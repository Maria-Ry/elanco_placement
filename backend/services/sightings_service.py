from typing import Any, Dict, List

from sqlalchemy.exc import SQLAlchemyError

from backend.core.database import SessionLocal
from backend.models.tick import Sighting


class ValidationError(Exception):
    """Raised when input data is invalid for creating a Sighting."""
    pass


def list_sightings() -> List[Dict[str, Any]]:
    """
    Return all sightings as a list of dictionaries, newest first.
    """
    session = SessionLocal()
    try:
        sightings = (
            session.query(Sighting)
            .order_by(Sighting.id.desc())
            .all()
        )
        return [s.to_dict() for s in sightings]
    except SQLAlchemyError:
        session.rollback()
        raise
    finally:
        session.close()


def create_sighting(data: Dict[str, Any]) -> Dict[str, Any]:
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
