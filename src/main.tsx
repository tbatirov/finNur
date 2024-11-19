import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import App from './App';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import { CompanyProvider } from './contexts/CompanyContext';
import './index.css';

// Global error handler
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', { message, source, lineno, colno, error });
  return false;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600">
              Please refresh the page or try again later
            </p>
          </div>
        </div>
      }
    >
      <QueryProvider>
        <AuthProvider>
          <CompanyProvider>
            <App />
          </CompanyProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  </StrictMode>
);