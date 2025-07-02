#!/bin/bash
echo "🌐 ユーザーシステムを起動中..."

# バックエンド起動
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# フロントエンド起動
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "✅ ユーザーシステムが起動しました"
echo "🌐 フロントエンド: http://localhost:3000"
echo "🔧 バックエンド: http://localhost:8000"
echo "📚 API ドキュメント: http://localhost:8000/docs"

# 終了時のクリーンアップ
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
