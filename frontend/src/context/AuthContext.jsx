'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize & Validate Auth State with Spring Boot Backend Server
  useEffect(() => {
    const validateTokenWithServer = async () => {
      try {
        const savedToken = typeof window !== 'undefined' ? localStorage.getItem('sree_padmavathi_jwt_token') : null;
        if (savedToken) {
          const { fetchCurrentUserApi } = await import('../lib/apiClient');
          const res = await fetchCurrentUserApi();
          const profile = res?.data || res;
          if (profile && profile.username) {
            if (profile.fullName === 'Super Admin') {
              profile.fullName = 'Store Owner';
            }
            setToken(savedToken);
            setUser(profile);
            setRole(profile.role || 'ROLE_CUSTOMER');
          }
        }
      } catch (e) {
        // Token invalid or expired in Spring Boot backend
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sree_padmavathi_jwt_token');
          localStorage.removeItem('sree_padmavathi_admin_auth');
        }
        setToken(null);
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    validateTokenWithServer();
  }, []);

  // Login Handler for Admin & Customers
  const login = async (username, password) => {
    try {
      const res = await apiClient.post('/admin/login', { username, password });
      const apiData = res.data?.data || res.data;
      if (apiData && apiData.token) {
        const userObj = {
          username: apiData.username,
          fullName: apiData.fullName,
          email: apiData.email,
          role: apiData.role
        };
        localStorage.setItem('sree_padmavathi_jwt_token', apiData.token);
        localStorage.setItem('sree_padmavathi_user_profile', JSON.stringify(userObj));
        setToken(apiData.token);
        setUser(userObj);
        setRole(apiData.role);
        return { success: true, data: apiData };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Authentication error. Please check credentials.'
      };
    }
  };



  // Logout Handler
  const logout = async () => {
    try {
      if (token && (role === 'ROLE_OWNER' || role === 'OWNER')) {
        const { apiClient } = await import('../lib/apiClient');
        await apiClient.post('/admin/logout');
      }
    } catch (err) {
      console.warn('Backend logout failed or not supported:', err.message);
    } finally {
      localStorage.removeItem('sree_padmavathi_jwt_token');
      localStorage.removeItem('sree_padmavathi_user_profile');
      localStorage.removeItem('sree_padmavathi_admin_auth');
      localStorage.removeItem('sree_padmavathi_user_role');
      setToken(null);
      setUser(null);
      setRole(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        isLoggedIn: !!token && !!user,
        isAdmin: role === 'ROLE_OWNER' || role === 'OWNER',
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
