from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func

from backend.core.database import Base
from backend.utils.sevirity import compute_severity


class Sighting(Base):
    __tablename__ = "sightings"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, default="user")
    species = Column(String, nullable=False)
    latin_name = Column(String, nullable=True)
    region = Column(String, nullable=True)

    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)

    date = Column(DateTime(timezone=True), nullable=False)
    notes = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    @property
    def severity(self) -> str:
        return compute_severity(self.date)

    def to_dict(self):
        return {
            "id": self.id,
            "source": self.source,
            "species": self.species,
            "severity": self.severity,
            "region": self.region,
            "lat": self.lat,
            "lon": self.lon,
            "date": self.date.isoformat() if self.date else None,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
