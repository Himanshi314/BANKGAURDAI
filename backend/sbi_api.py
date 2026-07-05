"""
Simulated SBI Banking API with realistic mock data.
Provides customer lookup, card management, account operations, and transaction handling.
"""

import random
import string
from datetime import datetime, timedelta
from typing import Optional

# ----- Mock Data -----

CUSTOMERS = {
    "4521": {
        "account_id": "SBI-ACC-004521",
        "name": "Rajesh Kumar",
        "phone": "9876543210",
        "email": "rajesh.kumar@email.com",
        "branch": "Delhi Main Branch",
        "ifsc": "SBIN0000123",
        "cards": [
            {"card_last4": "6702", "card_type": "debit", "status": "active", "network": "RuPay"},
            {"card_last4": "4491", "card_type": "credit", "status": "active", "network": "Visa"},
        ],
        "transactions": [
            {"txn_id": "TXN20260629001", "amount": 15000.0, "merchant": "Unknown Merchant", "timestamp": "2026-06-29T02:14:32", "type": "debit"},
            {"txn_id": "TXN20260629002", "amount": 450.0, "merchant": "Swiggy", "timestamp": "2026-06-29T12:30:00", "type": "debit"},
        ],
        "yono_status": "active",
        "balance": 124350.75,
    },
    "7832": {
        "account_id": "SBI-ACC-007832",
        "name": "Priya Sharma",
        "phone": "9845671234",
        "email": "priya.sharma@email.com",
        "branch": "Bangalore Koramangala Branch",
        "ifsc": "SBIN0004567",
        "cards": [
            {"card_last4": "9934", "card_type": "debit", "status": "active", "network": "RuPay"},
        ],
        "transactions": [
            {"txn_id": "TXN20260628010", "amount": 8500.0, "merchant": "Amazon Pay", "timestamp": "2026-06-28T23:55:10", "type": "debit"},
        ],
        "yono_status": "locked",
        "balance": 58920.50,
    },
    "3301": {
        "account_id": "SBI-ACC-003301",
        "name": "Amit Patel",
        "phone": "9123456789",
        "email": "amit.patel@email.com",
        "branch": "Ahmedabad Navrangpura Branch",
        "ifsc": "SBIN0007890",
        "cards": [
            {"card_last4": "1123", "card_type": "debit", "status": "active", "network": "Maestro"},
            {"card_last4": "5567", "card_type": "credit", "status": "active", "network": "MasterCard"},
        ],
        "transactions": [
            {"txn_id": "TXN20260629005", "amount": 25000.0, "beneficiary_upi": "wrong@paytm", "timestamp": "2026-06-29T09:02:44", "type": "upi_transfer"},
        ],
        "yono_status": "active",
        "balance": 202100.00,
    },
}

# Blocked cards and frozen accounts (in-memory state)
BLOCKED_CARDS: dict[str, dict] = {}
FROZEN_ACCOUNTS: dict[str, dict] = {}
FLAGGED_TRANSACTIONS: dict[str, dict] = {}
REVERSALS: dict[str, dict] = {}


def _generate_reference() -> str:
    year = datetime.now().year
    number = random.randint(100000, 999999)
    return f"BG-{year}-{number}"


def _now_str() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


# ----- API Functions -----

def lookup_customer(account_last4: str) -> Optional[dict]:
    """Return customer data for the given account last-4 digits, or None."""
    return CUSTOMERS.get(account_last4)


def verify_customer_otp(phone: str, otp: str) -> bool:
    """Simulate OTP verification. For demo purposes, '123456' always works."""
    return otp == "123456" or otp == "000000"


def get_customer_by_account_id(account_id: str) -> Optional[dict]:
    for customer in CUSTOMERS.values():
        if customer["account_id"] == account_id:
            return customer
    return None


def api_block_card(account_id: str, card_type: str) -> dict:
    """Block a card for the given account."""
    customer = get_customer_by_account_id(account_id)
    if not customer:
        return {"success": False, "error": "Account not found"}

    ref = _generate_reference()
    blocked_at = _now_str()

    # Update card status in mock data
    for card in customer["cards"]:
        if card["card_type"] == card_type and card["status"] == "active":
            card["status"] = "blocked"
            BLOCKED_CARDS[ref] = {
                "account_id": account_id,
                "card_type": card_type,
                "card_last4": card["card_last4"],
                "blocked_at": blocked_at,
                "reference_no": ref,
            }
            return {
                "success": True,
                "reference_no": ref,
                "blocked_at": blocked_at,
                "card_last4": card["card_last4"],
                "message": f"{card_type.title()} card ending {card['card_last4']} blocked successfully.",
            }

    return {"success": False, "error": f"No active {card_type} card found for this account"}


def api_freeze_account(account_id: str, reason: str) -> dict:
    """Freeze an account."""
    customer = get_customer_by_account_id(account_id)
    if not customer:
        return {"success": False, "error": "Account not found"}

    ref = _generate_reference()
    FROZEN_ACCOUNTS[account_id] = {
        "frozen_at": _now_str(),
        "reason": reason,
        "reference_no": ref,
    }
    return {
        "success": True,
        "reference_no": ref,
        "frozen_at": _now_str(),
        "message": "Account has been frozen. No debits or credits will be processed until unfrozen.",
    }


