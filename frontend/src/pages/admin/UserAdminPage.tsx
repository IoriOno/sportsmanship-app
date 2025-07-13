import React, { useState, useEffect, useCallback } from 'react';
import AdminHeader from '../../components/admin/AdminHeader';
import { createApiUrl } from '../../config/api';

interface User {
  user_id: string;
  name: string;
  age: number;
  email: string;
  role: string;
  club_id: string;
  parent_function: boolean;
  head_coach_function: boolean;
  head_parent_function?: boolean;
  created_date: string;
  updated_date?: string;
}

interface UserStatistics {
  total_users: number;
  role_statistics: Record<string, number>;
  club_statistics: Array<{ club_id: string; user_count: number; }>;
}

interface Club {
  club_id: string;
  club_name: string;
  created_date: string;
  user_count?: number;
}

// 役割の定義
const ROLES = {
  'player': '選手',
  'coach': 'コーチ',
  'mother': '母親',
  'father': '父親',
  'adult': '社会人'
};

const UserAdminPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterClub, setFilterClub] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);

  // ユーザー一覧を取得
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      let url = createApiUrl('/api/v1/admin/users');
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterRole) params.append('role', filterRole);
      if (filterClub) params.append('club_id', filterClub);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users || data);
        setError(null);
      } else {
        setError('ユーザーの取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterRole, filterClub]);

  // 統計情報を取得
  const fetchStatistics = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(createApiUrl('/api/v1/admin/users/statistics/summary'), {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      const data = await response.json();
      
      if (response.ok) {
        setStatistics(data);
      }
    } catch (err) {
      console.error('統計情報の取得に失敗:', err);
    }
  }, []);

  // 全クラブ情報を取得
  const fetchClubs = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(createApiUrl('/api/v1/admin/clubs'), {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      const data = await response.json();
      
      if (response.ok) {
        setClubs(data);
      }
    } catch (err) {
      console.error('クラブ情報の取得に失敗:', err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchStatistics();
    fetchClubs();
  }, [searchTerm, filterRole, filterClub]);

  // ユーザー情報を保存（役割とクラブIDの両方を更新）
  const handleSaveUser = async (user: User) => {
    try {
      const token = localStorage.getItem('admin_token');
      let updateCount = 0;
      let errorOccurred = false;
      
      // 役割の更新
      if (originalUser && user.role !== originalUser.role) {
        const roleResponse = await fetch(createApiUrl(`/api/v1/admin/users/${user.user_id}/role`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({ new_role: user.role }),
        });

        if (roleResponse.ok) {
          updateCount++;
        } else {
          errorOccurred = true;
          const errorData = await roleResponse.json();
          alert(`役割の更新エラー: ${errorData.detail || '更新に失敗しました'}`);
        }
      }
      
      // クラブIDの更新
      if (originalUser && user.club_id !== originalUser.club_id) {
        const clubResponse = await fetch(createApiUrl(`/api/v1/admin/users/${user.user_id}/club`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({ new_club_id: user.club_id }),
        });

        if (clubResponse.ok) {
          updateCount++;
        } else {
          errorOccurred = true;
          const errorData = await clubResponse.json().catch(() => ({ detail: 'クラブIDの更新に失敗しました' }));
          alert(`クラブIDの更新エラー: ${errorData.detail || '更新に失敗しました'}`);
        }
      }
      
      if (!errorOccurred) {
        setEditingUser(null);
        setOriginalUser(null);
        fetchUsers();
        fetchStatistics();
        if (updateCount > 0) {
          alert('ユーザー情報が更新されました');
        } else {
          alert('変更はありませんでした');
        }
      }
    } catch (err) {
      console.error('更新エラー:', err);
      alert('更新に失敗しました');
    }
  };

  // ユーザーの有効/無効を切り替え
  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('admin_token');
      const endpoint = isActive ? 'activate' : 'deactivate';
      const response = await fetch(createApiUrl(`/api/v1/admin/users/${userId}/${endpoint}`), {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (response.ok) {
        fetchUsers();
        fetchStatistics();
        alert(`ユーザーを${isActive ? '有効' : '無効'}にしました`);
      } else {
        const errorData = await response.json();
        alert(`エラー: ${errorData.detail || 'ステータスの更新に失敗しました'}`);
      }
    } catch (err) {
      alert('ステータスの更新に失敗しました');
    }
  };

  // ユーザーを削除
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`ユーザー「${userName}」を削除しますか？\n※関連するテスト結果もすべて削除されます。`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(createApiUrl(`/api/v1/admin/users/${userId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (response.ok) {
        fetchUsers();
        fetchStatistics();
        alert('ユーザーが削除されました');
      } else {
        const errorData = await response.json();
        alert(`エラー: ${errorData.detail || 'ユーザーの削除に失敗しました'}`);
      }
    } catch (err) {
      alert('ユーザーの削除に失敗しました');
    }
  };

  // ヘッドコーチ権限を切り替え
  const handleToggleHeadCoach = async (userId: string, userName: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const statusText = newStatus ? '有効' : '無効';
    
    if (!window.confirm(`${userName}のヘッドコーチ権限を${statusText}にしますか？`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(createApiUrl(`/api/v1/admin/users/${userId}/head-coach`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ is_head_coach: newStatus }),
      });

      if (response.ok) {
        fetchUsers();
        alert(`ヘッドコーチ権限を${statusText}にしました`);
      } else {
        const errorData = await response.json();
        alert(`エラー: ${errorData.detail || 'ヘッドコーチ権限の更新に失敗しました'}`);
      }
    } catch (err) {
      alert('ヘッドコーチ権限の更新に失敗しました');
    }
  };

  // ヘッド親権限を切り替え
  const handleToggleHeadParent = async (userId: string, userName: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const statusText = newStatus ? '有効' : '無効';
    
    if (!window.confirm(`${userName}のヘッド親権限を${statusText}にしますか？`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(createApiUrl(`/api/v1/admin/users/${userId}/head-parent`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ is_head_parent: newStatus }),
      });

      if (response.ok) {
        fetchUsers();
        alert(`ヘッド親権限を${statusText}にしました`);
      } else {
        const errorData = await response.json();
        alert(`エラー: ${errorData.detail || 'ヘッド親権限の更新に失敗しました'}`);
      }
    } catch (err) {
      alert('ヘッド親権限の更新に失敗しました');
    }
  };

  // 編集開始時に元のユーザー情報を保存
  const handleStartEdit = (user: User) => {
    setEditingUser({...user});
    setOriginalUser({...user});
  };

  // 編集キャンセル
  const handleCancelEdit = () => {
    setEditingUser(null);
    setOriginalUser(null);
  };

  if (loading) {
    return (
      <>
        <AdminHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">ユーザー情報を読み込み中...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">ユーザー管理</h1>
          
          {/* 統計情報 */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm font-medium text-gray-500">総ユーザー数</div>
                <div className="text-2xl font-bold text-gray-900">{statistics.total_users}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm font-medium text-gray-500">役割別ユーザー</div>
                <div className="text-sm text-gray-600">
                  {Object.entries(statistics.role_statistics).map(([role, count]) => (
                    <div key={role}>{ROLES[role as keyof typeof ROLES] || role}: {count}人</div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm font-medium text-gray-500">クラブ数</div>
                <div className="text-2xl font-bold text-blue-600">{clubs.length || 0}</div>
              </div>
            </div>
          )}

          {/* 検索・フィルター */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  検索（名前・メール）
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ユーザー名またはメールアドレス"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  役割フィルター
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">すべての役割</option>
                  {Object.entries(ROLES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  クラブフィルター
                </label>
                <select
                  value={filterClub}
                  onChange={(e) => setFilterClub(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">すべてのクラブ</option>
                  {clubs.map((club) => (
                    <option key={club.club_id} value={club.club_id}>
                      {club.club_name} ({club.club_id}) - {club.user_count || 0}人
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* ユーザー一覧 */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.user_id} className="px-6 py-4">
                {editingUser?.user_id === user.user_id ? (
                  // 編集モード
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          役割
                        </label>
                        <select
                          value={editingUser.role || ''}
                          onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                        >
                          {Object.entries(ROLES).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          クラブID
                        </label>
                        <select
                          value={editingUser.club_id || ''}
                          onChange={(e) => setEditingUser({...editingUser, club_id: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                        >
                          {clubs.length > 0 ? (
                            clubs.map((club) => (
                              <option key={club.club_id} value={club.club_id}>
                                {club.club_name} ({club.club_id})
                                {club.user_count === 0 && ' - 登録者なし'}
                              </option>
                            ))
                          ) : (
                            <option value={editingUser.club_id}>{editingUser.club_id}</option>
                          )}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">名前: {editingUser.name}</p>
                        <p className="text-sm text-gray-600">メール: {editingUser.email}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleSaveUser(editingUser)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                      >
                        保存
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  // 表示モード
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.name}
                            </p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {ROLES[user.role as keyof typeof ROLES] || user.role}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {user.club_id}
                            </span>
                            {user.head_coach_function && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                ヘッドコーチ
                              </span>
                            )}
                            {user.parent_function && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                親機能
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">
                            年齢: {user.age}歳 | 登録日: {new Date(user.created_date).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <button
                        onClick={() => handleStartEdit(user)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleToggleHeadCoach(user.user_id, user.name, user.head_coach_function)}
                        className={`${
                          user.head_coach_function 
                            ? 'bg-purple-600 hover:bg-purple-700' 
                            : 'bg-purple-400 hover:bg-purple-500'
                        } text-white px-3 py-1 rounded text-sm`}
                        title={user.head_coach_function ? 'ヘッドコーチ権限を無効化' : 'ヘッドコーチ権限を有効化'}
                      >
                        HC
                      </button>
                                              <button
                          onClick={() => handleToggleHeadParent(user.user_id, user.name, user.head_parent_function || false)}
                          className={`${
                            user.head_parent_function
                              ? 'bg-purple-600 hover:bg-purple-700'
                              : 'bg-purple-400 hover:bg-purple-500'
                          } text-white px-3 py-1 rounded text-sm`}
                          title={user.head_parent_function ? 'ヘッド親権限を無効化' : 'ヘッド親権限を有効化'}
                        >
                          HP
                        </button>
                      <button
                        onClick={() => handleToggleActive(user.user_id, true)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                        title="有効/無効化機能（is_activeフィールドなし）"
                      >
                        状態変更
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.user_id, user.name)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">該当するユーザーが見つかりません</p>
          </div>
        )}
      </div>
    </>
  );
};

export default UserAdminPage;