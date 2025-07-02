#!/bin/bash
echo "🛡️ 管理者システムを起動中..."

# 管理者バックエンド起動
cd backend_admin
uvicorn app.main:app --host 0.0.0.0 --port 8001 &
ADMIN_BACKEND_PID=$!

# 管理者フロントエンド起動
cd ../frontend_admin
npm start -- --port 3001 &
ADMIN_FRONTEND_PID=$!

echo "✅ 管理者システムが起動しました"
echo "🛡️ 管理ダッシュボード: http://localhost:3001/admin"
echo "🔧 管理API: http://localhost:8001"
echo "📚 管理API ドキュメント: http://localhost:8001/admin-docs"

# 終了時のクリーンアップ
trap "kill $ADMIN_BACKEND_PID $ADMIN_FRONTEND_PID" EXIT
wait
