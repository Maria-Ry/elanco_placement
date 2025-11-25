from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]

INSTANCE_DIR = BASE_DIR / "instance"
INSTANCE_DIR.mkdir(exist_ok=True)

DATABASE_PATH = INSTANCE_DIR / "ticktracker.db"
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"