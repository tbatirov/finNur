import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { SavedStatement } from '../../types/financial';
import StaticStatement from '../StaticStatement';

interface Props {
  statements: SavedStatement[];
}

export default function SavedStatements({ statements }: Props) {
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    if (statements.length > 0 && !activeTab) {
      setActiveTab(statements[0].type);
    }
  }, [statements, activeTab]);

  const getTabTitle = (type: string) => {
    switch (type) {
      case 'balance-sheet': return 'Balance Sheet';
      case 'income': return 'Income Statement';
      case 'cash-flow': return 'Cash Flow';
      case 'pnl': return 'Profit & Loss';
      default: return type;
    }
  };

  if (!statements || statements.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Saved Statements</h3>
        </div>
        <p className="text-gray-500 text-center">No statements available for this period</p>
      </div>
    );
  }

  console.log('Available statements:', statements);
  console.log('Active tab:', activeTab);

  const activeStatement = statements.find(s => s.type === activeTab);
  console.log('Active statement:', activeStatement);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Saved Statements</h3>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex -mb-px space-x-8">
          {statements.map((statement) => (
            <button
              key={statement.type}
              onClick={() => setActiveTab(statement.type)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === statement.type
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {getTabTitle(statement.type)}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeStatement?.statement ? (
          <StaticStatement statement={activeStatement.statement} />
        ) : (
          <p className="text-center text-gray-500">Select a statement type to view</p>
        )}
      </div>
    </div>
  );
}