def api_flag_transaction(account_id: str, transaction_id: Optional[str], amount: Optional[float]) -> dict:
    """Flag a transaction as suspicious and raise a dispute."""
    customer = get_customer_by_account_id(account_id)
    if not customer:
        return {"success": False, "error": "Account not found"}

    dispute_id = f"DSP-{datetime.now().year}-{random.randint(100000, 999999)}"
    txn_ref = transaction_id or f"TXN-{random.randint(1000000, 9999999)}"

    FLAGGED_TRANSACTIONS[dispute_id] = {
        "account_id": account_id,
        "transaction_id": txn_ref,
        "amount": amount,
        "flagged_at": _now_str(),
        "dispute_id": dispute_id,
        "status": "under_review",
        "expected_resolution": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
    }
    return {
        "success": True,
        "dispute_id": dispute_id,
        "transaction_id": txn_ref,
        "amount": amount,
        "status": "under_review",
        "expected_resolution_days": 7,
        "message": "Transaction flagged. Dispute raised. Our fraud team will review within 7 working days.",
    }


def api_reset_pin(account_id: str, card_last4: str) -> dict:
    """Initiate PIN reset — sends OTP to registered mobile."""
    customer = get_customer_by_account_id(account_id)
    if not customer:
        return {"success": False, "error": "Account not found"}

    for card in customer["cards"]:
        if card["card_last4"] == card_last4:
            return {
                "success": True,
                "otp_sent": True,
                "phone_masked": f"XXXXXX{customer['phone'][-4:]}",
                "message": f"PIN reset OTP sent to your registered mobile ending {customer['phone'][-4:]}. OTP valid for 10 minutes.",
                "expiry_minutes": 10,
            }

    return {"success": False, "error": "Card not found for this account"}


def api_raise_reversal(account_id: str, amount: float, beneficiary_upi: Optional[str]) -> dict:
    """Raise a fund reversal request."""
    customer = get_customer_by_account_id(account_id)
    if not customer:
        return {"success": False, "error": "Account not found"}

    reversal_id = f"REV-{datetime.now().year}-{random.randint(100000, 999999)}"
    REVERSALS[reversal_id] = {
        "account_id": account_id,
        "amount": amount,
        "beneficiary_upi": beneficiary_upi,
        "raised_at": _now_str(),
        "status": "initiated",
    }
    return {
        "success": True,
        "reversal_id": reversal_id,
        "amount": amount,
        "beneficiary_upi": beneficiary_upi,
        "status": "initiated",
        "expected_resolution_hours": 24,
        "message": f"Reversal request of ₹{amount:,.2f} initiated. Reversal ID: {reversal_id}. If beneficiary bank cooperates, amount will be reversed within 24 hours.",
    }


def api_unlock_yono(account_id: str) -> dict:
    """Unlock SBI YONO app."""
    customer = get_customer_by_account_id(account_id)
    if not customer:
        return {"success": False, "error": "Account not found"}

    customer["yono_status"] = "active"
    return {
        "success": True,
        "message": "SBI YONO app has been unlocked. Please open the app and set a new MPIN.",
        "reset_required": True,
    }


def api_send_sms(phone: str, message: str) -> dict:
    """Simulate sending an SMS (in production, this calls Twilio/MSG91)."""
    # Mask phone for logging
    masked = f"XXXXXX{phone[-4:]}" if len(phone) >= 4 else "XXXXXXX"
    print(f"[SMS] Sending to {masked}: {message}")
    return {
        "success": True,
        "phone_masked": masked,
        "sent_at": _now_str(),
    }


def api_escalate_to_human(reason: str, priority: str) -> dict:
    """Escalate to a human banking officer."""
    priority_eta = {
        "critical": 5,
        "high": 15,
        "medium": 30,
        "low": 60,
    }
    eta = priority_eta.get(priority.lower(), 30)
    ticket_id = f"TKT-{datetime.now().year}-{random.randint(100000, 999999)}"
    return {
        "ticket_id": ticket_id,
        "eta_minutes": eta,
        "priority": priority,
        "reason": reason,
        "message": f"Escalated to human officer. Ticket {ticket_id} created. ETA: {eta} minutes.",
    }


def get_recent_call_logs() -> list[dict]:
    """Return mock recent call logs for the dashboard."""
    return [
        {"time": "09:12 AM", "customer": "XXXXXX3210", "issue": "Lost Debit Card", "language": "Hindi", "resolution": "Card Blocked", "duration": "48s", "status": "Resolved"},
        {"time": "09:05 AM", "customer": "XXXXXX1234", "issue": "Suspicious Transaction", "language": "English", "resolution": "Transaction Flagged", "duration": "61s", "status": "Resolved"},
        {"time": "08:58 AM", "customer": "XXXXXX6789", "issue": "YONO App Locked", "language": "Tamil", "resolution": "App Unlocked", "duration": "35s", "status": "Resolved"},
        {"time": "08:47 AM", "customer": "XXXXXX4422", "issue": "Wrong Transfer", "language": "Telugu", "resolution": "Reversal Initiated", "duration": "72s", "status": "Resolved"},
        {"time": "08:31 AM", "customer": "XXXXXX9900", "issue": "Hacked Account", "language": "Bengali", "resolution": "Account Frozen", "duration": "55s", "status": "Escalated"},
    ]


def get_dashboard_stats() -> dict:
    """Return mock dashboard statistics."""
    return {
        "calls_today": 1842,
        "resolved_today": 1791,
        "resolution_rate": 97.2,
        "avg_resolution_seconds": 47,
        "cost_saved_today": 165780,
        "languages_used": ["Hindi", "English", "Tamil", "Telugu", "Bengali", "Marathi"],
        "top_issue": "Lost/Stolen Card",
        "escalation_rate": 2.8,
    }
