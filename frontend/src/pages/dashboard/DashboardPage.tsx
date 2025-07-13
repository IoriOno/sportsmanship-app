// ファイル: frontend/src/pages/dashboard/DashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/auth';
import { 
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    completedTests: 0,
    coachingSessions: 0,
    comparisons: 0,
    latestTestDate: null as string | null,
    latestScore: null as number | null
  });

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

  // 統計情報の取得
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TODO: 実際のAPIから統計情報を取得
        // 現在はサンプルデータを使用
        const sampleStats = {
          completedTests: 3,
          coachingSessions: 0,
          comparisons: 0,
          latestTestDate: '2024-01-15',
          latestScore: 295
        };
        setStats(sampleStats);
      } catch (error) {
        console.error('統計情報の取得に失敗:', error);
      }
    };

    fetchStats();
  }, []);

  // ナビゲーション関数
  const handleViewHistory = () => {
    navigate('/test/history');
  };

  const handleStartNewTest = () => {
    navigate('/test');
  };

  const getAvailableFeatures = () => {
    const baseFeatures = [
      {
        name: 'メンタルヘルステスト',
        description: '99問のテストで自己分析',
        icon: ClipboardDocumentListIcon,
        link: '/test',
        color: 'bg-blue-500',
        available: true,
        onClick: handleStartNewTest
      },
      {
        name: 'テスト履歴',
        description: '過去の結果を確認',
        icon: ChartBarIcon,
        link: '/test/history',
        color: 'bg-purple-500',
        available: true, // 有効化
        onClick: handleViewHistory
      },
      {
        name: 'AIコーチング',
        description: 'パーソナライズされたアドバイス',
        icon: ChatBubbleLeftRightIcon,
        link: '/coaching',
        color: 'bg-green-500',
        available: false, // 実装予定
        onClick: () => navigate('/coaching')
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
        color: 'bg-orange-500',
        available: true, // false → true に変更
        onClick: () => navigate('/comparison')
      });
    }

    return baseFeatures;
  };

  const getRoleDisplayName = () => {
    const roleNames = {
      [UserRole.PLAYER]: '選手',
      [UserRole.COACH]: 'コーチ',
      [UserRole.FATHER]: '父親',
      [UserRole.MOTHER]: '母親',
      [UserRole.ADULT]: '社会人'
    };

    let displayName = roleNames[user?.role as UserRole] || user?.role;
    
    if (user?.head_coach_function) {
      displayName += ' (ヘッドコーチ)';
    }
    if (user?.parent_function) {
      displayName += ' (親機能)';
    }

    return displayName;
  };

  const features = getAvailableFeatures();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              おかえりなさい、{user?.name}さん
            </h1>
            <p className="text-lg text-gray-600">
              {getWelcomeMessage()}
            </p>
          </div>
          {user?.head_coach_function && (
            <div className="flex space-x-2">
              <Link
                to="/admin/head-coach"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
              >
                <UserGroupIcon className="w-5 h-5 mr-2" />
                ヘッドコーチ管理
              </Link>
              <Link
                to="/admin/login"
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
              >
                <UserGroupIcon className="w-5 h-5 mr-2" />
                管理者ログイン
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {features.map((feature) => (
          feature.available ? (
            <button
              key={feature.name}
              onClick={feature.onClick}
              className="card p-6 hover:shadow-lg transition-shadow duration-200 text-left w-full"
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
            </button>
          ) : (
            <div
              key={feature.name}
              className="card p-6 opacity-50 cursor-not-allowed"
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-lg bg-gray-400`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="ml-4 text-lg font-semibold text-gray-900">
                  {feature.name}
                </h3>
              </div>
              <p className="text-gray-600">{feature.description}</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                  実装予定
                </span>
              </div>
            </div>
          )
        ))}
      </div>



      {/* App Information */}
      <div className="card p-6 mb-8">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-6 w-6 text-blue-500" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              スポーツマンシップアプリについて
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              このアプリは、クラブ単位でのメンタルヘルスチェック・分析・相互理解促進・AIコーチングを通じて、
              選手、コーチ、保護者の皆様がより良いスポーツ環境を築くためのツールです。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                </div>
                <div className="ml-2">
                  <h4 className="text-sm font-medium text-gray-900">99問のメンタルテスト</h4>
                  <p className="text-sm text-gray-600">
                    自己肯定感、アスリートマインド、スポーツマンシップの3領域を測定
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-500 mt-0.5" />
                </div>
                <div className="ml-2">
                  <h4 className="text-sm font-medium text-gray-900">AIによる個別サポート</h4>
                  <p className="text-sm text-gray-600">
                    テスト結果に基づいたパーソナライズされたアドバイス（実装予定）
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-5 w-5 text-orange-500 mt-0.5" />
                </div>
                <div className="ml-2">
                  <h4 className="text-sm font-medium text-gray-900">1on1比較機能</h4>
                  <p className="text-sm text-gray-600">
                    コーチと選手、保護者と子供の相互理解促進（実装予定）
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AcademicCapIcon className="h-5 w-5 text-purple-500 mt-0.5" />
                </div>
                <div className="ml-2">
                  <h4 className="text-sm font-medium text-gray-900">継続的な成長支援</h4>
                  <p className="text-sm text-gray-600">
                    定期的なテストと分析による長期的なメンタル強化
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {stats.completedTests === 0 ? 'はじめ方' : '次のステップ'}
        </h2>
        <div className="space-y-3">
          <div className="flex items-center">
            <div className={`flex-shrink-0 w-6 h-6 ${stats.completedTests > 0 ? 'bg-green-500' : 'bg-blue-500'} text-white rounded-full flex items-center justify-center text-sm font-medium`}>
              {stats.completedTests > 0 ? '✓' : '1'}
            </div>
            <div className="ml-3">
              <p className={stats.completedTests > 0 ? 'text-green-700' : 'text-gray-700'}>
                <strong>メンタルヘルステスト</strong>
                {stats.completedTests > 0 ? 'を完了しました！' : 'を実施して、現在の状態を確認しましょう'}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className={`flex-shrink-0 w-6 h-6 ${stats.completedTests > 0 ? 'bg-blue-500' : 'bg-gray-400'} text-white rounded-full flex items-center justify-center text-sm font-medium`}>
              2
            </div>
            <div className="ml-3">
              <p className={stats.completedTests > 0 ? 'text-gray-700' : 'text-gray-600'}>
                <strong>結果を確認</strong>して、自分の強みと改善点を理解します
                {stats.completedTests > 0 && (
                  <button
                    onClick={handleViewHistory}
                    className="ml-2 text-purple-600 hover:text-purple-800 text-sm underline"
                  >
                    履歴を見る
                  </button>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0 w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div className="ml-3">
              <p className="text-gray-600">
                <strong>AIコーチング</strong>を受けて、個別のアドバイスを実践します（実装予定）
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0 w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-medium">
              4
            </div>
            <div className="ml-3">
              <p className="text-gray-600">
                <strong>定期的なテスト</strong>で成長を確認し、継続的に向上を目指します
                {stats.completedTests > 0 && (
                  <button
                    onClick={handleStartNewTest}
                    className="ml-2 text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    再テストする
                  </button>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
