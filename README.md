# 🛡️ BankGuard AI

**One Call. Every Emergency. Resolved.**

Agentic AI-powered voice agent that handles any SBI banking emergency autonomously, 24/7, in the customer's own language. A customer calls one number, speaks naturally — the AI understands the problem, verifies identity, and resolves the issue end-to-end with zero human agents.

> Built for **SBI Hackathon @ Global Fintech Fest 2026** (HackCulture) by Sarthak Routray & Himanshi Pal — Manipal University Jaipur.

## The Crisis

- **15–25 mins** — average hold time on the SBI helpline
- **29,000+** card fraud complaints in India (2024, RBI report)
- **₹80–120** — customer-care agent cost per call
- A stolen card not blocked in time drains an account. Every minute counts.

## The Solution

Unlike a rigid IVR ("Press 1 to block card"), BankGuard AI understands free-form, code-mixed speech like *"Bhai maine apna card kho diya, mujhe darr hai koi use kar raha hai"* — and autonomously verifies, acts, confirms, and notifies.

### Emergencies handled autonomously

| Emergency | Action |
|---|---|
| Lost/stolen card | Instant block → branch locator → new card request |
| Unauthorized transaction | Account freeze → fraud flag → dispute initiated |
| Hacked account | Emergency lockdown → security reset |
| Forgotten ATM PIN | Identity-verified PIN reset (Green PIN OTP) |
| Wrong fund transfer | Reversal raised → beneficiary bank notified |
| Mobile app locked | Unlock after contextual verification |
| Cheque bounce | Status check → advisor callback scheduled |

## Architecture

```
Customer call (Hindi/Telugu/Tamil/English)
   → Telephony: Twilio ConversationRelay / Exotel Voice Streaming
   → STT: Sarvam AI Saaras (Indic-first, <300ms) / Deepgram Nova-3 fallback
   → Intent Engine: Claude Sonnet 4.6 (native tool-calling, prompt caching) / GPT-5 fallback
   → Verification: voice OTP or account last-4 (RBI compliant)
   → Action: FastAPI backend → SBI banking APIs (simulated for prototype)
   → TTS: Sarvam AI Bulbul / ElevenLabs Conversational v3
   → SMS confirmation with reference number (Twilio / MSG91)
Observability: Langfuse / OpenTelemetry — full call-trace logging for compliance audit
```

## Unit Economics

**₹100 human cost → ₹9 AI cost = ₹91 net savings per call**

| Component | Cost/call |
|---|---|
| Telephony | ₹2–3 |
| Speech-to-Text | ₹1–3.5 |
| LLM (cached — 90% input cost cut via prompt caching) | ₹1.5–2 |
| Text-to-Speech | ₹1–2 |
| Backend/Infra | ₹0.5–1 |
| SMS | ₹0.15–0.2 |

At 1M automated calls/month: **₹6.8–11.4 Cr/month → ₹82–137 Cr/year net savings.**

## Project Structure

```
sbi/
├── backend/            # FastAPI + Claude agentic core
│   ├── main.py         # API entry point (voice webhook, demo chat, dashboard)
│   ├── agents.py       # Claude Sonnet 4.6 tool-calling agent loop
│   ├── tools.py        # Banking action tools + schemas
│   ├── sbi_api.py      # Simulated SBI banking APIs (swap for sandbox later)
│   ├── voice.py        # STT/TTS + TwiML helpers
│   └── notifications.py# SMS confirmations
└── frontend/           # React 19 + Vite + Tailwind demo dashboard
    └── src/components/ # Hero, LiveDemo, HowItWorks, UseCases, TechStack, Metrics, CallLog
```

## Live Voice Agent (ElevenLabs)

The production voice layer runs on **ElevenLabs Conversational AI** — it handles telephony, STT, TTS, and turn-taking, and executes banking actions through our FastAPI backend via server tools. Attach a real phone number to the agent and calling it rings straight into BankGuard AI, with every action visible live on the dashboard's **Backend Actions** panel.

Full setup (agent prompt, tool configs, phone number, browser widget): see **[ELEVENLABS_SETUP.md](ELEVENLABS_SETUP.md)**.

## Quick Start

### Frontend (standalone demo — no backend needed)

```bash
cd frontend
npm install
npm run dev
```

### Backend (agentic API)

```bash
cd backend
pip install -r requirements.txt
copy .env.example .env   # add your ANTHROPIC_API_KEY
python main.py           # http://localhost:8000/docs
```

## Compliance

- Zero PII stored beyond the call
- DPDP Act & RBI compliant (OTP verification) by design
- Full call-trace logging for audit
- Prototype uses simulated SBI APIs — when SBI grants sandbox access, only `sbi_api.py` changes; the agent layer is untouched.
