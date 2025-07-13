// frontend/src/components/result/InsightPanel.tsx
import React, { useState } from 'react';

interface InsightPanelProps {
  athleteType: string;
  athleteTypeDescription: string;
  athleteTypePercentages: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  selfEsteemAnalysis: string;
  selfEsteemImprovements: string[];
  sportsmanshipBalance: string;
  overallScore?: number;  // オプショナルに変更
  maxScore?: number;      // オプショナルに変更
}

const InsightPanel: React.FC<InsightPanelProps> = ({
  athleteType,
  athleteTypeDescription,
  athleteTypePercentages,
  strengths,
  weaknesses,
  selfEsteemAnalysis,
  selfEsteemImprovements,
  sportsmanshipBalance,
  overallScore,
  maxScore
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'strengths' | 'improvements' | 'analysis'>('overview');

  const percentage = (overallScore && maxScore) ? (overallScore / maxScore) * 100 : 0;

  const getMotivationalMessage = () => {
    if (!overallScore || !maxScore) {
      return {
        title: "詳細な分析結果",
        message: "あなたの特性と成長ポイントを確認しましょう。",
        color: "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
      };
    }

    if (percentage >= 80) {
      return {
        title: "素晴らしい結果です！",
        message: "あなたは非常に高いメンタルヘルス状態を維持しています。この調子で継続していきましょう。",
        color: "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
      };
    } else if (percentage >= 60) {
      return {
        title: "順調に成長しています",
        message: "良好な状態です。さらなる向上を目指して、成長ポイントに取り組んでみましょう。",
        color: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
      };
    } else {
      return {
        title: "成長の可能性に満ちています",
        message: "改善のチャンスが多くあります。一歩ずつ取り組んでいけば、必ず向上できます。",
        color: "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
      };
    }
  };

  const motivationalContent = getMotivationalMessage();

  const tabs = [
    { id: 'overview', label: '総合分析' },
    { id: 'strengths', label: 'あなたの特徴' },
    { id: 'improvements', label: 'あなたの傾向' },
    { id: 'analysis', label: 'AI分析' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="text-2xl font-bold">パーソナル分析</h3>
            <p className="text-indigo-100">あなたの特性と成長ポイントを詳しく分析</p>
          </div>
        </div>
      </div>

      {/* Motivational Banner */}
      <div className={`border-l-4 border-r-4 border-t-0 border-b-0 p-4 ${motivationalContent.color}`}>
        <div className="flex items-center space-x-3">
          <div>
            <h4 className="font-semibold text-gray-900">{motivationalContent.title}</h4>
            <p className="text-sm text-gray-700">{motivationalContent.message}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Athlete Type */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                アスリートタイプ: {athleteType}
              </h4>
              <p className="text-gray-700 mb-4">{athleteTypeDescription}</p>
              
              {/* Type Percentages */}
              {Object.keys(athleteTypePercentages).length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(athleteTypePercentages).map(([type, percent]) => (
                    <div key={type} className="bg-white rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{type}</span>
                        <span className="text-sm font-bold text-blue-600">{Math.round(percent)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Balance Analysis */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                スポーツマンシップバランス
              </h4>
              <p className="text-gray-700">{sportsmanshipBalance}</p>
            </div>

            {/* Self-Esteem Analysis */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                自己肯定感分析
              </h4>
              <p className="text-gray-700">{selfEsteemAnalysis}</p>
            </div>
          </div>
        )}

        {activeTab === 'strengths' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h4 className="text-xl font-bold text-gray-900">あなたの特徴</h4>
              <p className="text-gray-600">これらの特性を活かして更なる成長を</p>
            </div>
            
            <div className="grid gap-4">
              {strengths.map((strength, index) => (
                <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900">{strength}</h5>
                      <p className="text-sm text-gray-600">この特性を継続して伸ばしていきましょう</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'improvements' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h4 className="text-xl font-bold text-gray-900">あなたの傾向</h4>
              <p className="text-gray-600">これらの分野で更なる向上が期待できます</p>
            </div>

            <div className="grid gap-4">
              {weaknesses.map((weakness, index) => (
                <div key={index} className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900">{weakness}</h5>
                      <p className="text-sm text-gray-600">重点的に取り組むことで大きな成長が期待できます</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Improvement Suggestions */}
            {selfEsteemImprovements.length > 0 && (
              <div className="mt-8">
                <h5 className="font-semibold text-gray-900 mb-4">具体的な改善提案</h5>
                <div className="space-y-3">
                  {selfEsteemImprovements.map((improvement, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white font-bold text-xs">{index + 1}</span>
                        </div>
                        <p className="text-gray-700">{improvement}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h4 className="text-xl font-bold text-gray-900">AI詳細分析</h4>
              <p className="text-gray-600">データに基づいた詳細な分析結果</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
              <h5 className="font-semibold text-gray-900 mb-3">総合評価</h5>
              {overallScore && maxScore && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">メンタルヘルススコア</span>
                    <span className="font-bold text-indigo-600">{Math.round(percentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-indigo-400 to-purple-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="text-sm text-gray-700 space-y-2">
                <p>• <strong>アスリートタイプ:</strong> {athleteType}の特徴が強く現れています</p>
                <p>• <strong>バランス:</strong> {sportsmanshipBalance}</p>
                <p>• <strong>成長パターン:</strong> 段階的な改善により大きな向上が期待できます</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
              <h5 className="font-semibold text-gray-900 mb-3">推奨アクション</h5>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">強みである「{strengths[0] || '特性'}」を活かした活動を継続する</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">成長ポイントの「{weaknesses[0] || '分野'}」に重点的に取り組む</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">定期的な自己評価で進捗を確認する</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightPanel;