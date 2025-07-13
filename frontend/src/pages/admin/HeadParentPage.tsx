import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/auth';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { 
  ArrowLeftIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  CalendarIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { createApiUrl } from '../../config/api';

interface FamilyMember {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  latest_test_date?: string;
  test_count?: number;
  relationship: string;
}

interface FamilyMemberTestResult {
  result_id: string;
  user_id: string;
  test_date: string;
  member_name: string;
  
  // 自己肯定感関連
  self_determination: number;
  self_acceptance: number;
  self_worth: number;
  self_efficacy: number;
  
  // アスリートマインド
  introspection: number;
  self_control: number;
  devotion: number;
  intuition: number;
  sensitivity: number;
  steadiness: number;
  comparison: number;
  result: number;
  assertion: number;
  commitment: number;
  
  // スポーツマンシップ
  courage: number;
  resilience: number;
  cooperation: number;
  natural_acceptance: number;
  non_rationality: number;
  
  // 分析結果
  self_esteem_total: number;
  athlete_type: string;
  strengths?: string[];
  weaknesses?: string[];
  sportsmanship_total: number;
}

const HeadParentPage = () => {
  const { user, token, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [memberResults, setMemberResults] = useState<FamilyMemberTestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'latest_test_date' | 'test_count' | 'relationship'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showResults, setShowResults] = useState(false);
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [addFamilyEmail, setAddFamilyEmail] = useState('');
  const [addFamilyError, setAddFamilyError] = useState<string | null>(null);
  const [addFamilyLoading, setAddFamilyLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // ヘッド親権限チェック
  useEffect(() => {
    console.log('Auth state:', { user, token, isAuthenticated }); // デバッグ用
    if (!user || !user.head_parent_function) {
      navigate('/dashboard');
    }
  }, [user, navigate, token, isAuthenticated]);

  // メールアドレスでユーザーを検索
  const searchUserByEmail = async (email: string) => {
    if (!email.trim()) {
      setSearchResult(null);
      return;
    }

    setSearchLoading(true);
    setAddFamilyError(null);
    
    try {
      const response = await fetch(createApiUrl(`/api/v1/family/search-user?email=${encodeURIComponent(email)}`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResult(data);
      } else {
        const errorData = await response.json();
        setAddFamilyError(errorData.detail || 'ユーザーが見つかりません');
        setSearchResult(null);
      }
    } catch (err) {
      setAddFamilyError('ネットワークエラーが発生しました');
      setSearchResult(null);
    } finally {
      setSearchLoading(false);
    }
  };

  // メールアドレス入力時の検索
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setAddFamilyEmail(email);
    setSearchResult(null);
    setAddFamilyError(null);
    
    if (email.trim()) {
      // デバウンス処理（500ms後に検索実行）
      const timeoutId = setTimeout(() => {
        searchUserByEmail(email);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  };

  // 家族メンバー一覧を取得
  const fetchFamilyMembers = async () => {
    try {
      setLoading(true);
      
      if (!token) {
        setError('認証トークンが見つかりません。ログインしてください。');
        setLoading(false);
        return;
      }
      
      console.log('Token:', token); // デバッグ用
      const response = await fetch(createApiUrl('/api/v1/family/members'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setFamilyMembers(data);
        setError(null);
      } else {
        setError('家族メンバー情報の取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // 家族メンバーのテスト結果を取得
  const fetchMemberResults = async (memberId: string) => {
    try {
      console.log('Token for results:', token); // デバッグ用
      const response = await fetch(createApiUrl(`/api/v1/family/members/${memberId}/results`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMemberResults(data);
      } else {
        setError('テスト結果の取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    }
  };

  const handleAddFamily = async () => {
    setAddFamilyError(null);
    setAddFamilyLoading(true);
    try {
      const response = await fetch(createApiUrl('/api/v1/family/add'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: addFamilyEmail }),
      });
      if (response.ok) {
        setShowAddFamily(false);
        setAddFamilyEmail('');
        setSearchResult(null);
        fetchFamilyMembers();
      } else {
        const data = await response.json();
        setAddFamilyError(data.detail || '家族の追加に失敗しました');
      }
    } catch (err) {
      setAddFamilyError('ネットワークエラーが発生しました');
    } finally {
      setAddFamilyLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  // 家族メンバー選択時の処理
  const handleMemberSelect = (member: FamilyMember) => {
    setSelectedMember(member);
    fetchMemberResults(member.user_id);
    setShowResults(true);
  };

  // フィルタリングとソート
  const filteredAndSortedMembers = React.useMemo(() => {
    let filtered = familyMembers.filter(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ソート処理
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortBy === 'name') {
        aValue = a.name;
        bValue = b.name;
      } else if (sortBy === 'latest_test_date') {
        aValue = a.latest_test_date ? new Date(a.latest_test_date).getTime() : 0;
        bValue = b.latest_test_date ? new Date(b.latest_test_date).getTime() : 0;
      } else if (sortBy === 'test_count') {
        aValue = a.test_count || 0;
        bValue = b.test_count || 0;
      } else if (sortBy === 'relationship') {
        aValue = a.relationship;
        bValue = b.relationship;
      } else {
        aValue = a.name;
        bValue = b.name;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [familyMembers, searchTerm, sortBy, sortOrder]);

  // スコア計算
  const calculateTotalScore = (result: FamilyMemberTestResult) => {
    return Math.round(result.self_esteem_total + result.sportsmanship_total);
  };

  // スコア評価
  const getScoreEvaluation = (score: number) => {
    if (score >= 80) return { label: '優秀', color: 'text-green-600 bg-green-100' };
    if (score >= 60) return { label: '良好', color: 'text-blue-600 bg-blue-100' };
    if (score >= 40) return { label: '普通', color: 'text-yellow-600 bg-yellow-100' };
    return { label: '要改善', color: 'text-red-600 bg-red-100' };
  };

  // 関係性の表示
  const getRelationshipLabel = (relationship: string) => {
    switch (relationship) {
      case 'parent':
        return { label: '親', color: 'text-purple-600 bg-purple-100' };
      case 'child':
        return { label: '子供', color: 'text-pink-600 bg-pink-100' };
      default:
        return { label: relationship, color: 'text-gray-600 bg-gray-100' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">家族メンバー情報を読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchFamilyMembers()}>再試行</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Button
            variant="secondary"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            ダッシュボードに戻る
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">ヘッド親管理</h1>
              <p className="text-gray-600">家族メンバーのテスト結果を確認できます</p>
            </div>
            <div className="flex items-center space-x-2">
              <HeartIcon className="w-8 h-8 text-purple-500" />
              <span className="text-lg font-semibold text-gray-700">
                {familyMembers.length}名の家族メンバー
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 家族メンバー一覧 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">家族メンバー一覧</h2>
                  <Button onClick={() => setShowAddFamily(true)} variant="primary">
                    家族を追加
                  </Button>
                </div>
                
                {/* 追加モーダル */}
                {showAddFamily && (
                  <Modal onClose={() => setShowAddFamily(false)}>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4">家族を追加</h3>
                      <input
                        type="email"
                        placeholder="家族のメールアドレス"
                        value={addFamilyEmail}
                        onChange={handleEmailChange}
                        className="w-full border rounded px-3 py-2 mb-2"
                      />
                      {addFamilyError && <div className="text-red-600 text-sm mb-2">{addFamilyError}</div>}
                      {searchLoading && (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent mx-auto mb-2"></div>
                          <p className="text-gray-600">ユーザーを検索中...</p>
                        </div>
                      )}
                      {searchResult && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h4 className="text-md font-semibold mb-2">検索結果</h4>
                          <div className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-white">
                            <div>
                              <p className="font-medium">{searchResult.name}</p>
                              <p className="text-sm text-gray-600">{searchResult.email}</p>
                              <p className="text-xs text-gray-500">役割: {searchResult.role}</p>
                            </div>
                            <Button
                              variant="primary"
                              className="px-3 py-1 text-sm"
                              onClick={() => {
                                setAddFamilyEmail(searchResult.email);
                                setSearchResult(null);
                              }}
                            >
                              選択
                            </Button>
                          </div>
                        </div>
                      )}
                      <div className="flex space-x-2 mt-2">
                        <Button onClick={handleAddFamily} disabled={addFamilyLoading || !addFamilyEmail}>
                          {addFamilyLoading ? '追加中...' : '追加する'}
                        </Button>
                        <Button variant="secondary" onClick={() => setShowAddFamily(false)}>
                          キャンセル
                        </Button>
                      </div>
                    </div>
                  </Modal>
                )}

                {/* 検索・フィルター */}
                <div className="space-y-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="メンバー名で検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <FunnelIcon className="w-5 h-5 text-gray-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="name">名前順</option>
                      <option value="latest_test_date">最新テスト順</option>
                      <option value="test_count">テスト回数順</option>
                      <option value="relationship">関係性順</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {sortOrder === 'asc' ? (
                        <ChevronUpIcon className="w-5 h-5" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* メンバーリスト */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredAndSortedMembers.map((member) => {
                  const relationshipInfo = getRelationshipLabel(member.relationship);
                  return (
                    <div
                      key={member.user_id}
                      onClick={() => handleMemberSelect(member)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                        selectedMember?.user_id === member.user_id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${relationshipInfo.color}`}>
                          {relationshipInfo.label}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <p>{member.email}</p>
                        <p className="capitalize">{member.role}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {member.latest_test_date ? (
                            <span>最新: {new Date(member.latest_test_date).toLocaleDateString()}</span>
                          ) : (
                            <span>テスト未実施</span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <ChartBarIcon className="w-4 h-4 mr-1" />
                          <span>{member.test_count || 0}回</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* テスト結果表示 */}
          <div className="lg:col-span-2">
            {selectedMember && showResults ? (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedMember.name}のテスト結果
                      </h2>
                      <p className="text-gray-600">{selectedMember.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRelationshipLabel(selectedMember.relationship).color}`}>
                        {getRelationshipLabel(selectedMember.relationship).label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      <span>テスト回数: {selectedMember.test_count || 0}回</span>
                    </div>
                    {selectedMember.latest_test_date && (
                      <div className="flex items-center">
                        <EyeIcon className="w-4 h-4 mr-1" />
                        <span>最新: {new Date(selectedMember.latest_test_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {memberResults.length > 0 ? (
                  <div className="space-y-6">
                    {memberResults.map((result, index) => {
                      const totalScore = calculateTotalScore(result);
                      const evaluation = getScoreEvaluation(totalScore);
                      
                      return (
                        <div key={result.result_id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <CalendarIcon className="w-5 h-5 text-gray-400" />
                              <span className="font-semibold text-gray-900">
                                {new Date(result.test_date).toLocaleDateString('ja-JP', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${evaluation.color}`}>
                                {evaluation.label}
                              </span>
                            </div>
                            <Button
                              variant="secondary"
                              onClick={() => navigate(`/test/result/${result.result_id}`, {
                                state: {
                                  playerName: result.member_name,
                                  playerRole: 'family_member'
                                }
                              })}
                              className="inline-flex items-center"
                            >
                              <EyeIcon className="w-4 h-4 mr-2" />
                              詳細を見る
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* 自己肯定感 */}
                            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4">
                              <div className="text-sm font-medium text-pink-700 mb-2">自己肯定感</div>
                              <div className="text-2xl font-bold text-pink-800">{Math.round(result.self_esteem_total)}</div>
                              <div className="text-xs text-pink-600">200点満点</div>
                            </div>

                            {/* アスリートタイプ */}
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                              <div className="text-sm font-medium text-blue-700 mb-2">アスリートタイプ</div>
                              <div className="text-lg font-bold text-blue-800">{result.athlete_type}</div>
                              <div className="text-xs text-blue-600">10要素分析</div>
                            </div>

                            {/* スポーツマンシップ */}
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                              <div className="text-sm font-medium text-purple-700 mb-2">スポーツマンシップ</div>
                              <div className="text-2xl font-bold text-purple-800">
                                {Math.round(result.courage + result.resilience + result.cooperation + 
                                 result.natural_acceptance + result.non_rationality)}
                              </div>
                              <div className="text-xs text-purple-600">250点満点</div>
                            </div>
                          </div>

                          {/* 強み・弱み */}
                          {(result.strengths?.length || result.weaknesses?.length) && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              {result.strengths?.length && (
                                <div>
                                  <div className="text-sm font-medium text-green-700 mb-2">強み</div>
                                  <div className="text-sm text-gray-700">
                                    {result.strengths.join(', ')}
                                  </div>
                                </div>
                              )}
                              {result.weaknesses?.length && (
                                <div>
                                  <div className="text-sm font-medium text-orange-700 mb-2">改善点</div>
                                  <div className="text-sm text-gray-700">
                                    {result.weaknesses.join(', ')}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">テスト結果がありません</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="text-center py-12">
                  <HeartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">左側の家族メンバーを選択してテスト結果を確認してください</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadParentPage; 