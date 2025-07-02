# ファイル: backend/app/api/athlete_type.py

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any

from app.utils.athlete_type_algorithm import analyze_athlete_type, get_athlete_types_list

router = APIRouter()


class AthleteTypeAnalysisRequest(BaseModel):
    athlete_mind_scores: Dict[str, float]
    target: str


@router.post("/analyze")
async def analyze_athlete_type_endpoint(
    request: AthleteTypeAnalysisRequest
):
    """
    アスリートタイプ分析エンドポイント
    
    Args:
        request: アスリートマインドスコアと対象を含むリクエスト
    
    Returns:
        アスリートタイプ分析結果
    """
    try:
        result = analyze_athlete_type(
            request.athlete_mind_scores, 
            request.target
        )
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"アスリートタイプ分析に失敗しました: {str(e)}"
        )


@router.get("/types")
async def get_athlete_types():
    """
    利用可能なアスリートタイプ一覧を取得
    """
    try:
        types = get_athlete_types_list()
        return {
            "success": True,
            "data": types
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"アスリートタイプ一覧の取得に失敗しました: {str(e)}"
        )