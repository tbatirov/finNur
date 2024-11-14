import { StatementType, AccountEntry } from '../types/financial';
import { STATEMENT_SECTIONS } from './statement-structure';
import { NAS_ACCOUNT_STRUCTURE } from './rag/knowledge-base';

export function buildStructuredPrompt(
  type: StatementType,
  data: AccountEntry[]
): string {
  const basePrompt = `Generate a ${type} following Uzbekistan NAS requirements. Return ONLY a valid JSON object with this structure:

{
  "lineItems": [
    {
      "description": "Account name",
      "amount": "Number following sign conventions",
      "section": "Account code + name (e.g., '1000 Cash')"
    }
  ],
  "subtotals": [
    {
      "description": "Section name",
      "amount": "Section total"
    }
  ],
  "total": "Statement total",
  "validations": ["Validation steps performed"],
  "corrections": ["Any corrections made"]
}

Account Classification Rules per NAS Uzbekistan:

1. Assets (0100-1399):
   - Normal balance: POSITIVE
   - Contra accounts: NEGATIVE
   - Current assets: 0100-0799
   - Non-current assets: 0800-1399

2. Contra Accounts (1400-1799):
   - Always NEGATIVE
   - Accumulated depreciation: 1400-1499
   - Accumulated amortization: 1500-1599
   - Allowances and reserves: 1600-1799

3. Liabilities (2000-2899):
   - Normal balance: POSITIVE
   - Current: 2000-2499
   - Non-current: 2500-2899

4. Equity (3000-3499):
   - Normal balance: POSITIVE
   - Share capital: 3000-3099
   - Reserves: 3200-3299
   - Retained earnings: 3300-3399

5. Revenue/Expense:
   - Revenue (4000-4299): POSITIVE
   - Expenses (5000-5499): NEGATIVE

Trial Balance Data:
${JSON.stringify(data, null, 2)}`;

  // Add statement-specific rules
  switch (type) {
    case 'balance-sheet':
      return `${basePrompt}

Balance Sheet Requirements:
1. Assets = Liabilities + Equity
2. Group by:
   - Current Assets (0100-0799)
   - Non-Current Assets (0800-1399)
   - Current Liabilities (2000-2499)
   - Non-Current Liabilities (2500-2899)
   - Equity (3000-3499)
3. Show contra accounts with their related assets`;

    case 'income':
      return `${basePrompt}

Income Statement Requirements:
1. Revenue (4000-4099): POSITIVE
2. Cost of Sales (5000-5099): NEGATIVE
3. Operating Expenses (5100-5299): NEGATIVE
4. Other Income/Expenses (5300-5499): Follow normal conventions
5. Calculate and show:
   - Gross Profit
   - Operating Income
   - Net Income`;

    case 'cash-flow':
      return `${basePrompt}

Cash Flow Requirements:
1. Operating Activities:
   - Cash from customers: POSITIVE
   - Cash paid to suppliers/employees: NEGATIVE
2. Investing Activities:
   - Asset purchases: NEGATIVE
   - Asset sales: POSITIVE
3. Financing Activities:
   - Borrowings: POSITIVE
   - Repayments: NEGATIVE`;

    case 'pnl':
      return `${basePrompt}

P&L Requirements:
1. Follow Income Statement rules
2. Additional detail for:
   - Operating revenue/expenses
   - Financial income/expenses
   - Extraordinary items
3. Show all subtotals`;

    default:
      return basePrompt;
  }
}