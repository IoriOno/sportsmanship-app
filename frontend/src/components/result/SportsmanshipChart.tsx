import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface SportsmanshipChartProps {
  scores: {
    courage: number;
    resilience: number;
    cooperation: number;
    natural_acceptance: number;
    non_rationality: number;
  };
  maxScore?: number;
  title?: string;
  showComparison?: boolean;
  comparisonData?: {
    courage: number;
    resilience: number;
    cooperation: number;
    natural_acceptance: number;
    non_rationality: number;
  };
}

const SportsmanshipChart = React.memo<SportsmanshipChartProps>(({
  scores,
  maxScore = 50,
  title = "スポーツマンシップ分析",
  showComparison = false,
  comparisonData
}) => {
  const labels = useMemo(() => ['勇気', '打たれ強さ', '協調性', '自然体', '非合理性'], []);
  
  // 現在のスコアをメモ化
  const currentScores = useMemo(() => [
    scores.courage,
    scores.resilience,
    scores.cooperation,
    scores.natural_acceptance,
    scores.non_rationality
  ], [scores]);

  // データセットをメモ化
  const datasets = useMemo(() => {
    const baseDatasets = [
      {
        label: '現在のスコア',
        data: currentScores,
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        borderColor: 'rgba(147, 51, 234, 0.8)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(147, 51, 234, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
      }
    ];

    if (showComparison && comparisonData) {
      const comparisonScores = [
        comparisonData.courage,
        comparisonData.resilience,
        comparisonData.cooperation,
        comparisonData.natural_acceptance,
        comparisonData.non_rationality
      ];

      baseDatasets.push({
        label: '前回のスコア',
        data: comparisonScores,
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        borderColor: 'rgba(251, 191, 36, 0.6)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(251, 191, 36, 0.8)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true
      } as any);
    }

    return baseDatasets;
  }, [currentScores, showComparison, comparisonData]);

  // モバイル判定
  const isMobile = window.innerWidth < 768;

  // オプションをメモ化（モバイル対応を強化）
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showComparison,
        position: 'top' as const,
        labels: {
          font: {
            size: isMobile ? 12 : 14,
            family: 'Inter, system-ui, sans-serif',
            weight: '600'
          },
          padding: isMobile ? 15 : 25,
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#374151'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(147, 51, 234, 0.8)',
        borderWidth: 2,
        cornerRadius: 12,
        padding: 12,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context: any) {
            const percentage = Math.round((context.parsed.r / maxScore) * 100);
            return `${context.dataset.label}: ${context.parsed.r}点 (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      r: {
        min: 0,
        max: maxScore,
        beginAtZero: true,
        ticks: {
          stepSize: maxScore / 5,
          font: {
            size: isMobile ? 10 : 12,
            weight: '500'
          },
          color: '#6B7280',
          backdropColor: 'rgba(255, 255, 255, 0.8)',
          backdropPadding: 4,
          display: !isMobile // モバイルでは数値を非表示
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
          lineWidth: 2,
          circular: true
        },
        angleLines: {
          color: 'rgba(156, 163, 175, 0.2)',
          lineWidth: 2
        },
        pointLabels: {
          font: {
            size: isMobile ? 11 : 14,
            weight: '600',
            family: 'Inter, system-ui, sans-serif'
          },
          color: '#1F2937',
          padding: isMobile ? 5 : 15,
          centerPointLabels: false,
          display: true,
          callback: function(value: string, index: number) {
            const score = currentScores[index];
            // モバイルでは改行せずに表示
            return isMobile ? `${value}` : `${value}\n${score}点`;
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart' as const
    }
  }) as any, [maxScore, currentScores, showComparison, isMobile]);

  // チャートデータをメモ化
  const data = useMemo(() => ({
    labels,
    datasets
  }), [labels, datasets]);

  // スコア分析をメモ化
  const analysis = useMemo(() => {
    const totalScore = currentScores.reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / currentScores.length;
    const maxCategoryScore = Math.max(...currentScores);
    const minCategoryScore = Math.min(...currentScores);
    const maxCategoryIndex = currentScores.indexOf(maxCategoryScore);
    const minCategoryIndex = currentScores.indexOf(minCategoryScore);

    return {
      totalScore,
      averageScore,
      maxCategory: labels[maxCategoryIndex],
      minCategory: labels[minCategoryIndex],
      maxCategoryScore,
      minCategoryScore
    };
  }, [currentScores, labels]);

  // 各項目の説明
  const itemDescriptions = {
    '勇気': '困難に立ち向かい、新しいことに挑戦する力',
    '打たれ強さ': '失敗や挫折から立ち直る回復力',
    '協調性': 'チームで協力し、他者と調和する力',
    '自然体': 'ありのままの自分を受け入れる力',
    '非合理性': '直感や感情を大切にする力'
  };

  // アイコンマッピング
  const itemIcons = {
    '勇気': '🔥',
    '打たれ強さ': '💪',
    '協調性': '🤝',
    '自然体': '🌱',
    '非合理性': '✨'
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 animate-fadeIn">
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
          5つの要素であなたのスポーツマンシップを可視化します
        </p>
      </div>

      {/* モバイル用レイアウト */}
      <div className="block lg:hidden">
        {/* チャート */}
        <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl p-4 shadow-inner mb-4">
          <div className="relative h-64 sm:h-80">
            <Radar data={data} options={options} />
          </div>
        </div>

        {/* スコア詳細（モバイル用コンパクト版） */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 shadow-lg">
          <h4 className="font-bold text-gray-900 mb-3 text-base">スコア詳細</h4>
          
          <div className="grid grid-cols-2 gap-3">
            {labels.map((label, index) => {
              const score = currentScores[index];
              const percentage = (score / maxScore) * 100;
              const isMax = score === analysis.maxCategoryScore;
              const isMin = score === analysis.minCategoryScore;
              
              return (
                <div key={label} className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{itemIcons[label as keyof typeof itemIcons]}</span>
                    <span className={`font-bold text-sm ${isMax ? 'text-green-700' : isMin ? 'text-orange-700' : 'text-gray-800'}`}>
                      {score}点
                    </span>
                  </div>
                  <div className="text-xs font-medium text-gray-700">
                    {label}
                    {isMax && <span className="ml-1 text-green-600">★</span>}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                        percentage >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                        percentage >= 60 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                        percentage >= 40 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                        'bg-gradient-to-r from-orange-400 to-orange-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 総合評価（モバイル） */}
          <div className="mt-4 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-gray-700">合計スコア</div>
                <div className="text-lg font-bold text-purple-700">
                  {analysis.totalScore} / {maxScore * 5}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {analysis.averageScore >= 40 ? 'S' :
                   analysis.averageScore >= 35 ? 'A' :
                   analysis.averageScore >= 30 ? 'B' :
                   analysis.averageScore >= 25 ? 'C' : 'D'}
                </div>
                <div className="text-xs text-gray-600 font-medium">ランク</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* デスクトップ用レイアウト（元のレイアウトを維持） */}
      <div className="hidden lg:grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* メインチャート */}
        <div className="xl:col-span-2">
          <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl p-8 shadow-inner">
            <div className="relative h-96">
              <Radar data={data} options={options} />
            </div>
          </div>
        </div>

        {/* サイドパネル */}
        <div className="space-y-6">
          {/* スコア詳細 */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-lg">
            <h4 className="font-bold text-gray-900 mb-4 text-lg">スコア詳細</h4>
            
            <div className="space-y-4">
              {labels.map((label, index) => {
                const score = currentScores[index];
                const percentage = (score / maxScore) * 100;
                const isMax = score === analysis.maxCategoryScore;
                const isMin = score === analysis.minCategoryScore;
                
                return (
                  <div key={label} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{itemIcons[label as keyof typeof itemIcons]}</span>
                        <span className={`font-medium ${isMax ? 'text-green-700' : isMin ? 'text-orange-700' : 'text-gray-700'}`}>
                          {label}
                          {isMax && <span className="ml-1 text-green-600">★</span>}
                        </span>
                      </div>
                      <span className={`font-bold ${isMax ? 'text-green-700' : isMin ? 'text-orange-700' : 'text-gray-800'}`}>
                        {score}点
                      </span>
                    </div>
                    
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                            percentage >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                            percentage >= 60 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                            percentage >= 40 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                            'bg-gradient-to-r from-orange-400 to-orange-600'
                          }`}
                          style={{ width: `${percentage}%` }}
                        >
                          <div className="h-full bg-white opacity-25 animate-pulse" />
                        </div>
                      </div>
                    </div>
                    
                    {/* ホバー時に説明を表示 */}
                    <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {itemDescriptions[label as keyof typeof itemDescriptions]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 総合評価 */}
          <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl p-6 shadow-lg">
            <h4 className="font-bold text-gray-900 mb-3">総合評価</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">合計スコア</span>
                <span className="text-xl font-bold text-purple-700">
                  {analysis.totalScore} / {maxScore * 5}
                </span>
              </div>
              
              <div className="border-t border-purple-200 pt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">強み</span>
                  <span className="text-sm font-bold text-green-700">
                    {analysis.maxCategory}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">成長ポイント</span>
                  <span className="text-sm font-bold text-orange-700">
                    {analysis.minCategory}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-purple-200">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {analysis.averageScore >= 40 ? 'S' :
                     analysis.averageScore >= 35 ? 'A' :
                     analysis.averageScore >= 30 ? 'B' :
                     analysis.averageScore >= 25 ? 'C' : 'D'}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">ランク</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

SportsmanshipChart.displayName = 'SportsmanshipChart';

export default SportsmanshipChart;