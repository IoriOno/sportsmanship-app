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

interface Participant {
  id: string;
  name: string;
  qualities: {
    // 自己肯定感
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
  };
}

interface QualitiesComparisonChartProps {
  participants: Participant[];
  maxScore?: number;
  showLegend?: boolean;
}

const QualitiesComparisonChart: React.FC<QualitiesComparisonChartProps> = ({
  participants,
  maxScore = 50,
  showLegend = true
}) => {
  // 項目のラベルとカテゴリー
  const qualityConfig = useMemo(() => [
    // 自己肯定感（青系）
    { key: 'self_determination', label: '自己決定感', category: 'self-esteem', color: '#3B82F6' },
    { key: 'self_acceptance', label: '自己受容感', category: 'self-esteem', color: '#3B82F6' },
    { key: 'self_worth', label: '自己有用感', category: 'self-esteem', color: '#3B82F6' },
    { key: 'self_efficacy', label: '自己効力感', category: 'self-esteem', color: '#3B82F6' },
    // アスリートマインド（緑系）
    { key: 'introspection', label: '内省', category: 'athlete-mind', color: '#10B981' },
    { key: 'self_control', label: '克己', category: 'athlete-mind', color: '#10B981' },
    { key: 'devotion', label: '献身', category: 'athlete-mind', color: '#10B981' },
    { key: 'intuition', label: '直感', category: 'athlete-mind', color: '#10B981' },
    { key: 'sensitivity', label: '繊細', category: 'athlete-mind', color: '#10B981' },
    { key: 'steadiness', label: '堅実', category: 'athlete-mind', color: '#10B981' },
    { key: 'comparison', label: '比較', category: 'athlete-mind', color: '#10B981' },
    { key: 'result', label: '結果', category: 'athlete-mind', color: '#10B981' },
    { key: 'assertion', label: '主張', category: 'athlete-mind', color: '#10B981' },
    { key: 'commitment', label: 'こだわり', category: 'athlete-mind', color: '#10B981' },
    // スポーツマンシップ（紫系）
    { key: 'courage', label: '勇気', category: 'sportsmanship', color: '#9333EA' },
    { key: 'resilience', label: '打たれ強さ', category: 'sportsmanship', color: '#9333EA' },
    { key: 'cooperation', label: '協調性', category: 'sportsmanship', color: '#9333EA' },
    { key: 'natural_acceptance', label: '自然体', category: 'sportsmanship', color: '#9333EA' },
    { key: 'non_rationality', label: '非合理性', category: 'sportsmanship', color: '#9333EA' }
  ], []);

  const labels = useMemo(() => qualityConfig.map(q => q.label), [qualityConfig]);

  // データセットの生成
  const datasets = useMemo(() => {
    const colors = [
      { bg: 'rgba(147, 51, 234, 0.15)', border: 'rgba(147, 51, 234, 0.8)' }, // 紫
      { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.8)' }, // 青
      { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.8)' }, // 緑
      { bg: 'rgba(251, 146, 60, 0.15)', border: 'rgba(251, 146, 60, 0.8)' }   // オレンジ
    ];

    return participants.map((participant, index) => {
      const colorSet = colors[index % colors.length];
      const data = qualityConfig.map(q => participant.qualities[q.key as keyof typeof participant.qualities]);

      return {
        label: participant.name,
        data,
        backgroundColor: colorSet.bg,
        borderColor: colorSet.border,
        borderWidth: 2,
        pointBackgroundColor: colorSet.border,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: index === 0 ? 5 : 4, // 最初の参加者（通常は自分）を少し大きく
        pointHoverRadius: 7,
        fill: true
      };
    });
  }, [participants, qualityConfig]);

  // チャートオプション
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
        labels: {
          font: {
            size: 14,
            family: 'Inter, system-ui, sans-serif',
            weight: '600'
          },
          padding: 20,
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
        borderWidth: 1,
        cornerRadius: 8,
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
            const qualityInfo = qualityConfig[context.dataIndex];
            const categoryLabel = {
              'self-esteem': '自己肯定感',
              'athlete-mind': 'アスリートマインド',
              'sportsmanship': 'スポーツマンシップ'
            }[qualityInfo.category];
            return `${context.dataset.label}: ${context.parsed.r}点 (${percentage}%) [${categoryLabel}]`;
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
          stepSize: 10,
          font: {
            size: 11,
            weight: '500'
          },
          color: '#6B7280',
          backdropColor: 'rgba(255, 255, 255, 0.8)',
          backdropPadding: 4
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
          lineWidth: 1.5,
          circular: true
        },
        angleLines: {
          color: 'rgba(156, 163, 175, 0.2)',
          lineWidth: 1.5
        },
        pointLabels: {
          font: {
            size: 12,
            weight: '600',
            family: 'Inter, system-ui, sans-serif'
          },
          padding: 10,
          centerPointLabels: false,
          display: true,
          callback: function(value: string, index: number) {
            const qualityInfo = qualityConfig[index];
            // カテゴリーごとに色を変える
            if (qualityInfo.category === 'self-esteem') {
              return value; // 青系の項目
            } else if (qualityInfo.category === 'athlete-mind') {
              return value; // 緑系の項目
            } else {
              return value; // 紫系の項目
            }
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.1
      }
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart' as const
    }
  }) as any, [maxScore, showLegend, qualityConfig]);

  // チャートデータ
  const data = useMemo(() => ({
    labels,
    datasets
  }), [labels, datasets]);

  // カテゴリー別の凡例
  const categoryLegends = [
    { label: '自己肯定感', color: '#3B82F6', items: 4 },
    { label: 'アスリートマインド', color: '#10B981', items: 10 },
    { label: 'スポーツマンシップ', color: '#9333EA', items: 5 }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          資質重ね合わせチャート
        </h3>
        <p className="text-gray-600">
          19項目の資質を総合的に比較表示します
        </p>
        
        {/* カテゴリー凡例 */}
        <div className="flex flex-wrap gap-4 mt-4">
          {categoryLegends.map((category) => (
            <div key={category.label} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm font-medium text-gray-700">
                {category.label} ({category.items}項目)
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative h-[600px]">
        <Radar data={data} options={options} />
      </div>

      {/* 参加者ごとの平均スコア */}
      {participants.length > 1 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">カテゴリー別平均スコア</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categoryLegends.map((category) => (
              <div key={category.label} className="bg-gray-50 rounded-lg p-4">
                <h5 
                  className="font-medium mb-3"
                  style={{ color: category.color }}
                >
                  {category.label}
                </h5>
                <div className="space-y-2">
                  {participants.map((participant, index) => {
                    const categoryKeys = qualityConfig
                      .filter(q => {
                        if (category.label === '自己肯定感') return q.category === 'self-esteem';
                        if (category.label === 'アスリートマインド') return q.category === 'athlete-mind';
                        return q.category === 'sportsmanship';
                      })
                      .map(q => q.key);
                    
                    const average = categoryKeys.reduce((sum, key) => 
                      sum + participant.qualities[key as keyof typeof participant.qualities], 0
                    ) / categoryKeys.length;

                    return (
                      <div key={participant.id} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">{participant.name}</span>
                        <span className="text-sm font-bold text-gray-900">
                          {Math.round(average)}点
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QualitiesComparisonChart;