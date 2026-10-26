from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import all models here so Alembic can detect them
from app.models.user import User  # noqa
from app.models.bus import Bus  # noqa
from app.models.route import Route  # noqa
from app.models.booking import Booking  # noqa
from app.models.payment import Payment  # noqa
