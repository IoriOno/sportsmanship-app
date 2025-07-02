from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, UUID4


class ChatMessage(BaseModel):
    message: str


class ChatResponse(BaseModel):
    message: str
    message_type: str = "assistant"


class ChatHistory(BaseModel):
    chat_id: UUID4
    user_id: UUID4
    message: str
    message_type: str
    timestamp: datetime
    
    class Config:
        from_attributes = True


class ChatSession(BaseModel):
    messages: List[ChatHistory]
    session_start: datetime
    session_end: Optional[datetime] = None


class CoachingContext(BaseModel):
    user_role: str
    latest_test_result: Optional[dict] = None
    comparison_results: Optional[List[dict]] = []