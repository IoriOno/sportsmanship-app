# Sportsmanship App 開発環境セットアップ

## 概要
このプロジェクトは、スポーツマンシップ評価システムのフルスタックアプリケーションです。
- **バックエンド**: FastAPI + PostgreSQL
- **フロントエンド**: React + TypeScript + Tailwind CSS

## 前提条件

### 必要なソフトウェア
1. **PostgreSQL** (バージョン 12以上)
2. **Python** (バージョン 3.8以上)
3. **Node.js** (バージョン 16以上)
4. **npm** (Node.jsと一緒にインストール)

### インストール方法

#### macOS
```bash
# Homebrewを使用
brew install postgresql
brew install python3
brew install node

# PostgreSQLの起動
brew services start postgresql
```

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo apt-get install python3 python3-pip python3-venv
sudo apt-get install nodejs npm
```

## クイックセットアップ

自動セットアップスクリプトを実行：
```bash
chmod +x setup_dev_environment.sh
./setup_dev_environment.sh
```

## 手動セットアップ

### 1. データベースの準備

```bash
# PostgreSQLに接続
sudo -u postgres psql

# データベースとユーザーを作成
CREATE DATABASE sportsmanship;
CREATE USER sportsmanship_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE sportsmanship TO sportsmanship_user;
\q
```

### 2. バックエンド環境のセットアップ

```bash
cd backend

# Python仮想環境の作成
python3 -m venv venv
source venv/bin/activate

# 依存関係のインストール
pip install -r requirements.txt

# 環境変数ファイルの作成
cat > .env << EOF
DATABASE_URL=postgresql://sportsmanship_user:your_password@localhost:5432/sportsmanship
SECRET_KEY=your-super-secret-key-change-this-in-production-environment
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_API_KEY=your-openai-api-key-here
ADMIN_EMAIL=admin@sportsmanship.com
ADMIN_PASSWORD=admin123456
APP_NAME=Sportsmanship App
APP_VERSION=1.0.0
DEBUG=True
REACT_APP_API_URL=http://localhost:8000
REACT_APP_APP_NAME=Sportsmanship App
EOF

# データベーステーブルの作成
python scripts/create_tables.py

# 管理者アカウントの作成
python scripts/init_admin.py
```

### 3. フロントエンド環境のセットアップ

```bash
cd ../frontend

# 依存関係のインストール
npm install
```

### 4. データベースの初期化

```bash
cd ../database

# データベーススキーマの作成
psql -U sportsmanship_user -d sportsmanship -f init.sql

# 初期データの挿入
psql -U sportsmanship_user -d sportsmanship -f seeds/clubs.sql
psql -U sportsmanship_user -d sportsmanship -f seeds/users.sql
```

## アプリケーションの起動

### バックエンドサーバーの起動
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### フロントエンドサーバーの起動
```bash
cd frontend
npm start
```

## アクセス方法

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000
- **API ドキュメント**: http://localhost:8000/docs
- **管理者ダッシュボード**: http://localhost:3000/admin

### 管理者アカウント
- **メール**: admin@sportsmanship.com
- **パスワード**: admin123456

## データベース構造

### 主要テーブル
1. **users** - ユーザー情報
2. **clubs** - クラブ情報
3. **test_results** - テスト結果
4. **family_relations** - 家族関係
5. **comparison_results** - 比較結果
6. **chat_history** - チャット履歴

### データベースファイル
- `database/init.sql` - メインのデータベース初期化スクリプト
- `database/seeds/clubs.sql` - クラブの初期データ
- `database/seeds/users.sql` - ユーザーの初期データ

## 開発用コマンド

### データベース関連
```bash
# テーブル作成
cd backend && python scripts/create_tables.py

# 管理者アカウント作成
cd backend && python scripts/init_admin.py

# データベースリセット
psql -U sportsmanship_user -d sportsmanship -f database/init.sql
```

### フロントエンド関連
```bash
# 開発サーバー起動
cd frontend && npm start

# ビルド
cd frontend && npm run build

# テスト
cd frontend && npm test
```

## トラブルシューティング

### よくある問題

1. **PostgreSQL接続エラー**
   - PostgreSQLサービスが起動しているか確認
   - データベースURLの設定を確認

2. **Python依存関係エラー**
   - 仮想環境が有効になっているか確認
   - `pip install -r requirements.txt`を再実行

3. **Node.js依存関係エラー**
   - `npm install`を再実行
   - `node_modules`を削除して再インストール

4. **ポート競合**
   - ポート8000または3000が使用中の場合、別のポートを指定

## 環境変数の説明

| 変数名 | 説明 | 必須 |
|--------|------|------|
| DATABASE_URL | PostgreSQL接続URL | はい |
| SECRET_KEY | JWT暗号化キー | はい |
| ADMIN_EMAIL | 管理者メールアドレス | はい |
| ADMIN_PASSWORD | 管理者パスワード | はい |
| OPENAI_API_KEY | OpenAI APIキー | いいえ |

## 貢献方法

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成 