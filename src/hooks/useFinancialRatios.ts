import { useMemo } from 'react';
import { SavedStatement } from '../types/financial';
import { logger } from '../services/logger';
import { AccountCodeRanges } from '../types/financial';
import { safeDiv } from '../utils/ratio-calculations';
// Helper to ensure code is a string and normalize to 4 digits
const isCodeInRange = (code: string, range: readonly [string, string]): boolean => {
  const normalizedCode = String(code).padStart(4, '0');
  return normalizedCode >= range[0] && normalizedCode <= range[1];
};

export function useFinancialRatios(
  statements: SavedStatement[],
  previousPeriodStatements?: SavedStatement[]
) {
  return useMemo(() => {
    const balanceSheet = statements.find(s => s.type === 'balance-sheet')?.statement;
    const incomeStatement = statements.find(s => s.type === 'income')?.statement;
    const cashFlow = statements.find(s => s.type === 'cash-flow')?.statement;

    if (!balanceSheet || !incomeStatement) {
      logger.log('Missing required statements for ratio calculation');
      return [];
    }

    // Calculate key metrics
    const currentAssets = balanceSheet.lineItems
      .filter(item => isCodeInRange(item.code, AccountCodeRanges.CURRENT_ASSETS))
      .reduce((sum, item) => sum + item.amount, 0);

    const inventory = balanceSheet.lineItems
      .filter(item => isCodeInRange(item.code, AccountCodeRanges.INVENTORY))
      .reduce((sum, item) => sum + item.amount, 0);

    const receivables = balanceSheet.lineItems
      .filter(item => isCodeInRange(item.code, AccountCodeRanges.RECEIVABLES))
      .reduce((sum, item) => sum + item.amount, 0);

    const cash = balanceSheet.lineItems
      .filter(item => isCodeInRange(item.code, AccountCodeRanges.CASH))
      .reduce((sum, item) => sum + item.amount, 0);

    const currentLiabilities = balanceSheet.lineItems
      .filter(item => isCodeInRange(item.code, AccountCodeRanges.CURRENT_LIABILITIES))
      .reduce((sum, item) => sum + Math.abs(item.amount), 0);

    const totalAssets = balanceSheet.lineItems
      .filter(item => 
        isCodeInRange(item.code, AccountCodeRanges.CURRENT_ASSETS) ||
        isCodeInRange(item.code, AccountCodeRanges.NON_CURRENT_ASSETS)
      )
      .reduce((sum, item) => sum + item.amount, 0);

    const fixedAssets = balanceSheet.lineItems
      .filter(item => isCodeInRange(item.code, AccountCodeRanges.FIXED_ASSETS))
      .reduce((sum, item) => sum + item.amount, 0);

    const totalLiabilities = balanceSheet.lineItems
      .filter(item => isCodeInRange(item.code, AccountCodeRanges.LONG_TERM_LIABILITIES))
      .reduce((sum, item) => sum + Math.abs(item.amount), 0);

    const equity = balanceSheet.lineItems
      .filter(item => isCodeInRange(item.code, AccountCodeRanges.EQUITY))
      .reduce((sum, item) => sum + Math.abs(item.amount), 0);

    const revenue = incomeStatement.lineItems
      .filter(item => isCodeInRange(item.code, AccountCodeRanges.REVENUE))
      .reduce((sum, item) => sum + Math.abs(item.amount), 0);

    const costOfSales = incomeStatement.lineItems
      .filter(item => isCodeInRange(item.code, AccountCodeRanges.COST_OF_SALES))
      .reduce((sum, item) => sum + Math.abs(item.amount), 0);

    const operatingExpenses = incomeStatement.lineItems
      .filter(item => isCodeInRange(item.code, AccountCodeRanges.OPERATING_EXPENSES))
      .reduce((sum, item) => sum + Math.abs(item.amount), 0);

    const netIncome = incomeStatement.total;

    const operatingCashFlow = cashFlow?.lineItems
      .filter(item => item.section.toLowerCase().includes('operating'))
      .reduce((sum, item) => sum + item.amount, 0) || 0;


    console.log(
      'currentAssets = ' + currentAssets + '\n' +
      'currentLiabilities = ' + currentLiabilities + '\n' +
      'netIncome = ' + netIncome + '\n' +
      'revenue = ' + revenue + '\n' +
      'costOfSales = ' + costOfSales + '\n' +
      'operatingExpenses = ' + operatingExpenses + '\n' +
      'fixedAssets = ' + fixedAssets + '\n' +
      'totalLiabilities = ' + totalLiabilities + '\n' +
      'equity = ' + equity + '\n' +
      'operatingCashFlow = ' + operatingCashFlow + '\n' +
      'totalAssets = ' + totalAssets + '\n' +
      'receivables = ' + receivables + '\n' +
      'inventory = ' + inventory + '\n' +
      'cash = ' + cash + '\n' +
      'totalLiabilities / equity = ' + (totalLiabilities / equity) + '\n' +
      'totalLiabilities / totalAssets = ' + (totalLiabilities / totalAssets) + '\n' +
      'netIncome = ' + netIncome
    );
    console.log(safeDiv(currentAssets, currentLiabilities));
    // Previous period metrics for trend calculation
    const prevNetIncome = previousPeriodStatements?.find(s => s.type === 'income')?.statement.total;

    return [
      {
        name: 'Liquidity Ratios',
        ratios: [
          {
            name: 'Current Ratio',
            value: safeDiv(currentAssets, currentLiabilities),
            description: 'Ability to pay short-term obligations',
            category: 'liquidity',
            benchmark: '> 1.5'
          },
          {
            name: 'Quick Ratio',
            value: safeDiv(currentAssets - inventory, currentLiabilities),
            description: 'Immediate liquidity excluding inventory',
            category: 'liquidity',
            benchmark: '> 1.0'
          },
          {
            name: 'Cash Ratio',
            value: safeDiv(cash, currentLiabilities),
            description: 'Immediate liquidity position',
            category: 'liquidity',
            benchmark: '> 0.5'
          },
          {
            name: 'Working Capital Ratio',
            value: safeDiv(currentAssets - currentLiabilities, totalAssets),
            description: 'Working capital as portion of total assets',
            category: 'liquidity',
            benchmark: '> 0.2'
          }
        ]
      },
      {
        name: 'Solvency Ratios',
        ratios: [
          {
            name: 'Debt to Equity',
            value: safeDiv(totalLiabilities, equity),
            description: 'Financial leverage',
            category: 'solvency',
            benchmark: '< 2.0'
          },
          {
            name: 'Debt Ratio',
            value: safeDiv(totalLiabilities, totalAssets) * 100,
            description: 'Portion of assets financed by debt',
            category: 'solvency',
            benchmark: '< 50%'
          }
        ]
      },
      {
        name: 'Profitability Ratios',
        ratios: [
          {
            name: 'Gross Margin',
            value: safeDiv(revenue - costOfSales, revenue) * 100,
            description: 'Profit after direct costs',
            category: 'profitability',
            benchmark: '> 30%'
          },
          {
            name: 'Operating Margin',
            value: safeDiv(revenue - operatingExpenses, revenue) * 100,
            description: 'Operating efficiency',
            category: 'profitability',
            benchmark: '> 15%'
          },
          {
            name: 'Net Profit Margin',
            value: safeDiv(netIncome, revenue) * 100,
            description: 'Overall profitability',
            category: 'profitability',
            benchmark: '> 10%',
            trend: prevNetIncome ? (netIncome > prevNetIncome ? 'up' : 'down') : undefined
          },
          {
            name: 'Return on Equity',
            value: safeDiv(netIncome, equity) * 100,
            description: 'Return on shareholder investment',
            category: 'profitability',
            benchmark: '> 15%'
          },
          {
            name: 'Return on Assets',
            value: safeDiv(netIncome, totalAssets) * 100,
            description: 'Asset efficiency',
            category: 'profitability',
            benchmark: '> 5%'
          }
        ]
      },
      {
        name: 'Efficiency Ratios',
        ratios: [
          {
            name: 'Asset Turnover',
            value: safeDiv(revenue, totalAssets),
            description: 'Asset utilization efficiency',
            category: 'activity',
            benchmark: '> 1.0'
          },
          {
            name: 'Fixed Asset Turnover',
            value: safeDiv(revenue, fixedAssets),
            description: 'Fixed asset efficiency',
            category: 'activity',
            benchmark: '> 2.0'
          },
          {
            name: 'Inventory Turnover',
            value: safeDiv(costOfSales, inventory),
            description: 'Inventory management efficiency',
            category: 'activity',
            benchmark: '> 6.0'
          },
          {
            name: 'Receivables Turnover',
            value: safeDiv(revenue, receivables),
            description: 'Collection efficiency',
            category: 'activity',
            benchmark: '> 12.0'
          },
          {
            name: 'Days Sales Outstanding',
            value: safeDiv(receivables * 365, revenue),
            description: 'Average collection period',
            category: 'activity',
            benchmark: '< 30'
          },
          {
            name: 'Operating Cash Flow Ratio',
            value: safeDiv(operatingCashFlow, currentLiabilities),
            description: 'Operating cash flow coverage',
            category: 'activity',
            benchmark: '> 1.0'
          }
        ]
      }
    ];
  }, [statements, previousPeriodStatements]);
}