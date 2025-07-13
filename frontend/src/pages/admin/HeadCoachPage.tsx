import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/auth';
import Button from '../../components/common/Button';
import { 
  ArrowLeftIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  CalendarIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { createApiUrl } from '../../config/api';

interface Player {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  latest_test_date?: string;
  test_count?: number;
}

interface PlayerTestResult {
  result_id: string;
  user_id: string;
  test_date: string;
  player_name: string;
  
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
}

const HeadCoachPage = () => {
  const { user, token, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerResults, setPlayerResults] = useState<PlayerTestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'latest_test_date' | 'test_count'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showResults, setShowResults] = useState(false);

  // ヘッドコーチ権限チェック
  useEffect(() => {
    console.log('Auth state:', { user, token, isAuthenticated }); // デバッグ用
    if (!user || !user.head_coach_function) {
      navigate('/dashboard');
    }
  }, [user, navigate, token, isAuthenticated]);

  // 所属選手一覧を取得
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      
      if (!token) {
        setError('認証トークンが見つかりません。ログインしてください。');
        setLoading(false);
        return;
      }
      
      console.log('Token:', token); // デバッグ用
      const response = await fetch(createApiUrl('/api/v1/coach/players'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlayers(data);
        setError(null);
      } else {
        setError('選手情報の取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // 選手のテスト結果を取得
  const fetchPlayerResults = async (playerId: string) => {
    try {
      console.log('Token for results:', token); // デバッグ用
      const response = await fetch(createApiUrl(`/api/v1/coach/players/${playerId}/results`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlayerResults(data);
      } else {
        setError('テスト結果の取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // 選手選択時の処理
  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
    fetchPlayerResults(player.user_id);
    setShowResults(true);
  };

  // フィルタリングとソート
  const filteredAndSortedPlayers = React.useMemo(() => {
    let filtered = players.filter(player => 
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [players, searchTerm, sortBy, sortOrder]);

  // スコア計算
  const calculateTotalScore = (result: PlayerTestResult) => {
    return Math.round(result.self_esteem_total + 
           result.courage + result.resilience + result.cooperation + 
           result.natural_acceptance + result.non_rationality);
  };

  // スコア評価
  const getScoreEvaluation = (score: number) => {
    if (score >= 80) return { label: '優秀', color: 'text-green-600 bg-green-100' };
    if (score >= 60) return { label: '良好', color: 'text-blue-600 bg-blue-100' };
    if (score >= 40) return { label: '普通', color: 'text-yellow-600 bg-yellow-100' };
    return { label: '要改善', color: 'text-red-600 bg-red-100' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">選手情報を読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchPlayers()}>再試行</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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

          {/* 管理画面へのリンクを追加 */}
          <div className="flex space-x-4">
            <Link
              to="/admin/users"
              className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg shadow hover:bg-gray-700 transition"
            >
              <UserGroupIcon className="w-5 h-5 mr-2" />
              管理画面（ユーザー管理）
            </Link>
            <Link
              to="/admin/login"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
            >
              <UserGroupIcon className="w-5 h-5 mr-2" />
              管理者ログイン
            </Link>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">ヘッドコーチ管理</h1>
              <p className="text-gray-600">所属選手のテスト結果を確認できます</p>
            </div>
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="w-8 h-8 text-indigo-500" />
              <span className="text-lg font-semibold text-gray-700">
                {players.length}名の選手
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 選手一覧 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">所属選手一覧</h2>
                
                {/* 検索・フィルター */}
                <div className="space-y-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="選手名で検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <FunnelIcon className="w-5 h-5 text-gray-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'name' | 'latest_test_date' | 'test_count')}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="name">名前順</option>
                      <option value="latest_test_date">最新テスト順</option>
                      <option value="test_count">テスト回数順</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {sortOrder === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 選手リスト */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredAndSortedPlayers.map((player) => (
                  <div
                    key={player.user_id}
                    onClick={() => handlePlayerSelect(player)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedPlayer?.user_id === player.user_id
                        ? 'bg-indigo-50 border-2 border-indigo-200'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {player.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{player.name}</div>
                          <div className="text-sm text-gray-500">{player.email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        {player.latest_test_date ? (
                          <div className="text-xs text-gray-500">
                            最終: {new Date(player.latest_test_date).toLocaleDateString('ja-JP')}
                          </div>
                        ) : (
                          <div className="text-xs text-red-500">テスト未実施</div>
                        )}
                        {player.test_count && (
                          <div className="text-xs text-gray-500">
                            {player.test_count}回実施
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* テスト結果表示 */}
          <div className="lg:col-span-2">
            {selectedPlayer && showResults ? (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedPlayer.name}のテスト結果
                      </h2>
                      <p className="text-gray-600">
                        {playerResults.length}件のテスト結果があります
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => setShowResults(false)}
                    >
                      選手一覧に戻る
                    </Button>
                  </div>
                </div>

                {playerResults.length > 0 ? (
                  <div className="space-y-6">
                    {playerResults.map((result, index) => {
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
                                  playerName: result.player_name,
                                  playerRole: 'player'
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
                  <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">選手を選択してください</h3>
                  <p className="text-gray-500">左側の選手一覧から選手を選択すると、テスト結果を確認できます</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadCoachPage; 