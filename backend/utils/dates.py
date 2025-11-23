from datetime import datetime
from typing import Optional


def parse_date(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None

    for fmt in ("%Y-%m-%d", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue

    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None
