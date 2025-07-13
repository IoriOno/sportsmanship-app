#!/bin/bash

echo "🚀 Sportsmanship App 開発環境セットアップを開始します..."

# 必要なディレクトリを作成
echo "📁 ディレクトリを作成中..."
mkdir -p backend/.env
mkdir -p database/backup

# PostgreSQLの確認
echo "🐘 PostgreSQLの確認中..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQLがインストールされていません。"
    echo "macOSの場合: brew install postgresql"
    echo "Ubuntuの場合: sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

# Python環境の確認
echo "🐍 Python環境の確認中..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3がインストールされていません。"
    exit 1
fi

# Node.js環境の確認
echo "📦 Node.js環境の確認中..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.jsがインストールされていません。"
    echo "https://nodejs.org/ からインストールしてください。"
    exit 1
fi

# データベースの作成
echo "🗄️ データベースを作成中..."
psql -U postgres -c "CREATE DATABASE sportsmanship;" 2>/dev/null || echo "データベースは既に存在します"

# バックエンド環境のセットアップ
echo "🔧 バックエンド環境をセットアップ中..."
cd backend

# Python仮想環境の作成
python3 -m venv venv
source venv/bin/activate

# 依存関係のインストール
pip install -r requirements.txt

# 環境変数ファイルの作成
cat > .env << EOF
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/sportsmanship

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production-environment
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OpenAI (必要に応じて設定)
OPENAI_API_KEY=your-openai-api-key-here

# Admin
ADMIN_EMAIL=admin@sportsmanship.com
ADMIN_PASSWORD=admin123456

# Application
APP_NAME=Sportsmanship App
APP_VERSION=1.0.0
DEBUG=True

# Frontend
REACT_APP_API_URL=http://localhost:8000
REACT_APP_APP_NAME=Sportsmanship App
EOF

echo "✅ バックエンド環境のセットアップが完了しました"

# フロントエンド環境のセットアップ
echo "🎨 フロントエンド環境をセットアップ中..."
cd ../frontend

# 依存関係のインストール
npm install

echo "✅ フロントエンド環境のセットアップが完了しました"

# データベースの初期化
echo "🗄️ データベースを初期化中..."
cd ../database
psql -U postgres -d sportsmanship -f init.sql

# 初期データの挿入
echo "📊 初期データを挿入中..."
psql -U postgres -d sportsmanship -f seeds/clubs.sql
psql -U postgres -d sportsmanship -f seeds/users.sql

echo "✅ データベースの初期化が完了しました"

# 管理者アカウントの作成
echo "👤 管理者アカウントを作成中..."
cd ../backend
source venv/bin/activate
python scripts/init_admin.py

echo "🎉 開発環境のセットアップが完了しました！"
echo ""
echo "📋 次のステップ:"
echo "1. バックエンドサーバーの起動:"
echo "   cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo ""
echo "2. フロントエンドサーバーの起動:"
echo "   cd frontend && npm start"
echo ""
echo "3. 管理者ダッシュボード:"
echo "   http://localhost:3000/admin"
echo "   メール: admin@sportsmanship.com"
echo "   パスワード: admin123456" 