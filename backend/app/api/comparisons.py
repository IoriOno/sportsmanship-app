from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.comparison import ComparisonResult
from app.models.user import User
from app.schemas.comparison import (
    ComparisonRequest,
    ComparisonResult as ComparisonResultSchema,
    ComparisonHistory
)
from app.dependencies import get_current_active_user, get_coach_or_parent_user
from app.services.comparison_service import ComparisonService

router = APIRouter()


@router.post("/create", response_model=ComparisonResultSchema)
def create_comparison(
    request: ComparisonRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_coach_or_parent_user)
):
    comparison_service = ComparisonService(db)
    
    # Validate participants
    if not comparison_service.validate_comparison_participants(
        current_user, request.participant_ids
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid comparison participants. Coaches and parents can only compare with players."
        )
    
    # Create comparison
    result = comparison_service.create_comparison(
        current_user.user_id, request.participant_ids
    )
    
    return result


@router.get("/history", response_model=ComparisonHistory)
def get_comparison_history(
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(ComparisonResult)
    
    # Filter based on user role
    if current_user.head_coach_function:
        # Head coach can see all comparisons in their club
        query = query.join(User, User.user_id == ComparisonResult.created_by).filter(
            User.club_id == current_user.club_id
        )
    elif current_user.role in ["coach", "father", "mother"] or current_user.parent_function:
        # Can see comparisons they created or are part of
        query = query.filter(
            db.or_(
                ComparisonResult.created_by == current_user.user_id,
                ComparisonResult.participants.contains([str(current_user.user_id)])
            )
        )
    else:
        # Players cannot see comparisons
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Players cannot view comparison history"
        )
    
    comparisons = query.order_by(
        ComparisonResult.created_date.desc()
    ).offset(offset).limit(limit).all()
    
    total = query.count()
    
    return {
        "comparisons": comparisons,
        "total_count": total
    }


@router.get("/{comparison_id}", response_model=ComparisonResultSchema)
def get_comparison(
    comparison_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    comparison = db.query(ComparisonResult).filter(
        ComparisonResult.comparison_id == comparison_id
    ).first()
    
    if not comparison:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comparison not found"
        )
    
    # Check permissions
    if not current_user.head_coach_function:
        if (str(current_user.user_id) != str(comparison.created_by) and 
            str(current_user.user_id) not in comparison.participants):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this comparison"
            )
    
    return comparison