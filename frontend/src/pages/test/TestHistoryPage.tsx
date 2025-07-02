import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ClockIcon, 
  ArrowPathIcon,
  PlusIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import HistoryCard from '../../components/history/HistoryCard';
import HistoryChart from '../../components/history/HistoryChart';
import CompareResults from '../../components/history/CompareResults';
import HistoryFilters, { FilterOptions } from '../../components/history/HistoryFilters';
import ExportOptions from '../../components/history/ExportOptions';
import { testService } from '../../services/testService';
import { TestResultWithAnalysis } from '../../types/test';

interface TestHistoryResponse {
  results: TestResultWithAnalysis[];
  total_count: number;
}

// ページ状態を一つのオブジェクトで管理
interface PageState {
  results: TestResultWithAnalysis[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalCount: number;
  showChart: boolean;
  selectedResults: Set<string>;
  showComparison: boolean;
  sortBy: 'date' | 'score';
  filters: FilterOptions;
}

// 定数をコンポーネント外に移動
const RESULTS_PER_PAGE = 10;
const INITIAL_FILTERS: FilterOptions = {
  period: 'all',
  athleteTypes: [],
  scoreRange: { min: 0, max: 600 },
  showOnlyImproved: false
};

// サンプルデータ生成関数をコンポーネント外に移動（開発環境のみ）
const generateSampleResults = (): TestResultWithAnalysis[] => [
  {
    result_id: 'sample-id-1',
    user_id: 'sample-user',
    test_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    
    self_determination: 75,
    self_acceptance: 68,
    self_worth: 72,
    self_efficacy: 80,
    
    introspection: 78,
    self_control: 82,
    devotion: 85,
    intuition: 70,
    sensitivity: 65,
    steadiness: 88,
    comparison: 75,
    result: 90,
    assertion: 77,
    commitment: 83,
    
    courage: 85,
    resilience: 78,
    cooperation: 72,
    natural_acceptance: 68,
    non_rationality: 45,
    
    self_esteem_total: 295,
    self_esteem_analysis: "あなたの自己肯定感は良好な状態です。",
    self_esteem_improvements: ["定期的な自己振り返りの時間を設けましょう"],
    athlete_type: "ストライカー",
    athlete_type_description: "結果を重視し、目標達成に向けて積極的に行動するタイプです。",
    athlete_type_percentages: {
      "ストライカー": 78,
      "サポーター": 45,
      "アナライザー": 62,
      "クリエイター": 38
    },
    strengths: ["結果志向", "リーダーシップ", "目標設定"],
    weaknesses: ["完璧主義", "プレッシャー感受性"],
    sportsmanship_balance: "全体的にバランスが取れています。"
  },
  {
    result_id: 'sample-id-2',
    user_id: 'sample-user',
    test_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    
    self_determination: 70,
    self_acceptance: 65,
    self_worth: 68,
    self_efficacy: 75,
    
    introspection: 75,
    self_control: 80,
    devotion: 82,
    intuition: 68,
    sensitivity: 62,
    steadiness: 85,
    comparison: 72,
    result: 87,
    assertion: 74,
    commitment: 80,
    
    courage: 82,
    resilience: 75,
    cooperation: 70,
    natural_acceptance: 65,
    non_rationality: 42,
    
    self_esteem_total: 278,
    self_esteem_analysis: "自己肯定感は概ね良好です。",
    self_esteem_improvements: ["小さな成功体験を積み重ねましょう"],
    athlete_type: "アンカー",
    athlete_type_description: "チームの土台として安定感を提供します。",
    athlete_type_percentages: {
      "ストライカー": 42,
      "アタッカー": 38,
      "ゲームメイカー": 65,
      "アンカー": 82,
      "ディフェンダー": 75
    },
    strengths: ["分析力", "計画性", "堅実性"],
    weaknesses: ["柔軟性", "直感力"],
    sportsmanship_balance: "バランスは良好ですが、非合理性の向上が期待されます。"
  }
];

// メモ化されたHistoryCardコンポーネント（クリック可能版）
const ClickableHistoryCard: React.FC<{
  result: TestResultWithAnalysis;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onView: (id: string) => void;
  showCheckbox: boolean;
}> = React.memo(({ result, index, isSelected, onSelect, onView, showCheckbox }) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // チェックボックスやボタンのクリックでない場合のみ詳細を表示
    const target = e.target as HTMLElement;
    if (!target.closest('input[type="checkbox"]') && !target.closest('button')) {
      onView(result.result_id);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="cursor-pointer hover:shadow-lg transition-shadow"
    >
      <HistoryCard
        result={result}
        index={index}
        isSelected={isSelected}
        onSelect={onSelect}
        showCheckbox={showCheckbox}
      />
    </div>
  );
});

