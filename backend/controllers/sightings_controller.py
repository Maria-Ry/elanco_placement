from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from backend.services import sightings_service as svc
from backend.services.sightings_service import ValidationError


sightings_bp = Blueprint("sightings", __name__, url_prefix="/api/sightings")


@sightings_bp.get("")
def list_sightings_route():
    """
    GET /api/sightings
    Return all sightings as JSON.
    """
    try:
        data = svc.list_sightings()
        return jsonify(data)
    except SQLAlchemyError as e:
        print("DB error in list_sightings:", e)
        return jsonify({"error": "Database error"}), 500


@sightings_bp.post("")
def create_sighting_route():
    """
    POST /api/sightings
    Create a new sighting from JSON payload.
    """
    payload = request.get_json() or {}

    try:
        sighting = svc.create_sighting(payload)
        return jsonify(sighting), 201

    except ValidationError as e:
        return jsonify({
            "error": "Validation error",
            "details": str(e),
        }), 400

    except SQLAlchemyError as e:
        print("DB error in create_sighting:", e)
        return jsonify({"error": "Database error"}), 500
