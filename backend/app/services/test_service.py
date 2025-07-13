# app/services/test_service.py 完全修正版
# 統合データローダーの標準化に完全対応

from typing import Dict, List
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.test_result import TestResult
from app.models.question import Question
from app.schemas.test import TestSubmit, TestResultWithAnalysis


class TestService:
    def __init__(self, db: Session):
        self.db = db
    
    def process_test_submission(self, user_id: UUID, test_data: TestSubmit, target_selection: str) -> TestResultWithAnalysis:
        """テスト提出を処理して結果を生成"""
        
        # 回答からスコアを計算
        scores = self._calculate_scores(test_data.answers, target_selection)
        
        # テスト結果をデータベースに保存
        test_result = TestResult(
            user_id=user_id,
            target_selection=target_selection,
            test_date=test_data.test_date,
            **scores
        )
        
        self.db.add(test_result)
        self.db.commit()
        self.db.refresh(test_result)
        
        # 分析結果を生成
        analysis = self.analyze_test_result(test_result)
        
        # 分析結果をデータベースに保存
        test_result.athlete_type = analysis.athlete_type
        test_result.athlete_type_description = analysis.athlete_type_description
        test_result.athlete_type_percentages = str(analysis.athlete_type_percentages)
        test_result.self_esteem_analysis = analysis.self_esteem_analysis
        test_result.self_esteem_improvements = str(analysis.self_esteem_improvements)
        test_result.strengths = str(analysis.strengths)
        test_result.weaknesses = str(analysis.weaknesses)
        test_result.sportsmanship_balance = analysis.sportsmanship_balance
        
        # 更新をコミット
        self.db.commit()
        
        return analysis


    def _calculate_scores(self, answers: List, target_selection: str) -> Dict[str, float]:
        """回答からスコアを計算（標準化されたsubcategory名に対応）"""
        
        # APIと同じロジックで質問を取得
        # sportsmanshipはtargetを問わず全件、それ以外はtargetでフィルタ
        sportsmanship_questions = self.db.query(Question).filter(
            Question.category == 'sportsmanship',
            Question.is_active == True
        ).all()
        
        other_questions = self.db.query(Question).filter(
            Question.category != 'sportsmanship',
            Question.is_active == True,
            ((Question.target == 'all') | (Question.target == target_selection))
        ).all()
        
        # 結合して番号順に並べる
        questions = sportsmanship_questions + other_questions
        questions.sort(key=lambda q: q.question_number)
        
        # 質問IDから質問オブジェクトへのマッピング
        question_map = {str(q.question_id): q for q in questions}
        
        # 回答データを質問IDをキーとした辞書に変換
        answer_map = {str(answer.question_id): answer.answer_value for answer in answers}
        
        # サブカテゴリ別にスコアを集計
        subcategory_scores = {}
        
        for question_id, answer_value in answer_map.items():
            question = question_map.get(question_id)
            if not question:
                continue
            
            # 逆転スコア処理（スポーツマンシップの質問）
            if question.is_reverse_score:
                score = 10 - answer_value
            else:
                score = answer_value
            
            # サブカテゴリ別スコア集計
            subcategory = question.subcategory
            if subcategory not in subcategory_scores:
                subcategory_scores[subcategory] = []
            subcategory_scores[subcategory].append(score)
        
        # 各サブカテゴリの平均スコアを計算
        final_scores = {}
        for subcategory, scores in subcategory_scores.items():
            if scores:
                avg_score = sum(scores) / len(scores)
                # 50点満点に正規化
                final_scores[subcategory] = round((avg_score / 10) * 50, 1)
        
        # 標準化されたフィールド名でレスポンスを構築
        result = {}
        
        # スポーツマンシップ（変更なし）
        result['courage'] = final_scores.get('courage', 0)
        result['resilience'] = final_scores.get('resilience', 0)
        result['cooperation'] = final_scores.get('cooperation', 0)
        result['natural_acceptance'] = final_scores.get('natural_acceptance', 0)
        result['non_rationality'] = final_scores.get('non_rationality', 0)
        
        # アスリートマインド（標準化された名前）
        result['commitment'] = final_scores.get('commitment', 0)      # こだわり
        result['result'] = final_scores.get('result', 0)             # 結果
        result['steadiness'] = final_scores.get('steadiness', 0)     # 堅実
        result['devotion'] = final_scores.get('devotion', 0)         # 献身
        result['self_control'] = final_scores.get('self_control', 0) # 克己
        result['assertion'] = final_scores.get('assertion', 0)       # 主張
        result['sensitivity'] = final_scores.get('sensitivity', 0)   # 繊細
        result['intuition'] = final_scores.get('intuition', 0)       # 直感
        result['introspection'] = final_scores.get('introspection', 0) # 内省
        result['comparison'] = final_scores.get('comparison', 0)     # 比較
        
        # 自己肯定感（変更なし）
        result['self_efficacy'] = final_scores.get('self_efficacy', 0)
        result['self_determination'] = final_scores.get('self_determination', 0)
        result['self_acceptance'] = final_scores.get('self_acceptance', 0)
        result['self_worth'] = final_scores.get('self_worth', 0)
        
        # 自己肯定感合計
        result['self_esteem_total'] = round(
            result['self_efficacy'] + 
            result['self_determination'] + 
            result['self_acceptance'] + 
            result['self_worth'], 1
        )
        
        return result
    
    def analyze_test_result(self, test_result: TestResult) -> TestResultWithAnalysis:
        """テスト結果を分析して詳細な結果を生成"""
        
        # アスリートタイプ分析
        athlete_analysis = self._analyze_athlete_type(test_result)
        
        # 強み・弱み分析
        strengths_weaknesses = self._analyze_strengths_weaknesses(test_result)
        
        # 自己肯定感分析
        self_esteem_analysis = self._generate_self_esteem_analysis(test_result)
        self_esteem_improvements = self._generate_self_esteem_improvements(test_result)
        
        # スポーツマンシップバランス分析
        sportsmanship_balance = self._generate_sportsmanship_balance(test_result)
        
        # TestResultの基本データを辞書として取得
        result_dict = {
            'result_id': test_result.result_id,
            'user_id': test_result.user_id,
            'target_selection': test_result.target_selection,
            'test_date': test_result.test_date,
            
            # 自己肯定感
            'self_determination': test_result.self_determination,
            'self_acceptance': test_result.self_acceptance,
            'self_worth': test_result.self_worth,
            'self_efficacy': test_result.self_efficacy,
            
            # アスリートマインド
            'commitment': test_result.commitment,
            'result': test_result.result,
            'steadiness': test_result.steadiness,
            'devotion': test_result.devotion,
            'self_control': test_result.self_control,
            'assertion': test_result.assertion,
            'sensitivity': test_result.sensitivity,
            'intuition': test_result.intuition,
            'introspection': test_result.introspection,
            'comparison': test_result.comparison,
            
            # スポーツマンシップ
            'courage': test_result.courage,
            'resilience': test_result.resilience,
            'cooperation': test_result.cooperation,
            'natural_acceptance': test_result.natural_acceptance,
            'non_rationality': test_result.non_rationality,
            
            # 計算値
            'self_esteem_total': test_result.self_esteem_total,
        }
        
        # 分析結果を追加（重複を避けるため、個別に設定）
        result_dict.update({
            'self_esteem_analysis': self_esteem_analysis,
            'self_esteem_improvements': self_esteem_improvements,
            'athlete_type': athlete_analysis['athlete_type'],
            'athlete_type_description': athlete_analysis['athlete_type_description'],
            'athlete_type_percentages': athlete_analysis['athlete_type_percentages'],
            'strengths': strengths_weaknesses['strengths'],
            'weaknesses': strengths_weaknesses['weaknesses'],
            'sportsmanship_balance': sportsmanship_balance
        })
    
        return TestResultWithAnalysis(**result_dict)
    
    def _analyze_athlete_type(self, test_result: TestResult) -> Dict[str, any]:
        """アスリートタイプ分析（提供資料に基づく5タイプ）"""
        
        # 特性スコアの計算（提供資料の優先順位に基づく）
        type_scores = {
            'ストライカー': (
                getattr(test_result, 'result', 0) + 
                getattr(test_result, 'assertion', 0) + 
                getattr(test_result, 'comparison', 0)
            ) / 3,
            'アタッカー': (
                getattr(test_result, 'result', 0) + 
                getattr(test_result, 'assertion', 0) + 
                getattr(test_result, 'intuition', 0)
            ) / 3,
            'ゲームメイカー': (
                getattr(test_result, 'steadiness', 0) + 
                getattr(test_result, 'introspection', 0) + 
                getattr(test_result, 'devotion', 0)
            ) / 3,
            'アンカー': (
                getattr(test_result, 'steadiness', 0) + 
                getattr(test_result, 'devotion', 0) + 
                getattr(test_result, 'introspection', 0)
            ) / 3,
            'ディフェンダー': (
                getattr(test_result, 'steadiness', 0) + 
                getattr(test_result, 'devotion', 0) + 
                getattr(test_result, 'sensitivity', 0)
            ) / 3
        }
        
        # 最高スコアのタイプを決定
        dominant_type = max(type_scores.items(), key=lambda x: x[1])
        
        # パーセンテージ計算
        total_score = sum(type_scores.values())
        if total_score > 0:
            percentages = {k: round((v / total_score) * 100, 1) for k, v in type_scores.items()}
        else:
            percentages = {k: 0 for k in type_scores.keys()}
        
        return {
            'athlete_type': dominant_type[0],
            'athlete_type_percentages': percentages,
            'athlete_type_description': self._get_type_description(dominant_type[0])
        }
    
    def _analyze_strengths_weaknesses(self, test_result: TestResult) -> Dict[str, List[str]]:
        """強み・弱み分析"""
        
        # 全ての特性スコア（アスリートマインドのみ）
        all_qualities = {
            'こだわり': getattr(test_result, 'commitment', 0),
            '結果': getattr(test_result, 'result', 0),
            '堅実': getattr(test_result, 'steadiness', 0),
            '献身': getattr(test_result, 'devotion', 0),
            '克己': getattr(test_result, 'self_control', 0),
            '主張': getattr(test_result, 'assertion', 0),
            '繊細': getattr(test_result, 'sensitivity', 0),
            '直感': getattr(test_result, 'intuition', 0),
            '内省': getattr(test_result, 'introspection', 0),
            '比較': getattr(test_result, 'comparison', 0)
        }
        
        # スコアでソート
        sorted_qualities = sorted(all_qualities.items(), key=lambda x: x[1], reverse=True)
        
        # 上位5つを強み、下位5つを弱みとする
        strengths = [q[0] for q in sorted_qualities[:5]]
        weaknesses = [q[0] for q in sorted_qualities[-5:]]
        
        return {
            'strengths': strengths,
            'weaknesses': weaknesses
        }
    
    def _get_type_description(self, athlete_type: str) -> str:
        """アスリートタイプの説明（提供資料に基づく）"""
        descriptions = {
            'ストライカー': '成果を追求し迅速な行動が求められる特性。明確なゴール設定と実現に向けた行動で、結果を最優先に考えるタイプです。',
            'アタッカー': '攻撃的で結果を追求し、状況を切り開く力を持つタイプ。目標に向かって自ら動き、最前線で戦う姿勢が特徴です。',
            'ゲームメイカー': 'チーム全体を見渡し、適切な判断を下しながらプレイメーカーとしての役割を果たす。調和と分析力、柔軟性が特徴です。',
            'アンカー': 'チームの土台として安定感を提供し、困難な状況でも冷静に対応する力を持つ。安定性とサポート力が特徴です。',
            'ディフェンダー': '守備の要として安定感を保ちながらチームの基盤を守り、危機を回避する役割を担う。堅実さと協調性が特徴です。'
        }
        return descriptions.get(athlete_type, '')
    
    def _generate_self_esteem_analysis(self, test_result: TestResult) -> str:
        """自己肯定感分析テキスト生成"""
        
        self_efficacy = getattr(test_result, 'self_efficacy', 0)
        self_determination = getattr(test_result, 'self_determination', 0)
        self_acceptance = getattr(test_result, 'self_acceptance', 0)
        self_worth = getattr(test_result, 'self_worth', 0)
        
        total = self_efficacy + self_determination + self_acceptance + self_worth
        
        if total >= 160:  # 40点以上の平均（50点満点×4項目×0.8）
            level = "非常に良好"
        elif total >= 140:  # 35点以上の平均（50点満点×4項目×0.7）
            level = "良好"
        elif total >= 120:  # 30点以上の平均（50点満点×4項目×0.6）
            level = "普通"
        else:
            level = "要改善"
        
        # 最も高いスコアと最も低いスコアを特定
        scores = {
            '自己効力感': self_efficacy,
            '自己決定感': self_determination,
            '自己受容': self_acceptance,
            '自己価値感': self_worth
        }
        
        highest = max(scores.items(), key=lambda x: x[1])
        lowest = min(scores.items(), key=lambda x: x[1])
        
        return f"""あなたの自己肯定感は{level}な状態です。特に{highest[0]}が高く（{highest[1]:.1f}点）、これは大きな強みです。一方で{lowest[0]}（{lowest[1]:.1f}点）の面で向上の余地があります。全体的なバランスを保ちながら、弱い部分を強化していくことで、さらに充実した成長を期待できます。"""
    
    def _generate_self_esteem_improvements(self, test_result: TestResult) -> List[str]:
        """自己肯定感改善提案生成"""
        
        improvements = []
        
        self_efficacy = getattr(test_result, 'self_efficacy', 0)
        self_determination = getattr(test_result, 'self_determination', 0)
        self_acceptance = getattr(test_result, 'self_acceptance', 0)
        self_worth = getattr(test_result, 'self_worth', 0)
        
        if self_efficacy < 30:
            improvements.append("小さな目標を設定し、成功体験を積み重ねることで自信を育てましょう")
        
        if self_determination < 30:
            improvements.append("日常の小さな選択から自分で決める習慣をつけ、主体性を高めましょう")
        
        if self_acceptance < 30:
            improvements.append("自分の長所と短所を客観視し、ありのままの自分を受け入れる練習をしましょう")
        
        if self_worth < 30:
            improvements.append("他者への貢献や自分の役割を意識し、存在価値を実感する機会を増やしましょう")
        
        # 共通の改善提案
        improvements.extend([
            "定期的な自己振り返りの時間を設けることをお勧めします",
            "他者との比較より自分自身の成長に焦点を当てましょう",
            "失敗を学習の機会として捉える習慣を身につけましょう"
        ])
        
        return improvements[:5]  # 最大5つまで
    
    def _generate_sportsmanship_balance(self, test_result: TestResult) -> str:
        """スポーツマンシップバランス分析"""
        
        courage = getattr(test_result, 'courage', 0)
        resilience = getattr(test_result, 'resilience', 0)
        cooperation = getattr(test_result, 'cooperation', 0)
        natural_acceptance = getattr(test_result, 'natural_acceptance', 0)
        non_rationality = getattr(test_result, 'non_rationality', 0)
        
        scores = {
            '勇気': courage,
            '打たれ強さ': resilience,
            '協調性': cooperation,
            '自然体': natural_acceptance,
            '非合理性': non_rationality
        }
        
        # 最も高いスコアと最も低いスコアを特定
        highest = max(scores.items(), key=lambda x: x[1])
        lowest = min(scores.items(), key=lambda x: x[1])
        
        # 全体の平均
        average = sum(scores.values()) / len(scores)
        
        if average >= 40:
            balance_level = "非常にバランスが取れて"
        elif average >= 35:
            balance_level = "良くバランスが取れて"
        elif average >= 30:
            balance_level = "概ねバランスが取れて"
        else:
            balance_level = "バランスに改善の余地があり"
        
        return f"""あなたのスポーツマンシップは{balance_level}います。特に{highest[0]}（{highest[1]:.1f}点）が優れており、これは大きな強みです。一方で{lowest[0]}（{lowest[1]:.1f}点）の分野で成長の余地があります。{lowest[0]}を意識的に伸ばしていくことで、より完成度の高いスポーツマンシップを身につけることができるでしょう。"""