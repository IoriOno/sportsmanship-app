import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthToken } from '../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (authData: AuthToken) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  checkTokenExpiry: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (authData: AuthToken) => {
        set({
          user: authData.user,
          token: authData.access_token,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      
      updateUser: (user: User) => {
        set((state) => ({
          ...state,
          user,
        }));
      },
      
      checkTokenExpiry: () => {
        const state = useAuthStore.getState();
        if (!state.token) return false;
        
        try {
          // JWTトークンをデコードして有効期限をチェック
          const payload = JSON.parse(atob(state.token.split('.')[1]));
          const expiryTime = payload.exp * 1000; // ミリ秒に変換
          const currentTime = Date.now();
          
          // 有効期限が切れている場合はログアウト
          if (currentTime >= expiryTime) {
            state.logout();
            return false;
          }
          
          // 有効期限が30分以内の場合は警告
          const warningTime = expiryTime - (30 * 60 * 1000); // 30分前
          if (currentTime >= warningTime) {
            console.warn('トークンの有効期限が近づいています');
          }
          
          return true;
        } catch (error) {
          console.error('トークンの解析に失敗しました:', error);
          state.logout();
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);