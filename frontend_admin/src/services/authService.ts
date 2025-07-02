import { apiService } from './api';
import { LoginRequest, RegisterRequest, AuthToken } from '../types/auth';

export class AuthService {
  async login(credentials: LoginRequest): Promise<AuthToken> {
    // FastAPI expects OAuth2PasswordRequestForm format
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    return response.json();
  }

  async register(data: RegisterRequest): Promise<AuthToken> {
    return apiService.post<AuthToken>('/auth/register', data);
  }

  async validateClub(clubId: string): Promise<{ valid: boolean }> {
    return apiService.get<{ valid: boolean }>(`/clubs/${clubId}/validate`);
  }

  async logout(): Promise<void> {
    // Clear token from localStorage
    localStorage.removeItem('auth-token');
  }
}

export const authService = new AuthService();