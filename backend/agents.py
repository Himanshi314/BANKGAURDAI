"""
BankGuard AI — Claude Sonnet agentic core.
Orchestrates multi-turn conversations with tool use to resolve banking emergencies.
"""

import json
import os
from typing import Optional
import anthropic
from tools import TOOL_DEFINITIONS, TOOL_FUNCTIONS, call_logs

SYSTEM_PROMPT = """You are BankGuard AI, SBI's emergency banking assistant. You handle banking emergencies 24/7 with empathy and urgency. You understand Hindi, Tamil, Telugu, Bengali, Marathi, and English — respond in the customer's language.

Your capabilities:
1. Block lost/stolen debit or credit cards instantly
2. Freeze accounts suspected of being compromised
3. Flag suspicious transactions and initiate disputes
4. Reset forgotten ATM PINs after verification
5. Raise wrong fund transfer reversal requests
6. Unlock locked SBI YONO app
7. Check cheque bounce status

For every action, you MUST verify identity first. Ask for: account last 4 digits OR registered mobile OTP. Then take the action using your tools. Always confirm what you did and send an SMS.

Be warm, speak with urgency matching the customer's distress, and reassure them at every step.

When you call a tool, briefly tell the customer what you are doing (e.g., "Verifying your identity now...", "Blocking your card right away...") before the tool result comes back.

After completing any action, ALWAYS call send_sms_confirmation to notify the customer via SMS.

Never ask the customer to call another number or visit a branch unless absolutely necessary — resolve everything here."""


def run_agent(
    messages: list[dict],
    session_id: str = "demo",
    max_iterations: int = 10,
) -> dict:
    """
    Run the BankGuard AI agent for one full conversation turn.
    Handles multi-step tool use automatically.

    Args:
        messages: List of {role, content} conversation messages so far.
        session_id: Unique session identifier for logging.
        max_iterations: Safety limit on tool-use loops.

    Returns:
        dict with 'response' (str), 'tool_calls' (list), 'messages' (updated list).
    """
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    tool_calls_made = []
    current_messages = list(messages)

    for iteration in range(max_iterations):
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            tools=TOOL_DEFINITIONS,
            messages=current_messages,
        )

        # Extract text content from response
        text_content = ""
        tool_use_blocks = []

        for block in response.content:
            if block.type == "text":
                text_content += block.text
            elif block.type == "tool_use":
                tool_use_blocks.append(block)

        # Add assistant message to history
        current_messages.append({
            "role": "assistant",
            "content": response.content,
        })

        # If no tool calls, we're done
        if response.stop_reason == "end_turn" or not tool_use_blocks:
            return {
                "response": text_content,
                "tool_calls": tool_calls_made,
                "messages": current_messages,
            }

        # Process tool calls
        tool_results = []
        for tool_block in tool_use_blocks:
            tool_name = tool_block.name
            tool_input = tool_block.input

            # Execute the tool
            tool_fn = TOOL_FUNCTIONS.get(tool_name)
            if tool_fn:
                try:
                    result = tool_fn(**tool_input)
                except Exception as e:
                    result = {"success": False, "error": str(e)}
            else:
                result = {"success": False, "error": f"Unknown tool: {tool_name}"}

            tool_calls_made.append({
                "tool": tool_name,
                "input": tool_input,
                "result": result,
            })

            tool_results.append({
                "type": "tool_result",
                "tool_use_id": tool_block.id,
                "content": json.dumps(result),
            })

        # Add tool results to conversation
        current_messages.append({
            "role": "user",
            "content": tool_results,
        })

    # Reached max iterations
    return {
        "response": "I'm having difficulty processing your request. Let me connect you with a banking officer right away.",
        "tool_calls": tool_calls_made,
        "messages": current_messages,
    }


def run_single_message(
    user_message: str,
    conversation_history: list[dict],
    language: str = "auto",
    session_id: str = "demo",
) -> dict:
    """
    Process a single user message and return the AI's response.

    Args:
        user_message: The customer's latest message.
        conversation_history: Previous conversation messages.
        language: Preferred language hint ('Hindi', 'English', 'Tamil', etc.)
        session_id: Session ID for logging.

    Returns:
        dict with 'response', 'tool_calls', 'updated_history'.
    """
    messages = list(conversation_history)

    # Add language hint to first message if specified
    if language and language.lower() != "auto" and not messages:
        system_hint = f"\n\n[Customer's preferred language: {language}. Respond primarily in {language}.]"
        # We inject this as a prefaced user message context
        messages.append({
            "role": "user",
            "content": f"[System: Customer prefers {language}]\n{user_message}",
        })
    else:
        messages.append({
            "role": "user",
            "content": user_message,
        })

    result = run_agent(messages, session_id=session_id)

    return {
        "response": result["response"],
        "tool_calls": result["tool_calls"],
        "updated_history": result["messages"],
    }
