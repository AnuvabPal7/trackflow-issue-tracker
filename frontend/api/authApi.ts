import { axiosClient } from './axiosClient';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';
import { INITIAL_USERS } from '../data/mockData';

const TOKEN_KEY = 'trackflow_token';
const USER_KEY = 'trackflow_user';

export const isMockMode = import.meta.env.VITE_USE_MOCK === 'true';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    if (isMockMode) {
      const foundUser = INITIAL_USERS.find(
        (u) => u.email.toLowerCase() === credentials.email.toLowerCase()
      );
      if (!foundUser || credentials.password !== 'password123') {
        throw new Error('Invalid email or password. Please verify your credentials.');
      }

      const mockToken = `mock-token-${foundUser.id}-${Date.now()}`;
      const authData: AuthResponse = {
        accessToken: mockToken,
        tokenType: 'Bearer',
        expiresIn: 86400,
        user: foundUser,
      };

      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(foundUser));
      return authData;
    }

    try {
      const response = await axiosClient.post<AuthResponse>('/auth/login', credentials);
      if (response.data?.accessToken) {
        localStorage.setItem(TOKEN_KEY, response.data.accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Login request failed';
      throw new Error(message);
    }
  },

  register: async (payload: RegisterRequest): Promise<AuthResponse> => {
    if (isMockMode) {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: payload.fullName,
        email: payload.email,
        role: 'DEVELOPER', // Always DEVELOPER on registration
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80`,
        title: payload.title || 'Software Engineer',
        department: payload.department || 'Engineering',
      };

      const mockToken = `mock-token-${newUser.id}-${Date.now()}`;
      const authData: AuthResponse = {
        accessToken: mockToken,
        tokenType: 'Bearer',
        expiresIn: 86400,
        user: newUser,
      };

      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      return authData;
    }

    try {
      const response = await axiosClient.post<AuthResponse>('/auth/register', payload);
      if (response.data?.accessToken) {
        localStorage.setItem(TOKEN_KEY, response.data.accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Registration request failed';
      throw new Error(message);
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    if (isMockMode) {
      const cached = localStorage.getItem(USER_KEY);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          return null;
        }
      }
      return null;
    }

    try {
      const response = await axiosClient.get<User>('/users/me');
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));
      return response.data;
    } catch {
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
};

