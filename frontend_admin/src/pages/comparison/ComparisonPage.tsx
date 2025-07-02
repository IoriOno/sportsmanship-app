import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/auth';
import Button from '../../components/common/Button';

const ComparisonPage = () => {
  const { user } = useAuthStore();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Check if user has permission to use comparison
  const hasPermission = user?.role === UserRole.COACH || 
                       user?.head_coach_function ||
                       (user?.role === UserRole.FATHER && user?.parent_function) ||
                       (user?.role === UserRole.MOTHER && user?.parent_function);

  // Sample users data - in production this would come from the backend
  const availableUsers = [
    { id: '1', name: '田中選手', role: 'player' },
    { id: '2', name: '佐藤選手', role: 'player' },
    { id: '3', name: '山田選手', role: 'player' }
  ];

  const handleUserSelect = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else if (selectedUsers.length < 4) {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleCreateComparison = () => {
    // TODO: Call API to create comparison
    console.log('Creating comparison for users:', selectedUsers);
    setShowResults(true);
  };

  if (!hasPermission) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            アクセス権限がありません
          </h1>
          <p className="text-gray-600">
            1on1比較機能はコーチ・ヘッドコーチ・親機能保護者のみご利用いただけます。
          </p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            1on1比較結果
          </h1>
          <Button
            variant="secondary"
            onClick={() => setShowResults(false)}
          >
            新しい比較を作成
          </Button>
        </div>

        <div className="space-y-8">
          {/* 比較チャート */}
          <div className="card p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              資質比較チャート
            </h2>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">資質重ね合わせチャート</span>
            </div>
          </div>

          {/* 相互理解分析 */}
          <div className="card p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              相互理解分析
            </h2>
            <p className="text-gray-600 mb-6">
              選択された参加者間の資質の違いを分析し、より良いコミュニケーションのための提案を行います。
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-green-600 mb-3">
                  効果的な対応例
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• 定期的な1on1ミーティングで相互理解を深める</li>
                  <li>• お互いの強みを認め合い、積極的に褒める</li>
                  <li>• 明確な目標設定とフィードバックを行う</li>
                  <li>• それぞれの特性を活かした役割分担をする</li>
                  <li>• 継続的なコミュニケーションを心がける</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-red-600 mb-3">
                  注意すべき対応例
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• 一方的な指示や批判を避ける</li>
                  <li>• 相手の弱みを否定的に指摘しない</li>
                  <li>• 価値観の違いを「間違い」として扱わない</li>
                  <li>• 感情的な反応を控える</li>
                  <li>• 過度な期待や圧力をかけない</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 差分詳細 */}
          <div className="card p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              資質差分詳細
            </h2>
            <div className="space-y-3">
              {['内省', '克己', '献身', '直感', '繊細'].map((quality, index) => (
                <div key={quality} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{quality}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">差分: {Math.floor(Math.random() * 20)}ポイント</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          1on1比較
        </h1>
        <p className="text-gray-600">
          選手との資質比較を行い、効果的なコミュニケーション方法を見つけましょう。
          （最大4人まで選択可能）
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          比較対象の選択
        </h2>

        {/* Current User */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">あなた</h3>
          <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0)}
              </div>
              <div className="ml-3">
                <div className="font-medium text-gray-900">{user?.name}</div>
                <div className="text-sm text-gray-500">
                  {user?.role === UserRole.COACH && 'コーチ'}
                  {user?.role === UserRole.FATHER && '父親'}
                  {user?.role === UserRole.MOTHER && '母親'}
                  {user?.head_coach_function && ' (ヘッドコーチ)'}
                  {user?.parent_function && ' (親機能)'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Available Users */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            選手を選択 ({selectedUsers.length}/4)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableUsers.map((availableUser) => (
              <div
                key={availableUser.id}
                onClick={() => handleUserSelect(availableUser.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedUsers.includes(availableUser.id)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${
                  selectedUsers.length >= 4 && !selectedUsers.includes(availableUser.id)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-medium">
                    {availableUser.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">{availableUser.name}</div>
                    <div className="text-sm text-gray-500">選手</div>
                  </div>
                  {selectedUsers.includes(availableUser.id) && (
                    <div className="ml-auto">
                      <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Comparison Button */}
        <div className="text-center">
          <Button
            onClick={handleCreateComparison}
            disabled={selectedUsers.length === 0}
          >
            比較を作成する
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage;