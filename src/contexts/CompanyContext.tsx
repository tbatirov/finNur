import React, { createContext, useContext, useState, useEffect } from 'react';
import { Company } from '../types/supabase';
import { getCompanies } from '../services/api/companies';
import { useAuth } from './AuthContext';

interface CompanyContextType {
  companies: Company[];
  selectedCompany: Company | null;
  selectedFiscalYear: string | null;
  loadCompanies: () => Promise<void>;
  setSelectedCompany: (company: Company | null) => void;
  setSelectedFiscalYear: (yearId: string | null) => void;
  isLoading: boolean;
  error: string | null;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadCompanies();
    }
  }, [user]);

  const loadCompanies = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getCompanies(user.id);
      setCompanies(data);
      
      // If no company is selected and we have companies, select the first one
      if (data.length > 0 && !selectedCompany) {
        setSelectedCompany(data[0]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load companies';
      setError(message);
      console.error('Failed to load companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    companies,
    selectedCompany,
    selectedFiscalYear,
    loadCompanies,
    setSelectedCompany,
    setSelectedFiscalYear,
    isLoading,
    error
  };

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
};