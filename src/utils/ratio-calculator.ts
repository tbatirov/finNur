import { GeneratedStatement } from '../types/financial';

function safeNumber(value: number | undefined): number {
  if (value === undefined || value === null || isNaN(value)) return 0;
  return Number(value);
}

function safeRatio(numerator: number, denominator: number, asPercentage = false): number {
  const num = safeNumber(numerator);
  const den = safeNumber(denominator);
  if (den === 0) return 0;
  const ratio = num / den;
  return asPercentage ? ratio * 100 : ratio;
}

function sumBySection(statement: GeneratedStatement, sectionPrefix: string): number {
  return statement.lineItems
    .filter(item => {
      const section = typeof item.section === 'string' 
        ? item.section.toLowerCase()
        : item.section.toString().toLowerCase();
      return section.includes(sectionPrefix.toLowerCase());
    })
    .reduce((sum, item) => sum + safeNumber(item.amount), 0);
}

export function calculateRatios(
  statement: GeneratedStatement,
  type: 'balance-sheet' | 'income' | 'cash-flow' | 'pnl'
): { name: string; value: number; description: string }[] {
  try {
    switch (type) {
      case 'balance-sheet': {
        const currentAssets = sumBySection(statement, 'assets_current');
        const currentLiabilities = sumBySection(statement, 'liabilities_current');
        const totalAssets = sumBySection(statement, 'assets');
        const totalLiabilities = sumBySection(statement, 'liabilities');
        const inventory = statement.lineItems
          .filter(item => item.description.toLowerCase().includes('inventory'))
          .reduce((sum, item) => sum + safeNumber(item.amount), 0);
        const equity = totalAssets - totalLiabilities;

        return [
          {
            name: 'Current Ratio',
            value: safeRatio(currentAssets, currentLiabilities),
            description: 'Measures ability to pay short-term obligations'
          },
          {
            name: 'Quick Ratio',
            value: safeRatio(currentAssets - inventory, currentLiabilities),
            description: 'Measures immediate ability to pay short-term obligations'
          },
          {
            name: 'Debt to Equity',
            value: safeRatio(totalLiabilities, equity),
            description: 'Measures financial leverage'
          },
          {
            name: 'Working Capital Ratio',
            value: safeRatio(currentAssets - currentLiabilities, totalAssets),
            description: 'Measures operating liquidity'
          }
        ];
      }

      case 'income': {
        const revenue = sumBySection(statement, 'revenue');
        const operatingExpenses = sumBySection(statement, 'operating_expenses');
        const costOfSales = sumBySection(statement, 'cost_of_sales');
        const grossProfit = revenue - costOfSales;

        return [
          {
            name: 'Gross Margin',
            value: safeRatio(grossProfit, revenue, true),
            description: 'Percentage of revenue retained after direct costs'
          },
          {
            name: 'Operating Margin',
            value: safeRatio(grossProfit - operatingExpenses, revenue, true),
            description: 'Percentage of revenue retained after operating expenses'
          },
          {
            name: 'Net Margin',
            value: safeRatio(statement.total, revenue, true),
            description: 'Percentage of revenue retained as profit'
          }
        ];
      }

      case 'cash-flow': {
        const operatingCash = sumBySection(statement, 'operating');
        const investingCash = sumBySection(statement, 'investing');
        const financingCash = sumBySection(statement, 'financing');

        return [
          {
            name: 'Operating Cash Ratio',
            value: safeRatio(operatingCash, statement.total),
            description: 'Operating cash flow as portion of total cash flow'
          },
          {
            name: 'Investment Coverage',
            value: safeRatio(operatingCash, Math.abs(investingCash)),
            description: 'Ability to fund investments with operations'
          },
          {
            name: 'Cash Flow Coverage',
            value: safeRatio(operatingCash, Math.abs(financingCash)),
            description: 'Ability to cover financing activities'
          }
        ];
      }

      case 'pnl': {
        const revenue = sumBySection(statement, 'revenue');
        const operatingExpenses = sumBySection(statement, 'operating_expenses');
        const costOfSales = sumBySection(statement, 'cost_of_sales');
        const grossProfit = revenue - costOfSales;

        return [
          {
            name: 'Gross Margin',
            value: safeRatio(grossProfit, revenue, true),
            description: 'Profitability after direct costs'
          },
          {
            name: 'Operating Margin',
            value: safeRatio(grossProfit - operatingExpenses, revenue, true),
            description: 'Profitability after operating expenses'
          },
          {
            name: 'Net Profit Margin',
            value: safeRatio(statement.total, revenue, true),
            description: 'Overall profitability'
          }
        ];
      }

      default:
        return [];
    }
  } catch (error) {
    console.error('Error calculating ratios:', error);
    return [];
  }
}