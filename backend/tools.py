"""
Banking action tools for BankGuard AI.
Each function wraps sbi_api.py and logs to call_logs for observability.
"""

from datetime import datetime
from typing import Optional
from sbi_api import (
    lookup_customer,
    verify_customer_otp,
    api_block_card,
    api_freeze_account,
    api_flag_transaction,
    api_reset_pin,
    api_raise_reversal,
    api_unlock_yono,
    api_send_sms,
    api_escalate_to_human,
)

# In-memory call log (in production, use a DB)
call_logs: list[dict] = []


def _log(action: str, account_id: Optional[str], result: dict, session_id: str = "system") -> None:
    call_logs.append({
        "timestamp": datetime.now().isoformat(),
        "action": action,
        "account_id": account_id,
        "result_success": result.get("success", True),
        "session_id": session_id,
    })


def verify_customer(account_last4: str, otp: Optional[str] = None) -> dict:
    """
    Verify a customer's identity using account last 4 digits and optionally OTP.
    Returns verified status, customer name, and account ID.
    """
    customer = lookup_customer(account_last4)
    if not customer:
        result = {
            "verified": False,
            "customer_name": None,
            "account_id": None,
            "error": "No account found with those last 4 digits. Please check and try again.",
        }
        _log("verify_customer", None, {"success": False})
        return result

    # OTP verification if provided
    if otp:
        otp_valid = verify_customer_otp(customer["phone"], otp)
        if not otp_valid:
            result = {
                "verified": False,
                "customer_name": customer["name"],
                "account_id": customer["account_id"],
                "error": "OTP verification failed. Please request a new OTP.",
            }
            _log("verify_customer", customer["account_id"], {"success": False})
            return result

    result = {
        "verified": True,
        "customer_name": customer["name"],
        "account_id": customer["account_id"],
        "phone_masked": f"XXXXXX{customer['phone'][-4:]}",
        "branch": customer["branch"],
    }
    _log("verify_customer", customer["account_id"], {"success": True})
    return result


def block_card(account_id: str, card_type: str = "debit") -> dict:
    """
    Block a lost or stolen debit or credit card.
    card_type must be 'debit' or 'credit'.
    """
    result = api_block_card(account_id, card_type)
    _log("block_card", account_id, result)
    return result


def freeze_account(account_id: str, reason: str) -> dict:
    """
    Freeze an account suspected of being compromised.
    All transactions will be suspended until the account is unfrozen by a branch officer.
    """
    result = api_freeze_account(account_id, reason)
    _log("freeze_account", account_id, result)
    return result


def flag_transaction(
    account_id: str,
    transaction_id: Optional[str] = None,
    amount: Optional[float] = None,
) -> dict:
    """
    Flag a suspicious transaction and initiate a dispute with the fraud team.
    Provide either transaction_id or amount (or both) to identify the transaction.
    """
    result = api_flag_transaction(account_id, transaction_id, amount)
    _log("flag_transaction", account_id, result)
    return result


def reset_pin(account_id: str, card_last4: str) -> dict:
    """
    Initiate ATM PIN reset. Sends OTP to the customer's registered mobile number.
    Customer must complete the reset via ATM or SBI YONO using the OTP.
    """
    result = api_reset_pin(account_id, card_last4)
    _log("reset_pin", account_id, result)
    return result


def raise_reversal(
    account_id: str,
    amount: float,
    beneficiary_upi: Optional[str] = None,
) -> dict:
    """
    Raise a wrong fund transfer reversal request.
    Initiates contact with beneficiary bank to reverse the erroneous transfer.
    """
    result = api_raise_reversal(account_id, amount, beneficiary_upi)
    _log("raise_reversal", account_id, result)
    return result


def unlock_yono(account_id: str) -> dict:
    """
    Unlock the SBI YONO mobile banking app for a customer who has been locked out.
    Customer will need to set a new MPIN after unlocking.
    """
    result = api_unlock_yono(account_id)
    _log("unlock_yono", account_id, result)
    return result


def send_sms_confirmation(phone: str, message: str) -> dict:
    """
    Send an SMS confirmation to the customer's registered mobile number.
    Used to confirm actions taken and provide reference numbers.
    """
    result = api_send_sms(phone, message)
    _log("send_sms", None, result)
    return result


def escalate_to_human(reason: str, priority: str = "high") -> dict:
    """
    Escalate the call to a human banking officer when the AI cannot resolve the issue.
    Priority levels: critical, high, medium, low.
    """
    result = api_escalate_to_human(reason, priority)
    _log("escalate_to_human", None, result)
    return result


