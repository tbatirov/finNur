import React from 'react';
import { StatementType } from '../types/financial';
import { FileSpreadsheet, DollarSign, ArrowDownUp, LayoutDashboard } from 'lucide-react';

interface Props {
  activeStatement: StatementType;
  onStatementChange: (type: StatementType) => void;
}

export default function Navigation({ activeStatement, onStatementChange }: Props) {
  const navItems = [
    {
      type: 'balance-sheet' as StatementType,
      label: 'Balance Sheet',
      icon: LayoutDashboard
    },
    {
      type: 'income' as StatementType,
      label: 'Income Statement',
      icon: FileSpreadsheet
    },
    {
      type: 'cash-flow' as StatementType,
      label: 'Cash Flow',
      icon: ArrowDownUp
    },
    {
      type: 'pnl' as StatementType,
      label: 'P&L',
      icon: DollarSign
    }
  ];

  return (
    <nav className="bg-white rounded-lg shadow-sm">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="hidden md:block w-full">
            <div className="flex space-x-4">
              {navItems.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => onStatementChange(type)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeStatement === type
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="md:hidden w-full">
            <select
              value={activeStatement}
              onChange={(e) => onStatementChange(e.target.value as StatementType)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {navItems.map(({ type, label }) => (
                <option key={type} value={type}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
}