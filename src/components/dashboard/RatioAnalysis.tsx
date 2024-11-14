import React from 'react';
import { Calculator } from 'lucide-react';
import { SavedStatement } from '../../types/financial';

interface Props {
  statements: SavedStatement[];
}

export default function RatioAnalysis({ statements }: Props) {
  const calculateRatios = () => {
    const balanceSheet = statements.find(s => s.type === 'balance-sheet')?.statement;
    const incomeStatement = statements.find(s => s.type === 'income')?.statement;

    if (!balanceSheet || !incomeStatement) return null;

    const currentAssets = balanceSheet.lineItems
      .filter(item => item.section.startsWith('assets_current'))
      .reduce((sum, item) => sum + item.amount, 0);

    const currentLiabilities = balanceSheet.lineItems
      .filter(item => item.section.startsWith('liabilities_current'))
      .reduce((sum, item) => sum + item.amount, 0);

    const totalAssets = balanceSheet.total;
    const totalLiabilities = balanceSheet.lineItems
      .filter(item => item.section.startsWith('liabilities'))
      .reduce((sum, item) => sum + item.amount, 0);

    const revenue = incomeStatement.lineItems
      .filter(item => item.section.startsWith('revenue'))
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      currentRatio: currentAssets / currentLiabilities,
      debtToEquity: totalLiabilities / (totalAssets - totalLiabilities),
      returnOnAssets: (incomeStatement.total / totalAssets) * 100,
      profitMargin: (incomeStatement.total / revenue) * 100
    };
  };

  const ratios = calculateRatios();

  if (!ratios) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Ratio Analysis</h3>
        </div>
        <p className="text-gray-500">Insufficient data for ratio analysis</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Ratio Analysis</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Current Ratio</h4>
          <p className="text-xl font-semibold text-gray-900">{ratios.currentRatio.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Liquidity measure</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Debt to Equity</h4>
          <p className="text-xl font-semibold text-gray-900">{ratios.debtToEquity.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Leverage measure</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Return on Assets</h4>
          <p className="text-xl font-semibold text-gray-900">{ratios.returnOnAssets.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Profitability measure</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Profit Margin</h4>
          <p className="text-xl font-semibold text-gray-900">{ratios.profitMargin.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Efficiency measure</p>
        </div>
      </div>
    </div>
  );
}