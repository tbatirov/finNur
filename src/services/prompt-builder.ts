export type StatementType = 'balance-sheet' | 'income' | 'cash-flow' | 'pnl';

export interface AccountEntry {
  code: string;
  description: string;
  amount: number;
}

export function buildStructuredPrompt(
  type: StatementType,
  data: AccountEntry[]
): string {
  const basePrompt = `Generate a ${type} following Uzbekistan NAS requirements. Return in the language data is submitted in. Return ONLY a valid JSON object with this structure:

{
  "lineItems": [
    {
      "description": "Account name",
      "code": "Account code", // number type,
      "amount": "Number following sign conventions", // number type,
      "section": "Account code + name (e.g., '1000 Cash')"
    }
  ],
  "subtotals": [
    {
      "description": "Section name",
      "amount": "Section total" // number type
    }
  ],
  "total": "Statement total", // number type
  "validations": ["Validation steps performed"],
  "corrections": ["Any corrections made"],
}

Account Classification Rules and Sign Conventions per NAS Uzbekistan:

1. Assets (0100-1399): POSITIVE BALANCE ACCOUNTS [DEBIT: +, CREDIT: -]
   Current Assets (0100-0799):
   - Cash and Cash Equivalents (0100-0199)
      * Cash in National Currency
      * Cash in Foreign Currency
      * Short-term Deposits
   - Short-term Investments (0200-0299)
      * Securities
      * Short-term Loans Given
   - Accounts Receivable (0300-0399)
      * Trade Receivables
      * Related Party Receivables
      * Employee Receivables
   - Inventory (0400-0499)
      * Raw Materials
      * Work in Progress
      * Finished Goods
      * Goods for Resale
   - Prepaid Expenses (0500-0599)
   - Other Current Assets (0600-0799)

   Non-current Assets (0800-1399):
   - Long-term Investments (0800-0899)
   - Fixed Assets (0900-0999)
      * Land and Buildings
      * Plant and Equipment
      * Vehicles
      * Office Equipment
   - Intangible Assets (1000-1099)
   - Long-term Receivables (1100-1199)
   - Other Non-current Assets (1200-1399)

2. Contra Accounts (1400-1799): ALWAYS NEGATIVE BALANCE [CREDIT: +, DEBIT: -]
   - Accumulated Depreciation (1400-1499)
      * Buildings Depreciation
      * Equipment Depreciation
      * Vehicle Depreciation
   - Accumulated Amortization (1500-1599)
   - Allowances and Reserves (1600-1799)
      * Allowance for Doubtful Accounts
      * Inventory Obsolescence Reserve

3. Liabilities (2000-2899): NEGATIVE BALANCE ACCOUNTS [CREDIT: +, DEBIT: -]
   Current Liabilities (2000-2499):
   - Accounts Payable (2000-2099)
   - Short-term Loans (2100-2199)
   - Tax Liabilities (2200-2299)
   - Employee Related Liabilities (2300-2399)
   - Other Current Liabilities (2400-2499)

   Non-current Liabilities (2500-2899):
   - Long-term Loans (2500-2599)
   - Bonds Payable (2600-2699)
   - Deferred Tax Liabilities (2700-2799)
   - Other Non-current Liabilities (2800-2899)

4. Equity (3000-3499): NEGATIVE BALANCE ACCOUNTS [CREDIT: +, DEBIT: -]
   - Share Capital (3000-3099)
      * Common Stock
      * Preferred Stock
   - Additional Paid-in Capital (3100-3199)
   - Reserves (3200-3299)
      * Legal Reserve
      * Statutory Reserve
   - Retained Earnings (3300-3399)
      * Current Year Earnings
      * Prior Years' Earnings
   - Other Equity Items (3400-3499)

5. Revenue/Income (4000-4999): NEGATIVE BALANCE ACCOUNTS [CREDIT: +, DEBIT: -]
   - Operating Revenue (4000-4299)
      * Product Sales
      * Service Revenue
      * Export Sales
   - Financial Income (4300-4499)
      * Interest Income
      * Foreign Exchange Gains
   - Other Income (4500-4999)
      * Asset Disposal Gains
      * Extraordinary Income

6. Expenses (5000-5499): POSITIVE BALANCE ACCOUNTS [DEBIT: +, CREDIT: -]
   - Cost of Sales (5000-5099)
      * Direct Materials
      * Direct Labor
      * Manufacturing Overhead
   - Operating Expenses (5100-5299)
      * Administrative Expenses
      * Selling Expenses
      * Marketing Expenses
      * Staff Costs
   - Financial Expenses (5300-5399)
      * Interest Expense
      * Foreign Exchange Losses
   - Other Expenses (5400-5499)
      * Asset Disposal Losses
      * Extraordinary Expenses

Sign Convention Summary:
1. POSITIVE BALANCE ACCOUNTS (Debit Balance):
   - All Assets (0100-1399)
   - All Expenses (5000-5499)
   
2. NEGATIVE BALANCE ACCOUNTS (Credit Balance):
   - All Liabilities (2000-2899)
   - All Equity accounts (3000-3499)
   - All Revenue/Income (4000-4999)
   - All Contra Accounts (1400-1799)

3. Financial Statement Presentation Rules:
   - Assets: Show as positive values
   - Contra Accounts: Show as negative values (reducing related asset)
   - Liabilities: Show as positive values
   - Equity: Show as positive values
   - Revenue: Show as positive values
   - Expenses: Show as negative values (reducing income)

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
     * Show quick ratio components separately
     * Categorize working capital components
   - Non-Current Assets (0800-1399)
     * Show fixed assets by category
     * Detail investment types
   - Current Liabilities (2000-2499)
     * Separate operational and financial liabilities
   - Non-Current Liabilities (2500-2899)
     * Detail long-term financing structure
   - Equity (3000-3499)
     * Show changes in equity components
3. Show contra accounts with their related assets
4. Calculate key ratios:
   - Liquidity Ratios
     * Current Ratio
     * Quick Ratio
     * Cash Ratio
   - Solvency Ratios
     * Debt-to-Equity
     * Debt-to-Assets
     * Interest Coverage
   - Efficiency Ratios
     * Asset Turnover
     * Working Capital Turnover
   - Capital Structure Analysis
     * Equity Ratio
     * Debt Ratio
     * Financial Leverage

Balance Sheet Sign Conventions:
1. Assets: Present as positive (debit balances)
2. Contra Accounts: Present as negative (credit balances)
3. Liabilities: Present as positive (credit balances)
4. Equity: Present as positive (credit balances)`;

    case 'income':
      return `${basePrompt}

Income Statement Requirements:
1. Revenue Classification (4000-4999):
   - Operating Revenue (4000-4299)
     * By product/service line
     * By geographical segment
   - Financial Revenue (4300-4499)
   - Other Revenue (4500-4999)

2. Cost and Expense Analysis (5000-5499):
   - Cost of Sales (5000-5099)
     * Direct costs
     * Indirect costs
     * Manufacturing overhead
   - Operating Expenses (5100-5299)
     * Administrative
     * Selling
     * Marketing
   - Financial Expenses (5300-5399)
   - Other Expenses (5400-5499)

3. Calculate and show:
   - Gross Profit
   - Operating Income
   - EBITDA
   - Income Before Tax
   - Net Income

4. Profitability Analysis:
   - Gross Profit Margin
   - Operating Margin
   - EBITDA Margin
   - Net Profit Margin
   - Return on Sales

5. Cost Analysis:
   - Cost of Sales Ratio
   - Operating Expense Ratio
   - Variable Cost Ratio
   - Fixed Cost Ratio

6. Efficiency Metrics:
   - Operating Leverage
   - Revenue per Employee
   - Operating Expense per Revenue
   - Cost Structure Analysis

Income Statement Sign Conventions:
1. Revenue: Present as positive (credit balances)
2. Expenses: Present as negative (debit balances)
3. Gains: Present as positive (credit balances)
4. Losses: Present as negative (debit balances)`;

    case 'cash-flow':
      return `${basePrompt}

Cash Flow Requirements:
1. Operating Activities:
   - Cash Receipts:
     * From customers (POSITIVE)
     * Interest received (POSITIVE)
     * Other operating receipts (POSITIVE)
   - Cash Payments:
     * To suppliers (NEGATIVE)
     * To employees (NEGATIVE)
     * Operating expenses (NEGATIVE)
     * Interest paid (NEGATIVE)
     * Income taxes paid (NEGATIVE)

2. Investing Activities:
   - Capital Expenditure:
     * Property and equipment (NEGATIVE)
     * Intangible assets (NEGATIVE)
   - Investment Transactions:
     * Purchase of investments (NEGATIVE)
     * Sale of investments (POSITIVE)
   - Other Investing Activities:
     * Acquisitions (NEGATIVE)
     * Disposals (POSITIVE)

3. Financing Activities:
   - Equity Transactions:
     * Share issues (POSITIVE)
     * Dividends paid (NEGATIVE)
   - Debt Transactions:
     * Loans received (POSITIVE)
     * Loan repayments (NEGATIVE)
     * Bond issues (POSITIVE)

4. Analysis Requirements:
   - Free Cash Flow
   - Operating Cash Flow Ratio
   - Cash Flow Coverage Ratio
   - Cash Flow to Debt Ratio
   - Cash Flow per Share

Cash Flow Statement Sign Conventions:
1. Cash Inflows: Present as positive
2. Cash Outflows: Present as negative
3. Net Change in Cash: Show actual mathematical result`;

    case 'pnl':
      return `${basePrompt}

P&L Requirements:
1. Revenue Analysis:
   - Operating Revenue by Segment (POSITIVE)
   - Revenue Growth Analysis
   - Revenue Mix Analysis

2. Cost Analysis:
   - Variable vs Fixed Costs (NEGATIVE)
   - Cost Behavior Analysis
   - Cost Center Analysis

3. Expense Categories (ALL NEGATIVE):
   - Administrative Expenses
   - Selling Expenses
   - Marketing Expenses
   - Research & Development
   - Financial Expenses

4. Profitability Analysis:
   - Segment Profitability
   - Product Line Profitability
   - Customer Profitability

5. Performance Metrics:
   - Break-even Analysis
   - Contribution Margin
   - Operating Leverage
   - Financial Leverage
   - Combined Leverage

6. Additional Requirements:
   - Year-over-year Comparison
   - Budget vs Actual Analysis
   - Variance Analysis
   - Trend Analysis

P&L Statement Sign Conventions:
1. Revenue: Present as positive
2. Costs and Expenses: Present as negative
3. Net Profit/Loss: Show actual mathematical result`;

    default:
      return basePrompt;
  }
}
