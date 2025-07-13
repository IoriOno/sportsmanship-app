// ファイル: frontend/src/pages/admin/AdminUserManagement.tsx

import React, { useState, useEffect } from 'react';
import AdminHeader from '../../components/admin/AdminHeader';
import { createApiUrl } from '../../config/api';

interface AdminUser {
  email: string;
  created_date: string;
  last_login?: string;
}

const AdminUserManagement = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 管理者ユーザー一覧を取得
  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(createApiUrl('/api/v1/admin/admins'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdminUsers(data);
        setError(null);
      } else {
        setError('管理者ユーザー情報の取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  // 新規管理者ユーザーを作成
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail.trim() || !newPassword.trim()) {
      alert('メールアドレスとパスワードを入力してください');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('パスワードが一致しません');
      return;
    }

    if (newPassword.length < 8) {
      alert('パスワードは8文字以上で入力してください');
      return;
    }

    // メールアドレスのバリデーション
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(newEmail)) {
      alert('有効なメールアドレスを入力してください');
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(createApiUrl('/api/v1/admin/admins'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
        }),
      });

      if (response.ok) {
        setNewEmail('');
        setNewPassword('');
        setConfirmPassword('');
        setIsCreating(false);
        fetchAdminUsers();
        alert('管理者ユーザーが作成されました');
      } else {
        const errorData = await response.json();
        alert(`エラー: ${errorData.detail || '管理者の作成に失敗しました'}`);
      }
    } catch (err) {
      alert('管理者の作成に失敗しました');
    }
  };

  // 管理者ユーザーを削除
  const handleDeleteAdmin = async (email: string) => {
    // 現在ログイン中の管理者メールアドレスを取得
    const currentAdminEmail = localStorage.getItem('admin_email');
    
    if (email === currentAdminEmail) {
      alert('現在ログイン中の管理者は削除できません');
      return;
    }
    
    if (adminUsers.length <= 1) {
      alert('最後の管理者は削除できません');
      return;
    }

    if (!window.confirm(`管理者「${email}」を削除しますか？`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(createApiUrl(`/api/v1/admin/admins/${encodeURIComponent(email)}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchAdminUsers();
        alert('管理者が削除されました');
      } else {
        const errorData = await response.json();
        alert(`エラー: ${errorData.detail || '管理者の削除に失敗しました'}`);
      }
    } catch (err) {
      alert('管理者の削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">管理者情報を読み込み中...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">管理者ユーザー管理</h1>
          
          {/* 警告メッセージ */}
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            <p className="font-semibold mb-1">⚠️ セキュリティに関する重要な注意</p>
            <ul className="list-disc list-inside text-sm">
              <li>管理者アカウントは強力な権限を持ちます。信頼できる人にのみ付与してください</li>
              <li>パスワードは安全な場所に保管し、定期的に変更してください</li>
              <li>不要になった管理者アカウントは速やかに削除してください</li>
            </ul>
          </div>

          {/* 操作バー */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  現在の管理者数: {adminUsers.length}
                </p>
              </div>
              <button
                onClick={() => setIsCreating(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新規管理者作成
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* 新規管理者作成フォーム */}
        {isCreating && (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">新規管理者作成</h2>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    パスワード <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="8文字以上"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    パスワード（確認） <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="パスワードを再入力"
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
                    setNewEmail('');
                    setNewPassword('');
                    setConfirmPassword('');
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

        {/* 管理者一覧 */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700">管理者一覧</h3>
          </div>
          
          <ul className="divide-y divide-gray-200">
            {adminUsers.map((admin) => (
              <li key={admin.email} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {admin.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          作成日: {new Date(admin.created_date).toLocaleDateString('ja-JP')}
                          {admin.last_login && ` | 最終ログイン: ${new Date(admin.last_login).toLocaleDateString('ja-JP')}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handleDeleteAdmin(admin.email)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      disabled={admin.email === localStorage.getItem('admin_email') || adminUsers.length <= 1}
                      title={
                        admin.email === localStorage.getItem('admin_email') 
                          ? '現在ログイン中の管理者は削除できません' 
                          : adminUsers.length <= 1 
                          ? '最後の管理者は削除できません' 
                          : ''
                      }
                    >
                      削除
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {adminUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">管理者が登録されていません</p>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminUserManagement;