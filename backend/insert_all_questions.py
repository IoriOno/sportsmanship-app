#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Heroku上のデータベースに全ての質問データを挿入するスクリプト
3つのupdate_スクリプトから質問データをインポートして挿入
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

# 各質問データをインポート
sys.path.insert(0, str(Path(__file__).parent / "scripts"))
from update_athlete_mind_questions import ATHLETE_MIND_QUESTIONS
from update_self_affirmation_questions import SELF_AFFIRMATION_QUESTIONS
from update_sportsmanship_questions import SPORTSMANSHIP_QUESTIONS

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
            print("既存データを削除して新しいデータを挿入します")
            
            # 既存データを削除
            session.query(Question).delete()
            session.commit()
            print("✅ 既存データを削除しました")
        
        # カテゴリ別に質問データを整理
        print("\n📝 質問データを整理中...")
        
        # スポーツマンシップ質問（全対象共通）
        sportsmanship_questions = []
        for subcategory, questions in SPORTSMANSHIP_QUESTIONS.items():
            for question_text in questions:
                sportsmanship_questions.append({
                    'question_text': question_text,
                    'category': 'sportsmanship',
                    'subcategory': subcategory,
                    'target': 'all',
                    'is_reverse_score': True,
                    'is_active': True
                })
        print(f"  スポーツマンシップ: {len(sportsmanship_questions)}問")
        
        # アスリートマインド質問（役割別）
        athlete_mind_questions = []
        for target, categories in ATHLETE_MIND_QUESTIONS.items():
            for subcategory, questions in categories.items():
                for question_text in questions:
                    athlete_mind_questions.append({
                        'question_text': question_text,
                        'category': 'athlete_mind',
                        'subcategory': subcategory,
                        'target': target,
                        'is_reverse_score': False,
                        'is_active': True
                    })
        print(f"  アスリートマインド: {len(athlete_mind_questions)}問")
        
        # 自己肯定感質問（役割別）
        self_affirmation_questions = []
        for target, categories in SELF_AFFIRMATION_QUESTIONS.items():
            for subcategory, questions in categories.items():
                for question_text in questions:
                    self_affirmation_questions.append({
                        'question_text': question_text,
                        'category': 'self_affirmation',
                        'subcategory': subcategory,
                        'target': target,
                        'is_reverse_score': False,
                        'is_active': True
                    })
        print(f"  自己肯定感: {len(self_affirmation_questions)}問")
        
        # 質問データを挿入（カテゴリ別に番号を振り直し）
        print(f"\n💾 質問データを挿入中...")
        
        # スポーツマンシップ質問を挿入（1番から開始）
        print(f"\n📝 スポーツマンシップ質問を挿入中... (1番から{len(sportsmanship_questions)}番)")
        for i, q_data in enumerate(sportsmanship_questions, 1):
            q_data['question_id'] = str(uuid.uuid4())
            q_data['question_number'] = i
            question = Question(**q_data)
            session.add(question)
            session.flush()  # 各質問を個別にコミット
        
        # アスリートマインド質問を挿入（1番から開始）
        print(f"📝 アスリートマインド質問を挿入中... (1番から{len(athlete_mind_questions)}番)")
        for i, q_data in enumerate(athlete_mind_questions, 1):
            q_data['question_id'] = str(uuid.uuid4())
            q_data['question_number'] = i
            question = Question(**q_data)
            session.add(question)
            session.flush()  # 各質問を個別にコミット
        
        # 自己肯定感質問を挿入（1番から開始）
        print(f"📝 自己肯定感質問を挿入中... (1番から{len(self_affirmation_questions)}番)")
        for i, q_data in enumerate(self_affirmation_questions, 1):
            q_data['question_id'] = str(uuid.uuid4())
            q_data['question_number'] = i
            question = Question(**q_data)
            session.add(question)
            session.flush()  # 各質問を個別にコミット
        
        session.commit()
        print(f"\n✅ 全質問データを挿入しました")
        
        # 挿入結果を確認
        print("\n📊 登録結果:")
        categories = session.query(Question.category).distinct().all()
        for cat in categories:
            count = session.query(Question).filter_by(category=cat[0]).count()
            min_num = session.query(func.min(Question.question_number)).filter_by(category=cat[0]).scalar()
            max_num = session.query(func.max(Question.question_number)).filter_by(category=cat[0]).scalar()
            print(f"\n  カテゴリ: {cat[0]} (全{count}問, 番号範囲: {min_num}-{max_num})")
            
            # サブカテゴリ別の内訳
            subcategories = session.query(Question.subcategory).filter_by(category=cat[0]).distinct().all()
            for subcat in subcategories:
                subcount = session.query(Question).filter_by(category=cat[0], subcategory=subcat[0]).count()
                print(f"    - {subcat[0]}: {subcount}問")
        
        # 役割別の質問数確認
        print("\n📊 役割別質問数:")
        targets = session.query(Question.target).distinct().all()
        for target in targets:
            count = session.query(Question).filter_by(target=target[0]).count()
            print(f"  対象 {target[0]}: {count}問")
        
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
    print("- スポーツマンシップ（全対象共通）")
    print("- アスリートマインド（役割別）")
    print("- 自己肯定感（役割別）")
    print("\n各カテゴリで質問番号を1から振り直します")
    insert_all_questions()