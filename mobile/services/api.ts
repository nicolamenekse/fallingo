import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const responseData = error.response.data as { code?: string };
      if (responseData?.code === 'TOKEN_EXPIRED') {
        originalRequest._retry = true;
        try {
          const refreshToken = await SecureStore.getItemAsync('refreshToken');
          if (!refreshToken) throw new Error('No refresh token');

          const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
          await SecureStore.setItemAsync('accessToken', data.accessToken);
          await SecureStore.setItemAsync('refreshToken', data.refreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          }
          return api(originalRequest);
        } catch {
          await SecureStore.deleteItemAsync('accessToken');
          await SecureStore.deleteItemAsync('refreshToken');
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authService = {
  register: (data: { name: string; email: string; password: string; zodiacSign?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: Partial<{ name: string; zodiacSign: string; birthDate: string }>) =>
    api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
};

// Fortune
export const fortuneService = {
  createCoffeeReading: (formData: FormData) =>
    api.post('/fortune/coffee', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  createPalmReading: (formData: FormData) =>
    api.post('/fortune/palm', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  createTarotReading: (data: { cardCount?: number; userNote?: string }) =>
    api.post('/fortune/tarot', data),
  createHoroscopeReading: (data: { zodiacSign?: string; period?: string; userNote?: string }) =>
    api.post('/fortune/horoscope', data),
  getReading: (id: string) => api.get(`/fortune/${id}`),
  rateReading: (id: string, data: { rating: number; feedback?: string }) =>
    api.post(`/fortune/${id}/rate`, data),
  toggleFavorite: (id: string) => api.post(`/fortune/${id}/favorite`),
  shareReading: (id: string) => api.post(`/fortune/${id}/share`),
  getSharedReading: (token: string) => api.get(`/fortune/shared/${token}`),
};

// History
export const historyService = {
  getHistory: (params?: { page?: number; limit?: number; type?: string; isFavorite?: boolean }) =>
    api.get('/history', { params }),
  getFavorites: (params?: { page?: number; limit?: number }) =>
    api.get('/history/favorites', { params }),
  getStats: () => api.get('/history/stats'),
  deleteReading: (id: string) => api.delete(`/history/${id}`),
  clearHistory: (type?: string) => api.delete('/history/clear', { params: type ? { type } : {} }),
};

// Premium
export const premiumService = {
  getPlans: () => api.get('/premium/plans'),
  createPaymentIntent: (planId: string) => api.post('/premium/payment-intent', { planId }),
  cancelSubscription: (reason?: string) => api.post('/premium/cancel', { reason }),
  getSubscriptionHistory: () => api.get('/premium/history'),
};

export const getApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'Bir hata oluştu.';
  }
  return 'Beklenmeyen bir hata oluştu.';
};
