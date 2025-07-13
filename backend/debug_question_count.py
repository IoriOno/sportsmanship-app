#!/usr/bin/env python3
from app.database import SessionLocal
from app.models.question import Question
from app.schemas.question import TargetType

def debug_question_count():
    db = SessionLocal()
    try:
        print("=== 質問数詳細調査 ===")
        
        # 1. 全質問数
        total_questions = db.query(Question).count()
        print(f"全質問数: {total_questions}")
        
        # 2. カテゴリ別質問数
        for category in ['sportsmanship', 'athlete_mind', 'self_affirmation']:
            count = db.query(Question).filter(Question.category == category).count()
            print(f"{category}: {count}問")
        
        # 3. target別質問数
        for target in ['all', 'player', 'coach', 'father', 'mother']:
            count = db.query(Question).filter(Question.target == target).count()
            print(f"target={target}: {count}問")
        
        # 4. APIと同じロジックでの質問数
        print("\n=== APIロジックでの質問数 ===")
        
        # sportsmanship（targetを問わず）
        sportsmanship_count = db.query(Question).filter(
            Question.category == 'sportsmanship',
            Question.is_active == True
        ).count()
        print(f"sportsmanship: {sportsmanship_count}問")
        
        # その他（targetでフィルタ）
        other_count = db.query(Question).filter(
            Question.category != 'sportsmanship',
            Question.is_active == True,
            ((Question.target == 'all') | (Question.target == 'player'))
        ).count()
        print(f"その他（player用）: {other_count}問")
        
        total_api_count = sportsmanship_count + other_count
        print(f"API合計: {total_api_count}問")
        
        # 5. 実際の質問内容確認
        print("\n=== 実際の質問内容 ===")
        questions = db.query(Question).filter(
            Question.category == 'sportsmanship',
            Question.is_active == True
        ).all()
        
        print(f"sportsmanship質問詳細:")
        for q in questions[:5]:  # 最初の5問
            print(f"  {q.question_number}: {q.subcategory} (target={q.target})")
        
        other_questions = db.query(Question).filter(
            Question.category != 'sportsmanship',
            Question.is_active == True,
            ((Question.target == 'all') | (Question.target == 'player'))
        ).all()
        
        print(f"\nその他質問詳細:")
        for q in other_questions[:5]:  # 最初の5問
            print(f"  {q.question_number}: {q.category}.{q.subcategory} (target={q.target})")
        
    except Exception as e:
        print(f"エラー: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_question_count() 