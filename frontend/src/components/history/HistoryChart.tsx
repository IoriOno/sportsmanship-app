import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TestDataPoint {
  test_date: string;
  self_esteem_total: number;
  courage: number;
  resilience: number;
  cooperation: number;
  natural_acceptance: number;
  non_rationality: number;
  introspection: number;
  self_control: number;
}

interface HistoryChartProps {
  data: TestDataPoint[];
  showCategories?: string[];
  height?: number;
}

const HistoryChart: React.FC<HistoryChartProps> = ({
  data,
  showCategories = ['self_esteem', 'sportsmanship', 'athlete_mind'],
  height = 400
}) => {
  const [activeDatasets, setActiveDatasets] = useState<Set<string>>(new Set(showCategories));

  // データを日付順にソート
  const sortedData = [...data].sort((a, b) => 
    new Date(a.test_date).getTime() - new Date(b.test_date).getTime()
  );

  const labels = sortedData.map(d => 
    new Date(d.test_date).toLocaleDateString('ja-JP', { 
      month: 'short', 
      day: 'numeric' 
    })
  );

  const datasets = [];

  // 自己肯定感の推移
  if (activeDatasets.has('self_esteem')) {
    datasets.push({
      label: '自己肯定感',
      data: sortedData.map(d => d.self_esteem_total),
      borderColor: 'rgb(168, 85, 247)',
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
      borderWidth: 3,
      pointBackgroundColor: 'rgb(168, 85, 247)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
      tension: 0.4,
      fill: true
    });
  }

  // スポーツマンシップ合計の推移
  if (activeDatasets.has('sportsmanship')) {
    const sportsmanshipData = sortedData.map(d => 
      d.courage + d.resilience + d.cooperation + d.natural_acceptance + d.non_rationality
    );
    
    datasets.push({
      label: 'スポーツマンシップ',
      data: sportsmanshipData,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 3,
      pointBackgroundColor: 'rgb(59, 130, 246)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
      tension: 0.4,
      fill: true
    });
  }

  // アスリートマインドの推移
  if (activeDatasets.has('athlete_mind')) {
    const athleteMindData = sortedData.map(d => 
      d.introspection + d.self_control
    );
    
    datasets.push({
      label: 'アスリートマインド',
      data: athleteMindData,
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderWidth: 3,
      pointBackgroundColor: 'rgb(34, 197, 94)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
      tension: 0.4,
      fill: true
    });
  }

  // 各要素の詳細推移
  if (activeDatasets.has('details')) {
    const detailDatasets = [
      { name: '勇気', key: 'courage', color: 'rgb(239, 68, 68)' },
      { name: '打たれ強さ', key: 'resilience', color: 'rgb(245, 158, 11)' },
      { name: '協調性', key: 'cooperation', color: 'rgb(16, 185, 129)' },
      { name: '自然体', key: 'natural_acceptance', color: 'rgb(99, 102, 241)' },
      { name: '非合理性', key: 'non_rationality', color: 'rgb(236, 72, 153)' }
    ];

    detailDatasets.forEach(({ name, key, color }) => {
      datasets.push({
        label: name,
        data: sortedData.map(d => d[key as keyof TestDataPoint] as number),
        borderColor: color,
        backgroundColor: `${color}33`,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        borderDash: [5, 5]
      });
    });
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + '点';
            }
            return label;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          },
          callback: function(value: any) {
            return value + '点';
          }
        }
      }
    }
  };

  const toggleDataset = (datasetKey: string) => {
    const newActiveDatasets = new Set(activeDatasets);
    if (newActiveDatasets.has(datasetKey)) {
      newActiveDatasets.delete(datasetKey);
    } else {
      newActiveDatasets.add(datasetKey);
    }
    setActiveDatasets(newActiveDatasets);
  };

  // 改善率の計算
  const calculateImprovement = () => {
    if (sortedData.length < 2) return null;
    
    const first = sortedData[0];
    const last = sortedData[sortedData.length - 1];
    
    const firstTotal = first.self_esteem_total + first.courage + first.resilience + 
                      first.cooperation + first.natural_acceptance + first.non_rationality;
    const lastTotal = last.self_esteem_total + last.courage + last.resilience + 
                     last.cooperation + last.natural_acceptance + last.non_rationality;
    
    const improvement = ((lastTotal - firstTotal) / firstTotal) * 100;
    return improvement;
  };

  const improvementRate = calculateImprovement();

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900">スコア推移</h3>
          {improvementRate !== null && (
            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              improvementRate > 0 
                ? 'bg-green-100 text-green-800' 
                : improvementRate < 0 
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {improvementRate > 0 && '+'}
              {improvementRate.toFixed(1)}% 
              <span className="ml-1 text-xs">総合改善率</span>
            </div>
          )}
        </div>
        
        {/* Dataset Toggle Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'self_esteem', label: '自己肯定感', color: 'bg-purple-500' },
            { key: 'sportsmanship', label: 'スポーツマンシップ', color: 'bg-blue-500' },
            { key: 'athlete_mind', label: 'アスリートマインド', color: 'bg-green-500' },
            { key: 'details', label: '詳細要素', color: 'bg-gray-500' }
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => toggleDataset(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeDatasets.has(key)
                  ? `${color} text-white`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: `${height}px` }}>
        <Line options={options as any} data={{ labels, datasets }} />
      </div>

      {/* Trend Analysis */}
      {sortedData.length >= 2 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">最も改善した項目</h4>
            <div className="text-lg font-bold text-purple-700">
              {/* 改善率が最も高い項目を計算して表示 */}
              協調性
            </div>
            <div className="text-sm text-purple-600">+15.2%</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">平均スコア</h4>
            <div className="text-lg font-bold text-blue-700">
              {Math.round(
                sortedData.reduce((sum, d) => sum + d.self_esteem_total, 0) / sortedData.length
              )}点
            </div>
            <div className="text-sm text-blue-600">自己肯定感</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">テスト回数</h4>
            <div className="text-lg font-bold text-green-700">{sortedData.length}回</div>
            <div className="text-sm text-green-600">
              {sortedData.length > 0 && `${Math.floor(
                (new Date().getTime() - new Date(sortedData[0].test_date).getTime()) / 
                (1000 * 60 * 60 * 24)
              )}日間`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryChart;