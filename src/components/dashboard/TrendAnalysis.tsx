import React from 'react';
import { LineChart, TrendingUp } from 'lucide-react';
import { SavedStatement } from '../../types/financial';

interface Props {
  statements: SavedStatement[];
}

export default function TrendAnalysis({ statements }: Props) {
  const calculateTrends = () => {
    const balanceSheet = statements.find(s => s.type === 'balance-sheet')?.statement;
    const incomeStatement = statements.find(s => s.type === 'income')?.statement;

    if (!balanceSheet?.lineItems || !incomeStatement?.lineItems) {
      return null;
    }

    return {
      assetGrowth: {
        current: balanceSheet.lineItems
          .filter(item => item.section.startsWith('assets_current'))
          .reduce((sum, item) => sum + item.amount, 0),
        total: balanceSheet.total || 0
      },
      profitability: {
        grossProfit: incomeStatement.lineItems
          .filter(item => item.section.startsWith('revenue'))
          .reduce((sum, item) => sum + item.amount, 0) -
          incomeStatement.lineItems
          .filter(item => item.section.startsWith('costOfSales'))
          .reduce((sum, item) => sum + item.amount, 0),
        netIncome: incomeStatement.total || 0
      }
    };
  };

  const trends = calculateTrends();

  if (!trends) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <LineChart className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Trend Analysis</h3>
        </div>
        <p className="text-gray-500 text-center py-4">
          Insufficient data for trend analysis
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <LineChart className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Trend Analysis</h3>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Asset Composition</h4>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-blue-600">
                  Current Assets
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {((trends.assetGrowth.current / trends.assetGrowth.total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
              <div
                style={{ width: `${(trends.assetGrowth.current / trends.assetGrowth.total) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Profitability</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600">Gross Profit</span>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-lg font-semibold mt-1">
                {formatCurrency(trends.profitability.grossProfit)}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600">Net Income</span>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-lg font-semibold mt-1">
                {formatCurrency(trends.profitability.netIncome)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}