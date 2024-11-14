import { StatementType, LineItem, GeneratedStatement } from '../types/financial';
import { NAS_ACCOUNT_STRUCTURE } from './rag/knowledge-base';
import { getAccountName, isContraAccount } from './rag/account-names';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions?: string[];
}

export class StatementValidator {
  static validateSignConvention(item: LineItem): ValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    if (typeof item.section !== 'string') {
      errors.push(`Invalid section format for item: ${item.description}`);
      return { isValid: false, errors, suggestions };
    }

    const accountCode = parseInt(item.section.split(' ')[0]);
    const accountName = item.description;
    const isContra = isContraAccount(accountName);

    // Assets (0100-1399)
    if (accountCode >= 100 && accountCode <= 1399) {
      if (item.amount < 0 && !isContra) {
        errors.push(`Asset account ${item.section} should have positive balance`);
        suggestions.push(`Verify if ${item.section} is a contra account`);
      }
    }

    // Contra Accounts (1400-1799)
    if (accountCode >= 1400 && accountCode <= 1799) {
      if (item.amount > 0) {
        errors.push(`Contra account ${item.section} should have negative balance`);
      }
    }

    // Liabilities (2000-2899)
    if (accountCode >= 2000 && accountCode <= 2899) {
      if (item.amount < 0) {
        errors.push(`Liability account ${item.section} should have positive balance`);
        suggestions.push(`Check for abnormal balance in ${item.section}`);
      }
    }

    // Equity (3000-3499)
    if (accountCode >= 3000 && accountCode <= 3499) {
      if (item.amount < 0 && accountCode !== 3400) { // Treasury shares can be negative
        errors.push(`Equity account ${item.section} should have positive balance`);
      }
    }

    // Revenue (4000-4299)
    if (accountCode >= 4000 && accountCode <= 4299) {
      if (item.amount < 0) {
        errors.push(`Revenue account ${item.section} should have positive balance`);
      }
    }

    // Expenses (5000-5499)
    if (accountCode >= 5000 && accountCode <= 5499) {
      if (item.amount > 0) {
        errors.push(`Expense account ${item.section} should have negative balance`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }

  static validateCalculations(statement: GeneratedStatement): ValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Ensure all amounts are numbers
    const total = Number(statement.total);
    if (isNaN(total)) {
      errors.push('Invalid statement total');
      return { isValid: false, errors };
    }

    // Validate line items total
    const lineItemsTotal = statement.lineItems.reduce((sum, item) => sum + Number(item.amount), 0);
    if (Math.abs(lineItemsTotal - total) > 0.01) {
      errors.push(`Total mismatch: Line items sum to ${lineItemsTotal.toFixed(2)} but total is ${total.toFixed(2)}`);
      suggestions.push('Review all line items for accuracy');
    }

    // Validate subtotals
    statement.subtotals.forEach(subtotal => {
      const subtotalAmount = Number(subtotal.amount);
      if (isNaN(subtotalAmount)) {
        errors.push(`Invalid subtotal amount for ${subtotal.description}`);
        return;
      }

      const items = statement.lineItems.filter(item => 
        item.section.startsWith(subtotal.description.split(' ')[0])
      );
      
      const calculatedTotal = items.reduce((sum, item) => sum + Number(item.amount), 0);
      if (Math.abs(calculatedTotal - subtotalAmount) > 0.01) {
        errors.push(`Subtotal mismatch for ${subtotal.description}: Calculated ${calculatedTotal.toFixed(2)} but shows ${subtotalAmount.toFixed(2)}`);
        suggestions.push(`Review items in ${subtotal.description}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }

  static validateStatement(statement: GeneratedStatement, type: StatementType): ValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Ensure all amounts are numbers
    const total = Number(statement.total);
    if (isNaN(total)) {
      errors.push('Invalid statement total');
      return { isValid: false, errors };
    }

    // Validate each line item's sign convention
    statement.lineItems.forEach(item => {
      const signValidation = this.validateSignConvention(item);
      errors.push(...signValidation.errors);
      if (signValidation.suggestions) {
        suggestions.push(...signValidation.suggestions);
      }
    });

    // Validate calculations
    const calculationValidation = this.validateCalculations(statement);
    errors.push(...calculationValidation.errors);
    if (calculationValidation.suggestions) {
      suggestions.push(...calculationValidation.suggestions);
    }

    // Statement-specific validations
    if (type === 'balance-sheet') {
      const assets = statement.lineItems
        .filter(item => {
          const code = parseInt(item.section.split(' ')[0]);
          return code >= 100 && code <= 1399;
        })
        .reduce((sum, item) => sum + Number(item.amount), 0);

      const liabilitiesAndEquity = statement.lineItems
        .filter(item => {
          const code = parseInt(item.section.split(' ')[0]);
          return code >= 2000 && code <= 3499;
        })
        .reduce((sum, item) => sum + Number(item.amount), 0);

      if (Math.abs(assets - liabilitiesAndEquity) > 0.01) {
        errors.push(`Balance sheet doesn't balance: Assets (${assets.toFixed(2)}) ≠ Liabilities + Equity (${liabilitiesAndEquity.toFixed(2)})`);
        suggestions.push('Review account classifications');
      }
    }

    if (type === 'income' || type === 'pnl') {
      const revenue = statement.lineItems
        .filter(item => {
          const code = parseInt(item.section.split(' ')[0]);
          return code >= 4000 && code <= 4299;
        })
        .reduce((sum, item) => sum + Number(item.amount), 0);

      const expenses = statement.lineItems
        .filter(item => {
          const code = parseInt(item.section.split(' ')[0]);
          return code >= 5000 && code <= 5499;
        })
        .reduce((sum, item) => sum + Number(item.amount), 0);

      if (Math.abs((revenue + expenses) - total) > 0.01) {
        errors.push(`Income calculation error: Revenue (${revenue.toFixed(2)}) + Expenses (${expenses.toFixed(2)}) ≠ Net Income (${total.toFixed(2)})`);
        suggestions.push('Verify expense accounts are negative');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }
}

// Export the validateStatement function directly
export const validateStatement = (statement: GeneratedStatement, type: StatementType): ValidationResult => {
  return StatementValidator.validateStatement(statement, type);
};