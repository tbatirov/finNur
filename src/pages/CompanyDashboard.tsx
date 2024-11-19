import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, AlertCircle } from 'lucide-react';
import PeriodSelector from '../components/dashboard/PeriodSelector';
import SavedStatements from '../components/dashboard/SavedStatements';
import { SavedStatement, StatementType } from '../types/financial';
import { useCompany } from '../contexts/CompanyContext';
import { getFiscalYears } from '../services/api/fiscal-years';
import { getStatements } from '../services/api/statements';
import { supabase } from '../config/client';

const VALIDATION_DURATION = 15000; // 15 seconds per statement
const VALIDATION_INTERVAL = 100; // Progress update interval
const STATEMENT_ORDER: StatementType[] = ['balance-sheet', 'income', 'cash-flow', 'pnl'];

interface ValidationState {
  timer: NodeJS.Timer | null;
  currentType: StatementType | null;
}

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [statements, setStatements] = useState<SavedStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedCompany } = useCompany();

  // Validation state
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [currentValidatingType, setCurrentValidatingType] = useState<StatementType | null>(null);
  const [canSave, setCanSave] = useState(false);
  const validationRef = useRef<ValidationState>({ timer: null, currentType: null });

  const transformStatementData = (rawData: any[]): SavedStatement[] => {
    if (!Array.isArray(rawData)) {
      console.error('Invalid rawData:', rawData);
      return [];
    }

    return rawData
      .map((item) => {
        try {
          const statements: SavedStatement[] = [];
          const data = item.data;

          for (const type of ['balance-sheet', 'income', 'cash-flow', 'pnl']) {
            if (data[type]) {
              statements.push({
                id: `${item.id}-${type}`,
                type: type as StatementType,
                statement: {
                  lineItems: data[type].lineItems || [],
                  subtotals: data[type].subtotals || [],
                  total: data[type].total || 0,
                  validations: data[type].validations || [],
                  corrections: data[type].corrections || [],
                },
                createdAt: item.created_at,
                updatedAt: item.updated_at,
              });
            }
          }

          return statements;
        } catch (err) {
          console.error('Error processing statement:', err, item);
          return [];
        }
      })
      .flat()
      .filter(Boolean);
  };

  const startValidationSequence = useCallback((startType: StatementType) => {
    // Clear any existing validation
    if (validationRef.current.timer) {
      clearInterval(validationRef.current.timer);
    }

    setCanSave(false);
    setIsValidating(true);
    setCurrentValidatingType(startType);
    setValidationProgress(0);
    validationRef.current.currentType = startType;

    const startTime = Date.now();
    validationRef.current.timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / VALIDATION_DURATION) * 100, 100);
      setValidationProgress(progress);

      if (progress >= 100) {
        clearInterval(validationRef.current.timer!);
        validationRef.current.timer = null;
        
        const currentIndex = STATEMENT_ORDER.indexOf(startType);
        const nextIndex = currentIndex + 1;

        if (nextIndex < STATEMENT_ORDER.length) {
          // Start validating next statement after a short delay
          setTimeout(() => {
            startValidationSequence(STATEMENT_ORDER[nextIndex]);
          }, 1000);
        } else {
          // All statements validated
          setIsValidating(false);
          setCurrentValidatingType(null);
          validationRef.current.currentType = null;
          setCanSave(true);
        }
      }
    }, VALIDATION_INTERVAL);

    return () => {
      if (validationRef.current.timer) {
        clearInterval(validationRef.current.timer);
        validationRef.current.timer = null;
      }
    };
  }, []);

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

          const { data: statementsData, error: statementsError } =
            await supabase
              .from('statements')
              .select('*')
              .eq('company_id', selectedCompany.id)
              .eq('fiscal_year_id', defaultYear)
              .eq('month', selectedMonth);

          if (statementsError) throw statementsError;

          if (statementsData) {
            const transformedStatements = transformStatementData(statementsData);
            setStatements(transformedStatements);
            // Start validation sequence with first statement type
            startValidationSequence('balance-sheet');
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

    // Cleanup validation on unmount
    return () => {
      if (validationRef.current.timer) {
        clearInterval(validationRef.current.timer);
      }
    };
  }, [selectedCompany, navigate, startValidationSequence]);

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
          const transformedStatements = transformStatementData(statementsData);
          setStatements(transformedStatements);
          // Start validation sequence with first statement type
          startValidationSequence('balance-sheet');
        }
      } catch (err) {
        console.error('Error loading statements:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load statements'
        );
      } finally {
        setLoading(false);
      }
    };

    loadStatements();
  }, [selectedCompany?.id, selectedYear, selectedMonth, startValidationSequence]);

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
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedCompany.name}
          </h1>
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
        <SavedStatements 
          statements={statements}
          isValidating={isValidating}
          validationProgress={validationProgress}
          currentValidatingType={currentValidatingType}
          canSave={canSave}
        />
      </div>
    </div>
  );
}