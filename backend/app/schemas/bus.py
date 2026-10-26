from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BusBase(BaseModel):
    bus_number: str
    total_seats: int


class BusCreate(BusBase):
    pass


class BusUpdate(BaseModel):
    bus_number: Optional[str] = None
    total_seats: Optional[int] = None
    is_active: Optional[bool] = None


class BusResponse(BusBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
