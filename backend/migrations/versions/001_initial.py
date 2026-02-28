"""
Initial migration: create users and analysis_results tables.
"""
from alembic import op
import sqlalchemy as sa

revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("created_at", sa.DateTime()),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "analysis_results",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), nullable=True),
        sa.Column("input_text", sa.Text(), nullable=False),
        sa.Column("text_hash", sa.String(64), nullable=False),
        sa.Column("p_ai", sa.Float(), nullable=True),
        sa.Column("s_perp", sa.Float(), nullable=True),
        sa.Column("s_embed_cluster", sa.Float(), nullable=True),
        sa.Column("p_ext", sa.Float(), nullable=True),
        sa.Column("s_styl", sa.Float(), nullable=True),
        sa.Column("p_watermark", sa.Float(), nullable=True),
        sa.Column("threat_score", sa.Float(), nullable=True),
        sa.Column("explainability", sa.JSON(), nullable=True),
        sa.Column("status", sa.String(20), default="pending"),
        sa.Column("created_at", sa.DateTime()),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("processing_time_ms", sa.Integer(), nullable=True),
    )
    op.create_index("ix_analysis_results_user_id", "analysis_results", ["user_id"])
    op.create_index("ix_analysis_results_text_hash", "analysis_results", ["text_hash"])


def downgrade():
    op.drop_table("analysis_results")
    op.drop_table("users")
