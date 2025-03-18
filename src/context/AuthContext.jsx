import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUser(decodedToken);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', user.role);
      setUser(user);
      return user;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', user.role);
      setUser(user);
      return user;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    setUser(null);
  };

  const getUserDashboard = async () => {
    try {
      const response = await api.get('/auth/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const updateUserDashboard = async (data) => {
    try {
      const response = await api.put('/auth/dashboard', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      getUserDashboard,
      updateUserDashboard
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};