import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/auth';
import Button from '../../components/common/Button';
import { ArrowLeftIcon, ChartBarIcon, UserGroupIcon, LightBulbIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import QualitiesComparisonChart from '../../components/comparison/QualitiesComparisonChart';
import SportsmanshipChart from '../../components/result/SportsmanshipChart';
import { comparisonService, ClubUser, ComparisonResult, ComparisonDifference } from '../../services/comparisonService';

const ComparisonPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<ClubUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // サンプル比較結果を生成
  const generateSampleComparisonResult = (participantIds: string[]): ComparisonResult => {
    const participants = participantIds.map((id, index) => {
      const isCurrentUser = index === 0;
      const baseScore = isCurrentUser ? 35 : 30;
      
      return {
        participant_id: id,
        participant_name: isCurrentUser ? user!.name : 'Virds',
        participant_role: isCurrentUser ? 'coach' : 'player',
        qualities: {
          // 自己肯定感
          self_determination: baseScore + Math.floor(Math.random() * 10),
          self_acceptance: baseScore + Math.floor(Math.random() * 10),
          self_worth: baseScore + Math.floor(Math.random() * 10),
          self_efficacy: baseScore + Math.floor(Math.random() * 10),
          // アスリートマインド（50点満点）
          introspection: Math.floor(Math.random() * 20) + 30,
          self_control: Math.floor(Math.random() * 20) + 30,
          devotion: Math.floor(Math.random() * 20) + 30,
          intuition: Math.floor(Math.random() * 20) + 25,
          sensitivity: Math.floor(Math.random() * 20) + 25,
          steadiness: Math.floor(Math.random() * 20) + 30,
          comparison: Math.floor(Math.random() * 20) + 25,
          result: Math.floor(Math.random() * 20) + 30,
          assertion: Math.floor(Math.random() * 20) + 25,
          commitment: Math.floor(Math.random() * 20) + 30,
          // スポーツマンシップ
          courage: baseScore + Math.floor(Math.random() * 10),
          resilience: baseScore + Math.floor(Math.random() * 10),
          cooperation: baseScore + Math.floor(Math.random() * 10),
          natural_acceptance: baseScore + Math.floor(Math.random() * 10),
          non_rationality: baseScore + Math.floor(Math.random() * 10)
        }
      };
    });

    const differences: ComparisonDifference[] = [];
    if (participants.length >= 2) {
      const qualities = Object.keys(participants[0].qualities) as Array<keyof typeof participants[0]['qualities']>;
      qualities.forEach(quality => {
        differences.push({
          quality: getQualityLabel(quality),
          difference: participants[0].qualities[quality] - participants[1].qualities[quality],
          participant1_value: participants[0].qualities[quality],
          participant2_value: participants[1].qualities[quality]
        });
      });
    }

    return {
      comparison_id: `comp-${Date.now()}`,
      participants,
      differences,
      mutual_understanding: 'コーチと選手の資質分析の結果、両者の強みを活かした関係構築が重要です。\n\n特に「直感」「献身」「結果志向」において差が見られ、これらの違いを理解することで、より効果的なコミュニケーションが可能になります。',
      good_interactions: [
        '選手の強みを認識し、積極的に褒める',
        '明確で具体的な目標設定を共に行う',
        '定期的な1on1での対話を重視する',
        '選手の意見や感情を尊重する',
        '成長過程を共に振り返る時間を作る'
      ],
      bad_interactions: [
        '一方的な指示や命令を避ける',
        '選手の弱点ばかりに注目しない',
        '感情的な批判を控える',
        '比較による評価を避ける',
        '過度なプレッシャーをかけない'
      ],
      created_by: participantIds[0],
      created_date: new Date().toISOString()
    };
  };

  // 質問項目のラベルを取得
  const getQualityLabel = (key: string): string => {
    const labels: Record<string, string> = {
      self_determination: '自己決定感',
      self_acceptance: '自己受容感',
      self_worth: '自己有用感',
      self_efficacy: '自己効力感',
      introspection: '内省',
      self_control: '克己',
      devotion: '献身',
      intuition: '直感',
      sensitivity: '繊細',
      steadiness: '堅実',
      comparison: '比較',
      result: '結果',
      assertion: '主張',
      commitment: 'こだわり',
      courage: '勇気',
      resilience: '打たれ強さ',
      cooperation: '協調性',
      natural_acceptance: '自然体',
      non_rationality: '非合理性'
    };
    return labels[key] || key;
  };

  // Check if user has permission to use comparison
  const hasPermission = user?.role === UserRole.COACH || 
                       user?.head_coach_function ||
                       (user?.role === UserRole.FATHER && user?.parent_function) ||
                       (user?.role === UserRole.MOTHER && user?.parent_function);

  // デバッグ用：現在のユーザー情報を表示
  useEffect(() => {
    console.log('🔍 現在のユーザー:', {
      user_id: user?.user_id,
      name: user?.name,
      role: user?.role,
      head_coach_function: user?.head_coach_function,
      parent_function: user?.parent_function
    });
  }, [user]);

  // クラブユーザーを取得
  useEffect(() => {
    if (hasPermission) {
      fetchClubUsers();
    }
  }, [hasPermission]);

  const fetchClubUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await comparisonService.getClubUsers();
      
      // 各ユーザーのテスト履歴を個別に確認（理想的ではないが一時的な対処）
      // または、すべてのユーザーを表示可能にする
      const processedUsers = users.map(user => ({
        ...user,
        // コーチまたは選手の場合は、テスト実施可能として扱う
        has_test_result: user.role === 'coach' || user.role === 'player'
      }));
      
      setAvailableUsers(processedUsers);
      
    } catch (error) {
      console.error('Failed to fetch club users:', error);
      setError('選手一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else if (selectedUsers.length < 3) { // 自分を含めて最大4人
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleCreateComparison = async () => {
    try {
      setLoading(true);
      setError(null);
      // 自分のuser_idを含めて比較を作成
      const participantIds = [user!.user_id, ...selectedUsers];
      
      // 選択したユーザーを確認
      const selectedUserDetails = selectedUsers.map(id => 
        availableUsers.find(u => u.user_id === id)
      );
      console.log('📍 比較対象ユーザー:', selectedUserDetails);
      
      // 全員がテスト未実施の場合はサンプルデータを使用
      const allUsersNoTest = selectedUserDetails.every(u => !u?.has_test_result);
      if (allUsersNoTest) {
        console.warn('📍 選択したユーザーはテスト未実施のため、サンプルデータを使用');
        const sampleResult = generateSampleComparisonResult(participantIds);
        setComparisonResult(sampleResult);
        setShowResults(true);
        return;
      }
      
      const result = await comparisonService.createComparison(participantIds);
      setComparisonResult(result);
      setShowResults(true);
    } catch (error: any) {
      console.error('Failed to create comparison:', error);
      setError(error.message || '比較の作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="secondary"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            ダッシュボードに戻る
          </Button>
        </div>
        
        <div className="card p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            アクセス権限がありません
          </h1>
          <p className="text-gray-600">
            1on1比較機能はコーチ・ヘッドコーチ・親機能保護者のみご利用いただけます。
          </p>
        </div>
      </div>
    );
  }

  if (showResults && comparisonResult) {
    // チャート用のデータを準備
    const chartParticipants = comparisonResult.participants.map(p => ({
      id: p.participant_id,
      name: p.participant_name,
      qualities: p.qualities
    }));

    // スポーツマンシップデータの準備（最初の2人のみ比較）
    const primaryParticipant = comparisonResult.participants[0];
    const comparisonParticipant = comparisonResult.participants[1];

    // アスリートマインドのデータ準備
    const athleteMindLabels = ['内省', '克己', '献身', '直感', '繊細', '堅実', '比較', '結果', '主張', 'こだわり'];
    const athleteMindKeys = ['introspection', 'self_control', 'devotion', 'intuition', 'sensitivity', 'steadiness', 'comparison', 'result', 'assertion', 'commitment'] as const;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button
              variant="secondary"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              ダッシュボードに戻る
            </Button>
          </div>
          
          {/* ヘッダー */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  1on1比較分析レポート
                </h1>
                <p className="text-gray-600">
                  作成日: {new Date(comparisonResult.created_date).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowResults(false);
                  setSelectedUsers([]);
                  setComparisonResult(null);
                  setError(null);
                }}
                className="mt-4 sm:mt-0"
              >
                新しい比較を作成
              </Button>
            </div>

            {/* 参加者情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {comparisonResult.participants.map((participant, index) => (
                <div key={participant.participant_id} className={`p-4 rounded-xl ${index === 0 ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? 'bg-blue-500' : 'bg-gray-400'}`}>
                      {participant.participant_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{participant.participant_name}</div>
                      <div className="text-sm text-gray-600">
                        {participant.participant_role === 'coach' ? 'コーチ' : '選手'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {/* 資質重ね合わせチャート */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-indigo-100 rounded-xl mr-4">
                  <ChartBarIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  総合資質分析
                </h2>
              </div>
              <QualitiesComparisonChart 
                participants={chartParticipants}
                showLegend={true}
              />
            </div>

            {/* アスリートマインド比較（棒グラフ） */}
            {comparisonResult.participants.length >= 2 && (
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-purple-100 rounded-xl mr-4">
                    <ChartBarIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    アスリートマインド詳細比較
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {athleteMindKeys.map((key, index) => {
                    const label = athleteMindLabels[index];
                    const value1 = primaryParticipant.qualities[key];
                    const value2 = comparisonParticipant.qualities[key];
                    const maxValue = 50;
                    const percentage1 = (value1 / maxValue) * 100;
                    const percentage2 = (value2 / maxValue) * 100;
                    
                    return (
                      <div key={key} className="relative">
                        <div className="flex items-center mb-2">
                          <span className="w-20 text-sm font-medium text-gray-700">{label}</span>
                          <div className="flex-1 flex items-center space-x-2 text-xs text-gray-600">
                            <span className="text-blue-600 font-semibold">{primaryParticipant.participant_name}: {value1}</span>
                            <span className="text-gray-400">vs</span>
                            <span className="text-orange-600 font-semibold">{comparisonParticipant.participant_name}: {value2}</span>
                          </div>
                        </div>
                        <div className="relative h-12">
                          {/* 背景グリッド */}
                          <div className="absolute inset-0 flex">
                            {[0, 25, 50, 75, 100].map((tick) => (
                              <div key={tick} className="flex-1 border-r border-gray-200 last:border-r-0" />
                            ))}
                          </div>
                          
                          {/* バー */}
                          <div className="absolute inset-0 flex flex-col justify-center space-y-1">
                            <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${percentage1}%` }}
                              />
                            </div>
                            <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${percentage2}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* スケール表示 */}
                <div className="mt-4 flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span>10</span>
                  <span>20</span>
                  <span>30</span>
                  <span>40</span>
                  <span>50</span>
                </div>
              </div>
            )}

            {/* スポーツマンシップ比較 */}
            {comparisonResult.participants.length >= 2 && (
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-green-100 rounded-xl mr-4">
                    <UserGroupIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    スポーツマンシップ分析
                  </h2>
                </div>
                
                {/* スポーツマンシップの棒グラフ比較 */}
                <div className="space-y-4">
                  {[
                    { key: 'courage', label: '勇気' },
                    { key: 'resilience', label: '打たれ強さ' },
                    { key: 'cooperation', label: '協調性' },
                    { key: 'natural_acceptance', label: '自然体' },
                    { key: 'non_rationality', label: '非合理性' }
                  ].map((item) => {
                    const value1 = primaryParticipant.qualities[item.key as keyof typeof primaryParticipant.qualities] as number;
                    const value2 = comparisonParticipant.qualities[item.key as keyof typeof comparisonParticipant.qualities] as number;
                    const maxValue = 50;
                    const percentage1 = (value1 / maxValue) * 100;
                    const percentage2 = (value2 / maxValue) * 100;
                    
                    return (
                      <div key={item.key} className="relative">
                        <div className="flex items-center mb-2">
                          <span className="w-24 text-sm font-medium text-gray-700">{item.label}</span>
                          <div className="flex-1 flex items-center space-x-2 text-xs text-gray-600">
                            <span className="text-blue-600 font-semibold">{primaryParticipant.participant_name}: {value1}</span>
                            <span className="text-gray-400">vs</span>
                            <span className="text-orange-600 font-semibold">{comparisonParticipant.participant_name}: {value2}</span>
                          </div>
                        </div>
                        <div className="relative h-12">
                          {/* 背景グリッド */}
                          <div className="absolute inset-0 flex">
                            {[0, 20, 40, 60, 80, 100].map((tick) => (
                              <div key={tick} className="flex-1 border-r border-gray-200 last:border-r-0" />
                            ))}
                          </div>
                          
                          {/* バー */}
                          <div className="absolute inset-0 flex flex-col justify-center space-y-1">
                            <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${percentage1}%` }}
                              />
                            </div>
                            <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${percentage2}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* スケール表示 */}
                <div className="mt-4 flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span>10</span>
                  <span>20</span>
                  <span>30</span>
                  <span>40</span>
                  <span>50</span>
                </div>
              </div>
            )}

            {/* 相互理解分析 */}
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-white rounded-xl mr-4 shadow-md">
                  <LightBulbIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  相互理解のための提案
                </h2>
              </div>
              
              <div className="bg-white rounded-2xl p-6 mb-6 shadow-md">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {comparisonResult.mutual_understanding}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 効果的な対応 */}
                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      効果的な対応例
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {comparisonResult.good_interactions.map((interaction, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">✓</span>
                        <span className="text-gray-700">{interaction}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 注意すべき対応 */}
                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      注意すべき対応例
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {comparisonResult.bad_interactions.map((interaction, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2 mt-1">✗</span>
                        <span className="text-gray-700">{interaction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 主な差分（上位5項目） */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                資質差分TOP5
              </h2>
              <div className="space-y-4">
                {comparisonResult.differences
                  .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
                  .slice(0, 5)
                  .map((diff, index) => {
                    const isPositive = diff.difference > 0;
                    const percentage = Math.abs(diff.difference);
                    
                    return (
                      <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${isPositive ? 'bg-green-100' : 'bg-orange-100'}`}>
                              <span className="text-lg font-bold">{index + 1}</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900">{diff.quality}</h4>
                          </div>
                          <div className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-orange-600'}`}>
                            {isPositive ? '+' : ''}{diff.difference}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-600">{primaryParticipant.participant_name}</span>
                              <span className="text-sm font-semibold text-blue-600">{diff.participant1_value}点</span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000"
                                style={{ width: `${(diff.participant1_value / 50) * 100}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="text-gray-400">vs</div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-600">{comparisonParticipant?.participant_name || '比較対象'}</span>
                              <span className="text-sm font-semibold text-orange-600">{diff.participant2_value}点</span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-1000"
                                style={{ width: `${(diff.participant2_value / 50) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          ダッシュボードに戻る
        </Button>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          1on1比較
        </h1>
        <p className="text-gray-600">
          選手との資質比較を行い、効果的なコミュニケーション方法を見つけましょう。
          （最大4人まで選択可能）
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          比較対象の選択
        </h2>

        {/* Current User */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">あなた</h3>
          <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0)}
              </div>
              <div className="ml-3">
                <div className="font-medium text-gray-900">{user?.name}</div>
                <div className="text-sm text-gray-500">
                  {user?.role === UserRole.COACH && 'コーチ'}
                  {user?.role === UserRole.FATHER && '父親'}
                  {user?.role === UserRole.MOTHER && '母親'}
                  {user?.head_coach_function && ' (ヘッドコーチ)'}
                  {user?.parent_function && ' (親機能)'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Available Users */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            選手を選択 ({selectedUsers.length}/3)
          </h3>
          
          {/* エラー表示 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          ) : availableUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              選手が登録されていません
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableUsers.map((availableUser) => (
                <div
                  key={availableUser.user_id}
                  onClick={() => handleUserSelect(availableUser.user_id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedUsers.includes(availableUser.user_id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${
                    selectedUsers.length >= 3 && !selectedUsers.includes(availableUser.user_id)
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-medium">
                      {availableUser.name.charAt(0)}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">{availableUser.name}</div>
                      <div className="text-sm text-gray-500">
                        {availableUser.role === 'player' && '選手'}
                        {availableUser.role === 'coach' && 'コーチ'}
                        {!availableUser.has_test_result && (
                          <span className="ml-2 text-orange-600">
                            (テスト未実施)
                          </span>
                        )}
                        {availableUser.latest_test_date && (
                          <span className="ml-2">
                            最終テスト: {new Date(availableUser.latest_test_date).toLocaleDateString('ja-JP')}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedUsers.includes(availableUser.user_id) && (
                      <div className="ml-auto">
                        <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* 全員がテスト未実施の場合の注意メッセージ */}
          {availableUsers.length > 0 && availableUsers.every(u => !u.has_test_result) && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
                注意: 選手はまだテストを実施していません。比較を作成するとサンプルデータが使用されます。
              </p>
            </div>
          )}
        </div>

        {/* Create Comparison Button */}
        <div className="text-center">
          <Button
            onClick={handleCreateComparison}
            disabled={selectedUsers.length === 0 || loading}
          >
            {loading ? '処理中...' : '比較を作成する'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage;