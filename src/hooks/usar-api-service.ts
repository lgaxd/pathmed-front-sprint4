import { useApi } from '../contexts/api-context';
import ApiService from '../services/api';
import { useMemo } from 'react';

export const useApiService = () => {
  const { apiBaseUrl } = useApi();

  const apiService = useMemo(() => new ApiService(apiBaseUrl), [apiBaseUrl]);

  return apiService;
};