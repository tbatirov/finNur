import React from 'react';
import { TrendingUp, DollarSign, PieChart, ArrowUpRight } from 'lucide-react';
import { SavedStatement } from '../../types/financial';

interface Props {
  statements: SavedStatement[];
}

export default function FinancialMetrics({ statements }: Props) {
  const calculateMetrics = () => {
    const balanceSheet = statements.find(s => s.type === 'balance-sheet');
    const incomeStatement = statements.find(s => s.type === 'income');
    const cashFlow = statements.find(s => s.type === 'cash-flow');

    return {
      totalAssets: balanceSheet?.statement.total || 0,
      revenue: incomeStatement?.statement.lineItems
        .filter(item => item.section.startsWith('revenue'))
        .reduce((sum, item) => sum + item.amount, 0) || 0,
      cashBalance: cashFlow?.statement.total || 0,
      profitMargin: incomeStatement ? 
        (incomeStatement.statement.total / 
          incomeStatement.statement.lineItems
            .filter(item => item.section.startsWith('revenue'))
            .reduce((sum, item) => sum + item.amount, 0)) * 100 : 0
    };
  };

  const metrics = calculateMetrics();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Financial Metrics</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-blue-600">Total Assets</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalAssets)}</p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-green-600">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.revenue)}</p>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <PieChart className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-medium text-purple-600">Profit Margin</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {metrics.profitMargin.toFixed(1)}%
          </p>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <ArrowUpRight className="w-5 h-5 text-yellow-600" />
            <span className="text-xs font-medium text-yellow-600">Cash Balance</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.cashBalance)}</p>
        </div>
      </div>
    </div>
  );
}