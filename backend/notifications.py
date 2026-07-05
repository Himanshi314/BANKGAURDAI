"""
Notification layer for BankGuard AI.
Handles SMS delivery via Twilio and MSG91.
"""

import os
from datetime import datetime
from typing import Optional


def send_sms_twilio(to_phone: str, message: str) -> dict:
    """
    Send SMS via Twilio. Falls back to simulation if credentials not set.
    """
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_PHONE_NUMBER")

    if not all([account_sid, auth_token, from_number]):
        # Simulate SMS for demo mode
        print(f"[DEMO SMS] To: {to_phone} | Message: {message}")
        return {
            "success": True,
            "provider": "demo",
            "sid": f"SM_DEMO_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "sent_at": datetime.now().isoformat(),
        }

    try:
        from twilio.rest import Client
        client = Client(account_sid, auth_token)
        msg = client.messages.create(
            body=message,
            from_=from_number,
            to=f"+91{to_phone}" if not to_phone.startswith("+") else to_phone,
        )
        return {
            "success": True,
            "provider": "twilio",
            "sid": msg.sid,
            "sent_at": datetime.now().isoformat(),
        }
    except Exception as e:
        return {"success": False, "error": str(e), "provider": "twilio"}


def send_sms_msg91(to_phone: str, message: str) -> dict:
    """
    Send SMS via MSG91 (alternative provider for India).
    """
    import httpx

    api_key = os.getenv("MSG91_API_KEY")
    sender_id = os.getenv("MSG91_SENDER_ID", "SBIBNK")

    if not api_key:
        print(f"[DEMO SMS via MSG91] To: {to_phone} | Message: {message}")
        return {"success": True, "provider": "demo_msg91"}

    try:
        response = httpx.post(
            "https://api.msg91.com/api/v5/flow/",
            headers={"authkey": api_key, "Content-Type": "application/json"},
            json={
                "flow_id": os.getenv("MSG91_FLOW_ID", ""),
                "sender": sender_id,
                "mobiles": f"91{to_phone}",
                "VAR1": message,
            },
            timeout=10.0,
        )
        response.raise_for_status()
        return {"success": True, "provider": "msg91", "response": response.json()}
    except Exception as e:
        return {"success": False, "error": str(e), "provider": "msg91"}


def compose_action_sms(action: str, customer_name: str, reference_no: str, details: str = "") -> str:
    """
    Compose standardized SMS messages for different banking actions.
    """
    base = f"SBI BankGuard AI | Dear {customer_name}, "
    timestamp = datetime.now().strftime("%d-%b-%Y %H:%M")

    templates = {
        "card_blocked": f"{base}your card has been BLOCKED as per your request. Ref: {reference_no}. Time: {timestamp}. If not requested by you, call 1800-11-2211. {details}",
        "account_frozen": f"{base}your account has been FROZEN for security. Ref: {reference_no}. Time: {timestamp}. Visit nearest SBI branch to unfreeze. {details}",
        "transaction_flagged": f"{base}your transaction dispute has been RAISED. Dispute ID: {reference_no}. Expected resolution: 7 working days. {details}",
        "pin_reset": f"{base}your ATM PIN reset has been INITIATED. OTP sent separately. Complete reset at any SBI ATM. Ref: {reference_no}. {details}",
        "reversal_raised": f"{base}wrong transfer REVERSAL request raised. Reversal ID: {reference_no}. Expected reversal: 24 hours. {details}",
        "yono_unlocked": f"{base}your YONO app has been UNLOCKED. Please set a new MPIN. Ref: {reference_no}. Time: {timestamp}. {details}",
    }

    return templates.get(action, f"{base}Action completed. Ref: {reference_no}. Time: {timestamp}. {details}")
