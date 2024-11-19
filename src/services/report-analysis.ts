import { SavedStatement } from '../types/financial';
import { logger } from './logger';

// Helper to normalize account codes
function normalizeCode(code: string | number): string {
  return code.toString().padStart(4, '0');
}

// Helper to check if code starts with a specific prefix
function codeStartsWith(code: string | number, prefix: string): boolean {
  const normalizedCode = normalizeCode(code);
  return normalizedCode.startsWith(prefix);
}

export function calculateMetrics(statements: SavedStatement[], previousPeriodStatements?: SavedStatement[]) {
  try {
    const currentPeriod = {
      revenue: calculateRevenue(statements),
      operatingIncome: calculateOperatingIncome(statements),
      netIncome: calculateNetIncome(statements),
      totalAssets: calculateTotalAssets(statements),
      currentAssets: calculateCurrentAssets(statements),
      currentLiabilities: calculateCurrentLiabilities(statements),
      totalLiabilities: calculateTotalLiabilities(statements),
      equity: calculateEquity(statements),
      operatingCashFlow: calculateOperatingCashFlow(statements)
    };

    const previousPeriod = previousPeriodStatements ? {
      revenue: calculateRevenue(previousPeriodStatements),
      operatingIncome: calculateOperatingIncome(previousPeriodStatements),
      netIncome: calculateNetIncome(previousPeriodStatements)
    } : null;

    return {
      revenueGrowth: previousPeriod ? 
        ((currentPeriod.revenue - previousPeriod.revenue) / previousPeriod.revenue) * 100 : 0,
      operatingMargin: (currentPeriod.operatingIncome / currentPeriod.revenue) * 100,
      netProfitMargin: (currentPeriod.netIncome / currentPeriod.revenue) * 100,
      currentRatio: currentPeriod.currentAssets / currentPeriod.currentLiabilities,
      debtToEquity: currentPeriod.totalLiabilities / currentPeriod.equity,
      returnOnEquity: (currentPeriod.netIncome / currentPeriod.equity) * 100,
      returnOnAssets: (currentPeriod.netIncome / currentPeriod.totalAssets) * 100,
      operatingCashFlowRatio: currentPeriod.operatingCashFlow / currentPeriod.currentLiabilities
    };
  } catch (error) {
    logger.log('Error calculating metrics:', error);
    throw error;
  }
}

export function generateAnalysis(statements: SavedStatement[], metrics: any) {
  const strengths: string[] = [];
  const improvements: string[] = [];
  const risks: string[] = [];
  const recommendations: string[] = [];

  // Analyze liquidity
  if (metrics.currentRatio > 2) {
    strengths.push('• Strong liquidity position with current ratio above 2');
  } else if (metrics.currentRatio < 1) {
    improvements.push('• Critical liquidity situation - current ratio below 1');
    risks.push('• Risk of default on short-term obligations');
    recommendations.push('• Improve working capital management');
  }

  // Analyze profitability
  if (metrics.netProfitMargin > 10) {
    strengths.push('• Strong profitability with net margin above 10%');
  } else if (metrics.netProfitMargin < 5) {
    improvements.push('• Below-average profit margins');
    recommendations.push('• Review pricing strategy and cost structure');
  }

  // Analyze operational efficiency
  if (metrics.operatingMargin > 15) {
    strengths.push('• Excellent operational efficiency');
  } else if (metrics.operatingMargin < 10) {
    improvements.push('• Operating efficiency needs improvement');
    recommendations.push('• Optimize operational processes and reduce overhead costs');
  }

  // Analyze financial leverage
  if (metrics.debtToEquity > 2) {
    risks.push('• High financial leverage increases vulnerability');
    recommendations.push('• Consider debt reduction or equity financing');
  }

  // Analyze cash flow
  if (metrics.operatingCashFlowRatio < 1) {
    risks.push('• Weak operating cash flow coverage');
    improvements.push('• Cash flow from operations needs strengthening');
    recommendations.push('• Implement stricter working capital management');
  }

  return {
    strengths,
    improvements,
    risks,
    recommendations
  };
}

// Helper functions for metric calculations
function calculateRevenue(statements: SavedStatement[]): number {
  const incomeStatement = statements.find(s => s.type === 'income')?.statement;
  return incomeStatement?.lineItems
    .filter(item => codeStartsWith(item.code, '7'))
    .reduce((sum, item) => sum + Math.abs(item.amount), 0) || 0;
}

function calculateOperatingIncome(statements: SavedStatement[]): number {
  const incomeStatement = statements.find(s => s.type === 'income')?.statement;
  if (!incomeStatement) return 0;

  const revenue = incomeStatement.lineItems
    .filter(item => codeStartsWith(item.code, '7'))
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);

  const operatingExpenses = incomeStatement.lineItems
    .filter(item => codeStartsWith(item.code, '8'))
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);

  return revenue - operatingExpenses;
}

function calculateNetIncome(statements: SavedStatement[]): number {
  return statements.find(s => s.type === 'income')?.statement.total || 0;
}

function calculateTotalAssets(statements: SavedStatement[]): number {
  const balanceSheet = statements.find(s => s.type === 'balance-sheet')?.statement;
  return balanceSheet?.lineItems
    .filter(item => codeStartsWith(item.code, '0') || codeStartsWith(item.code, '1'))
    .reduce((sum, item) => sum + item.amount, 0) || 0;
}

function calculateCurrentAssets(statements: SavedStatement[]): number {
  const balanceSheet = statements.find(s => s.type === 'balance-sheet')?.statement;
  return balanceSheet?.lineItems
    .filter(item => codeStartsWith(item.code, '0'))
    .reduce((sum, item) => sum + item.amount, 0) || 0;
}

function calculateCurrentLiabilities(statements: SavedStatement[]): number {
  const balanceSheet = statements.find(s => s.type === 'balance-sheet')?.statement;
  return balanceSheet?.lineItems
    .filter(item => codeStartsWith(item.code, '4'))
    .reduce((sum, item) => sum + Math.abs(item.amount), 0) || 0;
}

function calculateTotalLiabilities(statements: SavedStatement[]): number {
  const balanceSheet = statements.find(s => s.type === 'balance-sheet')?.statement;
  return balanceSheet?.lineItems
    .filter(item => codeStartsWith(item.code, '4') || codeStartsWith(item.code, '5'))
    .reduce((sum, item) => sum + Math.abs(item.amount), 0) || 0;
}

function calculateEquity(statements: SavedStatement[]): number {
  const balanceSheet = statements.find(s => s.type === 'balance-sheet')?.statement;
  return balanceSheet?.lineItems
    .filter(item => codeStartsWith(item.code, '6'))
    .reduce((sum, item) => sum + Math.abs(item.amount), 0) || 0;
}

function calculateOperatingCashFlow(statements: SavedStatement[]): number {
  const cashFlow = statements.find(s => s.type === 'cash-flow')?.statement;
  return cashFlow?.lineItems
    .filter(item => item.section.toLowerCase().includes('operating'))
    .reduce((sum, item) => sum + item.amount, 0) || 0;
}