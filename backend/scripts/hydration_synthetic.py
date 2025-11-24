from __future__ import annotations
from datetime import datetime

import numpy as np
import pandas as pd

from backend.core.config import BASE_DIR
from backend.core.database import SessionLocal
from backend.core.geo import get_jittered_coords
from backend.models.tick import Sighting


CSV_FILE = BASE_DIR / "data" / "synthetic_sightings.csv"


def hydrate_synthetic(n_rows: int = 1000, seed: int | None = 42) -> None:

    if not CSV_FILE.exists():
        raise FileNotFoundError(f"CSV file not found: {CSV_FILE}")

    df = pd.read_csv(CSV_FILE)

    if df.empty:
        raise ValueError("Source CSV has no rows")

    if seed is not None:
        np.random.seed(seed)

    synthetic_df = df.sample(n=n_rows, replace=True).reset_index(drop=True)

    session = SessionLocal()

    try:
        for _, row in synthetic_df.iterrows():
            region = row.get("location")
            lat, lon = get_jittered_coords(region)

            date_val = row["date"]
            if isinstance(date_val, datetime):
                date = date_val
            else:
                date = pd.to_datetime(date_val).to_pydatetime()

            sighting = Sighting(
                source="synthetic",
                species=row.get("species"),
                latin_name=row.get("latinName"),
                region=region,
                lat=lat,
                lon=lon,
                date=date,
                notes=None,
            )
            session.add(sighting)

        session.commit()
        print(f"Synthetic hydration complete. Inserted {len(synthetic_df)} rows.")

    except Exception as e:
        session.rollback()
        print("Error during synthetic hydration:", e)
        raise
    finally:
        session.close()


if __name__ == "__main__":
    hydrate_synthetic()
