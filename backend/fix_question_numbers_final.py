#!/usr/bin/env python3
from app.database import SessionLocal
from app.models.question import Question

# フロントエンドのBASE_SECTION_STRUCTUREと同じ順序
SPORTSMANSHIP_ORDER = [
    'courage',           # 勇気
    'resilience',        # 復活力
    'cooperation',       # 協調性
    'natural_acceptance', # 自然体
    'non_rationality'    # 非合理性
]

ATHLETE_MIND_ORDER = [
    'introspection',     # 内省
    'self_control',      # 克己
    'devotion',          # 献身
    'intuition',         # 直感
    'sensitivity',       # 繊細
    'steadiness',        # 堅実
    'comparison',        # 比較
    'result',            # 結果
    'assertion',         # 主張
    'commitment'         # こだわり
]

SELF_AFFIRMATION_ORDER = [
    'self_determination', # 自己決定感
    'self_acceptance',    # 自己受容感
    'self_worth',         # 自己有用感
    'self_efficacy'       # 自己効力感
]

def fix_question_numbers():
    db = SessionLocal()
    try:
        print('=== 質問番号修正開始 ===')
        
        # カテゴリごとの質問番号範囲を定義
        category_ranges = {
            'sportsmanship': (1, 29),    # 1-29
            'athlete_mind': (30, 79),     # 30-79  
            'self_affirmation': (80, 99)  # 80-99
        }
        
        for category, (start_num, end_num) in category_ranges.items():
            print(f'\n--- {category} カテゴリ処理 ---')
            
            if category == 'sportsmanship':
                # サブカテゴリ順で並べて振り直す
                questions = []
                for sub in SPORTSMANSHIP_ORDER:
                    sub_questions = db.query(Question).filter(
                        Question.category == category,
                        Question.subcategory == sub
                    ).order_by(Question.question_number).all()
                    questions.extend(sub_questions)
            elif category == 'athlete_mind':
                # サブカテゴリ順で並べて振り直す
                questions = []
                for sub in ATHLETE_MIND_ORDER:
                    sub_questions = db.query(Question).filter(
                        Question.category == category,
                        Question.subcategory == sub,
                        Question.target == 'player'
                    ).order_by(Question.question_number).all()
                    questions.extend(sub_questions)
            elif category == 'self_affirmation':
                # サブカテゴリ順で並べて振り直す
                questions = []
                for sub in SELF_AFFIRMATION_ORDER:
                    sub_questions = db.query(Question).filter(
                        Question.category == category,
                        Question.subcategory == sub,
                        Question.target == 'player'
                    ).order_by(Question.question_number).all()
                    questions.extend(sub_questions)
            else:
                questions = db.query(Question).filter(
                    Question.category == category,
                    Question.target == 'player'
                ).order_by(Question.subcategory, Question.question_number).all()
            
            if not questions:
                print(f'{category}: 質問が見つかりません')
                continue
            print(f'{category}: {len(questions)}問を処理')
            current_number = start_num
            for question in questions:
                old_number = question.question_number
                question.question_number = current_number
                current_number += 1
                print(f'  {old_number} → {question.question_number} ({question.subcategory})')
            db.commit()
            print(f'{category}: 番号 {start_num}-{current_number-1} に修正完了')
        
        print('\n=== 修正後の確認 ===')
        for category in category_ranges.keys():
            if category == 'sportsmanship':
                questions = db.query(Question).filter(
                    Question.category == category
                ).order_by(Question.question_number).all()
            else:
                questions = db.query(Question).filter(
                    Question.category == category,
                    Question.target == 'player'
                ).order_by(Question.question_number).all()
            if questions:
                print(f'{category}: {questions[0].question_number} - {questions[-1].question_number} (計{len(questions)}問)')
            else:
                print(f'{category}: 質問なし')
        print('\n=== 修正完了 ===')
    except Exception as e:
        print(f'エラーが発生しました: {e}')
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_question_numbers() 