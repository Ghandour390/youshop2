"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

// Types
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  address: string | null;
  phone: string | null;
  dateNaissance: string | null;
  photo: string | null;
  verificationEmail: boolean;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  updateUser: (user: User) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Token storage helpers
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

export const getStoredTokens = (): AuthTokens | null => {
  if (typeof window === 'undefined') return null;
  const access_token = localStorage.getItem(TOKEN_KEY);
  const refresh_token = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!access_token || !refresh_token) return null;
  return { access_token, refresh_token };
};

export const setStoredTokens = (tokens: AuthTokens): void => {
  localStorage.setItem(TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
};

export const clearStoredTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = getStoredUser();
      const tokens = getStoredTokens();

      if (storedUser && tokens) {
        setUser(storedUser);
        // Optionally verify token is still valid
        try {
          const response = await axiosInstance.get('/auth/profile');
          if (response.data) {
            setUser(response.data);
            setStoredUser(response.data);
          }
        } catch (error) {
          // Token might be expired, try refresh
          const refreshed = await refreshAuth();
          if (!refreshed) {
            clearStoredTokens();
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Refresh authentication
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    const tokens = getStoredTokens();
    if (!tokens?.refresh_token) return false;

    try {
      const response = await axiosInstance.post('/auth/refresh', {
        refresh_token: tokens.refresh_token,
      });

      const { access_token, refresh_token, user: newUser } = response.data;
      setStoredTokens({ access_token, refresh_token });
      if (newUser) {
        setUser(newUser);
        setStoredUser(newUser);
      }
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    const { user: userData, access_token, refresh_token } = response.data;

    setStoredTokens({ access_token, refresh_token });
    setStoredUser(userData);
    setUser(userData);
  }, []);

  // Register
  const register = useCallback(async (data: RegisterData): Promise<void> => {
    await axiosInstance.post('/auth/register', data);
    // Don't auto-login after register - user needs to verify email
    localStorage.setItem('email', data.email);
  }, []);

  // Logout (single device)
  const logout = useCallback(async (): Promise<void> => {
    const tokens = getStoredTokens();
    try {
      if (tokens?.refresh_token) {
        await axiosInstance.post('/auth/logout', {
          refresh_token: tokens.refresh_token,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearStoredTokens();
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  // Logout from all devices
  const logoutAll = useCallback(async (): Promise<void> => {
    try {
      await axiosInstance.post('/auth/logout-all');
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      clearStoredTokens();
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  // Update user data
  const updateUser = useCallback((updatedUser: User): void => {
    setUser(updatedUser);
    setStoredUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        logoutAll,
        refreshAuth,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export types
export type { User, AuthTokens, AuthContextType };
