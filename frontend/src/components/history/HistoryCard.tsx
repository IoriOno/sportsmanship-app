import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  TrophyIcon,
  SparklesIcon,
  ChartBarIcon,
  HeartIcon,
  ShieldCheckIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface TestResultSummary {
  result_id: string;
  test_date: string;
  self_esteem_total: number;
  athlete_type: string;
  // 自己肯定感の詳細
  self_determination?: number;
  self_acceptance?: number;
  self_worth?: number;
  self_efficacy?: number;
  // アスリートマインド
  introspection?: number;
  self_control?: number;
  devotion?: number;
  intuition?: number;
  sensitivity?: number;
  steadiness?: number;
  comparison?: number;
  result?: number;
  assertion?: number;
  commitment?: number;
  // スポーツマンシップ
  courage?: number;
  resilience?: number;
  cooperation?: number;
  natural_acceptance?: number;
  non_rationality?: number;
  // その他
  sportsmanship_total?: number;
  improvement_rate?: number;
  strengths?: string[];
  weaknesses?: string[];
}

interface HistoryCardProps {
  result: TestResultSummary;
  index: number;
  isSelected?: boolean;
  onSelect?: (resultId: string) => void;
  showCheckbox?: boolean;
}

const HistoryCard: React.FC<HistoryCardProps> = ({
  result,
  index,
  isSelected = false,
  onSelect,
  showCheckbox = false
}) => {
  // 日付フォーマット（date-fnsを使わずに）
  const formattedDate = useMemo(() => {
    const date = new Date(result.test_date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekDay = weekDays[date.getDay()];
    return `${year}年${month}月${day}日 (${weekDay})`;
  }, [result.test_date]);

  // スコア計算（各カテゴリーの満点を明確に）
  const scores = useMemo(() => {
    // 自己肯定感（200点満点 = 50点×4項目）
    const selfEsteemScore = Math.round(
      (result.self_determination || 0) + 
      (result.self_acceptance || 0) + 
      (result.self_worth || 0) + 
      (result.self_efficacy || 0)
    );
    
    // アスリートマインド（500点満点 = 50点×10項目）
    const athleteMindScore = Math.round(
      (result.introspection || 0) + 
      (result.self_control || 0) + 
      (result.devotion || 0) + 
      (result.intuition || 0) + 
      (result.sensitivity || 0) + 
      (result.steadiness || 0) + 
      (result.comparison || 0) + 
      (result.result || 0) + 
      (result.assertion || 0) + 
      (result.commitment || 0)
    );
    
    // スポーツマンシップ（250点満点 = 50点×5項目）
    const sportsmanshipScore = Math.round(
      (result.courage || 0) + 
      (result.resilience || 0) + 
      (result.cooperation || 0) + 
      (result.natural_acceptance || 0) + 
      (result.non_rationality || 0)
    );
    
    // 総合スコア（950点満点）
    const totalScore = selfEsteemScore + athleteMindScore + sportsmanshipScore;
    
    // パーセンテージ計算
    const selfEsteemPercentage = Math.round((selfEsteemScore / 200) * 100);
    const athleteMindPercentage = Math.round((athleteMindScore / 500) * 100);
    const sportsmanshipPercentage = Math.round((sportsmanshipScore / 250) * 100);
    const totalPercentage = Math.round((totalScore / 950) * 100);
    
    return {
      selfEsteem: { score: selfEsteemScore, max: 200, percentage: selfEsteemPercentage },
      athleteMind: { score: athleteMindScore, max: 500, percentage: athleteMindPercentage },
      sportsmanship: { score: sportsmanshipScore, max: 250, percentage: sportsmanshipPercentage },
      total: { score: totalScore, max: 950, percentage: totalPercentage }
    };
  }, [result]);

  // アスリートタイプの色
  const athleteTypeColors: Record<string, { bg: string; text: string; gradient: string }> = {
    'ストライカー': { 
      bg: 'bg-red-50', 
      text: 'text-red-700', 
      gradient: 'from-red-400 to-red-600' 
    },
    'アタッカー': { 
      bg: 'bg-orange-50', 
      text: 'text-orange-700', 
      gradient: 'from-orange-400 to-orange-600' 
    },
    'ゲームメイカー': { 
      bg: 'bg-blue-50', 
      text: 'text-blue-700', 
      gradient: 'from-blue-400 to-blue-600' 
    },
    'アンカー': { 
      bg: 'bg-green-50', 
      text: 'text-green-700', 
      gradient: 'from-green-400 to-green-600' 
    },
    'ディフェンダー': { 
      bg: 'bg-purple-50', 
      text: 'text-purple-700', 
      gradient: 'from-purple-400 to-purple-600' 
    },
    '未分析': { 
      bg: 'bg-gray-50', 
      text: 'text-gray-700', 
      gradient: 'from-gray-400 to-gray-600' 
    }
  };

  const typeColor = athleteTypeColors[result.athlete_type] || athleteTypeColors['未分析'];

  const handleClick = (e: React.MouseEvent) => {
    if (showCheckbox && onSelect) {
      e.preventDefault();
      onSelect(result.result_id);
    }
  };

  const improvementRate = result.improvement_rate || 0;
  const hasImproved = improvementRate > 0;

  return (
    <div className={`relative ${showCheckbox ? 'cursor-pointer' : ''}`} onClick={handleClick}>
      <Link
        to={showCheckbox ? '#' : `/test/result/${result.result_id}`}
        className={`block transition-all duration-300 ${
          isSelected 
            ? 'ring-2 ring-indigo-500 shadow-xl scale-[1.02]' 
            : 'hover:shadow-xl hover:scale-[1.01]'
        }`}
      >
        <div className="bg-white rounded-2xl overflow-hidden">
          {/* カラフルなヘッダーバー */}
          <div className={`h-2 bg-gradient-to-r ${typeColor.gradient}`} />
          
          <div className="p-6">
            {/* ヘッダー部分 */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-start gap-4 flex-1">
                {showCheckbox && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      onSelect?.(result.result_id);
                    }}
                    className="w-5 h-5 mt-1 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                
                {/* インデックスバッジ */}
                <div className="flex-shrink-0">
                  <div className={`w-14 h-14 bg-gradient-to-br ${typeColor.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <span className="text-lg font-bold text-white">#{index + 1}</span>
                  </div>
                </div>

                <div className="flex-1">
                  {/* 日付と最新バッジ */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <CalendarIcon className="w-5 h-5 text-gray-500" />
                      <span className="font-semibold text-lg">{formattedDate}</span>
                    </div>
                    {index === 0 && (
                      <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold rounded-full shadow-sm animate-pulse">
                        最新
                      </span>
                    )}
                  </div>
                  
                  {/* アスリートタイプと改善率 */}
                  <div className="flex items-center gap-3">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 ${typeColor.bg} ${typeColor.text} rounded-xl font-bold`}>
                      <TrophyIcon className="w-5 h-5" />
                      {result.athlete_type}
                    </div>
                    
                    {hasImproved && (
                      <div className="flex items-center gap-1 text-green-600 font-bold">
                        <ArrowTrendingUpIcon className="w-5 h-5" />
                        <span>+{improvementRate.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {!showCheckbox && (
                <ChevronRightIcon className="w-6 h-6 text-gray-400 flex-shrink-0" />
              )}
            </div>

            {/* 総合スコアセクション */}
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-5 mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-7 h-7 text-indigo-600" />
                  <span className="font-bold text-xl text-gray-800">総合スコア</span>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    {scores.total.score}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">/ {scores.total.max}点</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">達成率</span>
                  <span className="font-bold text-indigo-600">{scores.total.percentage}%</span>
                </div>
                <div className="w-full bg-white bg-opacity-70 rounded-full h-4 overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out shadow-sm"
                    style={{ width: `${scores.total.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 3つのカテゴリースコア */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {/* 自己肯定感 */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <HeartIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-sm text-gray-700">自己肯定感</span>
                </div>
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-700">{scores.selfEsteem.score}</div>
                    <div className="text-xs text-gray-600">/ {scores.selfEsteem.max}点</div>
                  </div>
                  <div className="bg-blue-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000"
                      style={{ width: `${scores.selfEsteem.percentage}%` }}
                    />
                  </div>
                  <div className="text-center text-xs font-semibold text-blue-700">
                    {scores.selfEsteem.percentage}%
                  </div>
                </div>
              </div>

              {/* アスリートマインド */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <FireIcon className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-sm text-gray-700">アスリートマインド</span>
                </div>
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">{scores.athleteMind.score}</div>
                    <div className="text-xs text-gray-600">/ {scores.athleteMind.max}点</div>
                  </div>
                  <div className="bg-green-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000"
                      style={{ width: `${scores.athleteMind.percentage}%` }}
                    />
                  </div>
                  <div className="text-center text-xs font-semibold text-green-700">
                    {scores.athleteMind.percentage}%
                  </div>
                </div>
              </div>

              {/* スポーツマンシップ */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheckIcon className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-sm text-gray-700">スポーツマンシップ</span>
                </div>
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-700">{scores.sportsmanship.score}</div>
                    <div className="text-xs text-gray-600">/ {scores.sportsmanship.max}点</div>
                  </div>
                  <div className="bg-purple-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-1000"
                      style={{ width: `${scores.sportsmanship.percentage}%` }}
                    />
                  </div>
                  <div className="text-center text-xs font-semibold text-purple-700">
                    {scores.sportsmanship.percentage}%
                  </div>
                </div>
              </div>
            </div>

            {/* スポーツマンシップ要素（元のデザインから） */}
            {(result.courage !== undefined || result.resilience !== undefined || result.cooperation !== undefined) && (
              <div className="border-t pt-4">
                <div className="text-xs text-gray-500 mb-3 font-semibold">スポーツマンシップ詳細</div>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: '勇気', value: result.courage, color: 'text-red-600' },
                    { label: '打たれ強さ', value: result.resilience, color: 'text-orange-600' },
                    { label: '協調性', value: result.cooperation, color: 'text-green-600' },
                    { label: '自然体', value: result.natural_acceptance, color: 'text-blue-600' },
                    { label: '非合理性', value: result.non_rationality, color: 'text-purple-600' }
                  ].map((item, idx) => (
                    item.value !== undefined && (
                      <div key={idx} className="text-center">
                        <div className="text-xs text-gray-600 mb-1">{item.label}</div>
                        <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
                        <div className="text-xs text-gray-500">/ 50</div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default HistoryCard;