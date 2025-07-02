import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

const TestHistoryPage = () => {
  // Sample data - in production this would come from the backend
  const testHistory = [
    {
      result_id: '1',
      test_date: '2024-01-15',
      self_esteem_total: 135,
      athlete_type: 'ストライカー'
    },
    {
      result_id: '2',
      test_date: '2024-01-01',
      self_esteem_total: 128,
      athlete_type: 'アタッカー'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          テスト履歴
        </h1>
        <p className="text-gray-600">
          過去に実施したテストの結果を確認できます。
        </p>
      </div>

      {testHistory.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500 mb-4">
            まだテストを実施していません。
          </p>
          <Link
            to="/test"
            className="btn-primary"
          >
            テストを開始する
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {testHistory.map((result) => (
            <Link
              key={result.result_id}
              to={`/test/result/${result.result_id}`}
              className="card p-6 hover:shadow-lg transition-shadow duration-200 block"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {new Date(result.test_date).toLocaleDateString('ja-JP')}のテスト結果
                    </h3>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">自己肯定感</div>
                      <div className="font-medium text-primary-600">
                        {result.self_esteem_total}/200
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">アスリートタイプ</div>
                      <div className="font-medium text-green-600">
                        {result.athlete_type}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 新しいテストボタン */}
      <div className="mt-8 text-center">
        <Link
          to="/test"
          className="btn-primary"
        >
          新しいテストを開始
        </Link>
      </div>
    </div>
  );
};

export default TestHistoryPage;