const TestHistoryPage = () => {
  const navigate = useNavigate();
  const chartRef = useRef<HTMLDivElement>(null);
  
  // 状態を一つのオブジェクトで管理
  const [state, setState] = useState<PageState>({
    results: [],
    loading: true,
    error: null,
    currentPage: 1,
    totalCount: 0,
    showChart: true,
    selectedResults: new Set(),
    showComparison: false,
    sortBy: 'date',
    filters: INITIAL_FILTERS
  });

  // デバッグ用：state.resultsの変更を監視
  useEffect(() => {
    console.log('TestHistoryPage: state更新', {
      resultsLength: state.results.length,
      loading: state.loading,
      error: state.error,
      results: state.results
    });
  }, [state]);

  // 利用可能なアスリートタイプをメモ化
  const availableAthleteTypes = useMemo(() => 
    Array.from(new Set(state.results.map(r => r.athlete_type).filter(Boolean))),
    [state.results]
  );

  // 履歴取得関数
  const fetchHistory = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      console.log('TestHistoryPage: 履歴取得開始');
      
      // トークンの有効期限をチェック
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const isExpired = new Date() > new Date(payload.exp * 1000);
          if (isExpired) {
            console.log('トークンの有効期限が切れています');
            setState(prev => ({
              ...prev,
              error: 'セッションの有効期限が切れました。再度ログインしてください。',
              loading: false
            }));
            setTimeout(() => {
              localStorage.removeItem('token');
              navigate('/login');
            }, 2000);
            return;
          }
        } catch (e) {
          console.error('トークンの検証エラー:', e);
        }
      }
      
      // APIから履歴を取得
      const historyData = await testService.fetchTestHistory({
        limit: RESULTS_PER_PAGE * 10,
        offset: 0,
        sortBy: 'date'
      });
      
      console.log('TestHistoryPage: API応答', historyData);
      console.log('API応答の詳細:', JSON.stringify(historyData, null, 2));
      console.log('結果の数:', historyData?.results?.length || 0);
      
      if (historyData && historyData.results && Array.isArray(historyData.results)) {
        console.log('結果を状態に設定します');
        
        // データ形式を変換（不足しているフィールドを追加）
        const transformedResults = historyData.results.map((result: any) => ({
          ...result,
          // 不足しているフィールドを計算または仮の値で追加
          self_esteem_total: result.self_determination + result.self_acceptance + result.self_worth,
          self_esteem_analysis: "分析データが利用できません",
          self_esteem_improvements: [],
          athlete_type: "未分析",
          athlete_type_description: "アスリートタイプの分析が必要です",
          athlete_type_percentages: {},
          strengths: [],
          weaknesses: [],
          sportsmanship_balance: "バランス分析が利用できません"
        }));
        
        console.log('変換後のデータ:', transformedResults);
        console.log('変換後の最初のデータ:', transformedResults[0]);
        
        setState(prev => ({
          ...prev,
          results: transformedResults,
          error: null,
          loading: false
        }));
      } else {
        console.error('API応答の形式が不正です:', historyData);
        throw new Error('Invalid API response format');
      }
    } catch (err: any) {
      console.error('履歴取得エラー:', err);
      
      // 401エラーの場合は認証エラーとして処理
      if (err.message.includes('401')) {
        setState(prev => ({
          ...prev,
          error: '認証エラー: セッションの有効期限が切れました。',
          loading: false
        }));
        // トークンを削除して3秒後にログインページへリダイレクト
        localStorage.removeItem('token');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        return;
      }
      
      // 開発環境のみサンプルデータを使用
      if (process.env.NODE_ENV === 'development') {
        console.log('開発環境: サンプルデータを使用');
        const sampleResults = generateSampleResults();
        setState(prev => ({
          ...prev,
          results: sampleResults,
          error: null,
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: 'テスト履歴の取得に失敗しました。',
          loading: false
        }));
      }
    }
  }, [navigate]);

  // 初回読み込み
  useEffect(() => {
    console.log('TestHistoryPage: 初期化開始');
    fetchHistory();
  }, [fetchHistory]);

  // フィルタリングとソートの処理をメモ化
  const processedResults = useMemo(() => {
    let filtered = testService.filterResults(state.results, state.filters);
    
    // ソート処理
    filtered.sort((a, b) => {
      if (state.sortBy === 'score') {
        const scoreA = a.self_esteem_total + a.courage + a.resilience + 
                      a.cooperation + a.natural_acceptance + a.non_rationality;
        const scoreB = b.self_esteem_total + b.courage + b.resilience + 
                      b.cooperation + b.natural_acceptance + b.non_rationality;
        return scoreB - scoreA;
      } else {
        return new Date(b.test_date).getTime() - new Date(a.test_date).getTime();
      }
    });

    // 改善率の計算（破壊的変更を避ける）
    if (filtered.length > 1) {
      filtered = filtered.map((current, index) => {
        if (index < filtered.length - 1) {
          const previous = filtered[index + 1];
          
          const currentTotal = current.self_esteem_total + current.courage + current.resilience + 
                             current.cooperation + current.natural_acceptance + current.non_rationality;
          const previousTotal = previous.self_esteem_total + previous.courage + previous.resilience + 
                              previous.cooperation + previous.natural_acceptance + previous.non_rationality;
          
          const improvement = ((currentTotal - previousTotal) / previousTotal) * 100;
          const sportsmanship_total = current.courage + current.resilience + 
                                    current.cooperation + current.natural_acceptance + 
                                    current.non_rationality;
          
          return {
            ...current,
            improvement_rate: improvement,
            sportsmanship_total
          } as any;
        }
        return current;
      });
    }

    return filtered;
  }, [state.results, state.filters, state.sortBy]);

  // ページネーション用のデータをメモ化
  const paginatedResults = useMemo(() => {
    const startIndex = (state.currentPage - 1) * RESULTS_PER_PAGE;
    return processedResults.slice(startIndex, startIndex + RESULTS_PER_PAGE);
  }, [processedResults, state.currentPage]);

  const totalPages = useMemo(() => 
    Math.ceil(processedResults.length / RESULTS_PER_PAGE),
    [processedResults.length]
  );

  // イベントハンドラーをメモ化
  const handleSelectResult = useCallback((resultId: string) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedResults);
      if (newSelected.has(resultId)) {
        newSelected.delete(resultId);
      } else {
        if (newSelected.size >= 2) {
          const firstSelected = Array.from(newSelected)[0];
          newSelected.delete(firstSelected);
        }
        newSelected.add(resultId);
      }
      return { ...prev, selectedResults: newSelected };
    });
  }, []);

  const handleCompare = useCallback(() => {
    if (state.selectedResults.size === 2) {
      setState(prev => ({ ...prev, showComparison: true }));
    }
  }, [state.selectedResults.size]);

  const handleCloseComparison = useCallback(() => {
    setState(prev => ({ ...prev, showComparison: false }));
  }, []);

  const getComparisonData = useCallback(() => {
    const selectedArray = Array.from(state.selectedResults);
    const result1 = processedResults.find(r => r.result_id === selectedArray[0]);
    const result2 = processedResults.find(r => r.result_id === selectedArray[1]);
    
    if (result1 && result2) {
      const sorted = [result1, result2].sort((a, b) => 
        new Date(a.test_date).getTime() - new Date(b.test_date).getTime()
      );
      return { result1: sorted[0], result2: sorted[1] };
    }
    return null;
  }, [state.selectedResults, processedResults]);

  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    setState(prev => ({ 
      ...prev, 
      filters: newFilters,
      currentPage: 1 
    }));
  }, []);

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setState(prev => ({ 
      ...prev, 
      sortBy: e.target.value as 'date' | 'score' 
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const toggleChart = useCallback(() => {
    setState(prev => ({ ...prev, showChart: !prev.showChart }));
  }, []);

  // 日付クリックで詳細を表示
  const handleViewResult = useCallback((resultId: string) => {
    const result = state.results.find(r => r.result_id === resultId);
    if (result) {
      // TestResultPageに遷移し、結果データを渡す
      navigate(`/test/result/${resultId}`, {
        state: {
          testResult: result,
          isFromHistory: true
        }
      });
    }
  }, [state.results, navigate]);

  // ローディング状態
  if (state.loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">履歴を読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  // エラー状態
  if (state.error && state.results.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{state.error}</div>
          <Button onClick={fetchHistory}>
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            再試行
          </Button>
        </div>
      </div>
    );
  }

  return (
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

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              テスト履歴
            </h1>
            <p className="text-gray-600">
              過去に実施したテストの結果を確認・比較できます
            </p>
          </div>
          
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button
              variant="secondary"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center"
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              ダッシュボード
            </Button>
            <Link to="/test">
              <Button>
                <PlusIcon className="w-4 h-4 mr-2" />
                新しいテストを開始
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {state.results.length === 0 ? (
        <div className="card p-8 text-center">
          <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            まだテストを実施していません
          </p>
          <div className="space-y-2">
            <Link to="/test">
              <Button>
                テストを開始する
              </Button>
            </Link>
            {/* 開発環境用のデバッグボタン */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-400">開発環境用</p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const sampleResults = generateSampleResults();
                    setState(prev => ({
                      ...prev,
                      results: sampleResults,
                      error: null
                    }));
                  }}
                >
                  サンプルデータを表示
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col lg:flex-row gap-4">
            <div className="flex flex-wrap gap-2 flex-1">
              <button
                onClick={toggleChart}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  state.showChart
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ChartBarIcon className="w-4 h-4 inline mr-2" />
                グラフ表示
              </button>

              <HistoryFilters
                onFilterChange={handleFilterChange}
                availableAthleteTypes={availableAthleteTypes}
                initialFilters={state.filters}
              />

              <select
                value={state.sortBy}
                onChange={handleSortChange}
                className="rounded-lg border-gray-300 text-sm"
              >
                <option value="date">日付順</option>
                <option value="score">スコア順</option>
              </select>

              <ExportOptions
                results={processedResults}
                selectedResultIds={state.selectedResults}
                chartRef={state.showChart ? chartRef : undefined}
              />
            </div>

            {state.selectedResults.size === 2 && (
              <Button onClick={handleCompare} variant="secondary">
                選択した結果を比較
              </Button>
            )}
          </div>

          {state.showChart && processedResults.length >= 2 && (
            <div className="mb-8" ref={chartRef}>
              <HistoryChart data={processedResults} />
            </div>
          )}

          <div className="space-y-4">
            {paginatedResults.map((result, index) => (
              <ClickableHistoryCard
                key={result.result_id}
                result={result}
                index={index + (state.currentPage - 1) * RESULTS_PER_PAGE}
                isSelected={state.selectedResults.has(result.result_id)}
                onSelect={handleSelectResult}
                onView={handleViewResult}
                showCheckbox={true}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      state.currentPage === page
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </>
      )}

      {state.showComparison && state.selectedResults.size === 2 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CompareResults
              comparison={getComparisonData()!}
              onClose={handleCloseComparison}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TestHistoryPage;