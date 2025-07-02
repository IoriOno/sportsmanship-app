import { ApiConfig } from '../types/api';

// APIのベースURL設定
const getApiUrl = (): string => {
  // 環境変数から取得
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // 環境に応じて自動判定
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // ローカル環境
    return 'http://localhost:8000';
  } else {
    // 本番環境（Herokuなど）
    return `https://${window.location.hostname}`;
  }
};

export const API_CONFIG: ApiConfig = {
  baseURL: getApiUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  endpoints: {
    // Auth
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    logout: '/api/v1/auth/logout',
    
    // Test
    submitTest: '/api/v1/tests/submit',
    getTestHistory: '/api/v1/tests/history',
    getTestResult: '/api/v1/tests/results',
    exportHistory: '/api/v1/tests/export',
    
    // Questions
    getQuestions: '/api/v1/questions',
    
    // Users
    getUsers: '/api/v1/users',
    getClubUsers: '/api/v1/users/club',
    
    // Comparisons
    createComparison: '/api/v1/comparisons/create',
    getComparisonHistory: '/api/v1/comparisons/history',
    
    // Clubs
    getClubs: '/api/v1/admin/clubs',
    createClub: '/api/v1/admin/clubs',
    validateClub: '/api/v1/clubs'
  }
};

// デバッグ情報
console.log('🚀 API Configuration:', {
  hostname: window.location.hostname,
  environment: process.env.NODE_ENV,
  apiUrl: API_CONFIG.baseURL,
  reactAppEnv: process.env.REACT_APP_ENVIRONMENT
});

// APIエンドポイントのURLを生成する関数
export const createApiUrl = (endpoint: string): string => {
  const baseURL = API_CONFIG.baseURL;
  // スラッシュの重複を防ぐ
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseURL}${normalizedEndpoint}`;
};

// 認証済みリクエストのオプションを生成
export const getAuthenticatedRequestOptions = (): RequestInit => {
  const token = localStorage.getItem('token') || localStorage.getItem('auth-token');

  return {
    headers: {
      ...API_CONFIG.headers,
      'Authorization': token ? `Bearer ${token}` : ''
    }
  };
};

// デフォルトリクエストオプション（後方互換性のため）
export const getDefaultRequestOptions = (): RequestInit => {
  return {
    headers: API_CONFIG.headers
  };
};

// APIのヘルスチェック
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(createApiUrl('/health'), {
      method: 'GET',
      headers: API_CONFIG.headers
    });
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

// 環境情報
export const ENVIRONMENT = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  apiUrl: API_CONFIG.baseURL,
  appName: process.env.REACT_APP_APP_NAME || 'Sportsmanship App',
  currentEnv: process.env.NODE_ENV || 'development'
};
