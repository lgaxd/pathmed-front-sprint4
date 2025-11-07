import React, { createContext, useContext, useState, ReactNode } from 'react';

type ApiType = 'java' | 'python';

interface ApiContextType {
  apiType: ApiType;
  setApiType: (type: ApiType) => void;
  apiBaseUrl: string;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiType, setApiType] = useState<ApiType>('java');

  const apiBaseUrl = apiType === 'java' 
    ? 'http://localhost:8080'
    : 'http://localhost:8000/api/v1';

  return (
    <ApiContext.Provider value={{ apiType, setApiType, apiBaseUrl }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi deve ser usado com ApiProvider');
  }
  return context;
};