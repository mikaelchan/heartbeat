import { defineStore } from 'pinia';
import axios from 'axios';
import type { AuthResponse, UserGender, UserProfile } from '@/types/auth';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

const TOKEN_STORAGE_KEY = 'heartbeat-token';

const setAuthHeader = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
};

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false,
    initialized: false,
    error: null
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user)
  },
  actions: {
    async initialize() {
      if (this.initialized) return;
      const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedToken) {
        this.token = storedToken;
        setAuthHeader(storedToken);
        try {
          const { data } = await axios.get<UserProfile>('/api/auth/me');
          this.user = data;
        } catch (error) {
          this.clearSession();
        }
      }
      this.initialized = true;
    },
    async register(username: string, password: string, gender: UserGender) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await axios.post<AuthResponse>('/api/auth/register', {
          username,
          password,
          gender
        });
        this.applySession(data);
        return data.user;
      } catch (error: unknown) {
        this.error = this.extractErrorMessage(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async login(username: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await axios.post<AuthResponse>('/api/auth/login', {
          username,
          password
        });
        this.applySession(data);
        return data.user;
      } catch (error: unknown) {
        this.error = this.extractErrorMessage(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.clearSession();
    },
    applySession(payload: AuthResponse) {
      this.user = payload.user;
      this.token = payload.token;
      setAuthHeader(payload.token);
      window.localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
    },
    clearSession() {
      this.user = null;
      this.token = null;
      this.error = null;
      setAuthHeader(null);
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    },
    extractErrorMessage(error: unknown) {
      if (axios.isAxiosError(error)) {
        return (error.response?.data as { message?: string } | undefined)?.message ?? '请求失败，请稍后再试。';
      }
      return '请求失败，请稍后再试。';
    }
  }
});
