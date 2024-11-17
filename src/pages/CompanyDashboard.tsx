import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, AlertCircle } from 'lucide-react';
import PeriodSelector from '../components/dashboard/PeriodSelector';
import FinancialMetrics from '../components/dashboard/FinancialMetrics';
import TrendAnalysis from '../components/dashboard/TrendAnalysis';
import RatioAnalysis from '../components/dashboard/RatioAnalysis';
import SavedStatements from '../components/dashboard/SavedStatements';
import { SavedStatement, GeneratedStatement } from '../types/financial';
import { useCompany } from '../contexts/CompanyContext';
import { getFiscalYears } from '../services/api/fiscal-years';
import { supabase } from '../config/client';

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [statements, setStatements] = useState<SavedStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedCompany } = useCompany();

  const transformStatementData = (rawData: any[]): SavedStatement[] => {
    if (!Array.isArray(rawData)) {
      console.error('Invalid rawData:', rawData);
      return [];
    }

    return rawData.map(item => {
      try {
        // Extract each statement type from the data object
        const statements: SavedStatement[] = [];
        const data = item.data;

        // Process each statement type
        for (const type of ['balance-sheet', 'income', 'cash-flow', 'pnl']) {
          if (data[type]) {
            statements.push({
              id: `${item.id}-${type}`,
              type,
              statement: {
                lineItems: data[type].lineItems || [],
                subtotals: data[type].subtotals || [],
                total: data[type].total || 0,
                validations: data[type].validations || [],
                corrections: data[type].corrections || []
              },
              createdAt: item.created_at,
              updatedAt: item.updated_at
            });
          }
        }

        return statements;
      } catch (err) {
        console.error('Error processing statement:', err, item);
        return [];
      }
    }).flat().filter(Boolean);
  };

  useEffect(() => {
    const loadFiscalYears = async () => {
      if (!selectedCompany) {
        navigate('/companies');
        return;
      }

      try {
        setLoading(true);
        const years = await getFiscalYears(selectedCompany.id);
        setFiscalYears(years);
        
        if (years.length > 0) {
          const defaultYear = years[0].id;
          setSelectedYear(defaultYear);
          
          const { data: statementsData, error: statementsError } = await supabase
            .from('statements')
            .select('*')
            .eq('company_id', selectedCompany.id)
            .eq('fiscal_year_id', defaultYear)
            .eq('month', selectedMonth);

          if (statementsError) throw statementsError;
          
          if (statementsData) {
            console.log('Raw statements data:', statementsData);
            const transformedStatements = transformStatementData(statementsData);
            console.log('Transformed statements:', transformedStatements);
            setStatements(transformedStatements);
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadFiscalYears();
  }, [selectedCompany, navigate]);

  useEffect(() => {
    const loadStatements = async () => {
      if (!selectedCompany?.id || !selectedYear) return;

      try {
        setLoading(true);
        const { data: statementsData, error: statementsError } = await supabase
          .from('statements')
          .select('*')
          .eq('company_id', selectedCompany.id)
          .eq('fiscal_year_id', selectedYear)
          .eq('month', selectedMonth);

        if (statementsError) throw statementsError;

        if (statementsData) {
          console.log('Raw statements data:', statementsData);
          const transformedStatements = transformStatementData(statementsData);
          console.log('Transformed statements:', transformedStatements);
          setStatements(transformedStatements);
        }
      } catch (err) {
        console.error('Error loading statements:', err);
        setError(err instanceof Error ? err.message : 'Failed to load statements');
      } finally {
        setLoading(false);
      }
    };

    if (selectedCompany && selectedYear) {
      loadStatements();
    }
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
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">{selectedCompany.name}</h1>
        </div>
        <p className="text-gray-500">Tax ID: {selectedCompany.tax_id}</p>
      </div>

      <div className="mb-8">
        <PeriodSelector
          fiscalYears={fiscalYears}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <SavedStatements statements={statements} />
        <FinancialMetrics statements={statements} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TrendAnalysis statements={statements} />
          <RatioAnalysis statements={statements} />
        </div>
      </div>
    </div>
  );
}