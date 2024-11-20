import React, { useState, useMemo, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { SavedStatement, StatementType } from '../../types/financial';
import StaticStatement from '../StaticStatement';
import TrendAnalysisView from './TrendAnalysisView';
import ComprehensiveReport from './ComprehensiveReport';
import RatioAnalysis from './RatioAnalysis';
import { ErrorBoundary } from '../ErrorBoundary';

interface Props {
  statements: SavedStatement[];
}

const STATEMENT_ORDER: StatementType[] = ['balance-sheet', 'income', 'cash-flow', 'pnl'];

function getTabTitle(type: string): string {
  switch (type) {
    case 'balance-sheet':
      return 'Balance Sheet';
    case 'income':
      return 'Income Statement';
    case 'cash-flow':
      return 'Cash Flow Statement';
    case 'pnl':
      return 'Profit & Loss Statement';
    case 'trend':
      return 'Trend Analysis';
    case 'ratios':
      return 'Financial Ratios';
    case 'report':
      return 'Comprehensive Report';
    default:
      return type;
  }
}

export default function SavedStatements({ statements }: Props) {
  const [activeTab, setActiveTab] = useState<string>('');

  // Create memoized tabs array
  const tabs = useMemo(() => {
    const statementTypes = STATEMENT_ORDER;
    const analysisTypes = ['trend', 'ratios', 'report'] as const;
    
    return [
      ...statementTypes.map(type => ({
        id: type,
        label: getTabTitle(type),
        order: STATEMENT_ORDER.indexOf(type)
      })),
      ...analysisTypes.map(type => ({
        id: type,
        label: getTabTitle(type),
        order: STATEMENT_ORDER.length
      }))
    ].sort((a, b) => a.order - b.order);
  }, []);

  // Set initial active tab
  useEffect(() => {
    if (statements.length > 0 && !activeTab) {
      setActiveTab(STATEMENT_ORDER[0]);
    }
  }, [statements, activeTab]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Saved Statements</h3>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex -mb-px space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200
                ${activeTab === tab.id 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent'
                }
                text-gray-500 hover:text-gray-700 hover:border-gray-300
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        <ErrorBoundary>
          {activeTab === 'trend' ? (
            <TrendAnalysisView statements={statements} />
          ) : activeTab === 'ratios' ? (
            <RatioAnalysis statements={statements} />
          ) : activeTab === 'report' ? (
            <ComprehensiveReport statements={statements} />
          ) : activeTab && statements.find(s => s.type === activeTab)?.statement ? (
            <StaticStatement statement={statements.find(s => s.type === activeTab)!.statement} />
          ) : (
            <p className="text-center text-gray-500">Select a statement type to view</p>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}