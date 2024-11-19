import { StatementType, LineItem, GeneratedStatement } from '../types/financial';
import { validateIncomeStatement, validateLineItem, IncomeTotals } from './rag/knowledge-base';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions?: string[];
}

export class StatementValidator {
  static validateStatement(statement: GeneratedStatement, type: StatementType): ValidationResult {
    switch (type) {
      case 'income':
        return this.validateIncomeStatement(statement);
      case 'balance-sheet':
        return this.validateBalanceSheet(statement);
      case 'cash-flow':
        return this.validateCashFlow(statement);
      case 'pnl':
        return this.validateIncomeStatement(statement); // PnL uses same validation as income statement
      default:
        return { isValid: true, errors: [] };
    }
  }

  static validateIncomeStatement(statement: GeneratedStatement): ValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Validate line items
    statement.lineItems.forEach(item => {
      if (!validateLineItem(item, 'income')) {
        errors.push(`Invalid classification or sign for item: ${item.description}`);
        suggestions.push(`Check account code and sign convention for ${item.description}`);
      }
    });

    // Calculate totals for validation
    const totals = this.calculateIncomeTotals(statement);
    
    // Validate calculations
    if (!validateIncomeStatement(statement.lineItems, totals)) {
      errors.push('Income statement calculations are inconsistent');
      suggestions.push('Review subtotal calculations and ensure all items are properly categorized');
    }

    // Validate completeness
    const sections = new Set(statement.lineItems.map(item => item.section));
    const requiredSections = [
      'operating_revenue',
      'cost_of_sales',
      'operating_expenses',
      'financial_revenue',
      'financial_expenses'
    ];

    requiredSections.forEach(section => {
      if (!sections.has(section)) {
        errors.push(`Missing required section: ${section}`);
        suggestions.push(`Add line items for ${section}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }

  private static validateBalanceSheet(statement: GeneratedStatement): ValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Basic balance sheet equation: Assets = Liabilities + Equity
    const assets = statement.lineItems
      .filter(item => item.section.toString().toLowerCase().includes('assets'))
      .reduce((sum, item) => sum + item.amount, 0);

    const liabilitiesAndEquity = statement.lineItems
      .filter(item => 
        item.section.toString().toLowerCase().includes('liabilities') ||
        item.section.toString().toLowerCase().includes('equity')
      )
      .reduce((sum, item) => sum + item.amount, 0);

    if (Math.abs(assets - liabilitiesAndEquity) > 0.01) {
      errors.push('Balance sheet equation not balanced');
      suggestions.push('Review assets, liabilities, and equity classifications');
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }

  private static validateCashFlow(statement: GeneratedStatement): ValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Validate cash flow sections
    const sections = new Set(statement.lineItems.map(item => item.section));
    const requiredSections = ['operating', 'investing', 'financing'];

    requiredSections.forEach(section => {
      if (!sections.has(section)) {
        errors.push(`Missing required cash flow section: ${section}`);
        suggestions.push(`Add line items for ${section} activities`);
      }
    });

    // Validate total cash flow calculation
    const calculatedTotal = statement.lineItems.reduce((sum, item) => sum + item.amount, 0);
    if (Math.abs(calculatedTotal - statement.total) > 0.01) {
      errors.push('Cash flow total calculation inconsistent');
      suggestions.push('Review cash flow calculations');
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }

  private static calculateIncomeTotals(statement: GeneratedStatement): IncomeTotals {
    const totals: IncomeTotals = {
      operatingRevenue: 0,
      costOfSales: 0,
      grossProfit: 0,
      operatingExpenses: 0,
      operatingProfit: 0,
      financialIncome: 0,
      financialExpenses: 0,
      otherIncome: 0,
      otherExpenses: 0,
      profitBeforeTax: 0,
      incomeTax: 0,
      netIncome: 0
    };

    statement.lineItems.forEach(item => {
      const section = item.section.toString().toLowerCase();
      const amount = Number(item.amount);

      if (section.includes('operating_revenue')) totals.operatingRevenue += amount;
      if (section.includes('cost_of_sales')) totals.costOfSales += amount;
      if (section.includes('operating_expenses')) totals.operatingExpenses += amount;
      if (section.includes('financial_revenue')) totals.financialIncome += amount;
      if (section.includes('financial_expenses')) totals.financialExpenses += amount;
      if (section.includes('other_revenue')) totals.otherIncome += amount;
      if (section.includes('other_expenses')) totals.otherExpenses += amount;
      if (section.includes('income_tax')) totals.incomeTax += amount;
    });

    // Calculate derived totals
    totals.grossProfit = totals.operatingRevenue - totals.costOfSales;
    totals.operatingProfit = totals.grossProfit - totals.operatingExpenses;
    totals.profitBeforeTax = totals.operatingProfit + totals.financialIncome - 
                            totals.financialExpenses + totals.otherIncome - totals.otherExpenses;
    totals.netIncome = totals.profitBeforeTax - totals.incomeTax;

    return totals;
  }
}

// Export the validateStatement function directly for convenience
export const validateStatement = (statement: GeneratedStatement, type: StatementType): ValidationResult => {
  return StatementValidator.validateStatement(statement, type);
};