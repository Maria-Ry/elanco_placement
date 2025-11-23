from flask import Flask, jsonify, request, redirect
from flask_cors import CORS
from sqlalchemy.exc import SQLAlchemyError

from backend.database import Base, engine, SessionLocal
from backend.models import Sighting

app = Flask(__name__)
CORS(app)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/api/health")
def health_check():
    return jsonify({"status": "ok"})


@app.get("/api/sightings")
def list_sightings():
    """Return all sightings"""
    db = next(get_db())
    try:
        sightings = db.query(Sighting).order_by(Sighting.id.desc()).all()
        return jsonify([s.to_dict() for s in sightings])
    except SQLAlchemyError as e:
        print(e)
        return jsonify({"error": "Database error"}), 500

@app.post("/api/sightings")
def create_sighting():
    """
    Create new sighting.
    Expected JSON:
    {
      "species": "...",
      "severity": "...",
      "region": "...",
      "lat": 51.5,
      "lon": -0.1,
      "date": "2025-11-22",
      "notes": "optional"
    }
    """
    data = request.get_json() or {}

    required_fields = ["species", "date"]
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        return jsonify({
            "error": "Validation error",
            "details": f"Missing fields: {', '.join(missing)}"
        }), 400

    db = next(get_db())
    try:
        sighting = Sighting(
            source="user",
            species=data.get("species"),
            severity=data.get("severity"),
            region=data.get("region"),
            lat=data.get("lat"),
            lon=data.get("lon"),
            date=data.get("date"),
            notes=data.get("notes"),
        )
        db.add(sighting)
        db.commit()
        db.refresh(sighting)
        return jsonify(sighting.to_dict()), 201
    except SQLAlchemyError as e:
        db.rollback()
        print(e)
        return jsonify({"error": "Database error"}), 500


if __name__ == "__main__":
    app.run(debug=True)
