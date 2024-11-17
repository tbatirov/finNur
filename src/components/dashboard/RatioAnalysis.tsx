import React from 'react';
import { Calculator } from 'lucide-react';
import { SavedStatement } from '../../types/financial';

interface Props {
  statements: SavedStatement[];
}

interface Ratio {
  name: string;
  value: number;
  description: string;
  category: string;
}

interface RatioCategory {
  name: string;
  ratios: Ratio[];
}

// Helper function to safely parse account codes
const parseAccountCode = (code: string): number | null => {
  const parsedCode = parseFloat(code);
  return isNaN(parsedCode) ? null : parsedCode;
};

export default function RatioAnalysis({ statements }: Props) {
  const calculateRatios = (): RatioCategory[] => {
    const balanceSheet = statements.find(s => s.type === 'balance-sheet')?.statement;
    const incomeStatement = statements.find(s => s.type === 'income')?.statement;
    const cashFlow = statements.find(s => s.type === 'cash-flow')?.statement;

    if (!balanceSheet?.lineItems || !incomeStatement?.lineItems) {
      console.warn('Missing required statements');
      return [];
    }

    // Asset-related calculations
    const totalAssets = balanceSheet.total;
    const currentAssets = balanceSheet.lineItems
      .filter(item => {
        return item.code >= 1000 && item.code <= 1999; // Adjust based on your actual current asset codes
      })
      .reduce((sum, item) => sum + item.amount, 0);

    const inventory = balanceSheet.lineItems
      .filter(item => {
        return item.code >= 1500 && item.code <= 1599; // Adjust based on your actual inventory codes
      })
      .reduce((sum, item) => sum + item.amount, 0);

    const accountsReceivable = balanceSheet.lineItems
      .filter(item => {
        return item.code >= 1200 && item.code <= 1299; // Adjust based on your actual receivable codes
      })
      .reduce((sum, item) => sum + item.amount, 0);

    // Liability-related calculations
    const totalLiabilities = balanceSheet.lineItems
      .filter(item => {
        return item.code >= 2000 && item.code <= 2999; // Adjust based on your actual liability codes
      })
      .reduce((sum, item) => sum + item.amount, 0);

    const currentLiabilities = balanceSheet.lineItems
      .filter(item => {
        return item.code >= 2000 && item.code <= 2499; // Adjust based on your actual current liability codes
      })
      .reduce((sum, item) => sum + item.amount, 0);

    // Income statement calculations
    const revenue = incomeStatement.lineItems
      .filter(item => {
        return item.code >= 4000 && item.code <= 4099; // Adjust based on your actual revenue codes
      })
      .reduce((sum, item) => sum + item.amount, 0);

    const costOfSales = incomeStatement.lineItems
      .filter(item => {
        return item.code >= 5000 && item.code <= 5099; // Adjust based on your actual cost of sales codes
      })
      .reduce((sum, item) => sum + item.amount, 0);

    const grossProfit = revenue - costOfSales;
    const operatingExpenses = incomeStatement.lineItems
      .filter(item => {
        return item.code >= 5100 && item.code <= 5199; // Adjust based on your actual operating expenses codes
      })
      .reduce((sum, item) => sum + item.amount, 0);

    const operatingIncome = grossProfit - operatingExpenses;
    const netIncome = incomeStatement.total;

    // Cash flow calculations
    const operatingCashFlow = cashFlow?.lineItems
      .filter(item => {
        return item.code >= 4000 && item.code <= 4999; // Adjust based on your actual operating cash flow codes
      })
      .reduce((sum, item) => sum + item.amount, 0) || 0;

    // Equity calculation
    const equity = totalAssets - totalLiabilities;

    console.log('currentAssets', currentAssets)
    console.log('totalAssets', totalAssets)
    console.log('totalLiabilities', totalLiabilities)
    console.log('operatingCashFlow', operatingCashFlow)
    console.log('revenue', revenue)
    console.log('costOfSales', costOfSales)
    console.log('grossProfit', grossProfit)
    console.log('operatingIncome', operatingIncome)
    console.log('netIncome', netIncome)
    console.log('currentLiabilities', currentLiabilities)
    console.log('totalLiabilities', totalLiabilities)
    console.log('totalAssets', totalAssets)
    console.log('equity', equity)

    return [
      {
        name: 'Liquidity Ratios',
        ratios: [
          {
            name: 'Current Ratio',
            value: currentAssets / currentLiabilities,
            description: 'Ability to pay short-term obligations',
            category: 'liquidity'
          },
          {
            name: 'Quick Ratio',
            value: (currentAssets - inventory) / currentLiabilities,
            description: 'Ability to pay short-term obligations without selling inventory',
            category: 'liquidity'
          },
          {
            name: 'Cash Ratio',
            value: (currentAssets - inventory - accountsReceivable) / currentLiabilities,
            description: 'Ability to pay short-term obligations with cash only',
            category: 'liquidity'
          },
          {
            name: 'Working Capital Ratio',
            value: (currentAssets - currentLiabilities) / totalAssets,
            description: 'Efficiency of operating cycle and financial health',
            category: 'liquidity'
          }
        ]
      },
      {
        name: 'Solvency Ratios',
        ratios: [
          {
            name: 'Debt to Equity',
            value: totalLiabilities / equity,
            description: 'Financial leverage and long-term solvency',
            category: 'solvency'
          },
          {
            name: 'Debt Ratio',
            value: totalLiabilities / totalAssets,
            description: 'Portion of assets financed by debt',
            category: 'solvency'
          },
          {
            name: 'Equity Ratio',
            value: equity / totalAssets,
            description: 'Portion of assets financed by shareholders',
            category: 'solvency'
          },
          {
            name: 'Debt Service Coverage',
            value: operatingIncome / totalLiabilities,
            description: 'Ability to service debt with operating income',
            category: 'solvency'
          }
        ]
      },
      {
        name: 'Profitability Ratios',
        ratios: [
          {
            name: 'Gross Margin',
            value: (grossProfit / revenue) * 100,
            description: 'Profitability of core business activities',
            category: 'profitability'
          },
          {
            name: 'Operating Margin',
            value: (operatingIncome / revenue) * 100,
            description: 'Profitability from operations',
            category: 'profitability'
          },
          {
            name: 'Net Profit Margin',
            value: (netIncome / revenue) * 100,
            description: 'Overall profitability after all expenses',
            category: 'profitability'
          },
          {
            name: 'Return on Assets',
            value: (netIncome / totalAssets) * 100,
            description: 'Efficiency of asset utilization',
            category: 'profitability'
          },
          {
            name: 'Return on Equity',
            value: (netIncome / equity) * 100,
            description: 'Return generated for shareholders',
            category: 'profitability'
          }
        ]
      },
      {
        name: 'Efficiency Ratios',
        ratios: [
          {
            name: 'Asset Turnover',
            value: revenue / totalAssets,
            description: 'Efficiency of asset utilization in generating revenue',
            category: 'efficiency'
          },
          {
            name: 'Inventory Turnover',
            value: costOfSales / inventory,
            description: 'Efficiency of inventory management',
            category: 'efficiency'
          },
          {
            name: 'Receivables Turnover',
            value: revenue / accountsReceivable,
            description: 'Efficiency of credit collection',
            category: 'efficiency'
          },
          {
            name: 'Operating Cash Flow Ratio',
            value: operatingCashFlow / currentLiabilities,
            description: 'Ability to cover short-term liabilities with operating cash flow',
            category: 'efficiency'
          }
        ]
      },
      {
        name: 'Market Value Ratios',
        ratios: [
          {
            name: 'Earnings Per Share',
            value: netIncome / totalAssets, // Using total assets as a proxy for shares
            description: 'Profitability on a per-share basis',
            category: 'market'
          },
          {
            name: 'Book Value Per Share',
            value: equity / totalAssets, // Using total assets as a proxy for shares
            description: 'Net asset value on a per-share basis',
            category: 'market'
          }
        ]
      }
    ];
  };

  const ratioCategories = calculateRatios();

  if (ratioCategories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Financial Ratios</h3>
        </div>
        <p className="text-gray-500 text-center">Insufficient data for ratio analysis</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Financial Ratios</h3>
      </div>

      <div className="space-y-8">
        {ratioCategories.map((category) => (
          <div key={category.name}>
            <h4 className="text-lg font-medium text-gray-700 mb-4">{category.name}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.ratios.map((ratio) => (
                <div key={ratio.name} className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">{ratio.name}</h5>
                  <p className="text-xl font-semibold text-gray-900">
                    {ratio.category === 'profitability' ? `${ratio.value.toFixed(1)}%` : ratio.value.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{ratio.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}