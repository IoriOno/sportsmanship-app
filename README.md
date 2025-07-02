# スポーツマンシップアプリ

スポーツクラブ向けメンタルヘルスチェック・分析・AIコーチングアプリケーション

## 技術スタック

- **Frontend**: React.js + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python
- **Database**: PostgreSQL
- **AI**: OpenAI ChatGPT API
- **Container**: Docker + Docker Compose

## セットアップ

1. 環境変数の設定
```bash
cp .env.example .env
# .envファイルを編集してOpenAI APIキーなどを設定
```

2. Dockerコンテナの起動
```bash
docker-compose up -d
```

3. データベースマイグレーション
```bash
docker-compose exec backend alembic upgrade head
```

4. アプリケーションへのアクセス
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 主要機能

1. **99問メンタルヘルステスト**
   - 自己肯定感、アスリートマインド、スポーツマンシップの測定
   - 0-10の11段階評価

2. **結果分析**
   - レーダーチャート、円グラフによる視覚化
   - アスリートタイプ診断
   - 改善提案の自動生成

3. **1on1比較機能**
   - コーチ・保護者と選手の資質比較
   - 相互理解促進のためのアドバイス生成

4. **AIコーチング**
   - ChatGPT APIを活用した個別コーチング
   - テスト結果に基づくパーソナライズされたアドバイス

5. **権限管理**
   - 選手、コーチ、保護者、ヘッドコーチ、親機能保護者の5種類
   - 役割に応じた機能制限

## 開発者向け

### Frontend開発
```bash
cd frontend
npm install
npm start
```

### Backend開発
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### テスト実行
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## ライセンス

Copyright (c) 2024 Sportsmanship App. All rights reserved.