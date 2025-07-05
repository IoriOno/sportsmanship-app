# # File: backend/app/services/comparison_service.py
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.test_result import TestResult
from app.models.comparison import ComparisonResult


class ComparisonService:
    def __init__(self, db: Session):
        self.db = db
    
    def validate_comparison_participants(self, current_user: User, participant_ids: List[UUID]) -> bool:
        # Get all participants
        participants = self.db.query(User).filter(User.user_id.in_(participant_ids)).all()
        
        if len(participants) != len(participant_ids):
            return False
        
        # Check if current user is in the list
        current_user_in_list = any(str(p.user_id) == str(current_user.user_id) for p in participants)
        
        if not current_user_in_list:
            return False
        
        # Check roles
        coaches_parents = [p for p in participants if p.role in ["coach", "father", "mother"]]
        players = [p for p in participants if p.role == "player"]
        
        # Must have at least one coach/parent and one player
        if len(coaches_parents) == 0 or len(players) == 0:
            return False
        
        # Current user must be a coach/parent
        if current_user.role not in ["coach", "father", "mother"] and not current_user.parent_function:
            return False
        
        return True
    
    def create_comparison(self, created_by: UUID, participant_ids: List[UUID]) -> dict:
        # Get participants and their latest test results
        participants_data = []
        
        for participant_id in participant_ids:
            user = self.db.query(User).filter(User.user_id == participant_id).first()
            if not user:
                continue
                
            latest_result = self.db.query(TestResult).filter(
                TestResult.user_id == participant_id
            ).order_by(TestResult.test_date.desc()).first()
            
            if not latest_result:
                # テスト結果がない場合はデフォルト値を使用
                qualities = {
                    'self_determination': 25,
                    'self_acceptance': 25,
                    'self_worth': 25,
                    'self_efficacy': 25,
                    'introspection': 25,
                    'self_control': 25,
                    'devotion': 25,
                    'intuition': 25,
                    'sensitivity': 25,
                    'steadiness': 25,
                    'comparison': 25,
                    'result': 25,
                    'assertion': 25,
                    'commitment': 25,
                    'courage': 25,
                    'resilience': 25,
                    'cooperation': 25,
                    'natural_acceptance': 25,
                    'non_rationality': 25
                }
            else:
                qualities = {
                    # 自己肯定感
                    'self_determination': latest_result.self_determination,
                    'self_acceptance': latest_result.self_acceptance,
                    'self_worth': latest_result.self_worth,
                    'self_efficacy': latest_result.self_efficacy,
                    # アスリートマインド
                    'introspection': latest_result.introspection,
                    'self_control': latest_result.self_control,
                    'devotion': latest_result.devotion,
                    'intuition': latest_result.intuition,
                    'sensitivity': latest_result.sensitivity,
                    'steadiness': latest_result.steadiness,
                    'comparison': latest_result.comparison,
                    'result': latest_result.result,
                    'assertion': latest_result.assertion,
                    'commitment': latest_result.commitment,
                    # スポーツマンシップ
                    'courage': latest_result.courage,
                    'resilience': latest_result.resilience,
                    'cooperation': latest_result.cooperation,
                    'natural_acceptance': latest_result.natural_acceptance,
                    'non_rationality': latest_result.non_rationality
                }
            
            participants_data.append({
                'participant_id': str(user.user_id),
                'participant_name': user.name,
                'participant_role': user.role,
                'qualities': qualities
            })
        
        # 参加者が不足している場合はエラー
        if len(participants_data) < 2:
            raise ValueError("At least 2 participants are required for comparison")
        
        # Calculate differences (for 2-person comparison)
        differences = []
        if len(participants_data) >= 2:
            p1_qualities = participants_data[0]['qualities']
            p2_qualities = participants_data[1]['qualities']
            
            for quality in p1_qualities:
                diff = p1_qualities[quality] - p2_qualities[quality]
                differences.append({
                    'quality': quality,
                    'difference': diff,
                    'participant1_value': p1_qualities[quality],
                    'participant2_value': p2_qualities[quality]
                })
            
            differences.sort(key=lambda x: abs(x['difference']), reverse=True)
        
        # Generate analysis
        mutual_understanding = self._generate_mutual_understanding(participants_data, differences)
        good_interactions = self._generate_good_interactions(participants_data, differences)
        bad_interactions = self._generate_bad_interactions(participants_data, differences)
        
        # Create comparison result
        comparison_data = {
            'participants': participants_data,
            'differences': differences,
            'mutual_understanding': mutual_understanding,
            'good_interactions': good_interactions,
            'bad_interactions': bad_interactions
        }
        
        comparison_result = ComparisonResult(
            participants=[str(pid) for pid in participant_ids],
            comparison_data=comparison_data,
            created_by=created_by
        )
        
        self.db.add(comparison_result)
        self.db.commit()
        self.db.refresh(comparison_result)
        
        # レスポンス用のデータを整形して返す
        return {
            'comparison_id': str(comparison_result.comparison_id),
            'participants': participants_data,
            'differences': differences,
            'mutual_understanding': mutual_understanding,
            'good_interactions': good_interactions,
            'bad_interactions': bad_interactions,
            'created_by': str(created_by),
            'created_date': comparison_result.created_date.isoformat()
        }
        
        
    def _generate_mutual_understanding(self, participants_data, differences) -> str:
        if len(participants_data) < 2:
            return "比較するには少なくとも2人の参加者が必要です。"
        
        p1 = participants_data[0]
        p2 = participants_data[1]
        
        return f"""
        {p1['participant_name']}さん（{p1['participant_role']}）と
        {p2['participant_name']}さん（{p2['participant_role']}）の比較分析結果です。
        
        最も差が大きい資質は「{differences[0]['quality']}」で、
        {differences[0]['difference']}ポイントの差があります。
        
        この違いを理解し、お互いの強みを活かすことで、
        より良いコミュニケーションと協力関係を築くことができます。
        """
    
    def _generate_good_interactions(self, participants_data, differences) -> List[str]:
        interactions = []
        
        if len(differences) > 0:
            # Find complementary qualities
            for diff in differences[:3]:
                if diff['participant1_value'] > diff['participant2_value']:
                    interactions.append(
                        f"{diff['quality']}が高い人が、その強みを活かしてサポートする"
                    )
                else:
                    interactions.append(
                        f"{diff['quality']}の違いを理解し、お互いの視点を尊重する"
                    )
        
        interactions.extend([
            "定期的な1on1ミーティングで相互理解を深める",
            "お互いの強みを認め合い、積極的に褒める"
        ])
        
        return interactions[:5]
    
    def _generate_bad_interactions(self, participants_data, differences) -> List[str]:
        interactions = []
        
        if len(differences) > 0:
            # Find potential conflict areas
            for diff in differences[:3]:
                if diff['difference'] > 20:
                    interactions.append(
                        f"{diff['quality']}の違いによる価値観の衝突に注意する"
                    )
        
        interactions.extend([
            "一方的な指示や批判を避ける",
            "相手の弱みを否定的に指摘しない",
            "価値観の違いを「間違い」として扱わない"
        ])
        
        return interactions[:5]