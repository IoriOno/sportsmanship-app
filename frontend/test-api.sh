#!/bin/bash

# テスト用のユーザーIDと日付を設定
USER_ID="67e8b2f3-f97c-4a0a-8d62-12f5096a8887"  # 実際のユーザーIDに置き換えてください
TEST_DATE=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

# まず質問データを取得して、question_idを抽出
echo "質問データを取得中..."
QUESTIONS=$(curl -s https://sportsmanship-app-1750609620-f0d2317caca5.herokuapp.com/api/v1/questions/for-user/player)

# 最初の3つの質問のIDを取得（テスト用）
QUESTION_IDS=$(echo $QUESTIONS | jq -r '.questions[0:3] | .[].question_id')

# テスト用の回答データを作成（最初の3問だけ）
ANSWERS_JSON=""
INDEX=0
for QID in $QUESTION_IDS; do
    if [ $INDEX -gt 0 ]; then
        ANSWERS_JSON+=","
    fi
    ANSWERS_JSON+="{\"question_id\":\"$QID\",\"answer_value\":5}"
    INDEX=$((INDEX + 1))
done

# 完全なJSONデータを作成（99問分のダミーデータ）
echo "テストデータを作成中..."

# まず実際の質問IDをすべて取得
ALL_QUESTION_IDS=$(echo $QUESTIONS | jq -r '.questions | .[].question_id')

# 99問分の回答データを作成
FULL_ANSWERS_JSON=""
INDEX=0
for QID in $ALL_QUESTION_IDS; do
    if [ $INDEX -gt 0 ]; then
        FULL_ANSWERS_JSON+=","
    fi
    # ランダムな値（0-10）を生成
    ANSWER_VALUE=$((RANDOM % 11))
    FULL_ANSWERS_JSON+="{\"question_id\":\"$QID\",\"answer_value\":$ANSWER_VALUE}"
    INDEX=$((INDEX + 1))
    
    # 99問で止める
    if [ $INDEX -eq 99 ]; then
        break
    fi
done

# 完全なリクエストボディを作成
REQUEST_BODY=$(cat <<EOF
{
  "user_id": "$USER_ID",
  "test_date": "$TEST_DATE",
  "answers": [$FULL_ANSWERS_JSON]
}
EOF
)

# リクエストボディをファイルに保存（デバッグ用）
echo $REQUEST_BODY | jq '.' > test_request.json

echo "APIにテスト送信中..."
echo "送信データのプレビュー:"
echo $REQUEST_BODY | jq '{user_id, test_date, answers_count: (.answers | length), sample_answers: .answers[0:3]}'

# APIに送信
RESPONSE=$(curl -s -X POST \
  https://sportsmanship-app-1750609620-f0d2317caca5.herokuapp.com/api/v1/tests/submit \
  -H "Content-Type: application/json" \
  -d "$REQUEST_BODY" \
  -w "\nHTTP_STATUS:%{http_code}")

# HTTPステータスコードを抽出
HTTP_STATUS=$(echo "$RESPONSE" | tail -n 1 | cut -d':' -f2)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

echo ""
echo "HTTPステータス: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
    echo "✅ テスト送信成功!"
    echo "$RESPONSE_BODY" | jq '.'
else
    echo "❌ テスト送信失敗"
    echo "$RESPONSE_BODY" | jq '.'
fi