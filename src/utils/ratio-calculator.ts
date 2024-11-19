import { SavedStatement, RatioCategory, AccountCodeRanges, RatioCalculationError } from '../types/financial';
import { logger } from '../services/logger';

// Helper function to ensure 4-digit code format
function normalizeAccountCode(code: string): string {
  return code.padStart(4, '0');
}

// Helper function to safely divide numbers
function safeDiv(numerator: number, denominator: number, ratioName: string, defaultValue = 0): number {
  logger.log(`Calculating ${ratioName}:`, { numerator, denominator });
  
  if (!denominator || isNaN(denominator)) {
    logger.log(`${ratioName}: Division by zero prevented`, { numerator, denominator });
    return defaultValue;
  }
  
  const result = numerator / denominator;
  logger.log(`${ratioName} result:`, result);
  return result;
}

// Helper function to sum values by code range
function sumByCodeRange(items: any[], range: readonly [string, string], description: string): number {
  logger.log(`Calculating sum for ${description}`, { range });
  
  const startCode = normalizeAccountCode(range[0]);
  const endCode = normalizeAccountCode(range[1]);
  
  const filteredItems = items.filter(item => {
    const code = normalizeAccountCode(
      typeof item.section === 'string' 
        ? item.section.split(' ')[0]
        : item.section
    );
    
    logger.log(`Comparing codes for ${description}:`, { 
      itemCode: code,
      startCode,
      endCode,
      isInRange: code >= startCode && code <= endCode
    });
    
    return code >= startCode && code <= endCode;
  });

  logger.log(`Filtered items for ${description}:`, filteredItems);
  
  const sum = filteredItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  logger.log(`Sum for ${description}:`, sum);
  
  return sum;
}

