import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/auth';
import { 
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { user } = useAuthStore();

  const getWelcomeMessage = () => {
    const roleMessages = {
      [UserRole.PLAYER]: 'あなたのメンタル状態を確認し、より良いパフォーマンスを目指しましょう。',
      [UserRole.COACH]: 'チームメンバーの成長をサポートし、効果的な指導を行いましょう。',
      [UserRole.FATHER]: 'お子さんのスポーツ活動をサポートし、成長を見守りましょう。',
      [UserRole.MOTHER]: 'お子さんのスポーツ活動をサポートし、成長を見守りましょう。',
      [UserRole.ADULT]: 'スポーツを通じた自己成長とメンタルヘルスの向上を目指しましょう。'
    };

    return roleMessages[user?.role as UserRole] || 'スポーツマンシップアプリへようこそ。';
  };

  const getAvailableFeatures = () => {
    const baseFeatures = [
      {
        name: 'メンタルヘルステスト',
        description: '99問のテストで自己分析',
        icon: ClipboardDocumentListIcon,
        link: '/test',
        color: 'bg-blue-500'
      },
      {
        name: 'AIコーチング',
        description: 'パーソナライズされたアドバイス',
        icon: ChatBubbleLeftRightIcon,
        link: '/coaching',
        color: 'bg-green-500'
      },
      {
        name: 'テスト履歴',
        description: '過去の結果を確認',
        icon: ChartBarIcon,
        link: '/test/history',
        color: 'bg-purple-500'
      }
    ];

    // Add 1on1 comparison for eligible users
    if (
      user?.role === UserRole.COACH ||
      user?.head_coach_function ||
      (user?.role === UserRole.FATHER && user?.parent_function) ||
      (user?.role === UserRole.MOTHER && user?.parent_function)
    ) {
      baseFeatures.splice(2, 0, {
        name: '1on1比較',
        description: '選手との資質比較',
        icon: UserGroupIcon,
        link: '/comparison',
        color: 'bg-orange-500'
      });
    }

    return baseFeatures;
  };

  const features = getAvailableFeatures();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          おかえりなさい、{user?.name}さん
        </h1>
        <p className="text-lg text-gray-600">
          {getWelcomeMessage()}
        </p>
      </div>

      {/* User Info Card */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">プロフィール情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-500">種別</div>
            <div className="font-medium">
              {user?.role === UserRole.PLAYER && '選手'}
              {user?.role === UserRole.COACH && 'コーチ'}
              {user?.role === UserRole.FATHER && '父親'}
              {user?.role === UserRole.MOTHER && '母親'}
              {user?.role === UserRole.ADULT && '社会人'}
              {user?.head_coach_function && ' (ヘッドコーチ)'}
              {user?.parent_function && ' (親機能)'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">クラブID</div>
            <div className="font-medium">{user?.club_id}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">登録日</div>
            <div className="font-medium">
              {user?.created_date ? new Date(user.created_date).toLocaleDateString('ja-JP') : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {features.map((feature) => (
          <Link
            key={feature.name}
            to={feature.link}
            className="card p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-lg ${feature.color}`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">
                {feature.name}
              </h3>
            </div>
            <p className="text-gray-600">{feature.description}</p>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">アクティビティ概要</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">0</div>
            <div className="text-sm text-gray-500">完了したテスト</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-500">コーチングセッション</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">0</div>
            <div className="text-sm text-gray-500">比較分析</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;