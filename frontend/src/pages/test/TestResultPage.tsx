import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ShareIcon, DocumentArrowDownIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import ResultHeader from '../../components/result/ResultHeader';
import SportsmanshipChart from '../../components/result/SportsmanshipChart';
import AthleteMindsSection from '../../components/result/AthleteMindsSection';
import InsightPanel from '../../components/result/InsightPanel';
import { useAuthStore } from '../../store/authStore';
import { User, UserRole } from '../../types/auth';
import { 
  generateSelfEsteemAnalysis, 
  generateSelfEsteemImprovements,
  generateSelfEfficacyAnalysis,
  generateSelfEfficacyImprovements,
  generateSportsmanshipAnalysis 
} from '../../utils/analysisGenerators';

// 標準化されたTestResult型定義
interface TestResult {
  result_id: string;
  user_id: string;
  test_date: string;
  
  // 自己肯定感関連
  self_determination: number;
  self_acceptance: number;
  self_worth: number;
  self_efficacy: number;
  
  // アスリートマインド（標準化されたフィールド名）
  introspection: number;   // 内省
  self_control: number;    // 克己
  devotion: number;        // 献身
  intuition: number;       // 直感
  sensitivity: number;     // 繊細
  steadiness: number;      // 堅実
  comparison: number;      // 比較
  result: number;          // 結果
  assertion: number;       // 主張
  commitment: number;      // こだわり
  
  // スポーツマンシップ
  courage: number;
  resilience: number;
  cooperation: number;
  natural_acceptance: number;
  non_rationality: number;
  
  // 分析結果
  self_esteem_total: number;
  self_esteem_analysis: string;
  self_esteem_improvements: string[];
  athlete_type: string;
  athlete_type_description: string;
  athlete_type_percentages: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  sportsmanship_balance: string;
}

// セクション展開状態
interface SectionExpanded {
  selfEsteem: boolean;
  athleteMind: boolean;
  sportsmanship: boolean;
}

