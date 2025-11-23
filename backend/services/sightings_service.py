from typing import Any, Dict, List, Optional
from datetime import datetime

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Query

from backend.core.database import SessionLocal
from backend.models.tick import Sighting


class ValidationError(Exception):
    """Raised when input data is invalid for creating a Sighting."""
    pass

def _parse_date(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d")
    except ValueError:
        try:
            return datetime.fromisoformat(value)
        except ValueError:
            return None

def list_sightings(
        region: Optional[str] = None,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
    """
    Return sightings as a list of dicts, optionally filtered
    by region and date range.
    """
    session = SessionLocal()
    try:
        query: Query = session.query(Sighting).order_by(Sighting.id.desc())

        if region:
            query = query.filter(Sighting.region == region)

        rows = query.all()

        start_dt = _parse_date(from_date)
        end_dt = _parse_date(to_date)

        def keep(s: Sighting) -> bool:
            if not (start_dt or end_dt):
                return True

            d = _parse_date(s.date)
            if d is None:
                return False

            if start_dt and d < start_dt:
                return False
            if end_dt and d > end_dt:
                return False
            return True

        filtered = [s for s in rows if keep(s)]
        return [s.to_dict() for s in filtered]

    except SQLAlchemyError:
        session.rollback()
        raise
    finally:
        session.close()


def create_sighting(
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
    """
    Validate input and create a new Sighting.
    Returns the created sighting as a dict.
    """
    required_fields = ["species", "date"]
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        raise ValidationError(f"Missing fields: {', '.join(missing)}")

    session = SessionLocal()
    try:
        sighting = Sighting(
            source="user",
            species=data.get("species"),
            latin_name=data.get("latin_name"),
            severity=data.get("severity"),
            region=data.get("region"),
            lat=data.get("lat"),
            lon=data.get("lon"),
            date=data.get("date"),
            notes=data.get("notes"),
        )

        session.add(sighting)
        session.commit()
        session.refresh(sighting)

        return sighting.to_dict()

    except SQLAlchemyError:
        session.rollback()
        raise
    finally:
        session.close()