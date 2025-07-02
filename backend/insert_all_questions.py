#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Heroku上のデータベースに全ての質問データを挿入するスクリプト
3つのupdate_スクリプトから質問データをインポートして挿入
"""
import os
import sys
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

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False, index=True)
    subcategory = Column(String, nullable=False)
    question_text = Column(String, nullable=False)
    question_type = Column(String, nullable=False, default="scale")
    scale_min = Column(Integer, default=1)
    scale_max = Column(Integer, default=5)
    reverse_scoring = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

# 各質問データをインポート
sys.path.insert(0, str(Path(__file__).parent / "scripts"))
from update_athlete_mind_questions import QUESTIONS as ATHLETE_MIND_QUESTIONS
from update_self_affirmation_questions import QUESTIONS as SELF_AFFIRMATION_QUESTIONS
from update_sportsmanship_questions import QUESTIONS as SPORTSMANSHIP_QUESTIONS

def insert_all_questions():
    """全ての質問データを挿入"""
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
        
        # 既存の質問データをチェック
        existing_count = session.query(Question).count()
        if existing_count > 0:
            print(f"⚠️  既に{existing_count}個の質問が登録されています")
            response = input("既存のデータを削除して新しいデータを挿入しますか？ (yes/no): ")
            if response.lower() != 'yes':
                print("処理を中止しました")
                return False
            
            # 既存データを削除
            session.query(Question).delete()
            session.commit()
            print("✅ 既存データを削除しました")
        
        # 全ての質問データを結合
        ALL_QUESTIONS = []
        
        # アスリートマインド質問を追加
        print("\n📝 アスリートマインド質問を準備中...")
        ALL_QUESTIONS.extend(ATHLETE_MIND_QUESTIONS)
        print(f"  {len(ATHLETE_MIND_QUESTIONS)}問追加")
        
        # 自己肯定感質問を追加
        print("\n📝 自己肯定感質問を準備中...")
        ALL_QUESTIONS.extend(SELF_AFFIRMATION_QUESTIONS)
        print(f"  {len(SELF_AFFIRMATION_QUESTIONS)}問追加")
        
        # スポーツマンシップ質問を追加
        print("\n📝 スポーツマンシップ質問を準備中...")
        ALL_QUESTIONS.extend(SPORTSMANSHIP_QUESTIONS)
        print(f"  {len(SPORTSMANSHIP_QUESTIONS)}問追加")
        
        # 質問データを挿入
        print(f"\n💾 質問データを挿入中... (全{len(ALL_QUESTIONS)}問)")
        for i, q_data in enumerate(ALL_QUESTIONS, 1):
            question = Question(**q_data)
            session.add(question)
            if i % 10 == 0:
                print(f"  {i}問挿入完了...")
        
        session.commit()
        print(f"\n✅ 全{len(ALL_QUESTIONS)}問の質問データを挿入しました")
        
        # 挿入結果を確認
        print("\n📊 登録結果:")
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
    print("=== Heroku質問データ挿入スクリプト ===")
    print("3つのカテゴリの質問データを挿入します:")
    print("- アスリートマインド")
    print("- 自己肯定感")
    print("- スポーツマンシップ")
    insert_all_questions()