from datetime import datetime, timezone
from typing import Optional

from backend.utils.dates import parse_date


def compute_severity(date_str: Optional[str]) -> str:
    """
    Compute severity based on recency of the sighting date.

    - 'high'    - sighting within last 7 days
    - 'medium'  - sighting within last 30 days
    - 'low'     - older than 30 days
    - 'unknown' - invalid or missing date
    """
    d = parse_date(date_str)
    if not d:
        return "unknown"

    if d.tzinfo is None:
        d = d.replace(tzinfo=timezone.utc)

    now = datetime.now(timezone.utc)
    days = (now - d).days

    if days <= 7:
        return "high"
    elif days <= 30:
        return "medium"
    elif days > 30:
        return "low"
    else:
        return "unknown"
