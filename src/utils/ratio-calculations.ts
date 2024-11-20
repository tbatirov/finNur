import { LineItem } from '../types/financial';

// Helper function for safe division
export const safeDiv = (num: number, den: number): number => {
  if (den === 0 ) return 0;
  return num / den;
};

// Helper function to get numeric code from section
const getCode = (section: string | number): string => {
  return section.toString().split(' ')[0];
};

// NAS Uzbekistan Account Code Ranges
const ACCOUNT_RANGES = {
  // Assets (0100-1399)
  CURRENT_ASSETS: { start: '0100', end: '0799' },
  CASH: { start: '0100', end: '0199' },
  RECEIVABLES: { start: '0300', end: '0399' },
  INVENTORY: { start: '0400', end: '0499' },
  NONCURRENT_ASSETS: { start: '0800', end: '1399' },
  
  // Contra Accounts (1400-1799)
  CONTRA_ACCOUNTS: { start: '1400', end: '1799' },
  
  // Liabilities (2000-2899)
  CURRENT_LIABILITIES: { start: '2000', end: '2499' },
  NONCURRENT_LIABILITIES: { start: '2500', end: '2899' },
  
  // Equity (3000-3499)
  EQUITY: { start: '3000', end: '3499' },
  
  // Revenue and Expenses (4000-5499)
  REVENUE: { start: '4000', end: '4999' },
  COST_OF_SALES: { start: '5000', end: '5099' },
  OPERATING_EXPENSES: { start: '5100', end: '5299' },
  FINANCIAL_EXPENSES: { start: '5300', end: '5399' }
};

// Calculate amounts respecting NAS Uzbekistan sign conventions
const calculateAmount = (items: LineItem[], range: { start: string; end: string }): number => {
  return items
    .filter(item => {
      const code = getCode(item.section);
      return code >= range.start && code <= range.end;
    })
    .reduce((sum, item) => {
      const code = getCode(item.section);
      // Determine if amount should be reversed based on account type
      const shouldReverse = code >= '2000' && code <= '4999';
      return sum + (shouldReverse ? -item.amount : item.amount);
    }, 0);
};

// Liquidity Ratios
export const calculateLiquidityRatios = (balanceSheet: LineItem[]) => {
  const currentAssets = calculateAmount(balanceSheet, ACCOUNT_RANGES.CURRENT_ASSETS);
  const cash = calculateAmount(balanceSheet, ACCOUNT_RANGES.CASH);
  const receivables = calculateAmount(balanceSheet, ACCOUNT_RANGES.RECEIVABLES);
  const inventory = calculateAmount(balanceSheet, ACCOUNT_RANGES.INVENTORY);
  const currentLiabilities = Math.abs(calculateAmount(balanceSheet, ACCOUNT_RANGES.CURRENT_LIABILITIES));

  const quickAssets = currentAssets - inventory;

  console.log('currentAssets '+currentAssets +' currentLiabilities '+currentLiabilities+' cash '+cash+' receivables '+receivables+' inventory '+inventory+' quickAssets '+quickAssets);
  return {
    currentRatio: safeDiv(currentAssets, currentLiabilities),
    quickRatio: safeDiv(quickAssets, currentLiabilities),
    cashRatio: safeDiv(cash, currentLiabilities),
    workingCapital: currentAssets - currentLiabilities
  };
};

// Solvency Ratios
export const calculateSolvencyRatios = (balanceSheet: LineItem[]) => {
  const totalAssets = calculateAmount(balanceSheet, { start: '0100', end: '1399' });
  const totalLiabilities = Math.abs(calculateAmount(balanceSheet, { start: '2000', end: '2899' }));
  const equity = Math.abs(calculateAmount(balanceSheet, ACCOUNT_RANGES.EQUITY));

  console.log('totalAssets '+totalAssets +' totalLiabilities '+totalLiabilities+' equity '+equity);
  return {
    debtToEquity: safeDiv(totalLiabilities, equity),
    debtRatio: safeDiv(totalLiabilities, totalAssets) * 100,
    equityRatio: safeDiv(equity, totalAssets) * 100,
    financialLeverage: safeDiv(totalAssets, equity)
  };
};

// Profitability Ratios
export const calculateProfitabilityRatios = (incomeStatement: LineItem[]) => {
  const revenue = Math.abs(calculateAmount(incomeStatement, ACCOUNT_RANGES.REVENUE));
  const costOfSales = Math.abs(calculateAmount(incomeStatement, ACCOUNT_RANGES.COST_OF_SALES));
  const operatingExpenses = Math.abs(calculateAmount(incomeStatement, ACCOUNT_RANGES.OPERATING_EXPENSES));
  const financialExpenses = Math.abs(calculateAmount(incomeStatement, ACCOUNT_RANGES.FINANCIAL_EXPENSES));

  const grossProfit = revenue - costOfSales;
  const operatingIncome = grossProfit - operatingExpenses;
  const netIncome = operatingIncome - financialExpenses;

  console.log('revenue '+revenue +' costOfSales '+costOfSales+' operatingExpenses '+operatingExpenses+' financialExpenses '+financialExpenses+' grossProfit '+grossProfit+' operatingIncome '+operatingIncome+' netIncome '+netIncome);
  return {
    grossMargin: safeDiv(grossProfit, revenue) * 100,
    operatingMargin: safeDiv(operatingIncome, revenue) * 100,
    netProfitMargin: safeDiv(netIncome, revenue) * 100,
    costOfSalesRatio: safeDiv(costOfSales, revenue) * 100,
    operatingExpenseRatio: safeDiv(operatingExpenses, revenue) * 100
  };
};

// Efficiency Ratios
export const calculateEfficiencyRatios = (balanceSheet: LineItem[], incomeStatement: LineItem[]) => {
  const totalAssets = calculateAmount(balanceSheet, { start: '0100', end: '1399' });
  const inventory = calculateAmount(balanceSheet, ACCOUNT_RANGES.INVENTORY);
  const receivables = calculateAmount(balanceSheet, ACCOUNT_RANGES.RECEIVABLES);
  const revenue = Math.abs(calculateAmount(incomeStatement, ACCOUNT_RANGES.REVENUE));
  const costOfSales = Math.abs(calculateAmount(incomeStatement, ACCOUNT_RANGES.COST_OF_SALES));

  console.log('totalAssets '+totalAssets +' inventory '+inventory+' receivables '+receivables+' revenue '+revenue+' costOfSales '+costOfSales);
  return {
    assetTurnover: safeDiv(revenue, totalAssets),
    inventoryTurnover: safeDiv(costOfSales, inventory),
    receivablesTurnover: safeDiv(revenue, receivables),
    averageCollectionPeriod: safeDiv(receivables * 365, revenue),
    inventoryDays: safeDiv(inventory * 365, costOfSales)
  };
};

// Combined ratio analysis
export const calculateAllRatios = (balanceSheet: LineItem[], incomeStatement: LineItem[]) => {
  return {
    liquidity: calculateLiquidityRatios(balanceSheet),
    solvency: calculateSolvencyRatios(balanceSheet),
    profitability: calculateProfitabilityRatios(incomeStatement),
    efficiency: calculateEfficiencyRatios(balanceSheet, incomeStatement)
  };
};