import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authService, getApiError } from '@/services/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; zodiacSign?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        const { data } = await authService.getMe();
        set({ user: data.user, isAuthenticated: true });
      }
    } catch {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
    } finally {
      set({ isInitialized: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authService.login({ email, password });
      await SecureStore.setItemAsync('accessToken', data.accessToken);
      await SecureStore.setItemAsync('refreshToken', data.refreshToken);
      set({ user: data.user, isAuthenticated: true });
    } catch (error) {
      set({ error: getApiError(error) });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (registerData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authService.register(registerData);
      await SecureStore.setItemAsync('accessToken', data.accessToken);
      await SecureStore.setItemAsync('refreshToken', data.refreshToken);
      set({ user: data.user, isAuthenticated: true });
    } catch (error) {
      set({ error: getApiError(error) });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {}
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (updates) => {
    const { user } = get();
    if (user) set({ user: { ...user, ...updates } });
  },

  refreshUser: async () => {
    try {
      const { data } = await authService.getMe();
      set({ user: data.user });
    } catch {}
  },

  clearError: () => set({ error: null }),
}));
