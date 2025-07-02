#!/usr/bin/env python3
"""
Heroku用簡易セットアップスクリプト
"""

import os
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid

def create_tables_directly():
    """環境変数から直接データベースURLを取得してテーブル作成"""
    
    # HerokuのDATABASE_URLを取得
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print('❌ DATABASE_URL環境変数が見つかりません')
        return False
    
    # postgresql:// に変換（Herokuの場合）
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
    print(f'データベースURL接続中...')
    
    try:
        # エンジン作成
        engine = create_engine(database_url, pool_pre_ping=True)
        
        # メタデータ作成
        metadata = MetaData()
        
        # questionsテーブル
        questions = Table('questions', metadata,
            Column('question_id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
            Column('question_number', Integer, nullable=False),
            Column('question_text', String(1000), nullable=False),
            Column('category', String(50), nullable=False),
            Column('subcategory', String(50), nullable=False),
            Column('target', String(50), nullable=False),
            Column('is_reverse_score', Boolean, default=False),
            Column('is_active', Boolean, default=True)
        )
        
        # test_resultsテーブル
        test_results = Table('test_results', metadata,
            Column('result_id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
            Column('user_id', UUID(as_uuid=True), nullable=True),
            Column('target_selection', String(20), nullable=False),
            Column('test_date', DateTime),
            
            # 自己肯定感
            Column('self_determination', Float),
            Column('self_acceptance', Float),
            Column('self_worth', Float),
            Column('self_efficacy', Float),
            
            # アスリートマインド
            Column('commitment', Float),
            Column('result', Float),
            Column('steadiness', Float),
            Column('devotion', Float),
            Column('self_control', Float),
            Column('assertion', Float),
            Column('sensitivity', Float),
            Column('intuition', Float),
            Column('introspection', Float),
            Column('comparison', Float),
            
            # スポーツマンシップ
            Column('courage', Float),
            Column('resilience', Float),
            Column('cooperation', Float),
            Column('natural_acceptance', Float),
            Column('non_rationality', Float),
            
            # 分析結果
            Column('self_esteem_total', Float),
            Column('self_esteem_analysis', String(1000)),
            Column('self_esteem_improvements', String(2000)),
            Column('athlete_type', String(100)),
            Column('athlete_type_description', String(1000)),
            Column('athlete_type_percentages', String(500)),
            Column('strengths', String(500)),
            Column('weaknesses', String(500)),
            Column('sportsmanship_balance', String(1000)),
            Column('created_date', DateTime)
        )
        
        # テーブル作成
        metadata.create_all(engine)
        
        print('✅ テーブル作成完了')
        
        # 作成されたテーブルを確認
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f'作成されたテーブル: {tables}')
        
        return True
        
    except Exception as e:
        print(f'❌ エラー: {e}')
        return False

if __name__ == "__main__":
    create_tables_directly()
