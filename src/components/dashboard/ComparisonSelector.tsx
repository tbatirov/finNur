import React, { useState } from 'react';
import { Scale, ChevronDown } from 'lucide-react';
import { FiscalYear, SavedStatement } from '../../types/financial';
import { getMonthlyStatements } from '../../services/statement-storage';

interface Period {
  fiscalYear: string;
  month: number;
}

interface Props {
  fiscalYears: FiscalYear[];
  onCompare: (statements1: SavedStatement[], statements2: SavedStatement[]) => void;
}

export default function ComparisonSelector({ fiscalYears, onCompare }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [period1, setPeriod1] = useState<Period>({ fiscalYear: '', month: 1 });
  const [period2, setPeriod2] = useState<Period>({ fiscalYear: '', month: 1 });

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2024, i).toLocaleString('default', { month: 'long' })
  }));

  const handleCompare = () => {
    if (!period1.fiscalYear || !period2.fiscalYear) return;

    const statements1 = getMonthlyStatements(period1.fiscalYear, period1.month);
    const statements2 = getMonthlyStatements(period2.fiscalYear, period2.month);
    onCompare(statements1, statements2);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <Scale className="w-4 h-4" />
        Compare Periods
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Compare Statements</h3>

          {/* Period 1 */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">Period 1</label>
            <div className="flex gap-2">
              <select
                value={period1.fiscalYear}
                onChange={(e) => setPeriod1({ ...period1, fiscalYear: e.target.value })}
                className="flex-1 text-sm rounded-md border-gray-300"
              >
                <option value="">Select Year...</option>
                {fiscalYears.map(year => (
                  <option key={year.id} value={year.id}>
                    FY {year.year}
                  </option>
                ))}
              </select>
              <select
                value={period1.month}
                onChange={(e) => setPeriod1({ ...period1, month: parseInt(e.target.value) })}
                className="flex-1 text-sm rounded-md border-gray-300"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Period 2 */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">Period 2</label>
            <div className="flex gap-2">
              <select
                value={period2.fiscalYear}
                onChange={(e) => setPeriod2({ ...period2, fiscalYear: e.target.value })}
                className="flex-1 text-sm rounded-md border-gray-300"
              >
                <option value="">Select Year...</option>
                {fiscalYears.map(year => (
                  <option key={year.id} value={year.id}>
                    FY {year.year}
                  </option>
                ))}
              </select>
              <select
                value={period2.month}
                onChange={(e) => setPeriod2({ ...period2, month: parseInt(e.target.value) })}
                className="flex-1 text-sm rounded-md border-gray-300"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleCompare}
              disabled={!period1.fiscalYear || !period2.fiscalYear}
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Compare
            </button>
          </div>
        </div>
      )}
    </div>
  );
}