import api from './api';
import type { RegisterRequest, LoginRequest, AuthResponse, User } from '../types';

export const authService = {
  /**
   * Register a new user account
   */
  async register(data: RegisterRequest): Promise<User> {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanName = data.full_name.trim();

    const response = await api.post<User>('/auth/register', {
      full_name: cleanName,
      email: cleanEmail,
      password: data.password,
    });
    return response.data;
  },

  /**
   * Login using JSON credentials
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const cleanEmail = data.email.trim().toLowerCase();

    const response = await api.post<AuthResponse>('/auth/login', {
      email: cleanEmail,
      username: cleanEmail,
      password: data.password,
    });

    return response.data;
  },

  /**
   * Fetch current authenticated user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};