const TestResultPage = () => {
  const { resultId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();
  
  const [result, setResult] = useState<TestResult | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // セクションの展開状態
  const [expandedSections, setExpandedSections] = useState<SectionExpanded>({
    selfEsteem: false,
    athleteMind: false,
    sportsmanship: false
  });

  // シェアモーダルの表示状態
  const [showShareModal, setShowShareModal] = useState(false);

  // 新しく提出されたテスト結果または履歴からの結果をlocation.stateから取得
  const testResultFromState = location.state?.testResult;
  const isNewResult = location.state?.isNewResult;
  const isFromHistory = location.state?.isFromHistory;

  // ユーザー情報の初期化
  useEffect(() => {
    const initializeUser = () => {
      console.log('TestResultPage: ユーザー情報確認開始');
      
      // 認証ストアからユーザー情報を取得
      if (authUser) {
        setUser(authUser);
        console.log('TestResultPage: 認証ストアからユーザー情報取得成功:', authUser);
          return;
      }
      
      // 認証ストアにユーザーがいない場合のみサンプルユーザーを使用
      const sampleUser: User = {
        user_id: '123',
        name: '田中太郎',
        role: UserRole.PLAYER,
        email: 'tanaka@example.com',
        club_id: 'sample-club',
        parent_function: false,
        head_coach_function: false,
        head_parent_function: false,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
      };
      
      setUser(sampleUser);
      console.log('TestResultPage: サンプルユーザーでフォールバック');
    };

    initializeUser();
  }, [authUser]);

  // テスト結果の取得
  useEffect(() => {
    // location.stateから結果データが渡されている場合
    if (testResultFromState) {
      console.log('TestResultPage: location.stateから結果データを使用', testResultFromState);
      setResult(testResultFromState);
      setLoading(false);
      return;
    }

    const fetchResult = async () => {
      try {
        setLoading(true);
        
        // ローカルストレージから履歴を確認
        const savedResults = localStorage.getItem('testResults');
        if (savedResults && resultId) {
          const parsedResults = JSON.parse(savedResults);
          const foundResult = parsedResults.find((r: TestResult) => r.result_id === resultId);
          if (foundResult) {
            setResult(foundResult);
            setLoading(false);
            return;
          }
        }
        
        // サンプルデータで代替
        const sampleResult: TestResult = {
          result_id: resultId || 'sample-id',
          user_id: user?.user_id || 'sample-user',
          test_date: new Date().toISOString(),
          
          // 自己肯定感関連
          self_determination: 37.5,
          self_acceptance: 34,
          self_worth: 36,
          self_efficacy: 40,
          
          // アスリートマインド
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
          
          // スポーツマンシップ
          courage: 85,
          resilience: 78,
          cooperation: 72,
          natural_acceptance: 68,
          non_rationality: 45,
          
          // 分析結果
          self_esteem_total: 147.5,
          self_esteem_analysis: "あなたの自己肯定感は良好な状態です。",
          self_esteem_improvements: [
            "定期的な自己振り返りの時間を設けることをお勧めします",
            "小さな成功体験を積み重ねていきましょう"
          ],
          athlete_type: "アタッカー",
          athlete_type_description: "攻撃的で結果を追求し、状況を切り開く力を持つタイプ。",
          athlete_type_percentages: {
            "ストライカー": 65,
            "アタッカー": 78,
            "ゲームメイカー": 45,
            "アンカー": 52,
            "ディフェンダー": 38
          },
          strengths: ["結果志向", "リーダーシップ", "目標設定"],
          weaknesses: ["完璧主義", "プレッシャー感受性"],
          sportsmanship_balance: "全体的にバランスが取れています。"
        };

        setTimeout(() => {
          setResult(sampleResult);
          setLoading(false);
        }, 1000);

      } catch (err: any) {
        console.error('テスト結果の取得に失敗:', err);
        setError('テスト結果の取得に失敗しました。');
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId, testResultFromState, user?.user_id]);

  // メモ化されたハンドラー
  const handleShare = useCallback(() => {
    const shareUrl = window.location.href;
    const shareText = result ? `私のアスリートタイプは「${result.athlete_type}」でした！スポーツマンシップテストを受けてみませんか？` : '';
    
    // Web Share APIが利用可能な場合
    if (navigator.share) {
      navigator.share({
        title: 'スポーツマンシップテスト結果',
        text: shareText,
        url: shareUrl,
      }).catch((error) => {
        // ユーザーがキャンセルした場合は無視
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      });
    } else {
      // Web Share APIが利用できない場合はSNS共有モーダルを表示
      setShowShareModal(true);
    }
  }, [result]);

  const handleSNSShare = useCallback((platform: string) => {
    const shareUrl = encodeURIComponent(window.location.href);
    const shareText = encodeURIComponent(result ? `私のアスリートタイプは「${result.athlete_type}」でした！` : '');
    
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case 'line':
        url = `https://line.me/R/msg/text/?${shareText}%20${shareUrl}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(window.location.href);
        alert('URLをコピーしました！');
        setShowShareModal(false);
        return;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      setShowShareModal(false);
    }
  }, [result]);

  const handleExportPDF = useCallback(() => {
    alert('PDF出力機能は近日実装予定です');
  }, []);

  const handleBackToDashboard = useCallback(() => {
    if (isFromHistory) {
      navigate('/test/history');
    } else {
      navigate('/dashboard');
    }
  }, [navigate, isFromHistory]);

  // セクション展開トグル
  const toggleSection = useCallback((section: keyof SectionExpanded) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // メモ化された計算値
  const selfEsteemTotal = useMemo(() => 
    result ? (result.self_acceptance + result.self_worth + result.self_determination) : 0,
    [result]
  );

  // 固定の分析結果を使用（履歴からの場合は保存されたものを使用）
  const selfEsteemAnalysis = useMemo(() => 
    result?.self_esteem_analysis || (result ? generateSelfEsteemAnalysis(result, selfEsteemTotal) : ''),
    [result, selfEsteemTotal]
  );

  const selfEsteemImprovements = useMemo(() => 
    result?.self_esteem_improvements || (result ? generateSelfEsteemImprovements(result) : []),
    [result]
  );

  const selfEfficacyAnalysis = useMemo(() => 
    result ? generateSelfEfficacyAnalysis(result) : '',
    [result]
  );

  const selfEfficacyImprovements = useMemo(() => 
    result ? generateSelfEfficacyImprovements(result) : [],
    [result]
  );

  const sportsmanshipAnalysis = useMemo(() => 
    result?.sportsmanship_balance || (result ? generateSportsmanshipAnalysis(result, selfEsteemTotal) : ''),
    [result, selfEsteemTotal]
  );

  // メモ化されたチャートデータ
  const sportsmanshipScores = useMemo(() => 
    result ? {
      courage: result.courage,
      resilience: result.resilience,
      cooperation: result.cooperation,
      natural_acceptance: result.natural_acceptance,
      non_rationality: result.non_rationality
    } : null,
    [result]
  );

  const athleteMindScores = useMemo(() => 
    result ? {
      commitment: result.commitment,
      result: result.result,
      steadiness: result.steadiness,
      devotion: result.devotion,
      self_control: result.self_control,
      assertion: result.assertion,
      sensitivity: result.sensitivity,
      intuition: result.intuition,
      introspection: result.introspection,
      comparison: result.comparison
    } : null,
    [result]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">結果を分析中...</p>
          <p className="text-sm text-gray-500 mt-2">素晴らしい結果をお待ちください</p>
        </div>
      </div>
    );
  }

  if (error || !result || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error || 'データの読み込みに失敗しました'}</div>
          <Button onClick={handleBackToDashboard}>
            {isFromHistory ? 'テスト履歴に戻る' : 'ダッシュボードに戻る'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Button
            variant="secondary"
            onClick={handleBackToDashboard}
            className="inline-flex items-center"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            {isFromHistory ? 'テスト履歴に戻る' : 'ダッシュボードに戻る'}
          </Button>
        </div>

        <div className="space-y-8">
          {/* Result Header */}
          <ResultHeader
            userName={location.state?.playerName || user.name}
            userRole={location.state?.playerRole || user.role}
            testDate={result.test_date}
            athleteType={result.athlete_type}
            onExportPDF={handleExportPDF}
            onShare={handleShare}
          />

          {/* New Result Celebration */}
          {isNewResult && !isFromHistory && (
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-2xl p-6 text-center shadow-lg">
              <div className="text-green-800">
                <h3 className="text-xl font-bold mb-2">🎉 テスト完了おめでとうございます！</h3>
                <p className="text-green-700">
                  あなたの結果を詳しく分析しました。下記の内容をじっくりとご確認ください。
                </p>
              </div>
            </div>
          )}

          {/* 履歴から表示の場合の表示 */}
          {isFromHistory && (
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-2xl p-6 text-center shadow-lg">
              <div className="text-blue-800">
                <h3 className="text-xl font-bold mb-2">📋 過去のテスト結果</h3>
                <p className="text-blue-700">
                  {new Date(result.test_date).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}に実施したテストの結果です。
                </p>
              </div>
            </div>
          )}

          {/* 自己肯定感・効力感セクション */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">自己肯定感・効力感</h2>
            
            {/* 自己肯定感スコア */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="md:col-span-3 grid grid-cols-3 gap-4">
                <ScoreCard
                  title="自己受容感"
                  score={result.self_acceptance}
                  maxScore={50}
                  color="blue"
                  icon="🤝"
                />
                <ScoreCard
                  title="自己有用感"
                  score={result.self_worth}
                  maxScore={50}
                  color="indigo"
                  icon="⭐"
                />
                <ScoreCard
                  title="自己決定感"
                  score={result.self_determination}
              maxScore={50}
                  color="purple"
                  icon="🎯"
                />
              </div>
              
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <ScoreCard
                  title="自己肯定感 合計"
                  score={selfEsteemTotal}
                  maxScore={150}
                  color="gradient-blue"
                  icon="💎"
                  isTotal
                />
                <ScoreCard
                  title="自己効力感"
                  score={result.self_efficacy}
                  maxScore={50}
                  color="green"
                  icon="🚀"
                />
              </div>
            </div>

            {/* 自己肯定感セクションボタン */}
            <SectionButton
              title="詳細分析を見る"
              subtitle="あなたの自己肯定感・効力感の分析と改善提案"
              color="blue"
              isExpanded={expandedSections.selfEsteem}
              onClick={() => toggleSection('selfEsteem')}
            />

            {/* 自己肯定感・効力感の詳細セクション */}
            {expandedSections.selfEsteem && (
              <div className="mt-6 pt-6 border-t border-gray-200 animate-fadeIn">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-800 mb-3">あなたの自己肯定感の分析</h4>
                    <p className="text-gray-700 mb-4">{selfEsteemAnalysis}</p>
                    
                    <h5 className="font-semibold text-gray-800 mb-2">日頃意識すべきこと：</h5>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {selfEsteemImprovements.map((improvement, index) => (
                        <li key={index}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-800 mb-3">あなたの自己効力感の分析</h4>
                    <p className="text-gray-700 mb-4">{selfEfficacyAnalysis}</p>
                    
                    <h5 className="font-semibold text-gray-800 mb-2">日頃意識すべきこと：</h5>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {selfEfficacyImprovements.map((improvement, index) => (
                        <li key={index}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-800 mb-3">スポーツマンシップ総合分析</h4>
                    <p className="text-gray-700">{sportsmanshipAnalysis}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* アスリートマインドセクション */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">アスリートマインド</h2>
            
            {/* アスリートマインドの全10項目サマリー表示 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {athleteMindScores && [
                { key: 'commitment', label: 'こだわり', score: athleteMindScores.commitment },
                { key: 'result', label: '結果', score: athleteMindScores.result },
                { key: 'steadiness', label: '堅実', score: athleteMindScores.steadiness },
                { key: 'devotion', label: '献身', score: athleteMindScores.devotion },
                { key: 'self_control', label: '克己', score: athleteMindScores.self_control },
                { key: 'assertion', label: '主張', score: athleteMindScores.assertion },
                { key: 'sensitivity', label: '繊細', score: athleteMindScores.sensitivity },
                { key: 'intuition', label: '直感', score: athleteMindScores.intuition },
                { key: 'introspection', label: '内省', score: athleteMindScores.introspection },
                { key: 'comparison', label: '比較', score: athleteMindScores.comparison }
              ].map((item) => (
                <div key={item.key} className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-3 text-center">
                  <div className="text-xs text-indigo-600 font-medium mb-1">
                    {item.label}
                  </div>
                  <div className="text-xl font-bold text-indigo-700">{item.score}</div>
                </div>
              ))}
            </div>

            {/* アスリートマインドセクションボタン */}
            <SectionButton
              title="10項目の詳細を見る"
              subtitle="項目別スコアとバランスチャート"
              color="indigo"
              isExpanded={expandedSections.athleteMind}
              onClick={() => toggleSection('athleteMind')}
            />

            {/* アスリートマインドの詳細セクション */}
            {expandedSections.athleteMind && athleteMindScores && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <AthleteMindsSection scores={athleteMindScores} />
              </div>
            )}
          </div>

          {/* スポーツマンシップセクション */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">スポーツマンシップ</h2>
            
            {/* スポーツマンシップのサマリー表示 */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              {sportsmanshipScores && Object.entries(sportsmanshipScores).map(([key, score]) => (
                <div key={key} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                  <div className="text-xs text-purple-600 font-medium mb-1">
                    {key === 'courage' ? '勇気' :
                     key === 'resilience' ? '打たれ強さ' :
                     key === 'cooperation' ? '協調性' :
                     key === 'natural_acceptance' ? '自然体' :
                     '非合理性'}
                  </div>
                  <div className="text-2xl font-bold text-purple-700">{score}</div>
                </div>
              ))}
            </div>

            {/* スポーツマンシップセクションボタン */}
            <SectionButton
              title="5要素の分析を見る"
              subtitle="レーダーチャートとバランス分析"
              color="purple"
              isExpanded={expandedSections.sportsmanship}
              onClick={() => toggleSection('sportsmanship')}
            />

            {/* スポーツマンシップの詳細セクション */}
            {expandedSections.sportsmanship && sportsmanshipScores && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <SportsmanshipChart
                  scores={sportsmanshipScores}
                  maxScore={50}
                  title="スポーツマンシップ分析"
                />
              </div>
            )}
          </div>

          {/* Insight Panel */}
          <InsightPanel
            athleteType={result.athlete_type}
            athleteTypeDescription={result.athlete_type_description}
            athleteTypePercentages={result.athlete_type_percentages}
            strengths={result.strengths}
            weaknesses={result.weaknesses}
            selfEsteemAnalysis={result.self_esteem_analysis}
            selfEsteemImprovements={result.self_esteem_improvements}
            sportsmanshipBalance={result.sportsmanship_balance}
          />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              onClick={handleExportPDF}
              variant="secondary"
              className="inline-flex items-center"
            >
              <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              PDFで保存
            </Button>
            
            <Button
              onClick={handleShare}
              className="inline-flex items-center"
            >
              <ShareIcon className="w-5 h-5 mr-2" />
              結果をシェア
            </Button>
            
            <Button
              onClick={() => navigate('/test')}
              variant="secondary"
            >
              再テストを受ける
            </Button>
          </div>

          {/* シェアモーダル */}
          {showShareModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-scaleIn">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">結果をシェア</h3>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <p className="text-gray-600 mb-6">
                  あなたのテスト結果をSNSでシェアしましょう！
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleSNSShare('twitter')}
                    className="flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    X (Twitter)
                  </button>
                  
                  <button
                    onClick={() => handleSNSShare('facebook')}
                    className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>
                  
                  <button
                    onClick={() => handleSNSShare('line')}
                    className="flex items-center justify-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.95 3.61 9.05 8.34 9.84.61.11.83-.26.83-.58 0-.29-.01-1.24-.01-2.25-3.06.56-3.81-.74-4.06-1.42-.14-.35-.74-1.42-1.26-1.71-.43-.23-1.05-.8-.02-.81.97-.01 1.66.89 1.89 1.26 1.1 1.85 2.87 1.33 3.57 1.01.11-.8.43-1.33.78-1.64-2.73-.31-5.58-1.37-5.58-6.07 0-1.34.48-2.45 1.26-3.31-.13-.31-.55-1.56.12-3.26 0 0 1.03-.32 3.38 1.26.98-.27 2.03-.41 3.08-.41s2.1.14 3.08.41c2.35-1.59 3.38-1.26 3.38-1.26.67 1.7.25 2.95.12 3.26.79.86 1.26 1.96 1.26 3.31 0 4.71-2.87 5.76-5.6 6.07.44.38.83 1.12.83 2.26 0 1.64-.01 2.96-.01 3.36 0 .32.22.7.84.58C20.39 21.05 24 16.95 24 12c0-5.52-4.48-10-10-10z"/>
                    </svg>
                    LINE
                  </button>
                  
                  <button
                    onClick={() => handleSNSShare('copy')}
                    className="flex items-center justify-center gap-2 p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    URLをコピー
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// スコアカードコンポーネント
const ScoreCard = React.memo<{
  title: string;
  score: number;
  maxScore: number;
  color: 'blue' | 'indigo' | 'purple' | 'green' | 'gradient-blue';
  icon: string;
  isTotal?: boolean;
}>(({ title, score, maxScore, color, icon, isTotal = false }) => {
  const percentage = (score / maxScore) * 100;
  
  // 静的クラスマッピング
  const colorClasses = {
    'blue': 'bg-blue-50 text-blue-700 bg-blue-500',
    'indigo': 'bg-indigo-50 text-indigo-700 bg-indigo-500',
    'purple': 'bg-purple-50 text-purple-700 bg-purple-500',
    'green': 'bg-green-50 text-green-700 bg-green-500',
    'gradient-blue': 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 bg-blue-500'
  };
  
  const [bgClass, textClass, barClass] = colorClasses[color].split(' ');
  
  return (
    <div className={`${color === 'gradient-blue' ? colorClasses[color].split(' ')[0] : bgClass} rounded-2xl p-4 ${isTotal ? 'border-2 border-opacity-30 border-indigo-400' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-medium ${textClass}`}>{title}</span>
      </div>
      <div className="text-center">
        <div className={`text-3xl font-bold ${textClass}`}>{score}</div>
        <div className="text-sm text-gray-600">/ {maxScore}</div>
        <div className="mt-2 bg-white bg-opacity-50 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${barClass} transition-all duration-1000`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
});

// セクションボタンコンポーネント
const SectionButton = React.memo<{
  title: string;
  subtitle: string;
  color: 'blue' | 'indigo' | 'purple';
  isExpanded: boolean;
  onClick: () => void;
}>(({ title, subtitle, color, isExpanded, onClick }) => {
  // 静的クラスマッピング
  const colorClasses = {
    'blue': 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    'indigo': 'bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
    'purple': 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
  };
  
  return (
    <button
      onClick={onClick}
      className={`w-full ${colorClasses[color]} text-white rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h4 className="text-lg font-bold">{title}</h4>
          <p className="text-sm opacity-90">{subtitle}</p>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="w-6 h-6" />
        ) : (
          <ChevronDownIcon className="w-6 h-6" />
        )}
      </div>
    </button>
  );
});

export default TestResultPage;