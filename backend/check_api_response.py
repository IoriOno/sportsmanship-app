#!/usr/bin/env python3
from app.database import SessionLocal
from app.models.question import Question
from app.api.questions import get_questions_for_user

def check_api_response():
    db = SessionLocal()
    try:
        print("=== APIレスポンス確認（DB直接取得） ===")
        
        # APIと同じロジックで質問を取得
        questions = db.query(Question).filter(
            Question.target == 'player'
        ).order_by(Question.question_number).all()
        
        # APIレスポンス形式に変換
        questions_data = []
        for q in questions:
            questions_data.append({
                'question_id': q.question_id,
                'question_number': q.question_number,
                'question_text': q.question_text,
                'category': q.category,
                'subcategory': q.subcategory,
                'target': q.target,
                'is_active': q.is_active
            })
        
        # スポーツマンシップカテゴリの質問を抽出
        sportsmanship_questions = [q for q in questions_data if q.get('category') == 'sportsmanship']
        
        print(f"\nスポーツマンシップ質問数: {len(sportsmanship_questions)}")
        print("質問番号リスト:")
        question_numbers = [q.get('question_number') for q in sportsmanship_questions]
        print(question_numbers)
        
        print("\n最初の5問の詳細:")
        for i, q in enumerate(sportsmanship_questions[:5]):
            print(f"  {i+1}. 番号: {q.get('question_number')}, サブカテゴリ: {q.get('subcategory')}, 質問: {q.get('question_text', '')[:50]}...")
        
        print("\n最後の5問の詳細:")
        for i, q in enumerate(sportsmanship_questions[-5:]):
            print(f"  {i+1}. 番号: {q.get('question_number')}, サブカテゴリ: {q.get('subcategory')}, 質問: {q.get('question_text', '')[:50]}...")
        
        print("\n=== 全カテゴリの質問番号範囲 ===")
        for category in ['sportsmanship', 'athlete_mind', 'self_affirmation']:
            cat_questions = [q for q in questions_data if q.get('category') == category]
            if cat_questions:
                numbers = [q.get('question_number') for q in cat_questions]
                print(f"{category}: {min(numbers)} - {max(numbers)} (計{len(cat_questions)}問)")
            else:
                print(f"{category}: 質問なし")
                
    except Exception as e:
        print(f"エラー: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_api_response() 