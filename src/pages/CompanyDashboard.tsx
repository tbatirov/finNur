import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, AlertCircle } from 'lucide-react';
import PeriodSelector from '../components/dashboard/PeriodSelector';
import FinancialMetrics from '../components/dashboard/FinancialMetrics';
import TrendAnalysis from '../components/dashboard/TrendAnalysis';
import RatioAnalysis from '../components/dashboard/RatioAnalysis';
import { SavedStatement } from '../types/financial';
import { useCompany } from '../contexts/CompanyContext';
import { getFiscalYears } from '../services/api/fiscal-years';
import { getStatements } from '../services/api/statements';

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [statements, setStatements] = useState<SavedStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedCompany } = useCompany();

  // Load fiscal years when company changes
  useEffect(() => {
    const loadFiscalYears = async () => {
      if (!selectedCompany) {
        navigate('/companies');
        return;
      }

      try {
        setLoading(true);
        const years = await getFiscalYears(selectedCompany.id);
        console.log('Loaded fiscal years:', years); // Debug log
        setFiscalYears(years);

        // Select first year by default if none selected
        if (years.length > 0 && !selectedYear) {
          setSelectedYear(years[0].id);
        }
      } catch (err) {
        console.error('Error loading fiscal years:', err);
        setError('Failed to load fiscal years');
      } finally {
        setLoading(false);
      }
    };

    loadFiscalYears();
  }, [selectedCompany, navigate]);

  // Load statements when period changes
  useEffect(() => {
    const loadStatements = async () => {
      if (!selectedCompany?.id || !selectedYear) {
        setStatements([]);
        return;
      }

      try {
        setLoading(true);
        console.log('Loading statements for:', { 
          companyId: selectedCompany.id,
          yearId: selectedYear,
          month: selectedMonth 
        });

        const data = await getStatements(
          selectedCompany.id,
          selectedYear,
          selectedMonth
        );

        console.log('Loaded statements:', data);
        setStatements(data || []);
      } catch (err) {
        console.error('Error loading statements:', err);
        setError('Failed to load statements');
      } finally {
        setLoading(false);
      }
    };

    loadStatements();
  }, [selectedCompany?.id, selectedYear, selectedMonth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertCircle className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Error</h2>
        </div>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!selectedCompany) {
    return (
      <div className="p-6 bg-yellow-50 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-600">
          <AlertCircle className="w-5 h-5" />
          <p>Please select a company to view the dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Company Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">{selectedCompany.name}</h1>
        </div>
        <p className="text-gray-500">Tax ID: {selectedCompany.tax_id}</p>
      </div>

      {/* Period Selector */}
      <div className="mb-8">
        <PeriodSelector
          fiscalYears={fiscalYears}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
        />
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 gap-8">
        <FinancialMetrics statements={statements} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TrendAnalysis statements={statements} />
          <RatioAnalysis statements={statements} />
        </div>
      </div>
    </div>
  );
}