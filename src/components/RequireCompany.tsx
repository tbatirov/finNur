import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCompany } from '../contexts/CompanyContext';
export default function RequireCompany() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { selectedCompany } = useCompany();
  useEffect(() => {
    const checkAccess = async () => {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
        return;
      }

      const activeCompany = selectedCompany;
      if (!activeCompany) {
        navigate('/companies', { replace: true });
      }
    };

    checkAccess();
  }, [navigate, isAuthenticated]);

  return <Outlet />;
}