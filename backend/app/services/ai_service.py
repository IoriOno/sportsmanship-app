import os
from typing import Optional
import openai
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.test_result import TestResult
from app.models.chat_history import ChatHistory
from app.config import settings


class AIService:
    def __init__(self, db: Session):
        self.db = db
        openai.api_key = settings.OPENAI_API_KEY
    
    def get_coaching_response(self, user: User, message: str) -> str:
        # Get user's latest test result
        latest_result = self.db.query(TestResult).filter(
            TestResult.user_id == user.user_id
        ).order_by(TestResult.test_date.desc()).first()
        
        # Get recent chat history
        recent_messages = self.db.query(ChatHistory).filter(
            ChatHistory.user_id == user.user_id
        ).order_by(ChatHistory.timestamp.desc()).limit(10).all()
        
        # Build context
        context = self._build_context(user, latest_result, recent_messages)
        
        # Get response from AI
        try:
            response = self._get_openai_response(context, message, user.role)
            return response
        except Exception as e:
            return f"申し訳ございません。現在AIコーチング機能が利用できません。しばらくしてから再度お試しください。"
    
    def _build_context(self, user: User, test_result: Optional[TestResult], recent_messages) -> str:
        context = f"""
        ユーザー情報:
        - 名前: {user.name}
        - 年齢: {user.age}
        - 役割: {user.role}
        - クラブID: {user.club_id}
        """
        
        if test_result:
            context += f"""
        
        最新のテスト結果:
        - 自己決定感: {test_result.self_determination}/50
        - 自己受容感: {test_result.self_acceptance}/50
        - 自己有用感: {test_result.self_worth}/50
        - 自己効力感: {test_result.self_efficacy}/50
        
        アスリートマインド:
        - 内省: {test_result.introspection}/50
        - 克己: {test_result.self_control}/50
        - 献身: {test_result.devotion}/50
        - 直感: {test_result.intuition}/50
        - 繊細: {test_result.sensitivity}/50
        - 堅実: {test_result.steadiness}/50
        - 比較: {test_result.comparison}/50
        - 結果: {test_result.result}/50
        - 主張: {test_result.assertion}/50
        - こだわり・丁寧: {test_result.commitment}/50
        
        スポーツマンシップ:
        - 勇気: {test_result.courage}
        - 打たれ強さ: {test_result.resilience}
        - 他者性・協調性: {test_result.cooperation}
        - 自己受容・自然体: {test_result.natural_acceptance}
        - 非合理性・非論理性: {test_result.non_rationality}
        """
        
        return context
    
    def _get_openai_response(self, context: str, message: str, user_role: str) -> str:
        # Role-specific system prompts
        role_prompts = {
            "player": "あなたは若いアスリートの成長をサポートする優しいコーチです。",
            "coach": "あなたは経験豊富なコーチの相談相手です。",
            "father": "あなたは子供のスポーツ活動をサポートする父親の相談相手です。",
            "mother": "あなたは子供のスポーツ活動をサポートする母親の相談相手です。",
            "adult": "あなたは社会人アスリートのメンタルコーチです。"
        }
        
        system_prompt = f"""
        {role_prompts.get(user_role, "あなたはスポーツメンタルコーチです。")}
        
        以下の原則に従って回答してください：
        1. オープンクエスチョンを使って考えさせる
        2. 否定的な表現を避ける
        3. 断定的な言い方をしない
        4. 相手の気持ちに共感する
        5. 具体的で実践可能なアドバイスを提供する
        
        ユーザーのコンテキスト:
        {context}
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                max_tokens=800,
                temperature=0.7
            )
            
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API error: {e}")
            raise e