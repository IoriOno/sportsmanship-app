// ファイル: frontend/src/pages/admin/AdminDashboard.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface AdminStatistics {
  users: {
    total: number;
    active: number;
    inactive: number;
    by_role: Record<string, number>;
    by_club: Array<{ club_id: string; user_count: number; }>;
  };
  questions: {
    total: number;
    active: number;
    inactive: number;
    by_section: Record<string, number>;
    by_target: Record<string, number>;
  };
  clubs: {
    total: number;
    active_clubs: number;
  };
  test_results: {
    total: number;
    completed_today: number;
    completed_this_week: number;
    completed_this_month: number;
  };
}

const AdminDashboard = () => {
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 統計情報を取得
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // 並行して各種統計を取得
      const [usersRes, questionsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/v1/admin/users/statistics/summary`),
        fetch(`${process.env.REACT_APP_API_URL}/api/v1/questions/`)
      ]);

      if (usersRes.ok && questionsRes.ok) {
        const usersData = await usersRes.json();
        const questionsData = await questionsRes.json();

        // 質問統計を計算
        const questionStats = questionsData.questions.reduce((acc: any, q: any) => {
          acc.by_section[q.section] = (acc.by_section[q.section] || 0) + 1;
          acc.by_target[q.target] = (acc.by_target[q.target] || 0) + 1;
          if (q.is_active) acc.active++;
          else acc.inactive++;
          return acc;
        }, { by_section: {}, by_target: {}, active: 0, inactive: 0 });

        setStatistics({
          users: {
            total: usersData.total_users,
            active: usersData.active_users,
            inactive: usersData.inactive_users,
            by_role: usersData.role_statistics,
            by_club: usersData.club_statistics
          },
          questions: {
            total: questionsData.total_count,
            active: questionStats.active,
            inactive: questionStats.inactive,
            by_section: questionStats.by_section,
            by_target: questionStats.by_target
          },
          clubs: {
            total: usersData.club_statistics.length,
            active_clubs: usersData.club_statistics.length
          },
          test_results: {
            total: 0, // TODO: テスト結果API実装後
            completed_today: 0,
            completed_this_week: 0,
            completed_this_month: 0
          }
        });
      } else {
        setError('統計情報の取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const roleLabels: Record<string, string> = {
    'player': '選手',
    'father': '父親',
    'mother': '母親',
    'coach': 'コーチ'
  };

  const targetLabels: Record<string, string> = {
    'all': '全対象共通',
    'player': '選手向け',
    'father': '父親向け',
    'mother': '母親向け',
    'coach': 'コーチ向け'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">管理者ダッシュボードを読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                管理者ダッシュボード
              </h1>
              <span className="ml-3 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                Administrator
              </span>
            </div>
            <div className="text-sm text-gray-500">
              スポーツマンシップアプリ 管理システム
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* 概要統計 */}
        {statistics && (
          <>
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">システム概要</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-500">総ユーザー数</div>
                      <div className="text-2xl font-bold text-gray-900">{statistics.users.total}</div>
                      <div className="text-sm text-green-600">
                        有効: {statistics.users.active} | 無効: {statistics.users.inactive}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-500">質問数</div>
                      <div className="text-2xl font-bold text-gray-900">{statistics.questions.total}</div>
                      <div className="text-sm text-green-600">
                        有効: {statistics.questions.active} | 無効: {statistics.questions.inactive}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-500">登録クラブ数</div>
                      <div className="text-2xl font-bold text-gray-900">{statistics.clubs.total}</div>
                      <div className="text-sm text-green-600">
                        アクティブ: {statistics.clubs.active_clubs}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-500">テスト結果</div>
                      <div className="text-2xl font-bold text-gray-900">{statistics.test_results.total}</div>
                      <div className="text-sm text-green-600">
                        実装予定
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 管理機能メニュー */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">管理機能</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link
                  to="/admin/users"
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">ユーザー管理</h3>
                      <p className="text-sm text-gray-600">登録ユーザーの確認・編集・削除</p>
                      <div className="text-xs text-gray-500 mt-1">
                        {statistics.users.total}人の登録ユーザー
                      </div>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/admin/questions"
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-yellow-500"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">質問管理</h3>
                      <p className="text-sm text-gray-600">テスト質問の追加・編集・削除</p>
                      <div className="text-xs text-gray-500 mt-1">
                        {statistics.questions.total}問の質問
                      </div>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/admin/clubs"
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">クラブ管理</h3>
                      <p className="text-sm text-gray-600">クラブIDの発行・管理</p>
                      <div className="text-xs text-gray-500 mt-1">
                        {statistics.clubs.total}個のクラブ
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="bg-white rounded-lg shadow p-6 opacity-50 border-l-4 border-gray-300">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">テスト結果管理</h3>
                      <p className="text-sm text-gray-600">テスト結果の確認・分析（実装予定）</p>
                      <div className="text-xs text-gray-500 mt-1">
                        データ分析機能
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 opacity-50 border-l-4 border-gray-300">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">システム設定</h3>
                      <p className="text-sm text-gray-600">アプリケーション設定（実装予定）</p>
                      <div className="text-xs text-gray-500 mt-1">
                        設定管理
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 詳細統計 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* ユーザー統計 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ユーザー統計</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">役割別ユーザー数</h4>
                    <div className="space-y-2">
                      {Object.entries(statistics.users.by_role).map(([role, count]) => (
                        <div key={role} className="flex justify-between">
                          <span className="text-sm text-gray-600">{roleLabels[role] || role}</span>
                          <span className="text-sm font-medium text-gray-900">{count}人</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">クラブ別ユーザー数</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {statistics.users.by_club.map((club) => (
                        <div key={club.club_id} className="flex justify-between">
                          <span className="text-sm text-gray-600">{club.club_id}</span>
                          <span className="text-sm font-medium text-gray-900">{club.user_count}人</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 質問統計 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">質問統計</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">セクション別質問数</h4>
                    <div className="space-y-2">
                      {Object.entries(statistics.questions.by_section).map(([section, count]) => (
                        <div key={section} className="flex justify-between">
                          <span className="text-sm text-gray-600">{section}</span>
                          <span className="text-sm font-medium text-gray-900">{count}問</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">対象別質問数</h4>
                    <div className="space-y-2">
                      {Object.entries(statistics.questions.by_target).map(([target, count]) => (
                        <div key={target} className="flex justify-between">
                          <span className="text-sm text-gray-600">{targetLabels[target] || target}</span>
                          <span className="text-sm font-medium text-gray-900">{count}問</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;