from datetime import datetime
from typing import Optional

from backend.utils.errors import ValidationError


def parse_date(value: Optional[str]) -> datetime:
    """
    Parse a date value into a datetime object.
    """
    if not value:
        raise ValidationError("Field 'date' is required.")

    try:
        return datetime.fromisoformat(value)
    except Exception:
        pass

    try:
        return datetime.strptime(value, "%d/%m/%Y")
    except Exception:
        pass

    try:
        return datetime.strptime(value, "%Y-%m-%d")
    except Exception:
        pass

    raise ValidationError("Invalid date format. Expected ISO datetime, 'DD/MM/YYYY' or 'YYYY-MM-DD'.")
