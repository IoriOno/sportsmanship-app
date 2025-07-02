// ファイル: frontend/src/pages/club/JoinClubPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const JoinClubPage = () => {
  const [clubId, setClubId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
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
      setCurrentUser(user);
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
        setCurrentUser(data);
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

  const handleJoinClub = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clubId.trim()) {
      setError('クラブIDを入力してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth-token') || localStorage.getItem('access_token');
      if (!token) {
        setError('認証トークンが見つかりません。再度ログインしてください。');
        setLoading(false);
        return;
      }
      
      console.log('使用するトークン:', token); // デバッグ用
      console.log('クラブID:', clubId); // デバッグ用
      
      // 1. クラブの存在確認をスキップしてダイレクトに参加を試みる
      // （バックエンドのvalidateエンドポイントに問題がある可能性があるため）
      
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

      console.log('Join Response Status:', joinResponse.status); // デバッグ用

      if (joinResponse.ok) {
        const data = await joinResponse.json();
        console.log('Join Success Data:', data); // デバッグ用
        
        // ローカルストレージのユーザー情報を更新
        if (currentUser) {
          const updatedUser = { ...currentUser, club_id: clubId.trim() };
          setCurrentUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        // エラーレスポンスの処理
        let errorMessage = 'クラブへの参加に失敗しました';
        try {
          const errorData = await joinResponse.json();
          console.log('Error Data:', errorData); // デバッグ用
          errorMessage = errorData.detail || 
                        errorData.message || 
                        errorData.error || 
                        errorMessage;
        } catch (e) {
          console.error('Error parsing response:', e);
        }
        setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      }
    } catch (err) {
      console.error('Network Error:', err);
      setError('ネットワークエラーが発生しました。サーバーが起動していることを確認してください。');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveClub = async () => {
    if (!window.confirm('本当にクラブから退会しますか？')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth-token') || localStorage.getItem('access_token');
      if (!token) {
        setError('認証トークンが見つかりません。再度ログインしてください。');
        setLoading(false);
        return;
      }
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/users/leave-club`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        // ローカルストレージのユーザー情報を更新
        if (currentUser) {
          const updatedUser = { ...currentUser, club_id: null };
          setCurrentUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        setError('');
        alert('クラブから退会しました');
        // ページをリロードして最新状態を反映
        window.location.reload();
      } else {
        // エラーレスポンスの処理
        let errorMessage = 'クラブからの退会に失敗しました';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || 
                        errorData.message || 
                        errorData.error || 
                        errorMessage;
        } catch (e) {
          // JSONパースエラーの場合はデフォルトメッセージを使用
          console.error('Error parsing response:', e);
        }
        setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      }
    } catch (err) {
      // ネットワークエラーなどの場合
      console.error('Error:', err);
      
      // バックエンドエラーの場合、ローカルでの処理を試みる
      if (currentUser?.club_id) {
        if (window.confirm('サーバーとの通信に失敗しました。ローカルのデータのみ更新しますか？')) {
          const updatedUser = { ...currentUser, club_id: null };
          setCurrentUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          alert('ローカルデータを更新しました。次回ログイン時にサーバーと同期してください。');
          window.location.reload();
        }
      }
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          クラブ参加・管理
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {currentUser?.club_id 
            ? `現在のクラブ: ${currentUser.club_id}`
            : 'クラブに参加してチーム機能を利用しましょう'
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    クラブへの参加が完了しました！
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>ダッシュボードにリダイレクトしています...</p>
                  </div>
                </div>
              </div>
            </div>
          ) : currentUser?.club_id ? (
            // 既にクラブに所属している場合
            <div className="space-y-6">
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      現在のクラブ
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p className="font-semibold">{currentUser.club_id}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={handleLeaveClub}
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {loading ? '処理中...' : 'クラブから退会'}
                </button>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              )}

              <div className="text-sm text-gray-600 text-center">
                <p>※ 退会後は別のクラブに参加できます</p>
              </div>
            </div>
          ) : (
            // クラブに所属していない場合
            <form className="space-y-6" onSubmit={handleJoinClub}>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              )}

              <div>
                <label htmlFor="clubId" className="block text-sm font-medium text-gray-700">
                  クラブID
                </label>
                <div className="mt-1">
                  <input
                    id="clubId"
                    name="clubId"
                    type="text"
                    value={clubId}
                    onChange={(e) => setClubId(e.target.value)}
                    required
                    disabled={loading}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="例: tokyo-eagles"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  コーチまたは管理者から提供されたクラブIDを入力してください
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {loading ? '確認中...' : 'クラブに参加'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">その他のオプション</span>
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
      </div>
    </div>
  );
};

export default JoinClubPage;