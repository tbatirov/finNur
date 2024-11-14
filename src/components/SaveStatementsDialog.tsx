import React, { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { Company, FiscalYear } from '../types/company';
import { GeneratedStatement } from '../types/financial';
import { getFiscalYears } from '../services/api/fiscal-years';
import { saveStatement, getStatements } from '../services/api/statements';
import { useCompany } from '../contexts/CompanyContext';


interface Props {
  statements: Record<string, GeneratedStatement>;
  type: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SaveStatementsDialog({ statements, type, onClose, onSuccess }: Props) {
  // const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExisting, setHasExisting] = useState(false);
  const { companies } = useCompany();

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [companiesList, activeCompany] = await Promise.all([
          companies,
          selectedCompany
        ]);
        
        // setCompanies(companiesList);
        
        if (selectedCompany) {
          const years = await getFiscalYears(selectedCompany?.id || '');
          setFiscalYears(years || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadFiscalYears = async () => {
      if (selectedCompany) {
        const years = await getFiscalYears(selectedCompany.id);
        setFiscalYears(years || []);
        setSelectedYear('');
      }
    };

    loadFiscalYears();
  }, [selectedCompany]);

  useEffect(() => {
    const checkStatements = async () => {
      if (!selectedCompany || !selectedYear || !selectedMonth) return;

      try {
        const exists = await getStatements(
          selectedCompany.id,
          selectedYear,
          parseInt(selectedMonth)
        );
        setHasExisting(exists.length > 0);
      } catch (err) {
        console.error('Failed to check existing statements:', err);
      }
    };

    checkStatements();
  }, [selectedCompany, selectedYear, selectedMonth]);

  const handleSave = async () => {
    if (!selectedCompany || !selectedYear || !selectedMonth) {
      setError('Please select all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await saveStatement({
        company_id: selectedCompany.id,
        fiscal_year_id: selectedYear,
        month: parseInt(selectedMonth),
        data: statements,
        type: type
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save statements');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-2 mb-6">
          <Save className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Save Statements</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 rounded-lg mb-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Company Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <select
                value={selectedCompany?.id || ''}
                onChange={(e) => {
                  const company = companies.find(c => c.id === e.target.value);
                  setSelectedCompany(company || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fiscal Year Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fiscal Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={!selectedCompany}
              >
                <option value="">Select fiscal year</option>
                {fiscalYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={!selectedYear}
              >
                <option value="">Select month</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {hasExisting && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-700">
                  Warning: Statements already exist for this period. Saving will overwrite existing data.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !selectedCompany || !selectedYear || !selectedMonth}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}