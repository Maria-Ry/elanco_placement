from flask import Blueprint, request, jsonify

from backend.ml.ml_service import predict_species

insights_bp = Blueprint("insights", __name__, url_prefix="/api/insights")


@insights_bp.post("/predict-species")
def predict_species_route():
    """
    POST /api/insights/predict-species

    {
      "location": "location_name",
      "season": "season_name",
      "year": 2023,
      "month": 7
    }
    """
    data = request.get_json(silent=True) or {}

    location = data.get("location")
    season = data.get("season")
    year = data.get("year")
    month = data.get("month")

    missing = [f for f in ["location", "season", "year", "month"] if data.get(f) is None]
    if missing:
        return jsonify({
            "error": "Missing required fields",
            "missing": missing
        }), 400

    try:
        preds = predict_species(
            location=location,
            season=season,
            year=int(year),
            month=int(month),
        )
    except Exception as e:
        return jsonify({"error": "Prediction failed", "details": str(e)}), 500

    return jsonify({
        "location": location,
        "season": season,
        "year": int(year),
        "month": int(month),
        "predictions": preds
    })