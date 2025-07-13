#!/usr/bin/env python3
"""
テスト結果UI更新用のサンプルデータを作成するスクリプト
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import engine
from app.models.user import User, UserRole
from app.models.test_result import TestResult
import uuid
from datetime import datetime, timedelta
import random
import hashlib

def create_sample_test_data():
    """サンプルテストデータを作成"""
    
    session = Session(engine)
    
    try:
        print("🔄 サンプルテストデータの作成を開始...")
        
        # サンプルユーザーを作成
        sample_users = [
            {
                "name": "田中太郎",
                "email": "tanaka@example.com",
                "role": UserRole.player,
                "age": 18,
                "club_id": "CLUB001"
            },
            {
                "name": "佐藤花子",
                "email": "sato@example.com", 
                "role": UserRole.mother,
                "age": 45,
                "club_id": "CLUB001"
            },
            {
                "name": "山田コーチ",
                "email": "yamada@example.com",
                "role": UserRole.coach,
                "age": 35,
                "club_id": "CLUB001"
            },
            {
                "name": "鈴木一郎",
                "email": "suzuki@example.com",
                "role": UserRole.father,
                "age": 48,
                "club_id": "CLUB002"
            },
            {
                "name": "高橋美咲",
                "email": "takahashi@example.com",
                "role": UserRole.player,
                "age": 16,
                "club_id": "CLUB002"
            }
        ]
        
        created_users = []
        
        for user_data in sample_users:
            # 既存ユーザーをチェック
            existing_user = session.query(User).filter(User.email == user_data["email"]).first()
            if existing_user:
                created_users.append(existing_user)
                print(f"既存ユーザー: {user_data['name']}")
                continue
                
            # 新規ユーザー作成（bcryptの代わりにSHA256を使用）
            password_hash = hashlib.sha256("password123".encode()).hexdigest()
            user = User(
                user_id=uuid.uuid4(),
                name=user_data["name"],
                email=user_data["email"],
                password_hash=password_hash,
                role=user_data["role"],
                age=user_data["age"],
                club_id=user_data["club_id"],
                is_individual=False
            )
            session.add(user)
            created_users.append(user)
            print(f"新規ユーザー作成: {user_data['name']}")
        
        session.commit()
        print(f"✅ {len(created_users)}人のユーザーを作成/確認しました")
        
        # サンプルテスト結果を作成
        test_results = []
        
        for i, user in enumerate(created_users):
            # 各ユーザーに複数のテスト結果を作成
            for j in range(3):  # 各ユーザーに3つのテスト結果
                # ランダムなスコアを生成
                scores = {
                    # 自己肯定感
                    "self_determination": round(random.uniform(3.0, 8.0), 1),
                    "self_acceptance": round(random.uniform(3.0, 8.0), 1),
                    "self_worth": round(random.uniform(3.0, 8.0), 1),
                    "self_efficacy": round(random.uniform(3.0, 8.0), 1),
                    
                    # アスリートマインド
                    "commitment": round(random.uniform(3.0, 8.0), 1),
                    "result": round(random.uniform(3.0, 8.0), 1),
                    "steadiness": round(random.uniform(3.0, 8.0), 1),
                    "devotion": round(random.uniform(3.0, 8.0), 1),
                    "self_control": round(random.uniform(3.0, 8.0), 1),
                    "assertion": round(random.uniform(3.0, 8.0), 1),
                    "sensitivity": round(random.uniform(3.0, 8.0), 1),
                    "intuition": round(random.uniform(3.0, 8.0), 1),
                    "introspection": round(random.uniform(3.0, 8.0), 1),
                    "comparison": round(random.uniform(3.0, 8.0), 1),
                    
                    # スポーツマンシップ
                    "courage": round(random.uniform(3.0, 8.0), 1),
                    "resilience": round(random.uniform(3.0, 8.0), 1),
                    "cooperation": round(random.uniform(3.0, 8.0), 1),
                    "natural_acceptance": round(random.uniform(3.0, 8.0), 1),
                    "non_rationality": round(random.uniform(3.0, 8.0), 1)
                }
                
                # 合計スコア計算
                self_esteem_total = sum([
                    scores["self_determination"],
                    scores["self_acceptance"], 
                    scores["self_worth"],
                    scores["self_efficacy"]
                ]) / 4
                
                # アスリートタイプ判定
                athlete_scores = [
                    scores["commitment"], scores["result"], scores["steadiness"],
                    scores["devotion"], scores["self_control"], scores["assertion"],
                    scores["sensitivity"], scores["intuition"], scores["introspection"],
                    scores["comparison"]
                ]
                
                max_score = max(athlete_scores)
                athlete_type = "バランス型"
                if max_score == scores["commitment"]:
                    athlete_type = "こだわり型"
                elif max_score == scores["result"]:
                    athlete_type = "結果重視型"
                elif max_score == scores["steadiness"]:
                    athlete_type = "堅実型"
                elif max_score == scores["devotion"]:
                    athlete_type = "献身型"
                elif max_score == scores["self_control"]:
                    athlete_type = "克己型"
                elif max_score == scores["assertion"]:
                    athlete_type = "主張型"
                elif max_score == scores["sensitivity"]:
                    athlete_type = "繊細型"
                elif max_score == scores["intuition"]:
                    athlete_type = "直感型"
                elif max_score == scores["introspection"]:
                    athlete_type = "内省型"
                elif max_score == scores["comparison"]:
                    athlete_type = "比較型"
                
                # テスト日付（過去30日以内）
                test_date = datetime.now() - timedelta(days=random.randint(0, 30))
                
                test_result = TestResult(
                    result_id=uuid.uuid4(),
                    user_id=user.user_id,
                    target_selection=user.role.value,
                    test_date=test_date,
                    **scores,
                    self_esteem_total=round(self_esteem_total, 1),
                    self_esteem_analysis=f"{user.name}さんの自己肯定感は{'高い' if self_esteem_total > 6.0 else '標準的' if self_esteem_total > 4.5 else '改善の余地がある'}レベルです。",
                    self_esteem_improvements="継続的な練習と自己評価の向上により、さらなる成長が期待できます。",
                    athlete_type=athlete_type,
                    athlete_type_description=f"{athlete_type}の特徴として、{athlete_type}らしい思考パターンと行動様式が見られます。",
                    athlete_type_percentages="こだわり:20%, 結果:15%, 堅実:10%, 献身:12%, 克己:8%, 主張:10%, 繊細:8%, 直感:7%, 内省:5%, 比較:5%",
                    strengths="継続力と集中力に優れています。",
                    weaknesses="時々完璧主義になりすぎる傾向があります。",
                    sportsmanship_balance="スポーツマンシップのバランスは良好で、競技と人格の両面で成長しています。"
                )
                
                session.add(test_result)
                test_results.append(test_result)
        
        session.commit()
        print(f"✅ {len(test_results)}件のテスト結果を作成しました")
        
        # 作成結果の確認
        print("\n📊 作成結果:")
        for user in created_users:
            result_count = session.query(TestResult).filter(TestResult.user_id == user.user_id).count()
            print(f"   {user.name} ({user.role.value}): {result_count}件のテスト結果")
        
        print("\n🎉 サンプルデータの作成が完了しました!")
        
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        session.rollback()
        raise
    finally:
        session.close()

if __name__ == "__main__":
    create_sample_test_data() 