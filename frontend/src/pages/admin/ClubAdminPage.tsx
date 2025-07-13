// ファイル: frontend/src/pages/admin/ClubAdminPage.tsx

import React, { useState, useEffect } from 'react';
import AdminHeader from '../../components/admin/AdminHeader';
import { createApiUrl } from '../../config/api';

interface Club {
  club_id: string;
  club_name: string;
  created_date: string;
  user_count?: number;
}

const ClubAdminPage = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newClubId, setNewClubId] = useState('');
  const [newClubName, setNewClubName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<'created_date' | 'club_name' | 'user_count'>('created_date');

  // クラブ一覧を取得
  const fetchClubs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        setError('認証トークンが見つかりません。ログインしてください。');
        setLoading(false);
        return;
      }
      
      const response = await fetch(createApiUrl('/api/v1/admin/clubs'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 403) {
        setError('アクセス権限がありません。管理者としてログインしてください。');
        // ログインページへリダイレクト
        window.location.href = '/admin/login';
        return;
      }
      
      const data = await response.json();
      
      if (response.ok) {
        setClubs(data);
        setError(null);
      } else {
        setError('クラブ情報の取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  // 新規クラブを作成
  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newClubId.trim() || !newClubName.trim()) {
      alert('クラブIDと名前を入力してください');
      return;
    }

    // クラブIDのバリデーション（英数字とハイフン、アンダースコアのみ）
    const clubIdPattern = /^[a-zA-Z0-9_-]+$/;
    if (!clubIdPattern.test(newClubId)) {
      alert('クラブIDは英数字、ハイフン、アンダースコアのみ使用できます');
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(createApiUrl('/api/v1/admin/clubs'), {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          club_id: newClubId,
          club_name: newClubName,
        }),
      });

      if (response.ok) {
        setNewClubId('');
        setNewClubName('');
        setIsCreating(false);
        fetchClubs();
        alert('クラブが作成されました');
      } else {
        const errorData = await response.json();
        alert(`エラー: ${errorData.detail || 'クラブの作成に失敗しました'}`);
      }
    } catch (err) {
      alert('クラブの作成に失敗しました');
    }
  };

  // クラブを削除
  const handleDeleteClub = async (clubId: string, clubName: string) => {
    if (!window.confirm(`クラブ「${clubName}」を削除しますか？\n※所属するユーザーも含めてすべて削除されます。`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(createApiUrl(`/api/v1/admin/clubs/${clubId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchClubs();
        alert('クラブが削除されました');
      } else {
        const errorData = await response.json();
        alert(`エラー: ${errorData.detail || 'クラブの削除に失敗しました'}`);
      }
    } catch (err) {
      alert('クラブの削除に失敗しました');
    }
  };

  // フィルタリングとソート
  const filteredAndSortedClubs = React.useMemo(() => {
    let filtered = clubs.filter(club => 
      club.club_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.club_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ソート処理
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'created_date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortBy === 'user_count') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [clubs, searchTerm, sortBy, sortOrder]);

  // クラブIDをクリップボードにコピー
  const handleCopyClubId = (clubId: string) => {
    navigator.clipboard.writeText(clubId).then(() => {
      alert(`クラブID「${clubId}」をコピーしました`);
    }).catch(() => {
      alert('コピーに失敗しました');
    });
  };

  if (loading) {
    return (
      <>
        <AdminHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">クラブ情報を読み込み中...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">クラブ管理</h1>
          
          {/* 統計情報 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500">総クラブ数</div>
              <div className="text-2xl font-bold text-gray-900">{clubs.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500">総ユーザー数</div>
              <div className="text-2xl font-bold text-blue-600">
                {clubs.reduce((sum, club) => sum + (club.user_count || 0), 0)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500">平均ユーザー数/クラブ</div>
              <div className="text-2xl font-bold text-green-600">
                {clubs.length > 0 
                  ? Math.round(clubs.reduce((sum, club) => sum + (club.user_count || 0), 0) / clubs.length)
                  : 0}
              </div>
            </div>
          </div>

          {/* 検索・操作バー */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  検索（クラブID・クラブ名）
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="クラブIDまたはクラブ名で検索"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={() => setIsCreating(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  新規クラブ作成
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* 新規クラブ作成フォーム */}
        {isCreating && (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">新規クラブ作成</h2>
            <form onSubmit={handleCreateClub} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    クラブID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newClubId}
                    onChange={(e) => setNewClubId(e.target.value)}
                    placeholder="例: tokyo-eagles"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    英数字、ハイフン、アンダースコアのみ使用可能
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    クラブ名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newClubName}
                    onChange={(e) => setNewClubName(e.target.value)}
                    placeholder="例: 東京イーグルス"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewClubId('');
                    setNewClubName('');
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  作成
                </button>
              </div>
            </form>
          </div>
        )}

        {/* クラブ一覧テーブル */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">
                クラブ一覧（{filteredAndSortedClubs.length}件）
              </h3>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">並び替え:</label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy as any);
                    setSortOrder(newSortOrder as any);
                  }}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="created_date-desc">作成日（新しい順）</option>
                  <option value="created_date-asc">作成日（古い順）</option>
                  <option value="club_name-asc">クラブ名（昇順）</option>
                  <option value="club_name-desc">クラブ名（降順）</option>
                  <option value="user_count-desc">ユーザー数（多い順）</option>
                  <option value="user_count-asc">ユーザー数（少ない順）</option>
                </select>
              </div>
            </div>
          </div>
          
          <ul className="divide-y divide-gray-200">
            {filteredAndSortedClubs.map((club) => (
              <li key={club.club_id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {club.club_name}
                          </p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {club.user_count || 0}人
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500">
                            ID: {club.club_id}
                          </p>
                          <button
                            onClick={() => handleCopyClubId(club.club_id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            コピー
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          作成日: {new Date(club.created_date).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={() => window.location.href = `/admin/users?club_id=${club.club_id}`}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                    >
                      ユーザー一覧
                    </button>
                    <button
                      onClick={() => handleDeleteClub(club.club_id, club.club_name)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      disabled={!!(club.user_count && club.user_count > 0)}
                      title={club.user_count && club.user_count > 0 ? 'ユーザーが存在するクラブは削除できません' : ''}
                    >
                      削除
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {filteredAndSortedClubs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? '該当するクラブが見つかりません' : 'クラブが登録されていません'}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default ClubAdminPage;