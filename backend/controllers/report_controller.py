from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from backend.services import reports_service as svc
from backend.utils.errors import ValidationError, ReportError

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")


@reports_bp.get("/regions")
def region_counts_route():
    """
    GET /api/reports/regions

    Optional query params:
      - region
      - from
      - to
    """
    region = request.args.get("region")
    from_date = request.args.get("from")
    to_date = request.args.get("to")

    try:
        data = svc.get_region_counts(
            region=region,
            from_date=from_date,
            to_date=to_date,
        )
        return jsonify(data)

    except ValidationError as e:
        return jsonify({
            "error": "Validation error",
            "details": str(e),
        }), 400

    except SQLAlchemyError as e:
        print("DB error in get_region_counts:", e)
        return jsonify({"error": "Database error"}), 500


@reports_bp.get("/trends")
def trends_route():
    """
    GET /api/reports/trends

    Optional query params:
      - group_by: 'month' | 'week'
      - region
      - from
      - to
    """
    group_by = request.args.get("group_by", "month")
    region = request.args.get("region")
    from_date = request.args.get("from")
    to_date = request.args.get("to")

    try:
        data = svc.get_trends(
            region=region,
            group_by=group_by,
            from_date=from_date,
            to_date=to_date,
        )
        return jsonify(data)

    except ReportError as e:
        return jsonify({
            "error": "Validation error",
            "details": str(e),
        }), 400

    except ValidationError as e:
        return jsonify({
            "error": "Validation error",
            "details": str(e),
        }), 400

    except SQLAlchemyError as e:
        print("DB error in get_trends:", e)
        return jsonify({"error": "Database error"}), 500
