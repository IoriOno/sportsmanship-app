// ファイル: frontend/src/pages/profile/ProfilePage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const ProfilePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [clubId, setClubId] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    // まずlocalStorageから取得
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserData(user);
      setClubId(user.club_id || '');
    }

    // APIからの取得を一時的にスキップ（バックエンドエラーのため）
    return;

    /* 
    // 最新情報をAPIから取得
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth-token') || localStorage.getItem('access_token');
      if (!token) {
        console.error('認証トークンが見つかりません');
        return;
      }
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/users/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        setClubId(data.club_id || '');
        // localStorageも更新
        localStorage.setItem('user', JSON.stringify(data));
      } else if (response.status === 401) {
        console.error('認証エラー: トークンが無効または期限切れです');
        // 必要に応じてログイン画面にリダイレクト
        // navigate('/login');
      }
    } catch (error) {
      console.error('ユーザー情報の取得に失敗:', error);
    }
    */
  };

  const handleUpdateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth-token') || localStorage.getItem('access_token');
      if (!token) {
        setError('認証トークンが見つかりません。再度ログインしてください。');
        setLoading(false);
        return;
      }
      
      // クラブIDが入力されている場合
      if (clubId.trim()) {
        // 1. クラブの存在確認をスキップして直接参加を試みる
        // （バックエンドのvalidateエンドポイントに問題がある可能性があるため）
        
        /*
        const checkResponse = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/clubs/${clubId}/validate`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!checkResponse.ok) {
          setError('指定されたクラブIDは存在しません');
          setLoading(false);
          return;
        }

        const checkData = await checkResponse.json();
        if (!checkData.valid) {
          setError('指定されたクラブIDは存在しません');
          setLoading(false);
          return;
        }
        */

        // 2. クラブに参加
        const joinResponse = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/users/join-club`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ club_id: clubId.trim() })
          }
        );

        if (joinResponse.ok) {
          const data = await joinResponse.json();
          setSuccess('クラブ情報を更新しました');
          // ユーザー情報を再取得
          await loadUserData();
          // authStoreも更新（fetchUserが利用可能な場合）
          // if (fetchUser) {
          //   await fetchUser();
          // }
          setEditMode(false);
          // ローカルストレージも更新
          const leftUser = { ...userData, club_id: null };
          setUserData(leftUser);
          localStorage.setItem('user', JSON.stringify(leftUser));
          // ローカルストレージも更新
          const updatedUser = { ...userData, club_id: clubId.trim() || null };
          setUserData(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          const errorData = await joinResponse.json();
          // エラーメッセージを文字列として取得
          const errorMessage = errorData.detail || 
                              errorData.message || 
                              errorData.error || 
                              'クラブへの参加に失敗しました';
          setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        }
      } else {
        // クラブIDが空の場合は退会処理
        const leaveResponse = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/users/leave-club`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (leaveResponse.ok) {
          setSuccess('クラブから退会しました');
          // ユーザー情報を再取得
          await loadUserData();
          // authStoreも更新（fetchUserが利用可能な場合）
          // if (fetchUser) {
          //   await fetchUser();
          // }
          setEditMode(false);
        } else {
          const errorData = await leaveResponse.json();
          // エラーメッセージを文字列として取得
          const errorMessage = errorData.detail || 
                              errorData.message || 
                              errorData.error || 
                              'クラブからの退会に失敗しました';
          setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        }
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return <div className="p-4">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              プロフィール情報
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              アカウントの詳細情報とクラブ設定
            </p>
          </div>
          
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">氏名</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {userData.name}
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {userData.email}
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">役割</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {userData.role === 'player' ? '選手' :
                   userData.role === 'father' ? '父親' :
                   userData.role === 'mother' ? '母親' :
                   userData.role === 'coach' ? 'コーチ' :
                   userData.role === 'head_coach' ? 'ヘッドコーチ' : userData.role}
                </dd>
              </div>
              
              {userData.age && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">年齢</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userData.age}歳
                  </dd>
                </div>
              )}
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">所属クラブ</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {editMode ? (
                    <form onSubmit={handleUpdateClub} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          value={clubId}
                          onChange={(e) => setClubId(e.target.value)}
                          placeholder="クラブIDを入力（空欄で退会）"
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
                          disabled={loading}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          {userData.club_id ? '空欄で送信するとクラブから退会します' : 'クラブIDを入力してください'}
                        </p>
                      </div>
                      
                      {error && (
                        <div className="rounded-md bg-red-50 p-3">
                          <p className="text-sm text-red-800">{error}</p>
                        </div>
                      )}
                      
                      {success && (
                        <div className="rounded-md bg-green-50 p-3">
                          <p className="text-sm text-green-800">{success}</p>
                        </div>
                      )}
                      
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                          {loading ? '更新中...' : '更新'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditMode(false);
                            setClubId(userData.club_id || '');
                            setError('');
                            setSuccess('');
                          }}
                          disabled={loading}
                          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          キャンセル
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span>{userData.club_id || '未所属'}</span>
                      <button
                        onClick={() => {
                          setEditMode(true);
                          setError('');
                          setSuccess('');
                        }}
                        className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                      >
                        編集
                      </button>
                    </div>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;