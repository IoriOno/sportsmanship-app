from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.club import Club
from app.schemas.user import User as UserSchema
from app.dependencies import get_current_active_user

router = APIRouter()


@router.get("/{club_id}")
def read_club(
    club_id: str,
    db: Session = Depends(get_db)
):
    club = db.query(Club).filter(Club.club_id == club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )
    
    return {
        "club_id": club.club_id,
        "club_name": club.club_name,
        "created_date": club.created_date
    }


@router.get("/{club_id}/validate")
def validate_club(
    club_id: str,
    db: Session = Depends(get_db)
):
    club = db.query(Club).filter(Club.club_id == club_id).first()
    return {"valid": club is not None}