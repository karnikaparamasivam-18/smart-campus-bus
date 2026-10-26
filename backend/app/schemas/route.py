from pydantic import BaseModel
from typing import Optional
from datetime import time, datetime


class RouteBase(BaseModel):
    route_name: str
    origin: str
    destination: str
    departure_time: time
    arrival_time: time
    fare: float
    available_seats: int
    bus_id: int


class RouteCreate(RouteBase):
    pass


class RouteUpdate(BaseModel):
    route_name: Optional[str] = None
    fare: Optional[float] = None
    available_seats: Optional[int] = None
    is_active: Optional[bool] = None


class RouteResponse(RouteBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
