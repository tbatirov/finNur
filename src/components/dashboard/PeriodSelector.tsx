import React from 'react';
import { CalendarDays } from 'lucide-react';

interface Props {
  fiscalYears: any[];
  selectedYear: string;
  selectedMonth: number;
  onYearChange: (year: string) => void;
  onMonthChange: (month: number) => void;
}

export default function PeriodSelector({
  fiscalYears,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange
}: Props) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = fiscalYears.find(fy => fy.id === selectedYear);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Period Selection</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fiscal Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select fiscal year...</option>
            {fiscalYears.map((fy) => (
              <option key={fy.id} value={fy.id}>
                {fy.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={!selectedYear}
          >
            {months.map((month, index) => (
              <option key={index} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentYear && (
        <div className="mt-4 text-sm text-gray-500">
          Selected period: {months[selectedMonth - 1]} {currentYear.name}
        </div>
      )}
    </div>
  );
}