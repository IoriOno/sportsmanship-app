import React from 'react';
import { useParams } from 'react-router-dom';

// Placeholder component - will be expanded with actual result visualization
const TestResultPage = () => {
  const { resultId } = useParams();

  // Sample data - in production this would come from the backend
  const result = {
    test_date: '2024-01-15',
    self_esteem_total: 135,
    athlete_type: 'ストライカー',
    athlete_type_description: '結果を重視し、目標達成に向けて積極的に行動するタイプです。',
    strengths: ['結果志向', '主張力', '比較力', '献身性', '内省力'],
    weaknesses: ['繊細さ', '自然体', '非合理性', '協調性', '堅実性']
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          テスト結果
        </h1>
        <p className="text-gray-600">
          実施日: {new Date(result.test_date).toLocaleDateString('ja-JP')}
        </p>
      </div>

      <div className="space-y-8">
        {/* スポーツマンシップ結果 */}
        <div className="card p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            スポーツマンシップ結果
          </h2>
          
          {/* 自己肯定感 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              自己肯定感: {result.self_esteem_total}/200
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-primary-600 h-4 rounded-full"
                style={{ width: `${(result.self_esteem_total / 200) * 100}%` }}
              ></div>
            </div>
            <p className="mt-3 text-gray-600">
              あなたの自己肯定感は良好な状態です。自分自身を受け入れ、価値ある存在として認識できています。
            </p>
          </div>

          {/* 改善提案 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">改善提案</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>定期的に自己振り返りの時間を設けることをお勧めします</li>
              <li>小さな成功体験を積み重ねていきましょう</li>
              <li>チームメンバーとのコミュニケーションを大切にしましょう</li>
            </ul>
          </div>
        </div>

        {/* アスリートタイプ */}
        <div className="card p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            アスリートタイプ診断
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                あなたのタイプ: {result.athlete_type}
              </h3>
              <p className="text-gray-600 mb-4">
                {result.athlete_type_description}
              </p>
              
              {/* タイプ別円グラフ（プレースホルダー） */}
              <div className="w-48 h-48 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                <span className="text-gray-500">円グラフ</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">資質分析</h4>
              
              <div className="mb-4">
                <h5 className="text-sm font-medium text-green-600 mb-2">強み</h5>
                <div className="flex flex-wrap gap-2">
                  {result.strengths.map((strength, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-orange-600 mb-2">成長ポイント</h5>
                <div className="flex flex-wrap gap-2">
                  {result.weaknesses.map((weakness, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                    >
                      {weakness}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* アスリートマインド詳細 */}
        <div className="card p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            アスリートマインド詳細
          </h2>
          
          {/* 棒グラフ（プレースホルダー） */}
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">10資質の棒グラフ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResultPage;