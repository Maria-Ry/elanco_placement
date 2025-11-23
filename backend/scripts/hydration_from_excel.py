import pandas as pd
from pathlib import Path

from backend.core.database import SessionLocal
from backend.models.tick import Sighting
from backend.core.config import BASE_DIR


EXCEL_FILE = BASE_DIR / "data" / "Tick_Sightings.xlsx"


def hydrate_from_excel():

    if not EXCEL_FILE.exists():
        raise FileNotFoundError(f"Excel file not found: {EXCEL_FILE}")

    df = pd.read_excel(EXCEL_FILE)

    session = SessionLocal()

    try:
        for _, row in df.iterrows():
            sighting = Sighting(
                source="xlsx",
                species=row.get("species"),
                latin_name=row.get("latinName"),
                region=row.get("location"),

                lat=None,
                lon=None,

                date=str(row.get("date")),
                notes=None
            )


            session.add(sighting)

        session.commit()
        print(f"Hydration complete. Inserted {len(df)} rows.")

    except Exception as e:
        session.rollback()
        print("Error during hydration:", e)
        raise
    finally:
        session.close()


if __name__ == "__main__":
    hydrate_from_excel()
