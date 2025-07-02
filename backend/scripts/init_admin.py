#!/usr/bin/env python3
"""
初期管理者ユーザーを作成するスクリプト
使用方法: python scripts/init_admin.py
"""

import sys
import os
import json
import getpass
from datetime import datetime
from passlib.context import CryptContext

# プロジェクトのルートディレクトリをPythonパスに追加
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# パスワードハッシュ化の設定
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 管理者情報を保存するファイル
ADMIN_STORAGE_FILE = "admin_users.json"


def create_initial_admin():
    """初期管理者を作成"""
    print("=== 初期管理者ユーザー作成 ===")
    
    # 既存のファイルチェック
    if os.path.exists(ADMIN_STORAGE_FILE):
        print(f"\n警告: {ADMIN_STORAGE_FILE} が既に存在します。")
        response = input("上書きしますか？ (y/N): ")
        if response.lower() != 'y':
            print("処理を中止しました。")
            return
    
    # メールアドレスの入力
    while True:
        email = input("\n管理者のメールアドレスを入力してください: ").strip()
        if '@' in email and '.' in email:
            break
        print("有効なメールアドレスを入力してください。")
    
    # パスワードの入力
    while True:
        password = getpass.getpass("パスワードを入力してください (8文字以上): ")
        if len(password) >= 8:
            password_confirm = getpass.getpass("パスワードを再入力してください: ")
            if password == password_confirm:
                break
            else:
                print("パスワードが一致しません。もう一度入力してください。")
        else:
            print("パスワードは8文字以上で入力してください。")
    
    # 管理者情報の作成
    admin_users = {
        email: {
            "password_hash": pwd_context.hash(password),
            "created_date": datetime.utcnow().isoformat(),
            "last_login": None
        }
    }
    
    # ファイルに保存
    with open(ADMIN_STORAGE_FILE, 'w') as f:
        json.dump(admin_users, f, indent=2)
    
    print(f"\n✅ 初期管理者が作成されました！")
    print(f"メールアドレス: {email}")
    print(f"ファイル: {ADMIN_STORAGE_FILE}")
    print("\n以下の情報でログインできます：")
    print(f"URL: http://your-domain/admin/login")
    print(f"メールアドレス: {email}")
    print(f"パスワード: [入力したパスワード]")
    
    # セキュリティ推奨事項
    print("\n🔒 セキュリティ推奨事項:")
    print("1. admin_users.json ファイルのアクセス権限を制限してください")
    print("   chmod 600 admin_users.json")
    print("2. 本番環境ではデータベースでの管理を検討してください")
    print("3. 定期的にパスワードを変更してください")
    print("4. 不要な管理者アカウントは削除してください")


if __name__ == "__main__":
    try:
        create_initial_admin()
    except KeyboardInterrupt:
        print("\n\n処理が中断されました。")
    except Exception as e:
        print(f"\nエラーが発生しました: {e}")
        sys.exit(1)