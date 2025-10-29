import api from '@/lib/api';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  company?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  role: 'CLIENT' | 'ADMIN';
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data.user;
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },

  isAdmin(): boolean {
    const user = this.getStoredUser();
    return user?.role === 'ADMIN';
  },
};
