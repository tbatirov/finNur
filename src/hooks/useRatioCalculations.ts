import { useMemo } from 'react';
import { SavedStatement, RatioCategory } from '../types/financial';

function sumByCode(items: any[], startCode: number, endCode: number, invertSign = false): number {
  return items
    .filter(item => {
      const code = parseInt(item.section.toString().split(' ')[0]);
      return code >= startCode && code <= endCode;
    })
    .reduce((sum, item) => {
      let amount = item.amount;
      if (invertSign) amount = -amount;
      return sum + amount;
    }, 0);
}

export function useRatioCalculations(statements: SavedStatement[]): RatioCategory[] {
  return useMemo(() => {
    const balanceSheet = statements.find(s => s.type === 'balance-sheet')?.statement;
    const incomeStatement = statements.find(s => s.type === 'income')?.statement;

    if (!balanceSheet?.lineItems || !incomeStatement?.lineItems) return [];

    try {
      // Balance Sheet Components
      const currentAssets = sumByCode(balanceSheet.lineItems, 100, 799);
      const cash = sumByCode(balanceSheet.lineItems, 100, 199);
      const inventory = sumByCode(balanceSheet.lineItems, 400, 499);
      const accountsReceivable = sumByCode(balanceSheet.lineItems, 300, 399);
      const currentLiabilities = sumByCode(balanceSheet.lineItems, 2000, 2499, true);
      const totalAssets = sumByCode(balanceSheet.lineItems, 100, 1399);
      const totalLiabilities = sumByCode(balanceSheet.lineItems, 2000, 2899, true);
      const fixedAssets = sumByCode(balanceSheet.lineItems, 900, 999);
      const longTermDebt = sumByCode(balanceSheet.lineItems, 2500, 2599, true);
      
      // Income Statement Components
      const revenue = sumByCode(incomeStatement.lineItems, 9000, 9099, true);
      const costOfSales = sumByCode(incomeStatement.lineItems, 9300, 9399);
      const operatingExpenses = sumByCode(incomeStatement.lineItems, 9400, 9499);
      const interestExpense = sumByCode(incomeStatement.lineItems, 9500, 9599);
      const depreciation = sumByCode(incomeStatement.lineItems, 9450, 9459);

      // Derived Calculations
      const totalEquity = totalAssets - totalLiabilities;
      const workingCapital = currentAssets - currentLiabilities;
      const quickAssets = currentAssets - inventory;
      const grossProfit = revenue - Math.abs(costOfSales);
      const operatingIncome = grossProfit - Math.abs(operatingExpenses);
      const ebit = operatingIncome + Math.abs(depreciation);
      const netIncome = incomeStatement.total || 0;

      const calculateRatio = (numerator: number, denominator: number, asPercent = false): number => {
        if (!denominator || denominator === 0) return 0;
        const ratio = numerator / Math.abs(denominator);
        return asPercent ? ratio * 100 : ratio;
      };

      return [
        {
          name: 'Liquidity Ratios',
          ratios: [
            {
              name: 'Current Ratio',
              value: calculateRatio(currentAssets, currentLiabilities),
              description: 'Ability to pay short-term obligations',
              category: 'liquidity'
            },
            {
              name: 'Quick Ratio',
              value: calculateRatio(quickAssets, currentLiabilities),
              description: 'Ability to pay immediate obligations',
              category: 'liquidity'
            },
            {
              name: 'Cash Ratio',
              value: calculateRatio(cash, currentLiabilities),
              description: 'Ability to pay with cash only',
              category: 'liquidity'
            },
            {
              name: 'Working Capital Ratio',
              value: calculateRatio(workingCapital, totalAssets),
              description: 'Working capital as % of total assets',
              category: 'liquidity'
            },
            {
              name: 'Defensive Interval',
              value: calculateRatio(quickAssets, (operatingExpenses / 365)),
              description: 'Days can operate from quick assets',
              category: 'liquidity'
            }
          ]
        },
        {
          name: 'Solvency Ratios',
          ratios: [
            {
              name: 'Debt to Equity',
              value: calculateRatio(totalLiabilities, totalEquity),
              description: 'Leverage of equity funding',
              category: 'solvency'
            },
            {
              name: 'Debt Ratio',
              value: calculateRatio(totalLiabilities, totalAssets, true),
              description: 'Assets funded by debt',
              category: 'solvency'
            },
            {
              name: 'Equity Ratio',
              value: calculateRatio(totalEquity, totalAssets, true),
              description: 'Assets funded by equity',
              category: 'solvency'
            },
            {
              name: 'Interest Coverage',
              value: calculateRatio(ebit, interestExpense),
              description: 'Times interest obligations covered',
              category: 'solvency'
            },
            {
              name: 'Fixed Assets to Equity',
              value: calculateRatio(fixedAssets, totalEquity),
              description: 'Fixed assets funded by equity',
              category: 'solvency'
            }
          ]
        },
        {
          name: 'Profitability Ratios',
          ratios: [
            {
              name: 'Gross Margin',
              value: calculateRatio(grossProfit, revenue, true),
              description: 'Profit after direct costs',
              category: 'profitability'
            },
            {
              name: 'Operating Margin',
              value: calculateRatio(operatingIncome, revenue, true),
              description: 'Profit from operations',
              category: 'profitability'
            },
            {
              name: 'Net Profit Margin',
              value: calculateRatio(netIncome, revenue, true),
              description: 'Final profit margin',
              category: 'profitability'
            },
            {
              name: 'EBIT Margin',
              value: calculateRatio(ebit, revenue, true),
              description: 'Earnings before interest & tax',
              category: 'profitability'
            },
            {
              name: 'Cost of Sales Ratio',
              value: calculateRatio(costOfSales, revenue, true),
              description: 'Direct costs as % of revenue',
              category: 'profitability'
            }
          ]
        },
        {
          name: 'Efficiency Ratios',
          ratios: [
            {
              name: 'Asset Turnover',
              value: calculateRatio(revenue, totalAssets),
              description: 'Revenue per asset dollar',
              category: 'efficiency'
            },
            {
              name: 'Inventory Turnover',
              value: calculateRatio(costOfSales, inventory),
              description: 'Inventory sold per period',
              category: 'efficiency'
            },
            {
              name: 'Receivables Turnover',
              value: calculateRatio(revenue, accountsReceivable),
              description: 'Collection efficiency',
              category: 'efficiency'
            },
            {
              name: 'Fixed Asset Turnover',
              value: calculateRatio(revenue, fixedAssets),
              description: 'Revenue per fixed asset',
              category: 'efficiency'
            },
            {
              name: 'Working Capital Turnover',
              value: calculateRatio(revenue, workingCapital),
              description: 'Revenue per working capital',
              category: 'efficiency'
            }
          ]
        },
        {
          name: 'Return Ratios',
          ratios: [
            {
              name: 'Return on Assets',
              value: calculateRatio(netIncome, totalAssets, true),
              description: 'Return on total assets',
              category: 'return'
            },
            {
              name: 'Return on Equity',
              value: calculateRatio(netIncome, totalEquity, true),
              description: 'Return on shareholder equity',
              category: 'return'
            },
            {
              name: 'Return on Capital',
              value: calculateRatio(ebit, (totalEquity + longTermDebt), true),
              description: 'Return on invested capital',
              category: 'return'
            },
            {
              name: 'Return on Sales',
              value: calculateRatio(operatingIncome, revenue, true),
              description: 'Operating return on sales',
              category: 'return'
            },
            {
              name: 'Return on Fixed Assets',
              value: calculateRatio(netIncome, fixedAssets, true),
              description: 'Return on fixed assets',
              category: 'return'
            }
          ]
        }
      ];
    } catch (error) {
      console.error('Error calculating ratios:', error);
      return [];
    }
  }, [statements]);
}