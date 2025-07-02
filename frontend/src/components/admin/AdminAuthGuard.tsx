// ファイル: frontend/src/components/admin/AdminAuthGuard.tsx

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      // トークンの有効性を確認（オプション）
      try {
        // トークンをデコードして有効期限をチェック
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // ミリ秒に変換
        const currentTime = Date.now();
        
        if (currentTime > expirationTime) {
          // トークンが期限切れ
          localStorage.removeItem('admin_token');
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        // トークンが無効
        localStorage.removeItem('admin_token');
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // 認証チェック中
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">認証を確認中...</div>
      </div>
    );
  }

  // 未認証の場合はログインページへリダイレクト
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // 認証済みの場合は子コンポーネントを表示
  return <>{children}</>;
};

export default AdminAuthGuard;