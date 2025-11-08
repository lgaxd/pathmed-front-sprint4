import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserData {
  idUsuario?: number;
  nomeUsuario?: string;
  tipoUsuario?: string;
  token?: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      try {
        const userData = JSON.parse(token);
        setIsAuthenticated(true);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user token:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData: UserData) => {
    localStorage.setItem('userToken', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
    navigate('/');
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth,
  };
}