// file: frontend/src/components/result/AthleteMindsSection.tsx
import React, { useMemo } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface AthleteMindsScores {
  commitment: number;      // こだわり
  result: number;         // 結果
  steadiness: number;     // 堅実
  devotion: number;       // 献身
  self_control: number;   // 克己
  assertion: number;      // 主張
  sensitivity: number;    // 繊細
  intuition: number;      // 直感
  introspection: number;  // 内省
  comparison: number;     // 比較
}

interface AthletesMindsSectionProps {
  scores: AthleteMindsScores;
}

const AthleteMindsSection: React.FC<AthletesMindsSectionProps> = ({ scores }) => {
  // スコアを配列に変換し、点数順にソート
  const sortedScores = useMemo(() => {
    const scoreArray = [
      { name: 'こだわり', key: 'commitment', score: scores.commitment },
      { name: '結果', key: 'result', score: scores.result },
      { name: '堅実', key: 'steadiness', score: scores.steadiness },
      { name: '献身', key: 'devotion', score: scores.devotion },
      { name: '克己', key: 'self_control', score: scores.self_control },
      { name: '主張', key: 'assertion', score: scores.assertion },
      { name: '繊細', key: 'sensitivity', score: scores.sensitivity },
      { name: '直感', key: 'intuition', score: scores.intuition },
      { name: '内省', key: 'introspection', score: scores.introspection },
      { name: '比較', key: 'comparison', score: scores.comparison },
    ];
    return scoreArray.sort((a, b) => b.score - a.score);
  }, [scores]);

  // レーダーチャート用データ
  const radarData = useMemo(() => ({
    labels: sortedScores.map(item => item.name),
    datasets: [
      {
        label: 'アスリートマインド',
        data: sortedScores.map(item => item.score),
        backgroundColor: 'rgba(79, 70, 229, 0.15)',
        borderColor: 'rgba(79, 70, 229, 0.8)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(79, 70, 229, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }
    ]
  }), [sortedScores]);

  // レーダーチャートオプション
  const radarOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(79, 70, 229, 0.8)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${context.parsed.r}点`;
          }
        }
      }
    },
    scales: {
      r: {
        min: 0,
        max: 50,
        beginAtZero: true,
        ticks: {
          stepSize: 10,
          font: {
            size: 11
          },
          color: '#6B7280',
          backdropColor: 'transparent'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
          lineWidth: 1
        },
        angleLines: {
          color: 'rgba(156, 163, 175, 0.2)',
          lineWidth: 1
        },
        pointLabels: {
          font: {
            size: 12,
            weight: '600' as const,
            family: 'Inter, system-ui, sans-serif'
          },
          color: '#374151',
          padding: 15
        }
      }
    }
  }) as any, []);

  // 色の取得関数 - クラシックで落ち着いた虹色
  const getBarColor = (score: number, index: number) => {
    const rainbowColors = [
      'from-red-600 to-red-700',      // 深い赤
      'from-orange-500 to-orange-600', // オレンジ
      'from-amber-500 to-amber-600',   // 琥珀
      'from-yellow-500 to-yellow-600', // 黄色
      'from-lime-500 to-lime-600',     // ライム
      'from-green-500 to-green-600',   // 緑
      'from-teal-500 to-teal-600',     // ティール
      'from-blue-500 to-blue-600',     // 青
      'from-indigo-500 to-indigo-600', // インディゴ
      'from-purple-500 to-purple-600'  // 紫
    ];
    return rainbowColors[index % rainbowColors.length];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 棒グラフセクション */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">項目別スコア（上位順）</h4>
        
        <div className="space-y-3">
          {sortedScores.map((item, index) => {
            const percentage = item.score;
            const isTop3 = index < 3;
            
            return (
              <div key={item.key} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {isTop3 && (
                      <span className="text-lg mr-2">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    )}
                    <span className={`font-medium ${isTop3 ? 'text-gray-800' : 'text-gray-700'}`}>
                      {item.name}
                    </span>
                  </div>
                  <span className={`font-bold ${isTop3 ? 'text-lg' : 'text-base'} text-gray-800`}>
                    {item.score}点
                  </span>
                </div>
                
                <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-gray-200 opacity-30" />
                  <div
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getBarColor(item.score, index)} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white opacity-20" />
                  </div>
                  
                  {/* 満点マーカー */}
                  <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-gray-400 opacity-50" />
                  
                  {/* パーセンテージ表示 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 統計情報 */}
        <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">平均スコア</p>
              <p className="text-2xl font-bold text-indigo-700">
                {(sortedScores.reduce((sum, item) => sum + item.score, 0) / sortedScores.length).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">最高得点項目</p>
              <p className="text-lg font-bold text-green-700">
                {sortedScores[0].name} ({sortedScores[0].score}点)
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* レーダーチャートセクション */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">バランスチャート</h4>
        
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
          <div className="relative h-80">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>
        
        {/* 分析コメント */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4">
          <h5 className="font-semibold text-gray-800 mb-2">バランス分析</h5>
          <p className="text-sm text-gray-700">
            あなたのアスリートマインドは
            <span className="font-bold text-indigo-700">{sortedScores[0].name}</span>、
            <span className="font-bold text-indigo-700">{sortedScores[1].name}</span>、
            <span className="font-bold text-indigo-700">{sortedScores[2].name}</span>
            が特に優れています。
            {sortedScores[sortedScores.length - 1].score < 60 && (
              <>
                一方で、
                <span className="font-bold text-orange-700">{sortedScores[sortedScores.length - 1].name}</span>
                にはまだ成長の余地があります。
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AthleteMindsSection);