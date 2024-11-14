import React from 'react';
import { SavedStatement } from '../../types/financial';

interface Props {
  statements1: SavedStatement[];
  statements2: SavedStatement[];
  period1Label: string;
  period2Label: string;
}

interface ComparisonRow {
  description: string;
  value1: number;
  value2: number;
  change: number;
}

export default function ComparisonTable({ statements1, statements2, period1Label, period2Label }: Props) {
  const getStatementByType = (statements: SavedStatement[], type: string) => {
    return statements.find(s => s.type === type);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateComparison = (): ComparisonRow[] => {
    const comparison: ComparisonRow[] = [];

    // Balance Sheet Comparisons
    const bs1 = getStatementByType(statements1, 'balance-sheet');
    const bs2 = getStatementByType(statements2, 'balance-sheet');
    if (bs1 && bs2) {
      const totalAssets1 = bs1.lineItems
        .filter(item => item.section.toLowerCase().includes('assets'))
        .reduce((sum, item) => sum + item.amount, 0);
      const totalAssets2 = bs2.lineItems
        .filter(item => item.section.toLowerCase().includes('assets'))
        .reduce((sum, item) => sum + item.amount, 0);

      comparison.push({
        description: 'Total Assets',
        value1: totalAssets1,
        value2: totalAssets2,
        change: ((totalAssets2 - totalAssets1) / totalAssets1) * 100
      });
    }

    // Income Statement Comparisons
    const is1 = getStatementByType(statements1, 'income');
    const is2 = getStatementByType(statements2, 'income');
    if (is1 && is2) {
      const revenue1 = is1.lineItems
        .filter(item => item.section.toLowerCase().includes('revenue'))
        .reduce((sum, item) => sum + item.amount, 0);
      const revenue2 = is2.lineItems
        .filter(item => item.section.toLowerCase().includes('revenue'))
        .reduce((sum, item) => sum + item.amount, 0);

      comparison.push({
        description: 'Revenue',
        value1: revenue1,
        value2: revenue2,
        change: ((revenue2 - revenue1) / revenue1) * 100
      });

      comparison.push({
        description: 'Net Income',
        value1: is1.total,
        value2: is2.total,
        change: ((is2.total - is1.total) / is1.total) * 100
      });
    }

    // Cash Flow Comparisons
    const cf1 = getStatementByType(statements1, 'cash-flow');
    const cf2 = getStatementByType(statements2, 'cash-flow');
    if (cf1 && cf2) {
      const operatingCash1 = cf1.lineItems
        .filter(item => item.section.toLowerCase().includes('operating'))
        .reduce((sum, item) => sum + item.amount, 0);
      const operatingCash2 = cf2.lineItems
        .filter(item => item.section.toLowerCase().includes('operating'))
        .reduce((sum, item) => sum + item.amount, 0);

      comparison.push({
        description: 'Operating Cash Flow',
        value1: operatingCash1,
        value2: operatingCash2,
        change: ((operatingCash2 - operatingCash1) / operatingCash1) * 100
      });
    }

    return comparison;
  };

  const comparisonData = calculateComparison();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Period Comparison</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metric
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {period1Label}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {period2Label}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comparisonData.map((row, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                  {formatCurrency(row.value1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                  {formatCurrency(row.value2)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                  row.change > 0 ? 'text-green-600' : row.change < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {row.change > 0 ? '+' : ''}{row.change.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}