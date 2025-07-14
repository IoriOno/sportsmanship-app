#!/usr/bin/env python3
"""
サンプルユーザーを挿入するスクリプト
新しいbcryptハッシュでサンプルユーザーを作成
"""

import os
import sys
from sqlalchemy import create_engine, text
from passlib.hash import bcrypt

# データベースURLを環境変数から取得
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
if not DATABASE_URL:
    print("DATABASE_URL environment variable not found")
    sys.exit(1)

# エンジンを作成
engine = create_engine(DATABASE_URL)

# 新しいハッシュを生成
password_hash = bcrypt.hash('password123')
print(f"Generated hash: {password_hash}")

# サンプルユーザーデータ
sample_users = [
    (1, 'DEMO001', 'coach@demo.com', password_hash, '田中コーチ', 35, 'coach', False, True, False),
    (2, 'DEMO001', 'yamada@demo.com', password_hash, '山田コーチ', 38, 'coach', False, True, False),
    (3, 'DEMO001', 'player1@demo.com', password_hash, '佐藤太郎', 16, 'player', False, False, False),
    (4, 'DEMO001', 'player2@demo.com', password_hash, '山田花子', 15, 'player', False, False, False),
    (5, 'DEMO001', 'parent1@demo.com', password_hash, '佐藤一郎', 45, 'father', True, False, True),
    (6, 'DEMO001', 'parent2@demo.com', password_hash, '佐藤美香', 42, 'mother', False, False, False),
]

try:
    with engine.connect() as conn:
        # 既存のサンプルユーザーを削除
        print("Deleting existing sample users...")
        conn.execute(text("DELETE FROM family_relations"))
        conn.execute(text("DELETE FROM users WHERE user_id IN (1,2,3,4,5,6)"))
        
        # 新しいユーザーを挿入
        print("Inserting new sample users...")
        for user_data in sample_users:
            conn.execute(text("""
                INSERT INTO users (user_id, club_id, email, password_hash, name, age, role, parent_function, head_coach_function, head_parent_function) 
                VALUES (:user_id, :club_id, :email, :password_hash, :name, :age, :role, :parent_function, :head_coach_function, :head_parent_function)
            """), {
                'user_id': user_data[0],
                'club_id': user_data[1],
                'email': user_data[2],
                'password_hash': user_data[3],
                'name': user_data[4],
                'age': user_data[5],
                'role': user_data[6],
                'parent_function': user_data[7],
                'head_coach_function': user_data[8],
                'head_parent_function': user_data[9]
            })
        
        # 家族関係を挿入（user_idで指定）
        print("Inserting family relations...")
        family_relations = [
            (5, 3), # parent1 -> player1
            (6, 3), # parent2 -> player1
            (5, 4), # parent1 -> player2
            (6, 4), # parent2 -> player2
        ]
        
        for parent_id, child_id in family_relations:
            conn.execute(text("""
                INSERT INTO family_relations (parent_id, child_id) VALUES (:parent_id, :child_id)
            """), {'parent_id': parent_id, 'child_id': child_id})
        
        conn.commit()
        print("Sample users inserted successfully!")
        
        # 確認
        result = conn.execute(text("SELECT user_id, email, name, role FROM users WHERE user_id IN (1,2,3,4,5,6)"))
        print("\nInserted users:")
        for row in result:
            print(f"- {row.user_id}: {row.email}: {row.name} ({row.role})")
            
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1) 