"""
Voice integration layer for BankGuard AI.
Handles Twilio ConversationRelay, Sarvam AI (STT/TTS), and Deepgram integration.
"""

import os
import httpx
from typing import Optional


# ----- Sarvam AI Integration -----

SARVAM_BASE_URL = "https://api.sarvam.ai"

async def sarvam_transcribe(audio_bytes: bytes, language_code: str = "hi-IN") -> str:
    """
    Transcribe audio using Sarvam AI Saaras (Speech-to-Text).
    Supports Indian languages: hi-IN, ta-IN, te-IN, bn-IN, mr-IN, en-IN.
    """
    api_key = os.getenv("SARVAM_API_KEY")
    if not api_key:
        raise ValueError("SARVAM_API_KEY not set")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SARVAM_BASE_URL}/speech-to-text",
            headers={"api-subscription-key": api_key},
            files={"file": ("audio.wav", audio_bytes, "audio/wav")},
            data={"language_code": language_code, "model": "saaras:v1"},
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        return data.get("transcript", "")


async def sarvam_synthesize(text: str, language_code: str = "hi-IN", speaker: str = "meera") -> bytes:
    """
    Convert text to speech using Sarvam AI Bulbul (Text-to-Speech).
    Returns audio bytes (WAV format).
    """
    api_key = os.getenv("SARVAM_API_KEY")
    if not api_key:
        raise ValueError("SARVAM_API_KEY not set")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SARVAM_BASE_URL}/text-to-speech",
            headers={
                "api-subscription-key": api_key,
                "Content-Type": "application/json",
            },
            json={
                "inputs": [text],
                "target_language_code": language_code,
                "speaker": speaker,
                "model": "bulbul:v1",
                "enable_preprocessing": True,
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        # Sarvam returns base64-encoded audio
        import base64
        audio_b64 = data.get("audios", [""])[0]
        return base64.b64decode(audio_b64)


def detect_language(text: str) -> str:
    """
    Simple heuristic to detect the language of input text.
    Returns BCP-47 language code.
    """
    # Devanagari script (Hindi, Marathi)
    if any('ऀ' <= c <= 'ॿ' for c in text):
        return "hi-IN"
    # Tamil script
    if any('஀' <= c <= '௿' for c in text):
        return "ta-IN"
    # Telugu script
    if any('ఀ' <= c <= '౿' for c in text):
        return "te-IN"
    # Bengali script
    if any('ঀ' <= c <= '৿' for c in text):
        return "bn-IN"
    # Default to English
    return "en-IN"


# ----- Deepgram Integration (fallback STT) -----

DEEPGRAM_BASE_URL = "https://api.deepgram.com/v1"

async def deepgram_transcribe(audio_bytes: bytes, language: str = "hi") -> str:
    """
    Transcribe audio using Deepgram as a fallback STT provider.
    """
    api_key = os.getenv("DEEPGRAM_API_KEY")
    if not api_key:
        raise ValueError("DEEPGRAM_API_KEY not set")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{DEEPGRAM_BASE_URL}/listen",
            headers={
                "Authorization": f"Token {api_key}",
                "Content-Type": "audio/wav",
            },
            params={
                "language": language,
                "model": "nova-2",
                "smart_format": "true",
            },
            content=audio_bytes,
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        transcript = (
            data.get("results", {})
            .get("channels", [{}])[0]
            .get("alternatives", [{}])[0]
            .get("transcript", "")
        )
        return transcript


# ----- Twilio TwiML Helpers -----

def generate_welcome_twiml(language: str = "hi-IN") -> str:
    """
    Generate Twilio TwiML for incoming call greeting using Sarvam/Polly voice.
    """
    greetings = {
        "hi-IN": "Namaste! Aap BankGuard AI se connected hain, SBI ki emergency banking service. Aap Hindi, English, ya kisi bhi bhasha mein baat kar sakte hain. Aapki samasya batayein.",
        "en-IN": "Hello! You are connected to BankGuard AI, SBI's emergency banking service. How can I help you today?",
        "ta-IN": "Vanakkam! Neengal BankGuard AI-udan inaindhuulleergal, SBI's emergency banking service. Ungal thevai enna?",
    }
    greeting = greetings.get(language, greetings["en-IN"])

    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="hi-IN">{greeting}</Say>
  <Start>
    <Stream url="wss://{{YOUR_NGROK_URL}}/api/voice/stream" />
  </Start>
  <Pause length="60"/>
</Response>"""


def generate_response_twiml(text: str, language: str = "hi-IN") -> str:
    """
    Generate TwiML to speak a response back to the caller.
    """
    voice_map = {
        "hi-IN": "Polly.Aditi",
        "en-IN": "Polly.Raveena",
        "ta-IN": "Polly.Aditi",
        "te-IN": "Polly.Aditi",
    }
    voice = voice_map.get(language, "Polly.Aditi")

    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="{voice}" language="{language}">{text}</Say>
  <Pause length="3"/>
</Response>"""
