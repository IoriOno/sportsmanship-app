import { LoginRequest, RegisterRequest, AuthToken } from '../types/auth';
import { API_CONFIG, createApiUrl, getDefaultRequestOptions } from '../config/api';

export class AuthService {
  async login(credentials: LoginRequest): Promise<AuthToken> {
    try {
      // FastAPI expects OAuth2PasswordRequestForm format
      const formData = new FormData();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);
      
      console.log('Attempting login with email:', credentials.email);
      console.log('FormData contents:', {
        username: credentials.email,
        password: '***' // パスワードは隠す
      });
      
      const response = await fetch(createApiUrl(API_CONFIG.endpoints.login), {
        method: 'POST',
        body: formData,
      });
      
      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'ログインに失敗しました';
        
        try {
          const errorData = await response.json();
          console.error('Login error response:', errorData);
          console.error('Error detail:', errorData.detail);
          
          // FastAPIのエラー形式に対応
          if (errorData.detail) {
            if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail;
            } else if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail.map((err: any) => err.msg || err.message).join(', ');
            } else if (typeof errorData.detail === 'object') {
              // detailがオブジェクトの場合、その内容を確認
              console.error('Detail object:', JSON.stringify(errorData.detail, null, 2));
              if (errorData.detail.message) {
                errorMessage = errorData.detail.message;
              } else if (errorData.detail.error) {
                errorMessage = errorData.detail.error;
              } else {
                errorMessage = JSON.stringify(errorData.detail);
              }
            }
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
          
          // 401エラーの場合は具体的なメッセージ
          if (response.status === 401) {
            errorMessage = 'メールアドレスまたはパスワードが正しくありません';
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `ログインエラー: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Login successful, token received');
      
      // トークンを保存（キー名を確認）
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('auth-token', data.access_token); // 互換性のため両方に保存
      }
      
      // ユーザー情報も保存（存在する場合）
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // エラーを再スロー（適切なメッセージで）
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('ログイン中に予期しないエラーが発生しました');
      }
    }
  }
  
  async register(data: RegisterRequest): Promise<AuthToken> {
    try {
      const response = await fetch(createApiUrl(API_CONFIG.endpoints.register), {
        method: 'POST',
        headers: getDefaultRequestOptions().headers,
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        let errorMessage = '登録に失敗しました';
        
        try {
          const errorData = await response.json();
          console.error('Registration error response:', errorData);
          
          if (errorData.detail) {
            if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail;
            } else if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail.map((err: any) => err.msg || err.message).join(', ');
            }
          }
        } catch (parseError) {
          errorMessage = `登録エラー: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const responseData = await response.json();
      
      // トークンを保存
      if (responseData.access_token) {
        localStorage.setItem('token', responseData.access_token);
        localStorage.setItem('auth-token', responseData.access_token);
      }
      
      return responseData;
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('登録中に予期しないエラーが発生しました');
      }
    }
  }
  
  async validateClub(clubId: string): Promise<{ valid: boolean }> {
    try {
      const response = await fetch(createApiUrl(`/api/v1/clubs/${clubId}/validate`), {
        method: 'GET',
        headers: getDefaultRequestOptions().headers,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Club validation failed');
      }
      
      return response.json();
    } catch (error) {
      console.error('Club validation error:', error);
      throw error;
    }
  }
  
  async logout(): Promise<void> {
    // Clear all auth-related items from localStorage
    localStorage.removeItem('auth-token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Logged out successfully');
  }
  
  // 現在のトークンを取得
  getToken(): string | null {
    return localStorage.getItem('token') || localStorage.getItem('auth-token');
  }
  
  // 認証状態をチェック
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // JWTの有効期限をチェック
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = new Date() > new Date(payload.exp * 1000);
      return !isExpired;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }
}

export const authService = new AuthService();