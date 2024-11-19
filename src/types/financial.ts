import { z } from 'zod';

export const AccountCodeRanges = {
  CURRENT_ASSETS: ['0100', '0999'] as const,
  CASH: ['0100', '0199'] as const,
  SHORT_TERM_INVESTMENTS: ['0200', '0299'] as const,
  RECEIVABLES: ['0300', '0399'] as const,
  INVENTORY: ['0400', '0499'] as const,
  PREPAID_EXPENSES: ['0500', '0599'] as const,
  OTHER_CURRENT_ASSETS: ['0600', '0999'] as const,

  NON_CURRENT_ASSETS: ['1000', '2999'] as const,
  LONG_TERM_INVESTMENTS: ['1000', '1099'] as const,
  FIXED_ASSETS: ['1100', '1199'] as const,
  INTANGIBLE_ASSETS: ['1200', '1299'] as const,
  LONG_TERM_RECEIVABLES: ['1300', '1399'] as const,
  CAPITAL_INVESTMENTS: ['1400', '1499'] as const,
  BIOLOGICAL_ASSETS: ['1500', '1599'] as const,
  DEFERRED_TAX_ASSETS: ['1600', '1699'] as const,
  OTHER_NON_CURRENT_ASSETS: ['1700', '2999'] as const,

  CONTRA_ASSETS: ['3000', '3999'] as const,
  ACCUMULATED_DEPRECIATION: ['3000', '3199'] as const,
  ACCUMULATED_AMORTIZATION: ['3200', '3399'] as const,
  ALLOWANCES: ['3400', '3999'] as const,

  CURRENT_LIABILITIES: ['4000', '4999'] as const,
  ACCOUNTS_PAYABLE: ['4000', '4099'] as const,
  SHORT_TERM_LOANS: ['4100', '4199'] as const,
  TAX_LIABILITIES: ['4200', '4299'] as const,
  EMPLOYEE_LIABILITIES: ['4300', '4399'] as const,
  OTHER_CURRENT_LIABILITIES: ['4400', '4999'] as const,

  LONG_TERM_LIABILITIES: ['5000', '5999'] as const,
  LONG_TERM_LOANS: ['5000', '5099'] as const,
  BONDS_PAYABLE: ['5100', '5199'] as const,
  FINANCE_LEASE_LIABILITIES: ['5200', '5299'] as const,
  DEFERRED_TAX_LIABILITIES: ['5300', '5399'] as const,
  OTHER_LONG_TERM_LIABILITIES: ['5400', '5999'] as const,

  EQUITY: ['6000', '6999'] as const,
  SHARE_CAPITAL: ['6000', '6099'] as const,
  ADDITIONAL_CAPITAL: ['6100', '6199'] as const,
  RESERVES: ['6200', '6299'] as const,
  RETAINED_EARNINGS: ['6300', '6399'] as const,
  REVALUATION_RESERVES: ['6400', '6499'] as const,
  OTHER_EQUITY: ['6500', '6999'] as const,

  REVENUE: ['7000', '7999'] as const,
  OPERATING_REVENUE: ['7000', '7499'] as const,
  FINANCIAL_INCOME: ['7500', '7699'] as const,
  OTHER_INCOME: ['7700', '7999'] as const,

  EXPENSES: ['8000', '8999'] as const,
  COST_OF_SALES: ['8000', '8099'] as const,
  OPERATING_EXPENSES: ['8100', '8499'] as const,
  FINANCIAL_EXPENSES: ['8500', '8699'] as const,
  OTHER_EXPENSES: ['8700', '8999'] as const
} as const;

export type StatementType = 'balance-sheet' | 'income' | 'cash-flow' | 'pnl';

export const AccountEntrySchema = z.object({
  accountCode: z.string().regex(/^\d{4}$/),
  accountName: z.string().min(1),
  openingBalanceDebit: z.number(),
  openingBalanceCredit: z.number(),
  currentTurnoverDebit: z.number(),
  currentTurnoverCredit: z.number(),
  endOfPeriodDebit: z.number(),
  endOfPeriodCredit: z.number()
});

export type AccountEntry = z.infer<typeof AccountEntrySchema>;

export const LineItemSchema = z.object({
  id: z.string().optional(),
  description: z.string(),
  code: z.string().regex(/^\d{4}$/),
  amount: z.number(),
  section: z.string()
});

export type LineItem = z.infer<typeof LineItemSchema>;

export const GeneratedStatementSchema = z.object({
  lineItems: z.array(LineItemSchema),
  subtotals: z.array(z.object({
    description: z.string(),
    amount: z.number()
  })),
  total: z.number(),
  validations: z.array(z.string()),
  corrections: z.array(z.string())
});

export type GeneratedStatement = z.infer<typeof GeneratedStatementSchema>;

export const SavedStatementSchema = z.object({
  id: z.string(),
  type: z.enum(['balance-sheet', 'income', 'cash-flow', 'pnl']),
  statement: GeneratedStatementSchema,
  createdAt: z.string(),
  updatedAt: z.string()
});

export type SavedStatement = z.infer<typeof SavedStatementSchema>;

export const RatioSchema = z.object({
  name: z.string(),
  value: z.number(),
  description: z.string(),
  category: z.enum(['liquidity', 'solvency', 'profitability', 'activity']),
  benchmark: z.string().optional(),
  trend: z.enum(['up', 'down', 'stable']).optional()
});

export type Ratio = z.infer<typeof RatioSchema>;

export const RatioCategorySchema = z.object({
  name: z.string(),
  ratios: z.array(RatioSchema)
});

export type RatioCategory = z.infer<typeof RatioCategorySchema>;

export class RatioCalculationError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'RatioCalculationError';
  }
}