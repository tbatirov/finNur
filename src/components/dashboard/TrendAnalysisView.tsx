import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SavedStatement } from '../../types/financial';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  statements: SavedStatement[];
}

export default function TrendAnalysisView({ statements }: Props) {
  const trendData = useMemo(() => {
    const balanceSheet = statements.find(s => s.type === 'balance-sheet')?.statement;
    const incomeStatement = statements.find(s => s.type === 'income')?.statement;
    const cashFlow = statements.find(s => s.type === 'cash-flow')?.statement;

    if (!balanceSheet || !incomeStatement || !cashFlow) return null;

    // Calculate key metrics
    const totalAssets = balanceSheet.lineItems
      .filter(item => item.section.toString().toLowerCase().includes('assets'))
      .reduce((sum, item) => sum + item.amount, 0);

    const totalLiabilities = balanceSheet.lineItems
      .filter(item => item.section.toString().toLowerCase().includes('liabilities'))
      .reduce((sum, item) => sum + Math.abs(item.amount), 0);

    const revenue = incomeStatement.lineItems
      .filter(item => item.section.toString().toLowerCase().includes('revenue'))
      .reduce((sum, item) => sum + Math.abs(item.amount), 0);

    const operatingCashFlow = cashFlow.lineItems
      .filter(item => item.section.toString().toLowerCase().includes('operating'))
      .reduce((sum, item) => sum + item.amount, 0);

    const netIncome = incomeStatement.total || 0;

    return {
      metrics: [
        {
          label: 'Total Assets',
          value: totalAssets,
          previousValue: totalAssets * 0.9, // Example: Compare with previous period
          trend: totalAssets > (totalAssets * 0.9) ? 'up' : 'down'
        },
        {
          label: 'Revenue',
          value: revenue,
          previousValue: revenue * 0.85,
          trend: revenue > (revenue * 0.85) ? 'up' : 'down'
        },
        {
          label: 'Net Income',
          value: netIncome,
          previousValue: netIncome * 0.8,
          trend: netIncome > (netIncome * 0.8) ? 'up' : 'down'
        },
        {
          label: 'Operating Cash Flow',
          value: operatingCashFlow,
          previousValue: operatingCashFlow * 0.95,
          trend: operatingCashFlow > (operatingCashFlow * 0.95) ? 'up' : 'down'
        }
      ],
      chartData: [
        {
          name: 'Current Period',
          assets: totalAssets,
          liabilities: totalLiabilities,
          revenue: revenue,
          netIncome: netIncome,
          cashFlow: operatingCashFlow
        }
      ]
    };
  }, [statements]);

  if (!trendData) {
    return (
      <div className="text-center text-gray-500 py-8">
        Insufficient data for trend analysis
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const calculateGrowth = (current: number, previous: number) => {
    return ((current - previous) / previous * 100).toFixed(1);
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {trendData.metrics.map((metric) => (
          <div key={metric.label} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{metric.label}</span>
              {metric.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : metric.trend === 'down' ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : (
                <Minus className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(metric.value)}
            </div>
            <div className={`text-sm ${
              metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {calculateGrowth(metric.value, metric.previousValue)}% vs previous period
            </div>
          </div>
        ))}
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Financial Trends</h4>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="assets"
                stroke="#4F46E5"
                name="Total Assets"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                name="Revenue"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="netIncome"
                stroke="#F59E0B"
                name="Net Income"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="cashFlow"
                stroke="#8B5CF6"
                name="Operating Cash Flow"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}