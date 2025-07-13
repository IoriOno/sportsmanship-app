#!/usr/bin/env python3
"""
既存ユーザーのパスワードハッシュをbcrypt形式に修正するスクリプト
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import engine
from app.models.user import User
from app.core.security import get_password_hash

def fix_user_passwords():
    """既存ユーザーのパスワードハッシュを修正"""
    
    session = Session(engine)
    
    try:
        print("🔄 ユーザーパスワードの修正を開始...")
        
        # サンプルユーザーのメールアドレス
        sample_emails = [
            "tanaka@example.com",
            "sato@example.com", 
            "yamada@example.com",
            "suzuki@example.com",
            "takahashi@example.com"
        ]
        
        fixed_count = 0
        
        for email in sample_emails:
            user = session.query(User).filter(User.email == email).first()
            if user:
                # bcrypt形式のパスワードハッシュに更新
                user.password_hash = get_password_hash("password123")
                fixed_count += 1
                print(f"パスワード修正: {user.name} ({email})")
        
        session.commit()
        print(f"✅ {fixed_count}人のユーザーのパスワードを修正しました")
        
        print("\n🎉 パスワード修正が完了しました!")
        print("ログイン情報:")
        print("- メール: tanaka@example.com")
        print("- パスワード: password123")
        
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        session.rollback()
        raise
    finally:
        session.close()

if __name__ == "__main__":
    fix_user_passwords() 