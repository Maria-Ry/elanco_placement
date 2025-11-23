from typing import List, Optional
from sqlalchemy.orm import Session, Query
from backend.models.tick import Sighting

from backend.utils.dates import parse_date


def base_query(session: Session) -> Query:
    """
    Base query so ordering is consistent across services.
    """
    return session.query(Sighting).order_by(Sighting.id.desc())


def find_sightings(
        session: Session,
        region: Optional[str] = None,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
    ):
    query = base_query(session)

    if region:
        query = query.filter(Sighting.region == region)

    if from_date:
        start_dt = parse_date(from_date)
        query = query.filter(Sighting.date >= start_dt)

    if to_date:
        end_dt = parse_date(to_date)
        query = query.filter(Sighting.date <= end_dt)

    return query.all()