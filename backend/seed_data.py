from database import Base, engine, SessionLocal
from models import Sighting

Base.metadata.create_all(bind=engine)

db = SessionLocal()

sample = [
    Sighting(
        source="excel",
        species="Ixodes ricinus",
        severity="medium",
        region="London",
        lat=51.5074,
        lon=-0.1278,
        date="2025-06-01",
        notes="Urban park"
    ),
    Sighting(
        source="api",
        species="Dermacentor reticulatus",
        severity="high",
        region="Manchester",
        lat=53.4808,
        lon=-2.2426,
        date="2025-05-20",
        notes="Rural field"
    ),
]

db.add_all(sample)
db.commit()
db.close()
print("Seeded sample data")
