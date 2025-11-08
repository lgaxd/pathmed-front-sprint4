import { useApi } from '../contexts/api-context';
import ApiService from '../services/api';
import { useMemo } from 'react';

export const useApiService = () => {
  const { apiBaseUrl } = useApi();

  const apiService = useMemo(() => {
    const service = new ApiService(apiBaseUrl);
    
    // Interceptar requests para adicionar token
    const originalRequest = (service as any).request;
    (service as any).request = async function(endpoint: string, options: RequestInit = {}) {
      const token = localStorage.getItem('userToken');
      const authHeaders = token ? { 'Authorization': `Bearer ${JSON.parse(token).token}` } : {};
      
      return originalRequest.call(this, endpoint, {
        ...options,
        headers: {
          ...options.headers,
          ...authHeaders,
        },
      });
    };
    
    return service;
  }, [apiBaseUrl]);

  return apiService;
};