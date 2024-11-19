import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import TopNavigation from './components/TopNavigation';
import RequireAuth from './components/RequireAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import CompanyList from './pages/CompanyList';
import CompanyForm from './pages/CompanyForm';
import CompanyProfile from './pages/CompanyProfile';
import FiscalYears from './pages/FiscalYears';
import ChartOfAccounts from './pages/ChartOfAccounts';
import AccountingPolicies from './pages/AccountingPolicies';
import StatementGeneratorPage from './pages/StatementGenerator';
import CompanyDashboard from './pages/CompanyDashboard';
import RequireCompany from './components/RequireCompany';
import { CompanyProvider, useCompany } from './contexts/CompanyContext';

function App() {
  const { selectedCompany } = useCompany();

  return (
    <AuthProvider>
      <CompanyProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<RequireAuth />}>
              <Route element={<TopNavigation />}>
                <Route path="/companies" element={<CompanyList />} />
                <Route path="/company/new" element={<CompanyForm />} />
                <Route path="/company/:id/edit" element={<CompanyForm />} />

                <Route element={<RequireCompany />}>
                  <Route path="/company/dashboard" element={<CompanyDashboard />} />
                  <Route path="/company/profile" element={<CompanyProfile />} />
                  <Route path="/company/fiscal-years" element={<FiscalYears />} />
                  <Route path="/company/chart-of-accounts" element={<ChartOfAccounts />} />
                  <Route path="/company/accounting-policies" element={<AccountingPolicies />} />
                  <Route path="/company/statements" element={<StatementGeneratorPage />} />
                </Route>
              </Route>
            </Route>
            
            <Route path="/" element={<Navigate to= {selectedCompany ? "/company/dashboard" : "/companies"} replace />} />
          </Routes>
        </div>
        </Router>
      </CompanyProvider>
    </AuthProvider>
  );  
}

export default App;