# Tool definitions for Claude's tool_use API
TOOL_DEFINITIONS = [
    {
        "name": "verify_customer",
        "description": "Verify a customer's identity using their account last 4 digits and optionally an OTP. Always call this before taking any action on an account.",
        "input_schema": {
            "type": "object",
            "properties": {
                "account_last4": {
                    "type": "string",
                    "description": "Last 4 digits of the customer's SBI account number.",
                },
                "otp": {
                    "type": "string",
                    "description": "One-time password sent to the customer's registered mobile. Optional — use when extra verification is needed.",
                },
            },
            "required": ["account_last4"],
        },
    },
    {
        "name": "block_card",
        "description": "Block a lost or stolen debit or credit card immediately to prevent unauthorized use.",
        "input_schema": {
            "type": "object",
            "properties": {
                "account_id": {
                    "type": "string",
                    "description": "The full SBI account ID returned by verify_customer.",
                },
                "card_type": {
                    "type": "string",
                    "enum": ["debit", "credit"],
                    "description": "Type of card to block.",
                },
            },
            "required": ["account_id", "card_type"],
        },
    },
    {
        "name": "freeze_account",
        "description": "Freeze an entire account suspected of being compromised. All transactions will be blocked.",
        "input_schema": {
            "type": "object",
            "properties": {
                "account_id": {"type": "string", "description": "The full SBI account ID."},
                "reason": {"type": "string", "description": "Reason for freezing the account (e.g., 'suspected unauthorized access', 'customer reported hacking')."},
            },
            "required": ["account_id", "reason"],
        },
    },
    {
        "name": "flag_transaction",
        "description": "Flag a suspicious or unauthorized transaction and raise a dispute with the fraud team.",
        "input_schema": {
            "type": "object",
            "properties": {
                "account_id": {"type": "string", "description": "The full SBI account ID."},
                "transaction_id": {"type": "string", "description": "Transaction ID if known. Optional."},
                "amount": {"type": "number", "description": "Amount of the suspicious transaction in INR. Optional."},
            },
            "required": ["account_id"],
        },
    },
    {
        "name": "reset_pin",
        "description": "Initiate ATM PIN reset for a customer who forgot their PIN. Sends OTP to registered mobile.",
        "input_schema": {
            "type": "object",
            "properties": {
                "account_id": {"type": "string", "description": "The full SBI account ID."},
                "card_last4": {"type": "string", "description": "Last 4 digits of the ATM/debit card."},
            },
            "required": ["account_id", "card_last4"],
        },
    },
    {
        "name": "raise_reversal",
        "description": "Raise a wrong fund transfer reversal request when the customer sent money to the wrong account.",
        "input_schema": {
            "type": "object",
            "properties": {
                "account_id": {"type": "string", "description": "The full SBI account ID."},
                "amount": {"type": "number", "description": "Amount transferred in INR."},
                "beneficiary_upi": {"type": "string", "description": "UPI ID of the beneficiary who received the wrong transfer. Optional."},
            },
            "required": ["account_id", "amount"],
        },
    },
    {
        "name": "unlock_yono",
        "description": "Unlock the SBI YONO mobile app for a customer who has been locked out.",
        "input_schema": {
            "type": "object",
            "properties": {
                "account_id": {"type": "string", "description": "The full SBI account ID."},
            },
            "required": ["account_id"],
        },
    },
    {
        "name": "send_sms_confirmation",
        "description": "Send an SMS confirmation to the customer with action details and reference number. Always call this after completing an action.",
        "input_schema": {
            "type": "object",
            "properties": {
                "phone": {"type": "string", "description": "Customer's registered mobile number."},
                "message": {"type": "string", "description": "SMS message content including reference number and action taken."},
            },
            "required": ["phone", "message"],
        },
    },
    {
        "name": "escalate_to_human",
        "description": "Escalate the issue to a human banking officer when the AI cannot resolve it. Use for complex fraud, legal matters, or customer insistence.",
        "input_schema": {
            "type": "object",
            "properties": {
                "reason": {"type": "string", "description": "Detailed reason for escalation."},
                "priority": {
                    "type": "string",
                    "enum": ["critical", "high", "medium", "low"],
                    "description": "Priority level based on urgency.",
                },
            },
            "required": ["reason", "priority"],
        },
    },
]

# Map tool names to functions
TOOL_FUNCTIONS = {
    "verify_customer": verify_customer,
    "block_card": block_card,
    "freeze_account": freeze_account,
    "flag_transaction": flag_transaction,
    "reset_pin": reset_pin,
    "raise_reversal": raise_reversal,
    "unlock_yono": unlock_yono,
    "send_sms_confirmation": send_sms_confirmation,
    "escalate_to_human": escalate_to_human,
}
