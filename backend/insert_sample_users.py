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
    ('DEMO001', 'coach@demo.com', password_hash, '田中コーチ', 35, 'coach', False, True, False),
    ('DEMO001', 'yamada@demo.com', password_hash, '山田コーチ', 38, 'coach', False, True, False),
    ('DEMO001', 'player1@demo.com', password_hash, '佐藤太郎', 16, 'player', False, False, False),
    ('DEMO001', 'player2@demo.com', password_hash, '山田花子', 15, 'player', False, False, False),
    ('DEMO001', 'parent1@demo.com', password_hash, '佐藤一郎', 45, 'father', True, False, True),
    ('DEMO001', 'parent2@demo.com', password_hash, '佐藤美香', 42, 'mother', False, False, False),
]

try:
    with engine.connect() as conn:
        # 既存のサンプルユーザーを削除
        print("Deleting existing sample users...")
        conn.execute(text("DELETE FROM family_relations"))
        conn.execute(text("DELETE FROM users WHERE email LIKE '%@demo.com'"))
        
        # 新しいユーザーを挿入
        print("Inserting new sample users...")
        for user_data in sample_users:
            conn.execute(text("""
                INSERT INTO users (club_id, email, password_hash, name, age, role, parent_function, head_coach_function, head_parent_function) 
                VALUES (:club_id, :email, :password_hash, :name, :age, :role, :parent_function, :head_coach_function, :head_parent_function)
            """), {
                'club_id': user_data[0],
                'email': user_data[1],
                'password_hash': user_data[2],
                'name': user_data[3],
                'age': user_data[4],
                'role': user_data[5],
                'parent_function': user_data[6],
                'head_coach_function': user_data[7],
                'head_parent_function': user_data[8]
            })
        
        # 家族関係を挿入
        print("Inserting family relations...")
        family_relations = [
            ('parent1@demo.com', 'player1@demo.com'),
            ('parent2@demo.com', 'player1@demo.com'),
            ('parent1@demo.com', 'player2@demo.com'),
            ('parent2@demo.com', 'player2@demo.com'),
        ]
        
        for parent_email, child_email in family_relations:
            conn.execute(text("""
                INSERT INTO family_relations (parent_id, child_id) 
                SELECT u1.user_id, u2.user_id 
                FROM users u1, users u2 
                WHERE u1.email = :parent_email AND u2.email = :child_email
            """), {'parent_email': parent_email, 'child_email': child_email})
        
        conn.commit()
        print("Sample users inserted successfully!")
        
        # 確認
        result = conn.execute(text("SELECT email, name, role FROM users WHERE email LIKE '%@demo.com'"))
        print("\nInserted users:")
        for row in result:
            print(f"- {row.email}: {row.name} ({row.role})")
            
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1) 