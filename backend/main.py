"""
BankGuard AI — FastAPI application entry point.
Provides REST endpoints for voice banking, demo chat, and dashboard data.
"""

import json
import os
import uuid
from datetime import datetime
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

load_dotenv()

from agents import run_single_message
from sbi_api import get_recent_call_logs, get_dashboard_stats, api_block_card, api_freeze_account, api_flag_transaction
from tools import call_logs, TOOL_FUNCTIONS
from voice import generate_welcome_twiml, generate_response_twiml

app = FastAPI(
    title="BankGuard AI API",
    description="Agentic AI-powered voice banking emergency system for SBI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store (use Redis in production)
sessions: dict[str, list[dict]] = {}

# Live feed of tool executions — powers the "Backend Actions" panel on the
# dashboard. Populated by both the demo chat agent and ElevenLabs server tools.
live_actions: list[dict] = []


def _record_action(tool: str, tool_input: dict, result: dict, source: str) -> None:
    live_actions.append({
        "id": len(live_actions) + 1,
        "timestamp": datetime.now().isoformat(),
        "tool": tool,
        "input": tool_input,
        "result": result,
        "source": source,
    })
    del live_actions[:-100]  # keep last 100


# ----- Request/Response Models -----

class DemoChatRequest(BaseModel):
    message: str
    language: str = "auto"
    session_id: Optional[str] = None


class DemoChatResponse(BaseModel):
    response: str
    tool_calls: list[dict]
    session_id: str


class EmergencyActionRequest(BaseModel):
    account_id: str
    reason: Optional[str] = None
    amount: Optional[float] = None
    card_type: Optional[str] = "debit"


# ----- Routes -----

@app.get("/")
async def root():
    return {
        "service": "BankGuard AI",
        "version": "1.0.0",
        "status": "operational",
        "description": "SBI Emergency Banking Assistant",
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/api/voice/inbound", response_class=PlainTextResponse)
async def voice_inbound():
    """
    Twilio webhook for inbound calls.
    Returns TwiML to greet the caller and start streaming.
    """
    twiml = generate_welcome_twiml(language="hi-IN")
    return PlainTextResponse(content=twiml, media_type="text/xml")


@app.websocket("/api/voice/stream")
async def voice_stream(websocket: WebSocket):
    """
    WebSocket endpoint for real-time voice streaming via Twilio ConversationRelay.
    Receives audio chunks, transcribes them, runs the AI agent, and streams back TTS audio.
    """
    await websocket.accept()
    session_id = str(uuid.uuid4())
    conversation_history: list[dict] = []

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            event_type = payload.get("event")

            if event_type == "media":
                # In production: decode audio, run STT, call agent, run TTS, send back
                # For demo, we echo a placeholder response
                transcript = payload.get("media", {}).get("payload", "")
                if transcript:
                    result = run_single_message(
                        user_message=transcript,
                        conversation_history=conversation_history,
                        session_id=session_id,
                    )
                    conversation_history = result["updated_history"]
                    response_twiml = generate_response_twiml(result["response"])
                    await websocket.send_text(json.dumps({
                        "event": "response",
                        "twiml": response_twiml,
                        "tool_calls": result["tool_calls"],
                    }))

            elif event_type == "stop":
                break

    except WebSocketDisconnect:
        pass
    finally:
        sessions.pop(session_id, None)


@app.post("/api/demo/chat", response_model=DemoChatResponse)
async def demo_chat(request: DemoChatRequest):
    """
    Demo chat endpoint for the frontend interactive demo.
    Takes a text message and returns the AI response with tool calls made.
    """
    session_id = request.session_id or str(uuid.uuid4())

    # Get or create conversation history
    if session_id not in sessions:
        sessions[session_id] = []

    history = sessions[session_id]

    try:
        result = run_single_message(
            user_message=request.message,
            conversation_history=history,
            language=request.language,
            session_id=session_id,
        )
        sessions[session_id] = result["updated_history"]

        for tc in result["tool_calls"]:
            _record_action(tc["tool"], tc["input"], tc["result"], source="demo_chat")

        return DemoChatResponse(
            response=result["response"],
            tool_calls=result["tool_calls"],
            session_id=session_id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")


@app.delete("/api/demo/session/{session_id}")
async def clear_session(session_id: str):
    """Clear a demo conversation session."""
    sessions.pop(session_id, None)
    return {"cleared": True, "session_id": session_id}


# ----- ElevenLabs Conversational AI server tools -----
# Each tool configured on the ElevenLabs agent points to
# POST https://<public-url>/api/agent-tools/<tool_name> with JSON params.
# The voice agent (STT/TTS/turn-taking) runs on ElevenLabs; the banking
# actions execute HERE, so the ops dashboard sees them in real time.

ELEVENLABS_TOOLS_SECRET = os.getenv("ELEVENLABS_TOOLS_SECRET", "")


@app.post("/api/agent-tools/execute")
async def agent_tool_execute(payload: dict, request: Request):
    """
    Consolidated dispatcher — lets a single ElevenLabs webhook tool cover
    several backend actions (works around per-agent tool-count limits).
    Expects {"action": "<tool_name>", ...params}.
    """
    if ELEVENLABS_TOOLS_SECRET:
        if request.headers.get("x-tools-secret") != ELEVENLABS_TOOLS_SECRET:
            raise HTTPException(status_code=401, detail="Invalid tools secret")

    action = payload.pop("action", None)
    fn = TOOL_FUNCTIONS.get(action)
    if not fn:
        raise HTTPException(status_code=404, detail=f"Unknown action: {action}")

    # Drop params the target function doesn't accept (LLMs sometimes over-fill)
    import inspect
    accepted = set(inspect.signature(fn).parameters)
    clean = {k: v for k, v in payload.items() if k in accepted and v is not None}

    try:
        result = fn(**clean)
    except TypeError as e:
        raise HTTPException(status_code=422, detail=f"Bad parameters for {action}: {e}")

    _record_action(action, clean, result, source="voice_call")
    return result


@app.post("/api/agent-tools/{tool_name}")
async def agent_tool(tool_name: str, payload: dict, request: Request):
    if ELEVENLABS_TOOLS_SECRET:
        if request.headers.get("x-tools-secret") != ELEVENLABS_TOOLS_SECRET:
            raise HTTPException(status_code=401, detail="Invalid tools secret")

    fn = TOOL_FUNCTIONS.get(tool_name)
    if not fn:
        raise HTTPException(status_code=404, detail=f"Unknown tool: {tool_name}")

    try:
        result = fn(**payload)
    except TypeError as e:
        raise HTTPException(status_code=422, detail=f"Bad parameters for {tool_name}: {e}")

    _record_action(tool_name, payload, result, source="voice_call")
    return result


@app.get("/api/actions")
async def get_actions(since: int = 0):
    """Live feed of tool executions for the dashboard (poll with ?since=<last id>)."""
    fresh = [a for a in live_actions if a["id"] > since]
    return {"actions": fresh, "latest_id": live_actions[-1]["id"] if live_actions else 0}


@app.get("/api/calls")
async def get_calls():
    """Get recent call logs for the dashboard."""
    sbi_logs = get_recent_call_logs()
    agent_logs = call_logs[-20:] if call_logs else []
    return {
        "recent_calls": sbi_logs,
        "agent_actions": agent_logs,
        "total": len(sbi_logs),
    }


@app.get("/api/stats")
async def get_stats():
    """Get dashboard statistics."""
    stats = get_dashboard_stats()
    stats["active_sessions"] = len(sessions)
    return stats


@app.post("/api/emergency/block_card")
async def emergency_block_card(request: EmergencyActionRequest):
    """Direct endpoint to block a card (for testing/admin use)."""
    result = api_block_card(request.account_id, request.card_type or "debit")
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to block card"))
    return result


@app.post("/api/emergency/freeze_account")
async def emergency_freeze_account(request: EmergencyActionRequest):
    """Direct endpoint to freeze an account."""
    result = api_freeze_account(
        request.account_id,
        request.reason or "Customer requested account freeze",
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to freeze account"))
    return result


@app.post("/api/emergency/flag_transaction")
async def emergency_flag_transaction(request: EmergencyActionRequest):
    """Direct endpoint to flag a suspicious transaction."""
    result = api_flag_transaction(request.account_id, None, request.amount)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to flag transaction"))
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
