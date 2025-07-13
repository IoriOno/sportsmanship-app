import React, { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Radar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement
);

interface SelfEsteemScores {
  self_acceptance: number;    // 自己受容感
  self_worth: number;         // 自己有用感
  self_determination: number; // 自己決定感
  self_efficacy: number;      // 自己効力感
}

interface SelfEsteemChartProps {
  scores: SelfEsteemScores;
  maxScore?: number;
  showAnalysis?: boolean;
}

const SelfEsteemChart: React.FC<SelfEsteemChartProps> = ({
  scores,
  maxScore = 50,
  showAnalysis = true
}) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'overview' | 'details'>('radar');

  // 総合スコア計算
  const totalScore = useMemo(() => 
    scores.self_acceptance + scores.self_worth + scores.self_determination + scores.self_efficacy, 
    [scores]
  );
  const maxTotalScore = maxScore * 4;
  const totalPercentage = (totalScore / maxTotalScore) * 100;

  // レーダーチャート用データ
  const radarData = useMemo(() => ({
    labels: ['自己受容感', '自己有用感', '自己決定感', '自己効力感'],
    datasets: [
      {
        label: '自己肯定感・効力感',
        data: [
          scores.self_acceptance,
          scores.self_worth,
          scores.self_determination,
          scores.self_efficacy
        ],
        backgroundColor: 'rgba(147, 51, 234, 0.15)',
        borderColor: 'rgba(147, 51, 234, 0.8)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(147, 51, 234, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
      }
    ]
  }), [scores]);

  // 円グラフ用データ（総合スコア）
  const doughnutData = useMemo(() => ({
    labels: ['達成', '未達成'],
    datasets: [
      {
        data: [totalScore, maxTotalScore - totalScore],
        backgroundColor: [
          'rgba(147, 51, 234, 0.8)',
          'rgba(156, 163, 175, 0.2)'
        ],
        borderColor: [
          'rgba(147, 51, 234, 1)',
          'rgba(156, 163, 175, 0.3)'
        ],
        borderWidth: 2,
        cutout: '70%',
      }
    ]
  }), [totalScore, maxTotalScore]);

  // レーダーチャートオプション
  const radarOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
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
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context: any) {
            const percentage = Math.round((context.parsed.r / maxScore) * 100);
            return `${context.label}: ${context.parsed.r}点 (${percentage}%)`;
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
          size: 12,
            weight: 500
        },
          color: '#6B7280',
          backdropColor: 'rgba(255, 255, 255, 0.8)',
          backdropPadding: 4,
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
          size: 14,
            weight: 600,
          family: 'Inter, system-ui, sans-serif'
        },
          color: '#1F2937',
          padding: 20,
          centerPointLabels: false,
          display: true,
          callback: function(value: string, index: number) {
            const scoreValues = [
              scores.self_acceptance,
              scores.self_worth,
              scores.self_determination,
              scores.self_efficacy
            ];
            return `${value}\n${scoreValues[index]}点`;
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.3
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart' as const
    }
  }), [scores, maxScore]);

  // 円グラフオプション
  const doughnutOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    },
    cutout: '70%',
    animation: {
      animateRotate: true,
      duration: 2000,
      easing: 'easeInOutQuart' as const
    }
  }), []);

  // 各要素の説明
  const elementDescriptions = {
    self_acceptance: {
      title: '自己受容感',
      description: 'ありのままの自分を受け入れる力',
      icon: '🤝',
      color: 'from-blue-500 to-blue-600'
    },
    self_worth: {
      title: '自己有用感',
      description: '自分に価値があると感じる力',
      icon: '⭐',
      color: 'from-indigo-500 to-indigo-600'
    },
    self_determination: {
      title: '自己決定感',
      description: '自分で決断し行動する力',
      icon: '🎯',
      color: 'from-purple-500 to-purple-600'
    },
    self_efficacy: {
      title: '自己効力感',
      description: '目標達成への自信と実行力',
      icon: '🚀',
      color: 'from-pink-500 to-pink-600'
    }
  };

  // スコアレベル判定
  const getScoreLevel = (score: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return { label: '非常に優秀', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (percentage >= 80) return { label: '優秀', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 70) return { label: '良好', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (percentage >= 60) return { label: '標準', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (percentage >= 40) return { label: '要改善', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { label: '要強化', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const totalLevel = getScoreLevel(totalScore / 4);

  return (
    <div className="space-y-6">
      {/* タブナビゲーション */}
      <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
        {[
          { id: 'radar', label: 'バランス分析', icon: '📊' },
          { id: 'overview', label: '総合評価', icon: '🎯' },
          { id: 'details', label: '詳細分析', icon: '📈' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* レーダーチャートタブ */}
      {activeTab === 'radar' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">4要素バランス分析</h4>
            <div className="relative h-80">
              <Radar data={radarData} options={radarOptions} />
            </div>
          </div>

          {/* 要素説明カード */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(elementDescriptions).map(([key, desc]) => {
              const score = scores[key as keyof SelfEsteemScores];
              const level = getScoreLevel(score);
              const percentage = (score / maxScore) * 100;
              
              return (
                <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <div className="text-2xl mb-2">{desc.icon}</div>
                    <h5 className="font-semibold text-gray-900 mb-1">{desc.title}</h5>
                    <div className="text-2xl font-bold text-purple-600 mb-2">{score}</div>
                    <div className="text-xs text-gray-500 mb-3">{desc.description}</div>
                    
                    {/* プログレスバー */}
                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${desc.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <div className="mt-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${level.bg} ${level.color}`}>
                        {level.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 総合評価タブ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 円グラフ */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">総合達成度</h4>
              <div className="relative h-64 flex items-center justify-center">
                <Doughnut data={doughnutData} options={doughnutOptions} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-700">{totalScore}</div>
                    <div className="text-sm text-gray-500">/ {maxTotalScore}</div>
                    <div className="text-lg font-semibold text-purple-600 mt-1">
                      {Math.round(totalPercentage)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 総合評価 */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">総合評価</h4>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-700 mb-2">
                    {Math.round(totalPercentage)}%
                  </div>
                  <div className={`text-sm font-medium px-3 py-1 rounded-full inline-block ${totalLevel.bg} ${totalLevel.color}`}>
                    {totalLevel.label}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">自己受容感</span>
                    <span className="font-semibold text-blue-600">{scores.self_acceptance}点</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">自己有用感</span>
                    <span className="font-semibold text-indigo-600">{scores.self_worth}点</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">自己決定感</span>
                    <span className="font-semibold text-purple-600">{scores.self_determination}点</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">自己効力感</span>
                    <span className="font-semibold text-pink-600">{scores.self_efficacy}点</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 詳細分析タブ */}
      {activeTab === 'details' && (
        <div className="space-y-6">
          {Object.entries(elementDescriptions).map(([key, desc]) => {
            const score = scores[key as keyof SelfEsteemScores];
            const level = getScoreLevel(score);
            const percentage = (score / maxScore) * 100;
            
            return (
              <div key={key} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-3xl">{desc.icon}</div>
                  <div className="flex-1">
                    <h5 className="text-lg font-bold text-gray-900">{desc.title}</h5>
                    <p className="text-sm text-gray-600">{desc.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{score}点</div>
                    <div className="text-sm text-gray-500">/ {maxScore}点</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">達成度</span>
                    <span className="text-sm font-semibold text-purple-600">{Math.round(percentage)}%</span>
                  </div>
                  
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full bg-gradient-to-r ${desc.color} transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">評価</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${level.bg} ${level.color}`}>
                      {level.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SelfEsteemChart; 