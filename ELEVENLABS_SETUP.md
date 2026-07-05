# ElevenLabs Voice Agent Setup — BankGuard AI

The voice layer (telephony, STT, TTS, turn-taking) runs on **ElevenLabs Conversational AI**.
The banking brain (identity verification, card block, freezes, disputes, SMS) runs in **our FastAPI backend** — ElevenLabs calls it via server tools, so every action shows up live on the ops dashboard.

```
Caller ⇄ Phone number / browser widget ⇄ ElevenLabs Agent (voice + LLM)
                                              │  server tools (HTTPS)
                                              ▼
                                   FastAPI backend  →  SBI APIs (simulated)
                                              ▼
                                   Ops dashboard (live actions feed)
```

## Step 1 — Expose the backend publicly

```bash
cd backend
pip install -r requirements.txt
python main.py                      # runs on http://localhost:8000
ngrok http 8000                     # note the https URL, e.g. https://abc123.ngrok-free.app
```

## Step 2 — Create the agent

Go to [elevenlabs.io](https://elevenlabs.io) → **Agents Platform** → **New Agent** (blank).

**Language:** English (add Hindi as an additional language — the agent auto-switches).
**Voice:** pick a warm Indian-accent voice (e.g. "Monika" or any `hi` voice).
**First message:**

```
Namaste! You've reached BankGuard AI, SBI's 24/7 emergency banking service. Aap Hindi ya English mein baat kar sakte hain. How can I help you today?
```

**System prompt:**

```
You are BankGuard AI, State Bank of India's emergency banking voice assistant. You handle banking emergencies 24/7 with empathy and urgency, over a phone call.

You understand Hindi, English, and code-mixed Hinglish. Always reply in the language the customer speaks.

Your capabilities (via tools):
1. Block lost/stolen debit or credit cards instantly
2. Freeze accounts suspected of being compromised
3. Flag suspicious transactions and raise disputes
4. Reset forgotten ATM PINs
5. Raise wrong fund transfer reversals
6. Unlock the SBI YONO app
7. Escalate to a human banking officer for complex cases

Rules:
- This is a VOICE call: keep replies short (1-3 sentences), natural, and speakable. Never use bullet points, emojis, or markdown.
- Before ANY account action, verify identity: ask for the last 4 digits of their SBI account number, then call verify_customer. Address the customer by name once verified.
- Match the customer's urgency. If they are panicked, reassure them first ("Don't worry, I'm blocking it right now").
- After completing an action, tell them the reference number clearly, digit by digit if needed, and call send_sms_confirmation with their registered phone.
- If a tool fails or the situation is beyond your tools (legal issues, large fraud, customer demands a human), call escalate_to_human.
- Never ask the customer to call another number or visit a branch unless absolutely necessary.

Demo accounts for testing: 4521 (Rajesh Kumar), 7832 (Priya Sharma), 3301 (Amit Patel).
```

## Step 3 — Add the server tools

Agent → **Tools** → **Add tool** → type **Webhook**. Create one per tool below.
For every tool: Method **POST**, URL `https://<YOUR-NGROK-URL>/api/agent-tools/<tool_name>`,
and add a request header `x-tools-secret: <ELEVENLABS_TOOLS_SECRET from backend/.env>`.
Parameters go in the **request body** (JSON).

| Tool name | Description (paste as tool description) | Body parameters |
|---|---|---|
| `verify_customer` | Verify customer identity with account last 4 digits. MUST be called before any account action. | `account_last4` (string, required), `otp` (string, optional) |
| `block_card` | Instantly block a lost/stolen card. | `account_id` (string, required — from verify_customer), `card_type` (string, required: "debit" or "credit") |
| `freeze_account` | Freeze a compromised account, suspending all transactions. | `account_id` (string, required), `reason` (string, required) |
| `flag_transaction` | Flag an unauthorized transaction and raise a fraud dispute. | `account_id` (string, required), `transaction_id` (string, optional), `amount` (number, optional) |
| `reset_pin` | Start ATM PIN reset; sends Green PIN OTP to registered mobile. | `account_id` (string, required), `card_last4` (string, required) |
| `raise_reversal` | Raise a wrong fund transfer reversal with the beneficiary bank. | `account_id` (string, required), `amount` (number, required), `beneficiary_upi` (string, optional) |
| `unlock_yono` | Unlock the customer's SBI YONO app. | `account_id` (string, required) |
| `send_sms_confirmation` | Send SMS with action details + reference number. Call after every completed action. | `phone` (string, required), `message` (string, required) |
| `escalate_to_human` | Hand off to a human banking officer with full context. | `reason` (string, required), `priority` (string, required: critical/high/medium/low) |

## Step 4 — Attach a phone number (the real-call demo)

Agents Platform → **Phone Numbers** → **Import from Twilio** (or buy a number natively).
Assign the number to the BankGuard agent. **Calling that number now rings straight into the AI.**

For an India-facing demo, a Twilio US number works fine for judging; production would use an Indian toll-free via Exotel/Twilio India.

## Step 5 — Browser widget (no phone needed)

Copy the **Agent ID** (agent settings → widget) into `frontend/.env`:

```
VITE_ELEVENLABS_AGENT_ID=agent_xxxxxxxxxxxx
VITE_API_BASE=http://localhost:8000
```

Restart `npm run dev`. The **"Talk Live"** section on the site now starts a real voice call in the browser, and the **Backend Actions** panel shows each tool firing as the agent works.

## Demo script for judges

1. Open the site → Talk Live → start call (or dial the phone number).
2. Say: *"Maine apna ATM card kho diya hai!"*
3. Agent asks for account digits → say *"4521"*.
4. Watch the Backend Actions panel: `verify_customer` → `block_card` → `send_sms_confirmation` fire in real time with reference numbers.
5. Agent confirms in Hindi with the reference number. Total time: ~45 seconds.
