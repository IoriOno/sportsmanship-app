#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
選手向けにスポーツマンシップ質問を追加するスクリプト
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

def add_sportsmanship_to_player():
    """選手向けにスポーツマンシップ質問を追加"""
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
        
        # 既存の選手向けスポーツマンシップ質問をチェック
        existing_count = session.query(Question).filter(
            Question.target == 'player',
            Question.category == 'sportsmanship'
        ).count()
        
        if existing_count > 0:
            print(f"⚠️  既に{existing_count}個の選手向けスポーツマンシップ質問が登録されています")
            response = input("既存のデータを削除して新しいデータを挿入しますか？ (yes/no): ")
            if response.lower() != 'yes':
                print("処理を中止しました")
                return False
            
            # 既存データを削除
            session.query(Question).filter(
                Question.target == 'player',
                Question.category == 'sportsmanship'
            ).delete()
            session.commit()
            print("✅ 既存データを削除しました")
        
        # 全対象共通のスポーツマンシップ質問を取得
        all_sportsmanship = session.query(Question).filter(
            Question.target == 'all',
            Question.category == 'sportsmanship'
        ).all()
        
        print(f"📝 選手向けにスポーツマンシップ質問を追加中... ({len(all_sportsmanship)}問)")
        
        # 現在の最大質問番号を取得
        max_question_number = session.query(func.max(Question.question_number)).scalar() or 0
        question_number = max_question_number + 1
        
        added_count = 0
        for question in all_sportsmanship:
            # 選手向けの新しい質問を作成
            new_question = Question(
                question_id=uuid.uuid4(),
                question_number=question_number,
                question_text=question.question_text,
                category=question.category,
                subcategory=question.subcategory,
                target='player',  # 選手向けに変更
                is_reverse_score=question.is_reverse_score,
                is_active=question.is_active
            )
            session.add(new_question)
            question_number += 1
            added_count += 1
        
        session.commit()
        print(f"✅ 選手向けスポーツマンシップ質問追加完了: {added_count}問")
        
        # 投入結果を確認
        print("\n📊 登録結果:")
        categories = session.query(Question.category).distinct().all()
        for cat in categories:
            count = session.query(Question).filter_by(category=cat[0]).count()
            subcategories = session.query(Question.subcategory).filter_by(category=cat[0]).distinct().all()
            print(f"\n  カテゴリ: {cat[0]} (全{count}問)")
            for subcat in subcategories:
                subcount = session.query(Question).filter_by(category=cat[0], subcategory=subcat[0]).count()
                print(f"    - {subcat[0]}: {subcount}問")
        
        # 選手向けの質問数を確認
        player_count = session.query(Question).filter_by(target='player').count()
        print(f"\n🎯 選手向け質問数: {player_count}問")
        
        session.close()
        return True
        
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=== 選手向けスポーツマンシップ質問追加スクリプト ===")
    add_sportsmanship_to_player() 