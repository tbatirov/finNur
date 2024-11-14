import { StatementType } from '../../types/financial';

export interface AccountingRule {
  id: string;
  category: 'sign' | 'classification' | 'calculation';
  type: StatementType[];
  code: string;
  description: string;
  validation: string;
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
    '4000-4099': 'Operating revenue',
    '4100-4199': 'Financial income',
    '4200-4299': 'Other income'
  },
  expenses: {
    '5000-5099': 'Cost of sales',
    '5100-5199': 'Operating expenses',
    '5200-5299': 'Financial expenses',
    '5300-5399': 'Tax expenses',
    '5400-5499': 'Other expenses'
  }
};

// Updated accounting rules based on NAS Uzbekistan
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
  {
    id: 'sign-005',
    category: 'sign',
    type: ['income', 'pnl'],
    code: '4000-4299',
    description: 'Revenue accounts must have positive balances',
    validation: 'balance > 0'
  },
  {
    id: 'sign-006',
    category: 'sign',
    type: ['income', 'pnl'],
    code: '5000-5499',
    description: 'Expense accounts must have negative balances',
    validation: 'balance < 0'
  },

  // Classification Rules
  {
    id: 'class-001',
    category: 'classification',
    type: ['balance-sheet'],
    code: '0100-0799',
    description: 'Current assets must be classified under current assets section',
    validation: 'section === "assets_current"'
  },
  {
    id: 'class-002',
    category: 'classification',
    type: ['balance-sheet'],
    code: '0800-1399',
    description: 'Non-current assets must be classified under non-current assets section',
    validation: 'section === "assets_noncurrent"'
  },
  {
    id: 'class-003',
    category: 'classification',
    type: ['balance-sheet'],
    code: '2000-2499',
    description: 'Current liabilities must be classified under current liabilities section',
    validation: 'section === "liabilities_current"'
  },
  {
    id: 'class-004',
    category: 'classification',
    type: ['balance-sheet'],
    code: '2500-2899',
    description: 'Non-current liabilities must be classified under non-current liabilities section',
    validation: 'section === "liabilities_noncurrent"'
  },

  // Calculation Rules
  {
    id: 'calc-001',
    category: 'calculation',
    type: ['balance-sheet'],
    code: 'all',
    description: 'Total assets must equal total liabilities plus equity',
    validation: 'Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01'
  },
  {
    id: 'calc-002',
    category: 'calculation',
    type: ['income', 'pnl'],
    code: 'all',
    description: 'Net income must equal total revenue minus total expenses',
    validation: 'Math.abs(netIncome - (totalRevenue - totalExpenses)) < 0.01'
  },
  {
    id: 'calc-003',
    category: 'calculation',
    type: ['balance-sheet'],
    code: '0100-1399',
    description: 'Net assets must be positive (going concern principle)',
    validation: 'netAssets > 0'
  }
];

export function getRulesForStatement(type: StatementType): AccountingRule[] {
  return accountingRules.filter(rule => rule.type.includes(type));
}

export function getRulesByCategory(category: AccountingRule['category']): AccountingRule[] {
  return accountingRules.filter(rule => rule.category === category);
}

export function getRuleById(id: string): AccountingRule | undefined {
  return accountingRules.find(rule => rule.id === id);
}

export function getAccountSection(code: string): string {
  const numericCode = parseInt(code);
  
  // Check each section in NAS_ACCOUNT_STRUCTURE
  if (numericCode >= 100 && numericCode <= 799) return 'assets_current';
  if (numericCode >= 800 && numericCode <= 1399) return 'assets_noncurrent';
  if (numericCode >= 1400 && numericCode <= 1799) return 'contra_assets';
  if (numericCode >= 2000 && numericCode <= 2499) return 'liabilities_current';
  if (numericCode >= 2500 && numericCode <= 2899) return 'liabilities_noncurrent';
  if (numericCode >= 3000 && numericCode <= 3499) return 'equity';
  if (numericCode >= 4000 && numericCode <= 4299) return 'revenue';
  if (numericCode >= 5000 && numericCode <= 5499) return 'expenses';
  
  return 'other';
}