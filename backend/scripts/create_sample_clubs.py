#!/usr/bin/env python3
"""
サンプルクラブデータを作成するスクリプト
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import engine
from app.models.club import Club

def create_sample_clubs():
    """サンプルクラブデータを作成"""
    
    session = Session(engine)
    
    try:
        print("🔄 サンプルクラブデータの作成を開始...")
        
        # サンプルクラブデータ
        sample_clubs = [
            {
                "club_id": "CLUB001",
                "club_name": "サッカークラブA"
            },
            {
                "club_id": "CLUB002", 
                "club_name": "野球クラブB"
            },
            {
                "club_id": "CLUB003",
                "club_name": "バスケットボールクラブC"
            }
        ]
        
        created_clubs = []
        
        for club_data in sample_clubs:
            # 既存クラブをチェック
            existing_club = session.query(Club).filter(Club.club_id == club_data["club_id"]).first()
            if existing_club:
                created_clubs.append(existing_club)
                print(f"既存クラブ: {club_data['club_name']}")
                continue
                
            # 新規クラブ作成
            club = Club(
                club_id=club_data["club_id"],
                club_name=club_data["club_name"]
            )
            session.add(club)
            created_clubs.append(club)
            print(f"新規クラブ作成: {club_data['club_name']}")
        
        session.commit()
        print(f"✅ {len(created_clubs)}個のクラブを作成/確認しました")
        
        # 作成結果の確認
        print("\n📊 作成結果:")
        for club in created_clubs:
            print(f"   {club.club_id}: {club.club_name}")
        
        print("\n🎉 サンプルクラブデータの作成が完了しました!")
        
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        session.rollback()
        raise
    finally:
        session.close()

if __name__ == "__main__":
    create_sample_clubs() 