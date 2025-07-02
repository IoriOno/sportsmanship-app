from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.test_result import TestResult
from app.models.chat_history import ChatHistory
from app.schemas.coaching import ChatMessage, ChatResponse, ChatHistory as ChatHistorySchema
from app.dependencies import get_current_active_user
from app.services.ai_service import AIService

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat_with_ai(
    message: ChatMessage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if user has completed at least one test
    test_result = db.query(TestResult).filter(
        TestResult.user_id == current_user.user_id
    ).first()
    
    if not test_result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must complete at least one test before using the coaching feature"
        )
    
    # Get AI service
    ai_service = AIService(db)
    
    # Get AI response
    response = ai_service.get_coaching_response(
        user=current_user,
        message=message.message
    )
    
    # Save chat history
    user_msg = ChatHistory(
        user_id=current_user.user_id,
        message=message.message,
        message_type="user"
    )
    ai_msg = ChatHistory(
        user_id=current_user.user_id,
        message=response,
        message_type="assistant"
    )
    
    db.add(user_msg)
    db.add(ai_msg)
    db.commit()
    
    return ChatResponse(message=response)


@router.get("/history")
def get_chat_history(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    messages = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.user_id
    ).order_by(ChatHistory.timestamp.desc()).offset(offset).limit(limit).all()
    
    return {
        "messages": messages[::-1],  # Reverse to get chronological order
        "total_count": db.query(ChatHistory).filter(
            ChatHistory.user_id == current_user.user_id
        ).count()
    }


@router.delete("/history")
def clear_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.user_id
    ).delete()
    db.commit()
    
    return {"message": "Chat history cleared successfully"}