export function calculateFinancialRatios(
  statements: SavedStatement[],
  previousPeriodStatements?: SavedStatement[]
): RatioCategory[] {
  logger.log('Starting financial ratio calculations');

  const balanceSheet = statements.find(s => s.type === 'balance-sheet')?.statement;
  const incomeStatement = statements.find(s => s.type === 'income')?.statement;
  const cashFlow = statements.find(s => s.type === 'cash-flow')?.statement;

  if (!balanceSheet?.lineItems || !incomeStatement?.lineItems) {
    throw new RatioCalculationError(
      'MISSING_STATEMENTS',
      'Required statements not found'
    );
  }

  try {
    // Asset calculations
    const currentAssets = sumByCodeRange(balanceSheet.lineItems, AccountCodeRanges.CURRENT_ASSETS, 'Current Assets');
    const totalAssets = sumByCodeRange(balanceSheet.lineItems, ['0100', '2999'], 'Total Assets');
    const fixedAssets = sumByCodeRange(balanceSheet.lineItems, AccountCodeRanges.FIXED_ASSETS, 'Fixed Assets');
    const inventory = sumByCodeRange(balanceSheet.lineItems, AccountCodeRanges.INVENTORY, 'Inventory');
    const receivables = sumByCodeRange(balanceSheet.lineItems, AccountCodeRanges.RECEIVABLES, 'Receivables');
    const cash = sumByCodeRange(balanceSheet.lineItems, AccountCodeRanges.CASH, 'Cash');

    // Liability calculations
    const currentLiabilities = sumByCodeRange(balanceSheet.lineItems, AccountCodeRanges.CURRENT_LIABILITIES, 'Current Liabilities');
    const totalLiabilities = sumByCodeRange(balanceSheet.lineItems, ['4000', '5999'], 'Total Liabilities');
    const longTermDebt = sumByCodeRange(balanceSheet.lineItems, AccountCodeRanges.LONG_TERM_LOANS, 'Long Term Debt');

    // Equity calculations
    const totalEquity = sumByCodeRange(balanceSheet.lineItems, AccountCodeRanges.EQUITY, 'Total Equity');

    // Income statement calculations
    const revenue = sumByCodeRange(incomeStatement.lineItems, AccountCodeRanges.REVENUE, 'Revenue');
    const operatingIncome = sumByCodeRange(incomeStatement.lineItems, AccountCodeRanges.OPERATING_REVENUE, 'Operating Income');
    const netIncome = incomeStatement.total;
    const costOfSales = sumByCodeRange(incomeStatement.lineItems, AccountCodeRanges.COST_OF_SALES, 'Cost of Sales');
    const operatingExpenses = sumByCodeRange(incomeStatement.lineItems, AccountCodeRanges.OPERATING_EXPENSES, 'Operating Expenses');

    // Previous period calculations for trends
    const prevNetIncome = previousPeriodStatements?.find(s => s.type === 'income')?.statement.total;

    return [
      {
        name: 'Liquidity Ratios',
        ratios: [
          {
            name: 'Current Ratio',
            value: safeDiv(currentAssets, currentLiabilities, 'Current Ratio'),
            description: 'Ability to pay short-term obligations',
            category: 'liquidity',
            benchmark: '> 1.5'
          },
          {
            name: 'Quick Ratio',
            value: safeDiv(currentAssets - inventory, currentLiabilities, 'Quick Ratio'),
            description: 'Immediate liquidity position',
            category: 'liquidity',
            benchmark: '> 1.0'
          },
          {
            name: 'Cash Ratio',
            value: safeDiv(cash, currentLiabilities, 'Cash Ratio'),
            description: 'Cash coverage of current liabilities',
            category: 'liquidity',
            benchmark: '> 0.5'
          }
        ]
      },
      {
        name: 'Solvency Ratios',
        ratios: [
          {
            name: 'Debt to Equity',
            value: safeDiv(totalLiabilities, totalEquity, 'Debt to Equity'),
            description: 'Financial leverage',
            category: 'solvency',
            benchmark: '< 2.0'
          },
          {
            name: 'Debt Ratio',
            value: safeDiv(totalLiabilities, totalAssets, 'Debt Ratio'),
            description: 'Portion of assets financed by debt',
            category: 'solvency',
            benchmark: '< 0.5'
          },
          {
            name: 'Long-term Debt to Equity',
            value: safeDiv(longTermDebt, totalEquity, 'Long-term Debt to Equity'),
            description: 'Long-term financial leverage',
            category: 'solvency',
            benchmark: '< 1.0'
          }
        ]
      },
      {
        name: 'Profitability Ratios',
        ratios: [
          {
            name: 'Gross Margin',
            value: safeDiv(revenue - costOfSales, revenue, 'Gross Margin') * 100,
            description: 'Profit after direct costs',
            category: 'profitability',
            benchmark: '> 30%'
          },
          {
            name: 'Operating Margin',
            value: safeDiv(operatingIncome, revenue, 'Operating Margin') * 100,
            description: 'Profit from operations',
            category: 'profitability',
            benchmark: '> 15%'
          },
          {
            name: 'Net Profit Margin',
            value: safeDiv(netIncome, revenue, 'Net Profit Margin') * 100,
            description: 'Overall profitability',
            category: 'profitability',
            benchmark: '> 10%',
            trend: prevNetIncome ? (netIncome > prevNetIncome ? 'up' : 'down') : undefined
          },
          {
            name: 'Return on Assets',
            value: safeDiv(netIncome, totalAssets, 'Return on Assets') * 100,
            description: 'Asset efficiency',
            category: 'profitability',
            benchmark: '> 5%'
          },
          {
            name: 'Return on Equity',
            value: safeDiv(netIncome, totalEquity, 'Return on Equity') * 100,
            description: 'Shareholder return',
            category: 'profitability',
            benchmark: '> 15%'
          }
        ]
      },
      {
        name: 'Activity Ratios',
        ratios: [
          {
            name: 'Asset Turnover',
            value: safeDiv(revenue, totalAssets, 'Asset Turnover'),
            description: 'Asset utilization efficiency',
            category: 'activity',
            benchmark: '> 1.0'
          },
          {
            name: 'Fixed Asset Turnover',
            value: safeDiv(revenue, fixedAssets, 'Fixed Asset Turnover'),
            description: 'Fixed asset efficiency',
            category: 'activity',
            benchmark: '> 2.0'
          },
          {
            name: 'Inventory Turnover',
            value: safeDiv(costOfSales, inventory, 'Inventory Turnover'),
            description: 'Inventory management efficiency',
            category: 'activity',
            benchmark: '> 6.0'
          },
          {
            name: 'Receivables Turnover',
            value: safeDiv(revenue, receivables, 'Receivables Turnover'),
            description: 'Collection efficiency',
            category: 'activity',
            benchmark: '> 12.0'
          },
          {
            name: 'Days Sales Outstanding',
            value: safeDiv(receivables * 365, revenue, 'Days Sales Outstanding'),
            description: 'Average collection period',
            category: 'activity',
            benchmark: '< 30'
          }
        ]
      }
    ];
  } catch (error) {
    logger.log('Error calculating ratios:', error);
    throw new RatioCalculationError(
      'CALCULATION_ERROR',
      'Error calculating financial ratios',
      error
    );
  }
}