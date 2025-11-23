from typing import Any, Dict, List, Optional

from sqlalchemy.exc import SQLAlchemyError

from backend.core.database import SessionLocal
from backend.models.tick import Sighting
from backend.repositories.sightings_repository import find_sightings
from backend.utils.dates import parse_date
from backend.utils.errors import ValidationError


def list_sightings(
        region: Optional[str] = None,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
    """
    Return sightings as a list of dicts, filterable by region and date range.
    """
    session = SessionLocal()
    try:
        rows = find_sightings(
            session,
            region=region,
            from_date=from_date,
            to_date=to_date,
        )
        return [s.to_dict() for s in rows]

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

    date_str = data.get("date")
    date_obj = parse_date(date_str)

    session = SessionLocal()
    try:
        sighting = Sighting(
            source="user",
            species=data.get("species"),
            latin_name=data.get("latin_name"),
            region=data.get("region"),
            lat=data.get("lat"),
            lon=data.get("lon"),
            date=date_obj,
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
