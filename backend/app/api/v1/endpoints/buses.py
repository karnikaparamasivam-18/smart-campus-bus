from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.bus import BusCreate, BusResponse, BusUpdate
from app.api.deps import get_current_admin, get_current_user
from app.models.bus import Bus
from app.models.user import User
from fastapi import HTTPException

router = APIRouter()


@router.get("/", response_model=List[BusResponse])
def list_buses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """List all active buses."""
    return db.query(Bus).filter(Bus.is_active == True).all()


@router.post("/", response_model=BusResponse, status_code=201)
def create_bus(bus_in: BusCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    """Admin: Add a new bus."""
    existing = db.query(Bus).filter(Bus.bus_number == bus_in.bus_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bus number already exists")
    bus = Bus(**bus_in.model_dump())
    db.add(bus)
    db.commit()
    db.refresh(bus)
    return bus


@router.put("/{bus_id}", response_model=BusResponse)
def update_bus(bus_id: int, bus_in: BusUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    """Admin: Update bus details."""
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    for field, value in bus_in.model_dump(exclude_unset=True).items():
        setattr(bus, field, value)
    db.commit()
    db.refresh(bus)
    return bus


@router.delete("/{bus_id}", status_code=204)
def delete_bus(bus_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    """Admin: Deactivate a bus."""
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    bus.is_active = False
    db.commit()
