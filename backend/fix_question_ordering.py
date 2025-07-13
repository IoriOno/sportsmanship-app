#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
質問の順番を正しく並べ直すスクリプト
各アカウント種別で共通の質問（スポーツマンシップ）を含めて順番通りに表示されるようにする
"""
import os
import sys
import uuid
from pathlib import Path

# プロジェクトルートをPythonパスに追加
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime

# データベース設定を直接扱う
Base = declarative_base()

# Questionモデルを直接定義
class Question(Base):
    __tablename__ = "questions"

    question_id = Column(String, primary_key=True, index=True)  # UUID
    question_number = Column(Integer, nullable=False, unique=True)
    question_text = Column(String, nullable=False)
    category = Column(String, nullable=False, index=True)
    subcategory = Column(String, nullable=False)
    target = Column(String, nullable=False)
    is_reverse_score = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_date = Column(DateTime, server_default=func.now())
    updated_date = Column(DateTime, server_default=func.now(), onupdate=func.now())

def fix_question_ordering():
    """質問の順番を正しく並べ直す"""
    # データベースURLを取得
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("❌ エラー: DATABASE_URL環境変数が設定されていません")
        return False
    
    # HerokuのPostgreSQLのURLを修正（postgres:// → postgresql://）
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
    try:
        # データベース接続
        print("データベースに接続中...")
        print(f"URL: {database_url.split('@')[1]}")  # パスワード部分を隠して表示
        engine = create_engine(database_url)
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # 現在の質問データを取得
        all_questions = session.query(Question).order_by(Question.category, Question.subcategory, Question.question_number).all()
        
        print(f"📝 質問データを並べ直し中... (全{len(all_questions)}問)")
        
        # 新しいquestion_numberを割り当て
        new_question_number = 1
        for question in all_questions:
            old_number = question.question_number
            question.question_number = new_question_number
            new_question_number += 1
            print(f"  質問番号 {old_number} → {question.question_number}: {question.category}.{question.subcategory}")
        
        session.commit()
        print(f"✅ 質問の順番を修正しました (1から{new_question_number-1}まで)")
        
        # 修正結果を確認
        print("\n📊 修正結果:")
        categories = session.query(Question.category).distinct().all()
        for cat in categories:
            count = session.query(Question).filter_by(category=cat[0]).count()
            subcategories = session.query(Question.subcategory).filter_by(category=cat[0]).distinct().all()
            print(f"\n  カテゴリ: {cat[0]} (全{count}問)")
            for subcat in subcategories:
                subcount = session.query(Question).filter_by(category=cat[0], subcategory=subcat[0]).count()
                print(f"    - {subcat[0]}: {subcount}問")
        
        session.close()
        return True
        
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=== 質問順番修正スクリプト ===")
    print("質問を正しい順番で並べ直します:")
    print("- スポーツマンシップ (1-29)")
    print("- アスリートマインド (30-79)")
    print("- 自己肯定感 (80-99)")
    fix_question_ordering() 