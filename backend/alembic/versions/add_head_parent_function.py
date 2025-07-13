"""Add head_parent_function column

Revision ID: add_head_parent_function
Revises: 530b8aadee38
Create Date: 2025-01-27 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_head_parent_function'
down_revision = '530b8aadee38'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add head_parent_function column to users table
    op.add_column('users', sa.Column('head_parent_function', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    # Remove head_parent_function column from users table
    op.drop_column('users', 'head_parent_function') 