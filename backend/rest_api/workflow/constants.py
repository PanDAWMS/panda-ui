"""Workflow constants"""

PENDING_STATUSES = (
    "registered",
    "checking",
    "checked_true",
    "checked_false",
    "pending",
    "ready",
)
ACTIVE_STATUSES = ("starting", "running")
FAILED_STATUSES = ("failed", "cancelled", "closed")
