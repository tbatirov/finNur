export interface AccountEntry {
  accountCode: string;
  accountName: string;
  openingBalanceDebit: number;
  openingBalanceCredit: number;
  currentTurnoverDebit: number;
  currentTurnoverCredit: number;
  endOfPeriodDebit: number;
  endOfPeriodCredit: number;
}

export interface LineItem {
  id?: string;
  description: string;
  code: number;
  amount: number;
  section: string;
}

export interface GeneratedStatement {
  lineItems: LineItem[];
  subtotals: Array<{ description: string; amount: number }>;
  total: number;
  validations: string[];
  corrections: string[];
}

export type StatementType = 'balance-sheet' | 'income' | 'cash-flow' | 'pnl';

export interface SavedStatement {
  id: string;
  type: StatementType;
  statement: GeneratedStatement;
  createdAt: string;
  updatedAt: string;
}

export interface StatementData {
  company_id: string;
  fiscal_year_id: string;
  month: number;
  type: StatementType;
  data: GeneratedStatement;
}