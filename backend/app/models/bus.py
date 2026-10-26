from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Bus(Base):
    __tablename__ = "buses"

    id = Column(Integer, primary_key=True, index=True)
    bus_number = Column(String(20), unique=True, nullable=False, index=True)
    total_seats = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    routes = relationship("Route", back_populates="bus")
