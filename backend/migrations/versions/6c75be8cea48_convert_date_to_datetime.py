"""convert date to datetime

Revision ID: 6c75be8cea48
Revises: d574cbece39b
Create Date: 2025-11-23 21:17:36.511549

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from datetime import datetime


# revision identifiers, used by Alembic.
revision: str = '6c75be8cea48'
down_revision: Union[str, Sequence[str], None] = 'd574cbece39b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # 1. Add new column
    op.add_column("sightings",
        sa.Column("date_dt", sa.DateTime(timezone=True))
    )
    # 2. Migrate data
    conn = op.get_bind()
    rows = conn.execute(sa.text("SELECT id, date FROM sightings")).fetchall()

    for row in rows:
        try:
            parsed = datetime.fromisoformat(row.date)
        except Exception:
            # fallback if format is "YYYY-MM-DD"
            parsed = datetime.strptime(row.date, "%Y-%m-%d")

        conn.execute(
            sa.text("UPDATE sightings SET date_dt = :d WHERE id = :i"),
            {"d": parsed, "i": row.id}
        )

    # 3. Drop old column
    op.drop_column("sightings", "date")

    # 4. Rename new column
    op.alter_column("sightings", "date_dt", new_column_name="date")


def downgrade():
    raise RuntimeError("Not supported")