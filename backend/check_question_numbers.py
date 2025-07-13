#!/usr/bin/env python3
from app.database import SessionLocal
from app.models.question import Question

def check_question_numbers():
    db = SessionLocal()
    try:
        print('=== カテゴリ別質問番号範囲 ===')
        categories = ['sportsmanship', 'athlete_mind', 'self_affirmation']
        
        for cat in categories:
            questions = db.query(Question).filter(
                Question.category == cat, 
                Question.target == 'player'
            ).order_by(Question.question_number).all()
            
            if questions:
                print(f'{cat}: {questions[0].question_number} - {questions[-1].question_number} (計{len(questions)}問)')
                print(f'  サブカテゴリ: {[q.subcategory for q in questions[:3]]}...')
            else:
                print(f'{cat}: 質問なし')
        
        print('\n=== 全質問の番号範囲 ===')
        all_questions = db.query(Question).filter(Question.target == 'player').order_by(Question.question_number).all()
        if all_questions:
            print(f'全体: {all_questions[0].question_number} - {all_questions[-1].question_number} (計{len(all_questions)}問)')
        
    finally:
        db.close()

if __name__ == "__main__":
    check_question_numbers() 