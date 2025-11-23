from flask import Flask, jsonify
from flask_cors import CORS

from backend.controllers.sightings_controller import sightings_bp
from backend.controllers.report_controller import reports_bp


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    @app.get("/api/health")
    def health_check():
        return jsonify({"status": "ok"})

    app.register_blueprint(sightings_bp)
    app.register_blueprint(reports_bp)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
