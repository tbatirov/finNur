import React from 'react';
import { TrendingUp, DollarSign, PieChart, ArrowUpRight } from 'lucide-react';
import { SavedStatement } from '../../types/financial';

interface Props {
  statements: SavedStatement[];
}

export default function FinancialMetrics({ statements }: Props) {
  const calculateMetrics = () => {
    const balanceSheet = statements.find(s => s.type === 'balance-sheet')?.statement;
    const incomeStatement = statements.find(s => s.type === 'income')?.statement;
    const cashFlow = statements.find(s => s.type === 'cash-flow')?.statement;

    // Calculate total assets from balance sheet
    const totalAssets = balanceSheet?.lineItems
      .filter(item => item.section.toString().toLowerCase().includes('assets'))
      .reduce((sum, item) => sum + item.amount, 0) || 0;

    // Calculate revenue from income statement
    const revenue = incomeStatement?.lineItems
      .filter(item => item.section.toString().toLowerCase().includes('revenue'))
      .reduce((sum, item) => sum + item.amount, 0) || 0;

    // Calculate operating cash flow
    const operatingCashFlow = cashFlow?.lineItems
      .filter(item => item.section.toString().toLowerCase().includes('operating'))
      .reduce((sum, item) => sum + item.amount, 0) || 0;

    // Calculate net income (total from income statement)
    const netIncome = incomeStatement?.total || 0;

    // Calculate profit margin
    const profitMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0;

    return {
      totalAssets,
      revenue,
      operatingCashFlow,
      profitMargin
    };
  };

  const metrics = calculateMetrics();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(amount);
  };

  if (!statements.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Financial Metrics</h3>
        <p className="text-gray-500 text-center">No statements available for this period</p>
      </div>
    );
  }

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
            <span className="text-xs font-medium text-yellow-600">Operating Cash Flow</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.operatingCashFlow)}</p>
        </div>
      </div>
    </div>
  );
}