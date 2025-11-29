import React, { useEffect, useState } from 'react';
import { authApi } from '../services/api';
import { apiClient } from '../lib/api-client';
import type { User } from '../types/api';
import { AuthContext, type AuthContextType } from './auth-context';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = apiClient.getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Try to get current user info
      const response = await authApi.getCurrentUser();
      setUser(response.data.user);
    } catch {
      // Token is invalid, clear it
      apiClient.clearAuthToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });

    if (response.success) {
      const { user: userData, token } = response.data;

      // Store token and user data
      apiClient.setAuthToken(token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Even if logout fails on server, clear local data
      console.error('Logout error:', error);
    } finally {
      apiClient.clearAuthToken();
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};