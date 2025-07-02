# ファイル: backend/app/api/questions.py

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.models.question import Question
from app.schemas.question import (
    Question as QuestionSchema,
    QuestionCreate,
    QuestionUpdate,
    QuestionList,
    TargetType
)

router = APIRouter()


@router.get("/", response_model=QuestionList)
def get_questions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[str] = None,
    target: Optional[TargetType] = None,
    user_target: Optional[TargetType] = None,  # ユーザーの対象（テスト用）
    is_active: Optional[bool] = True,
    db: Session = Depends(get_db)
):
    """全ての質問を取得
    
    user_target が指定された場合、そのユーザー向けの質問のみを返す
    （target='all' または target=user_target の質問）
    """
    query = db.query(Question)
    
    if category:
        query = query.filter(Question.category == category)
    if target:
        query = query.filter(Question.target == target)
    if is_active is not None:
        query = query.filter(Question.is_active == is_active)
    
    # ユーザー対象による絞り込み（テスト実行時用）
    if user_target:
        query = query.filter(
            (Question.target == TargetType.ALL) | 
            (Question.target == user_target)
        )
    
    query = query.order_by(Question.question_number)
    
    total_count = query.count()
    questions = query.offset(skip).limit(limit).all()
    
    # SQLAlchemyモデルを辞書に変換（Questionスキーマに合わせる）
    question_dicts = []
    for q in questions:
        question_dict = {
            "question_id": str(q.question_id),
            "question_number": q.question_number,
            "question_text": q.question_text,
            "category": q.category,
            "subcategory": q.subcategory,
            "target": q.target,
            "is_reverse_score": q.is_reverse_score,
            "is_active": q.is_active,
            "created_date": q.created_date.isoformat() if q.created_date else datetime.utcnow().isoformat(),
            "updated_date": q.updated_date.isoformat() if q.updated_date else None
        }
        question_dicts.append(question_dict)
    
    return QuestionList(questions=question_dicts, total_count=total_count)


@router.post("/", response_model=QuestionSchema)
def create_question(
    question_data: QuestionCreate,
    db: Session = Depends(get_db)
):
    """新しい質問を作成"""
    # 質問番号の重複チェック
    existing = db.query(Question).filter(
        Question.question_number == question_data.question_number
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Question number {question_data.question_number} already exists"
        )
    
    db_question = Question(**question_data.dict())
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    
    return db_question


@router.get("/{question_id}", response_model=QuestionSchema)
def get_question(
    question_id: UUID,
    db: Session = Depends(get_db)
):
    """特定の質問を取得"""
    question = db.query(Question).filter(
        Question.question_id == question_id
    ).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    return question


@router.put("/{question_id}", response_model=QuestionSchema)
def update_question(
    question_id: UUID,
    question_update: QuestionUpdate,
    db: Session = Depends(get_db)
):
    """質問を更新"""
    question = db.query(Question).filter(
        Question.question_id == question_id
    ).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    update_data = question_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(question, field, value)
    
    db.commit()
    db.refresh(question)
    
    return question


@router.delete("/{question_id}")
def delete_question(
    question_id: UUID,
    db: Session = Depends(get_db)
):
    """質問を削除"""
    question = db.query(Question).filter(
        Question.question_id == question_id
    ).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    db.delete(question)
    db.commit()
    
    return {"message": "Question deleted successfully"}


@router.get("/for-user/{user_target}")  # response_modelを一時的に削除
def get_questions_for_user(
    user_target: TargetType,
    category: Optional[str] = None,
    is_active: bool = True,
    db: Session = Depends(get_db)
):
    """特定ユーザー向けの質問を取得"""
    try:
        query = db.query(Question)
        
        if category:
            query = query.filter(Question.category == category)
        
        query = query.filter(Question.is_active == is_active)
        query = query.filter(
            (Question.target == TargetType.ALL) | 
            (Question.target == user_target)
        )
        
        query = query.order_by(Question.question_number)
        
        total_count = query.count()
        questions = query.all()
        
        # 手動で辞書に変換
        questions_dict = []
        for q in questions:
            questions_dict.append({
                "question_id": str(q.question_id),
                "question_number": q.question_number,
                "question_text": q.question_text,
                "category": q.category,
                "subcategory": q.subcategory,
                "target": q.target.value if hasattr(q.target, 'value') else q.target,
                "is_reverse_score": q.is_reverse_score,
                "is_active": q.is_active,
                "created_date": q.created_date.isoformat() if q.created_date else None,
                "updated_date": q.updated_date.isoformat() if q.updated_date else None
            })
        
        return {
            "questions": questions_dict,
            "total_count": total_count
        }
    except Exception as e:
        print(f"Error in get_questions_for_user: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise