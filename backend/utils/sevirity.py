from datetime import datetime, timezone
from typing import Optional


def compute_severity(date_value: Optional[datetime]) -> str:
    """
    Compute severity based on recency of the sighting date.

    - 'high'    - sighting within last 7 days
    - 'medium'  - within last 30 days
    - 'low'     - older than 30 days
    - 'unknown' - missing or invalid date
    """

    if date_value is None:
        return "unknown"

    if date_value.tzinfo is None:
        d = date_value.replace(tzinfo=timezone.utc)
    else:
        d = date_value

    now = datetime.now(timezone.utc)

    delta = now - d
    days = delta.days

    if days <= 7:
        return "high"
    elif days <= 30:
        return "medium"
    elif days > 30:
        return "low"
    else:
        return "unknown"
