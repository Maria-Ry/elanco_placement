from pathlib import Path
from functools import lru_cache

import pandas as pd
from joblib import load

from backend.core.config import BASE_DIR

MODEL_PATH = BASE_DIR / "backend" / "ml" / "rf_species_model.joblib"
FEATURE_COLS = ["location", "season", "year", "month"]


@lru_cache()
def _load_model():
    model = load(MODEL_PATH)
    return model


def predict_species(location: str, season: str, year: int, month: int, top_k: int = 3):
    """
    Returns top-k species predictions with probabilities.
    """
    model = _load_model()

    data = pd.DataFrame([{
        "location": location,
        "season": season,
        "year": year,
        "month": month,
    }], columns=FEATURE_COLS)

    proba = model.predict_proba(data)[0]
    classes = model.named_steps["clf"].classes_

    pairs = sorted(
        zip(classes, proba),
        key=lambda x: x[1],
        reverse=True
    )[:top_k]

    return [
        {"species": str(species), "probability": float(p)}
        for species, p in pairs
    ]
