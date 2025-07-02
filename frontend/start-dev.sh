#!/bin/bash
echo "🚀 Starting development environment..."
echo "📍 Forcing local API usage..."

# 環境変数を明示的に設定
export REACT_APP_API_URL=http://localhost:8000
export REACT_APP_ENV=development
export NODE_ENV=development

# 現在の設定を表示
echo "✅ Environment variables set:"
echo "   REACT_APP_API_URL=$REACT_APP_API_URL"
echo "   REACT_APP_ENV=$REACT_APP_ENV"
echo "   NODE_ENV=$NODE_ENV"

# 既存のプロセスを確認
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  Port 3000 is already in use. Killing existing process..."
    lsof -t -i :3000 | xargs kill -9
fi

# 開発サーバーを起動
echo "🔧 Starting React development server..."
npm start