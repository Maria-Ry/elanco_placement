from typing import Any, Dict, List, Optional
from collections import defaultdict

from sqlalchemy.exc import SQLAlchemyError

from backend.core.database import SessionLocal
from backend.models.tick import Sighting
from backend.repositories.sightings_repository import find_sightings


class ReportError(Exception):
    """Raised when reporting parameters are invalid."""
    pass


def get_region_counts(
        region: Optional[str] = None,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
    """
    Aggregate number of sightings per region (and by severity).
    """
    session = SessionLocal()
    try:
        rows = find_sightings(
            session,
            region=region,
            from_date=from_date,
            to_date=to_date,
        )

        records: Dict[str, Dict[str, Any]] = {}

        for s in rows:
            key = s.region or "Unknown"
            if key not in records:
                records[key] = {
                    "region": key,
                    "total": 0,
                    "high": 0,
                    "medium": 0,
                    "low": 0,
                }

            r = records[key]
            r["total"] += 1

            sev = (s.severity or "").lower()
            if "high" in sev:
                r["high"] += 1
            elif "medium" in sev:
                r["medium"] += 1
            elif "low" in sev:
                r["low"] += 1

        return sorted(records.values(), key=lambda x: x["total"], reverse=True)

    except SQLAlchemyError:
        session.rollback()
        raise
    finally:
        session.close()


def get_trends(
        group_by: str = "month",
        region: Optional[str] = None,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
    """
    Aggregate sightings over time (weekly or monthly).
    """
    group_by = (group_by or "month").lower()
    if group_by not in {"month", "week"}:
        raise ReportError("group_by must be 'month' or 'week'.")

    session = SessionLocal()
    try:
        rows = find_sightings(
            session,
            region=region,
            from_date=from_date,
            to_date=to_date,
        )

        records: Dict[str, int] = defaultdict(int)

        for s in rows:
            d = s.date
            if not d:
                continue

            if group_by == "month":
                key = f"{d.year:04d}-{d.month:02d}"
            else:  # week
                iso = d.isocalendar()
                year = iso[0]
                week = iso[1]
                key = f"{year:04d}-W{week:02d}"

            records[key] += 1

        return [
            {"period": k, "count": v}
            for k, v in sorted(records.items())
        ]

    except SQLAlchemyError:
        session.rollback()
        raise
    finally:
        session.close()
