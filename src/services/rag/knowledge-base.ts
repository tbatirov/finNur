import { StatementType, LineItem } from '../../types/financial';

export interface AccountingRule {
  id: string;
  category: 'sign' | 'classification' | 'calculation';
  type: StatementType[];
  code: string;
  description: string;
  validation: string;
}

export interface IncomeTotals {
  operatingRevenue: number;
  costOfSales: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingProfit: number;
  financialIncome: number;
  financialExpenses: number;
  otherIncome: number;
  otherExpenses: number;
  profitBeforeTax: number;
  incomeTax: number;
  netIncome: number;
}

// NAS Uzbekistan Account Code Structure
export const NAS_ACCOUNT_STRUCTURE = {
  assets: {
    current: {
      '0100-0199': 'Cash and cash equivalents',
      '0200-0299': 'Short-term investments',
      '0300-0399': 'Trade receivables',
      '0400-0499': 'Inventory',
      '0500-0599': 'Current tax assets',
      '0600-0699': 'Prepaid expenses',
      '0700-0799': 'Other current assets'
    },
    noncurrent: {
      '0800-0899': 'Long-term investments',
      '0900-0999': 'Fixed assets',
      '1000-1099': 'Intangible assets',
      '1100-1199': 'Long-term receivables',
      '1200-1299': 'Deferred tax assets',
      '1300-1399': 'Other non-current assets'
    }
  },
  contraAssets: {
    '1400-1499': 'Accumulated depreciation - Fixed assets',
    '1500-1599': 'Accumulated amortization - Intangible assets',
    '1600-1699': 'Allowance for doubtful accounts',
    '1700-1799': 'Inventory valuation adjustments'
  },
  liabilities: {
    current: {
      '2000-2099': 'Trade payables',
      '2100-2199': 'Short-term borrowings',
      '2200-2299': 'Current tax liabilities',
      '2300-2399': 'Accrued expenses',
      '2400-2499': 'Other current liabilities'
    },
    noncurrent: {
      '2500-2599': 'Long-term borrowings',
      '2600-2699': 'Bonds payable',
      '2700-2799': 'Deferred tax liabilities',
      '2800-2899': 'Other non-current liabilities'
    }
  },
  equity: {
    '3000-3099': 'Share capital',
    '3100-3199': 'Additional paid-in capital',
    '3200-3299': 'Revaluation reserves',
    '3300-3399': 'Retained earnings',
    '3400-3499': 'Treasury shares'
  },
  revenue: {
    '9000-9099': 'Operating revenue',
    '9100-9199': 'Financial income',
    '9200-9299': 'Other income'
  },
  expenses: {
    '9300-9399': 'Cost of sales',
    '9400-9499': 'Operating expenses',
    '9500-9599': 'Financial expenses',
    '9600-9699': 'Tax expenses',
    '9700-9799': 'Other expenses'
  }
};

// NAS Uzbekistan Accounting Rules
export const accountingRules: AccountingRule[] = [
  // Asset Sign Convention Rules
  {
    id: 'sign-001',
    category: 'sign',
    type: ['balance-sheet'],
    code: '0100-1399',
    description: 'Active accounts must have positive balances',
    validation: 'balance > 0 || isContraAccount'
  },
  {
    id: 'sign-002',
    category: 'sign',
    type: ['balance-sheet'],
    code: '1400-1799',
    description: 'Contra asset accounts must have negative balances',
    validation: 'balance < 0'
  },
  {
    id: 'sign-003',
    category: 'sign',
    type: ['balance-sheet'],
    code: '2000-2899',
    description: 'Liability accounts must have positive balances',
    validation: 'balance > 0'
  },
  {
    id: 'sign-004',
    category: 'sign',
    type: ['balance-sheet'],
    code: '3000-3499',
    description: 'Equity accounts must have positive balances (except treasury shares)',
    validation: 'balance > 0 || code.startsWith("3400")'
  },

  // Income Statement Rules
  {
    id: 'income-001',
    category: 'sign',
    type: ['income', 'pnl'],
    code: '9000-9299',
    description: 'Revenue accounts must have positive balances',
    validation: 'balance > 0'
  },
  {
    id: 'income-002',
    category: 'sign',
    type: ['income', 'pnl'],
    code: '9300-9899',
    description: 'Expense accounts must have negative balances',
    validation: 'balance < 0'
  },
  {
    id: 'income-003',
    category: 'calculation',
    type: ['income', 'pnl'],
    code: 'all',
    description: 'Gross profit must equal revenue minus cost of sales',
    validation: 'Math.abs(grossProfit - (revenue - costOfSales)) < 0.01'
  },
  {
    id: 'income-004',
    category: 'calculation',
    type: ['income', 'pnl'],
    code: 'all',
    description: 'Operating profit must equal gross profit minus operating expenses',
    validation: 'Math.abs(operatingProfit - (grossProfit - operatingExpenses)) < 0.01'
  },

  // Cash Flow Rules
  {
    id: 'cash-001',
    category: 'sign',
    type: ['cash-flow'],
    code: '4000-4099',
    description: 'Cash receipts must have positive balances',
    validation: 'balance > 0'
  },
  {
    id: 'cash-002',
    category: 'sign',
    type: ['cash-flow'],
    code: '4100-4399',
    description: 'Cash payments must have negative balances',
    validation: 'balance < 0'
  },
  {
    id: 'cash-003',
    category: 'calculation',
    type: ['cash-flow'],
    code: 'all',
    description: 'Net cash flow must equal sum of operating, investing, and financing activities',
    validation: 'Math.abs(netCashFlow - (operatingCashFlow + investingCashFlow + financingCashFlow)) < 0.01'
  }
];

export function validateLineItem(item: LineItem, type: StatementType): boolean {
  const code = typeof item.section === 'string' 
    ? parseInt(item.section.split(' ')[0])
    : parseInt(item.section.code);

  const relevantRules = accountingRules.filter(rule => 
    rule.type.includes(type) && 
    (rule.code === 'all' || isCodeInRange(code, rule.code))
  );

  return relevantRules.every(rule => evaluateRule(rule, item));
}

export function validateIncomeStatement(items: LineItem[], totals: IncomeTotals): boolean {
  // Validate gross profit calculation
  if (Math.abs(totals.grossProfit - (totals.operatingRevenue - totals.costOfSales)) > 0.01) {
    return false;
  }

  // Validate operating profit calculation
  if (Math.abs(totals.operatingProfit - (totals.grossProfit - totals.operatingExpenses)) > 0.01) {
    return false;
  }

  // Validate net income calculation
  const calculatedNetIncome = totals.operatingProfit + 
    totals.financialIncome - totals.financialExpenses +
    totals.otherIncome - totals.otherExpenses - totals.incomeTax;

  if (Math.abs(totals.netIncome - calculatedNetIncome) > 0.01) {
    return false;
  }

  return true;
}

function isCodeInRange(code: number, range: string): boolean {
  if (range === 'all') return true;
  const [start, end] = range.split('-').map(Number);
  return code >= start && code <= end;
}

function evaluateRule(rule: AccountingRule, item: LineItem): boolean {
  const context = {
    balance: item.amount,
    code: item.section.toString(),
    isContraAccount: (item: LineItem) => item.description.toLowerCase().includes('contra')
  };

  try {
    return new Function(...Object.keys(context), `return ${rule.validation}`)
      (...Object.values(context));
  } catch {
    return false;
  }
}