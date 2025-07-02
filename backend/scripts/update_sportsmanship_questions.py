#!/usr/bin/env python3
# backend/scripts/update_sportsmanship_questions.py
"""
スポーツマンシップ正式質問データ投入スクリプト
99問スポーツマンシップメンタルテストシステム用
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import engine
from app.models.question import Question

# スポーツマンシップ正式質問データ（0-10の11段階評価、逆転スコア）
SPORTSMANSHIP_QUESTIONS = {
    'courage': [  # 勇気（回避）- 6問
        "物事を上手く進めるために何をすればいいかわかっていて、その通り行えていますか？",
        "自分に何が足りないかを積極的に仲間や上司に聞くようにしていますか？",
        "努力は継続することが大事なので毎日続けなくても出来る範囲ですればよいと思いますか？",
        "皆の前で何かを披露するのが好きではありませんか？",
        "自分には夢ややりたいことがたくさんありますか？",
        "なんとなく目標は達成できそうな気がしていると感じることがありますか？"
    ],
    'resilience': [  # 打たれ強さ - 6問
        "辛いことはなるべく考えないようにして別のことを行いますか？",
        "相手の嫌なところではなく良いところを見るようにしていますか？",
        "勝負ごとに負けたときそれを受け入れられず引きずることがありますか？",
        "正しいとわかっていても、他人からの指摘を素直に受け入れられないことがありますか？",
        "自分と真逆の意見を持つ人とは仲良くすることができませんか？",
        "嫌なことはすぐに忘れて楽しいことを考えるようにしていますか？"
    ],
    'cooperation': [  # 他者性・協調性 - 6問
        "他人から嫌われているように感じることがありますか？",
        "人には中々理解してもらえないと思っていますか？",
        "人の嫌な部分が良く見えるし気になることがありますか？",
        "自分はコミュニケーション能力がある方だと思いますか？",
        "人からライバル意識を持たれやすいと思いますか？",
        "自分の周りには尊敬できる素晴らしい人がいて、何かあればすぐに相談できますか？"
    ],
    'natural_acceptance': [  # 自己受容・自然体 - 5問
        "尊敬する人がいてその人の言うことに影響を受けていますか？",
        "出身校や記録などを人に話すことがありますか？",
        "憧れている人がいて髪型や服装・話し方などを真似ることがありますか？",
        "すごくつらい時にもあえて笑って過ごすようにしていますか？",
        "とても怒っているのにあえて丁寧に接することがありますか？"
    ],
    'non_rationality': [  # 非合理性・非論理性 - 6問
        "自分の長所短所は説明することができますか？",
        "何が問題かを把握して理解することが重要だと思いますか？",
        "手順をしっかり学んで取り組みたいと思いますか？",
        "物事は捉え方次第だと思いますか？",
        "自分の行動や選択はいい方向にいくと思いますか？",
        "自分と同じ考えをしている人が多いと安心しますか？"
    ]
}

def update_sportsmanship_questions():
    print("🚀 スポーツマンシップ正式データ投入開始...")
    
    with Session(engine) as db:
        # 既存のスポーツマンシップ質問を削除
        print("🔄 既存のスポーツマンシップ質問を削除中...")
        existing_questions = db.query(Question).filter(Question.category == 'sportsmanship').all()
        deleted_count = len(existing_questions)
        
        for question in existing_questions:
            db.delete(question)
        
        db.commit()
        print(f"   削除した質問数: {deleted_count}問")
        
        # 正式なスポーツマンシップ質問を投入
        print("📝 正式なスポーツマンシップ質問を投入中...")
        
        question_number = 1  # スポーツマンシップは質問番号1から開始
        
        # 全対象共通の質問として投入
        for subcategory, questions in SPORTSMANSHIP_QUESTIONS.items():
            for question_text in questions:
                new_question = Question(
                    question_number=question_number,
                    question_text=question_text,
                    category='sportsmanship',
                    subcategory=subcategory,
                    target='all',
                    is_reverse_score=True,  # スポーツマンシップは逆転スコア
                    is_active=True
                )
                db.add(new_question)
                question_number += 1
        
        db.commit()
        
        # 投入結果確認
        total_count = db.query(Question).filter(Question.category == 'sportsmanship').count()
        print(f"✅ スポーツマンシップ質問投入完了: {total_count}問")
        
        # カテゴリ別内訳確認
        print("\n📊 投入結果確認:")
        print("   サブカテゴリ別:")
        
        subcategory_counts = db.query(
            Question.subcategory, 
            func.count(Question.question_id)
        ).filter(
            Question.category == 'sportsmanship'
        ).group_by(
            Question.subcategory
        ).order_by(
            Question.subcategory
        ).all()
        
        for subcategory, count in subcategory_counts:
            print(f"     {subcategory}: {count}問")
        
        # 逆転スコア確認
        reverse_count = db.query(Question).filter(
            Question.category == 'sportsmanship',
            Question.is_reverse_score == True
        ).count()
        print(f"   逆転スコア質問数: {reverse_count}問")
        
        # 全体の質問数確認
        print("\n📈 全体質問数確認:")
        categories = db.query(Question.category, func.count(Question.question_id)).group_by(Question.category).all()
        total_all = 0
        for category, count in categories:
            print(f"   {category}: {count}問")
            total_all += count
        print(f"   総計: {total_all}問")
        
        print("\n🎉 スポーツマンシップ正式データ投入作業完了！")

if __name__ == "__main__":
    update_sportsmanship_questions()