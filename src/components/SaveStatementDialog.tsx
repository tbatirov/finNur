import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { GeneratedStatement, StatementType, FiscalYear } from '../types/financial';
import { saveStatement } from '../services/statement-storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  statement: GeneratedStatement;
  type: StatementType;
  fiscalYears: FiscalYear[];
  onSave: () => void;
}

export default function SaveStatementDialog({ 
  isOpen, 
  onClose, 
  statement, 
  type,
  fiscalYears,
  onSave 
}: Props) {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSave = () => {
    try {
      if (!selectedYear) {
        setError('Please select a fiscal year');
        return;
      }

      saveStatement(statement, selectedYear, type);
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save statement');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Save Statement</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Fiscal Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a fiscal year...</option>
              {fiscalYears
                .filter(year => year.status === 'Active')
                .map(year => (
                  <option key={year.id} value={year.id}>
                    {year.year} ({year.start} to {year.end})
                  </option>
                ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600 mb-4">{error}</p>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              Save Statement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}