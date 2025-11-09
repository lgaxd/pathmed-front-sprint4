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
  const [userType, setUserType] = useState<'PACIENTE' | 'COLABORADOR' | null>(null); // Novo estado
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('userToken');
    const storedUserType = localStorage.getItem('userType') as 'PACIENTE' | 'COLABORADOR' | null;
    
    if (token) {
      try {
        const userData = JSON.parse(token);
        setIsAuthenticated(true);
        setUser(userData);
        setUserType(storedUserType);
      } catch (error) {
        console.error('Error parsing user token:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData: UserData, tipoUsuario: 'PACIENTE' | 'COLABORADOR' = 'PACIENTE') => {
    const userDataCompleto = {
      ...userData,
      tipoUsuario
    };
    
    localStorage.setItem('userToken', JSON.stringify(userDataCompleto));
    localStorage.setItem('userType', tipoUsuario);
    setIsAuthenticated(true);
    setUser(userDataCompleto);
    setUserType(tipoUsuario);
    
    // Redirecionar baseado no tipo de usuário
    const redirectPath = tipoUsuario === 'COLABORADOR' ? '/colaborador' : '/';
    navigate(redirectPath);
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    setIsAuthenticated(false);
    setUser(null);
    setUserType(null);
    navigate('/login');
  }, [navigate]);

  return {
    isAuthenticated,
    user,
    userType, // Exportar o tipo de usuário
    loading,
    login,
    logout,
    checkAuth,
  };
}