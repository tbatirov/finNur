import { useMemo } from 'react';
import { SavedStatement } from '../types/financial';
import { logger } from '../services/logger';

// Helper to ensure code is a string and normalize to 4 digits
function normalizeCode(code: string | number): string {
  return code.toString().padStart(4, '0');
}

// Helper to check if code starts with a specific digit
function codeStartsWith(code: string | number, prefix: string): boolean {
  const normalizedCode = normalizeCode(code);
  return normalizedCode.startsWith(prefix);
}

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
      .filter(item => codeStartsWith(item.code, '0'))
      .reduce((sum, item) => sum + item.amount, 0);

    const inventory = balanceSheet.lineItems
      .filter(item => codeStartsWith(item.code, '05'))
      .reduce((sum, item) => sum + item.amount, 0);

    const receivables = balanceSheet.lineItems
      .filter(item => codeStartsWith(item.code, '04'))
      .reduce((sum, item) => sum + item.amount, 0);

    const cash = balanceSheet.lineItems
      .filter(item => codeStartsWith(item.code, '01') || codeStartsWith(item.code, '02'))
      .reduce((sum, item) => sum + item.amount, 0);

    const currentLiabilities = balanceSheet.lineItems
      .filter(item => codeStartsWith(item.code, '4'))
      .reduce((sum, item) => sum + Math.abs(item.amount), 0);

    const totalAssets = balanceSheet.lineItems
      .filter(item => codeStartsWith(item.code, '0') || codeStartsWith(item.code, '1'))
      .reduce((sum, item) => sum + item.amount, 0);

    const fixedAssets = balanceSheet.lineItems
      .filter(item => codeStartsWith(item.code, '1'))
      .reduce((sum, item) => sum + item.amount, 0);

    const totalLiabilities = balanceSheet.lineItems
      .filter(item => codeStartsWith(item.code, '4') || codeStartsWith(item.code, '5'))
      .reduce((sum, item) => sum + Math.abs(item.amount), 0);

    const equity = balanceSheet.lineItems
      .filter(item => codeStartsWith(item.code, '6'))
      .reduce((sum, item) => sum + Math.abs(item.amount), 0);

    const revenue = incomeStatement.lineItems
      .filter(item => codeStartsWith(item.code, '7'))
      .reduce((sum, item) => sum + Math.abs(item.amount), 0);

    const costOfSales = incomeStatement.lineItems
      .filter(item => codeStartsWith(item.code, '80'))
      .reduce((sum, item) => sum + Math.abs(item.amount), 0);

    const operatingExpenses = incomeStatement.lineItems
      .filter(item => codeStartsWith(item.code, '8'))
      .reduce((sum, item) => sum + Math.abs(item.amount), 0);

    const netIncome = incomeStatement.total;

    const operatingCashFlow = cashFlow?.lineItems
      .filter(item => item.section.toLowerCase().includes('operating'))
      .reduce((sum, item) => sum + item.amount, 0) || 0;

    // Previous period metrics for trend calculation
    const prevNetIncome = previousPeriodStatements?.find(s => s.type === 'income')?.statement.total;

    return [
      {
        name: 'Liquidity Ratios',
        ratios: [
          {
            name: 'Current Ratio',
            value: currentAssets / currentLiabilities,
            description: 'Ability to pay short-term obligations',
            category: 'liquidity',
            benchmark: '> 1.5'
          },
          {
            name: 'Quick Ratio',
            value: (currentAssets - inventory) / currentLiabilities,
            description: 'Immediate liquidity excluding inventory',
            category: 'liquidity',
            benchmark: '> 1.0'
          },
          {
            name: 'Cash Ratio',
            value: cash / currentLiabilities,
            description: 'Immediate liquidity position',
            category: 'liquidity',
            benchmark: '> 0.5'
          },
          {
            name: 'Working Capital Ratio',
            value: (currentAssets - currentLiabilities) / totalAssets,
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
            value: totalLiabilities / equity,
            description: 'Financial leverage',
            category: 'solvency',
            benchmark: '< 2.0'
          },
          {
            name: 'Debt Ratio',
            value: (totalLiabilities / totalAssets) * 100,
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
            value: ((revenue - costOfSales) / revenue) * 100,
            description: 'Profit after direct costs',
            category: 'profitability',
            benchmark: '> 30%'
          },
          {
            name: 'Operating Margin',
            value: ((revenue - operatingExpenses) / revenue) * 100,
            description: 'Operating efficiency',
            category: 'profitability',
            benchmark: '> 15%'
          },
          {
            name: 'Net Profit Margin',
            value: (netIncome / revenue) * 100,
            description: 'Overall profitability',
            category: 'profitability',
            benchmark: '> 10%',
            trend: prevNetIncome ? (netIncome > prevNetIncome ? 'up' : 'down') : undefined
          },
          {
            name: 'Return on Equity',
            value: (netIncome / equity) * 100,
            description: 'Return on shareholder investment',
            category: 'profitability',
            benchmark: '> 15%'
          },
          {
            name: 'Return on Assets',
            value: (netIncome / totalAssets) * 100,
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
            value: revenue / totalAssets,
            description: 'Asset utilization efficiency',
            category: 'activity',
            benchmark: '> 1.0'
          },
          {
            name: 'Fixed Asset Turnover',
            value: revenue / fixedAssets,
            description: 'Fixed asset efficiency',
            category: 'activity',
            benchmark: '> 2.0'
          },
          {
            name: 'Inventory Turnover',
            value: costOfSales / inventory,
            description: 'Inventory management efficiency',
            category: 'activity',
            benchmark: '> 6.0'
          },
          {
            name: 'Receivables Turnover',
            value: revenue / receivables,
            description: 'Collection efficiency',
            category: 'activity',
            benchmark: '> 12.0'
          },
          {
            name: 'Days Sales Outstanding',
            value: (receivables * 365) / revenue,
            description: 'Average collection period',
            category: 'activity',
            benchmark: '< 30'
          },
          {
            name: 'Operating Cash Flow Ratio',
            value: operatingCashFlow / currentLiabilities,
            description: 'Operating cash flow coverage',
            category: 'activity',
            benchmark: '> 1.0'
          }
        ]
      }
    ];
  }, [statements, previousPeriodStatements]);
}