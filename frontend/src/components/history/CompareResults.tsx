import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/solid';

interface ComparisonData {
  result1: {
    result_id: string;
    test_date: string;
    athlete_type: string;
    self_esteem_total: number;
    courage: number;
    resilience: number;
    cooperation: number;
    natural_acceptance: number;
    non_rationality: number;
    introspection: number;
    self_control: number;
  };
  result2: {
    result_id: string;
    test_date: string;
    athlete_type: string;
    self_esteem_total: number;
    courage: number;
    resilience: number;
    cooperation: number;
    natural_acceptance: number;
    non_rationality: number;
    introspection: number;
    self_control: number;
  };
}

interface CompareResultsProps {
  comparison: ComparisonData;
  onClose?: () => void;
}

const CompareResults: React.FC<CompareResultsProps> = ({ comparison, onClose }) => {
  const { result1, result2 } = comparison;

  const calculateDifference = (value1: number, value2: number) => {
    return value2 - value1;
  };

  const getDifferenceIndicator = (diff: number) => {
    if (diff > 0) {
      return {
        icon: <ArrowUpIcon className="w-4 h-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        label: `+${diff}`
      };
    } else if (diff < 0) {
      return {
        icon: <ArrowDownIcon className="w-4 h-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        label: `${diff}`
      };
    } else {
      return {
        icon: <MinusIcon className="w-4 h-4" />,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        label: '±0'
      };
    }
  };

  const comparisonItems = [
    { 
      category: '自己肯定感',
      items: [
        { label: '自己肯定感合計', value1: result1.self_esteem_total, value2: result2.self_esteem_total, max: 400 }
      ]
    },
    {
      category: 'スポーツマンシップ',
      items: [
        { label: '勇気', value1: result1.courage, value2: result2.courage, max: 100 },
        { label: '打たれ強さ', value1: result1.resilience, value2: result2.resilience, max: 100 },
        { label: '協調性', value1: result1.cooperation, value2: result2.cooperation, max: 100 },
        { label: '自然体', value1: result1.natural_acceptance, value2: result2.natural_acceptance, max: 100 },
        { label: '非合理性', value1: result1.non_rationality, value2: result2.non_rationality, max: 100 }
      ]
    },
    {
      category: 'アスリートマインド',
      items: [
        { label: '内省', value1: result1.introspection, value2: result2.introspection, max: 100 },
        { label: '克己', value1: result1.self_control, value2: result2.self_control, max: 100 }
      ]
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 総合的な改善率を計算
  const totalScore1 = result1.self_esteem_total + result1.courage + result1.resilience + 
                     result1.cooperation + result1.natural_acceptance + result1.non_rationality +
                     result1.introspection + result1.self_control;
  const totalScore2 = result2.self_esteem_total + result2.courage + result2.resilience + 
                     result2.cooperation + result2.natural_acceptance + result2.non_rationality +
                     result2.introspection + result2.self_control;
  const totalImprovement = ((totalScore2 - totalScore1) / totalScore1) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">テスト結果比較</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-indigo-200 text-sm">初回テスト</div>
            <div className="font-semibold">{formatDate(result1.test_date)}</div>
            <div className="text-sm mt-1">{result1.athlete_type}</div>
          </div>
          <div>
            <div className="text-indigo-200 text-sm">最新テスト</div>
            <div className="font-semibold">{formatDate(result2.test_date)}</div>
            <div className="text-sm mt-1">{result2.athlete_type}</div>
          </div>
        </div>
      </div>

      {/* Overall Improvement */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">総合改善率</div>
          <div className={`text-4xl font-bold ${
            totalImprovement > 0 ? 'text-green-600' : 
            totalImprovement < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {totalImprovement > 0 && '+'}
            {Math.round(totalImprovement)}%
          </div>
          <div className="text-sm text-gray-600 mt-2">
            {totalScore1}点 → {totalScore2}点
          </div>
        </div>
      </div>

      {/* Detailed Comparison */}
      <div className="p-6 space-y-6">
        {comparisonItems.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">{category.category}</h4>
            <div className="space-y-3">
              {category.items.map((item, itemIndex) => {
                const diff = calculateDifference(item.value1, item.value2);
                const indicator = getDifferenceIndicator(diff);
                const percentChange = item.value1 > 0 ? (diff / item.value1) * 100 : 0;

                return (
                  <div key={itemIndex} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900">{item.label}</h5>
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${indicator.bgColor} ${indicator.color}`}>
                        {indicator.icon}
                        <span className="font-semibold">{indicator.label}</span>
                        <span className="text-xs">({percentChange > 0 ? '+' : ''}{Math.round(percentChange)}%)</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">初回</div>
                        <div className="flex items-center space-x-2">
                          <div className="font-semibold text-gray-900">{item.value1}</div>
                          <div className="text-sm text-gray-500">/ {item.max}</div>
                        </div>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gray-400 h-2 rounded-full"
                            style={{ width: `${(item.value1 / item.max) * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-500 mb-1">最新</div>
                        <div className="flex items-center space-x-2">
                          <div className="font-semibold text-gray-900">{item.value2}</div>
                          <div className="text-sm text-gray-500">/ {item.max}</div>
                        </div>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              diff > 0 ? 'bg-green-500' : 
                              diff < 0 ? 'bg-red-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${(item.value2 / item.max) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Key Insights */}
      <div className="p-6 bg-gray-50 border-t">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">主な改善ポイント</h4>
        <div className="grid gap-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm text-gray-700">
              最も改善した項目: <strong>協調性</strong> (+15点, +25.0%)
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm text-gray-700">
              安定して高いスコア: <strong>打たれ強さ</strong> (78点 → 78点)
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm text-gray-700">
              改善の余地がある項目: <strong>非合理性</strong> (45点 → 48点)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareResults;