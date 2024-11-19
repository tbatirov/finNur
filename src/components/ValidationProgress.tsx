import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { StatementType } from '../types/financial';

interface Props {
  progress: number;
  currentType: StatementType;
  canSave: boolean;
}

function getStatementName(type: StatementType): string {
  switch (type) {
    case 'balance-sheet':
      return 'Balance Sheet';
    case 'income':
      return 'Income Statement';
    case 'cash-flow':
      return 'Cash Flow Statement';
    case 'pnl':
      return 'Profit & Loss Statement';
    default:
      return type;
  }
}

export default function ValidationProgress({ progress, currentType, canSave }: Props) {
  return (
    <div className="bg-blue-50 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-blue-700 min-w-[200px]">
            {canSave 
              ? 'Validation Complete'
              : `Validating ${getStatementName(currentType)}...`
            }
          </span>
          {progress >= 100 && !canSave && currentType !== 'pnl' && (
            <div className="flex items-center gap-1 text-sm text-blue-600 transition-opacity duration-200">
              <ArrowRight className="w-4 h-4" />
              <span>Moving to next statement</span>
            </div>
          )}
        </div>
        <span className="text-sm text-blue-600 min-w-[48px] text-right">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out transform"
          style={{ width: `${progress}%` }}
        />
      </div>
      {canSave && (
        <div className="flex items-center gap-2 mt-2 text-green-600 transition-opacity duration-200">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">All statements validated - Ready to save</span>
        </div>
      )}
    </div>
  );
}