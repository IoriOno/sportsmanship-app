# backend/scripts/fix_question_numbers.py

#!/usr/bin/env python3
"""
質問番号の重複を修正するスクリプト
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import engine
from app.models.question import Question

def fix_question_numbers():
    """質問番号の重複を修正"""
    
    session = Session(engine)
    
    try:
        print("🔄 質問番号の修正を開始...")
        
        # 役割別に質問を取得して番号を振り直す
        roles = ['all', 'player', 'coach', 'mother', 'father', 'adult']
        
        for role in roles:
            print(f"\n📝 {role}向け質問の番号を修正中...")
            
            # 役割ごとの質問を取得（カテゴリー順、サブカテゴリー順、question_id順）
            if role == 'all':
                # スポーツマンシップ質問
                questions = session.query(Question).filter(
                    Question.target == 'all'
                ).order_by(
                    Question.category,
                    Question.subcategory,
                    Question.question_id  # idではなくquestion_idを使用
                ).all()
            else:
                # 役割別質問
                questions = session.query(Question).filter(
                    Question.target == role
                ).order_by(
                    Question.category,
                    Question.subcategory,
                    Question.question_id  # idではなくquestion_idを使用
                ).all()
            
            # 番号を振り直す
            if role == 'all':
                # スポーツマンシップは1から開始
                current_number = 1
            else:
                # 他の役割は30から開始（スポーツマンシップの後）
                current_number = 30
            
            for question in questions:
                old_number = question.question_number
                question.question_number = current_number
                if old_number != current_number:
                    print(f"   質問 {question.question_id}: {old_number} → {current_number}")
                current_number += 1
            
            print(f"   {role}向け: {len(questions)}問 (番号範囲: {30 if role != 'all' else 1}-{current_number-1})")
        
        session.commit()
        print("\n✅ 質問番号の修正完了!")
        
        # 修正結果の確認
        print("\n📊 修正結果:")
        for role in ['all', 'player', 'coach', 'mother', 'father', 'adult']:
            if role == 'all':
                count = session.query(Question).filter(Question.target == 'all').count()
                min_num = session.query(func.min(Question.question_number)).filter(Question.target == 'all').scalar()
                max_num = session.query(func.max(Question.question_number)).filter(Question.target == 'all').scalar()
            else:
                count = session.query(Question).filter(Question.target == role).count()
                min_num = session.query(func.min(Question.question_number)).filter(Question.target == role).scalar()
                max_num = session.query(func.max(Question.question_number)).filter(Question.target == role).scalar()
            
            if count > 0:
                print(f"   {role}: {count}問 (番号範囲: {min_num}-{max_num})")
            else:
                print(f"   {role}: 0問")
        
        # 重複チェック
        print("\n🔍 重複チェック:")
        duplicate_numbers = session.query(
            Question.question_number,
            func.count(Question.question_id)
        ).group_by(
            Question.question_number
        ).having(
            func.count(Question.question_id) > 1
        ).all()
        
        if duplicate_numbers:
            print("   ⚠️  重複する質問番号が見つかりました:")
            for number, count in duplicate_numbers:
                print(f"      番号 {number}: {count}個")
                # 重複している質問の詳細を表示
                dup_questions = session.query(Question).filter(
                    Question.question_number == number
                ).all()
                for q in dup_questions:
                    print(f"         - {q.target} / {q.category} / {q.subcategory}")
        else:
            print("   ✅ 重複なし")
        
    except Exception as e:
        session.rollback()
        print(f"❌ エラーが発生しました: {e}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    fix_question_numbers()