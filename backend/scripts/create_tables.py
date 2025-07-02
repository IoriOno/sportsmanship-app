#!/usr/bin/env python3
"""
Heroku用テーブル作成スクリプト
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base
from app.models.user import User
from app.models.test_result import TestResult  
from app.models.question import Question
from app.models.club import Club

def create_tables():
    """テーブルを作成"""
    try:
        Base.metadata.create_all(engine)
        print('✅ テーブル作成完了')
        
        # テーブル一覧を確認
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f'作成されたテーブル: {tables}')
        
    except Exception as e:
        print(f'❌ エラー: {e}')
        return False
    
    return True

if __name__ == "__main__":
    create_tables()
