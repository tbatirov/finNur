import { StatementType, LineItem } from '../../types/financial';
import { logger } from '../logger';
import { NAS_ACCOUNTS, ACCOUNT_RELATIONSHIPS } from './nas-accounts';

interface ValidationResult {
  isValid: boolean;
  violations: string[];
}

export class NASValidator {
  static validateHierarchy(item: LineItem): ValidationResult {
    const violations: string[] = [];
    const code = item.code;
    let foundInHierarchy = false;

    // Check if account exists in NAS hierarchy
    for (const [category, subcategories] of Object.entries(NAS_ACCOUNTS)) {
      for (const [subcategory, data] of Object.entries(subcategories)) {
        if (data.range && this.isInRange(code, data.range[0], data.range[1])) {
          foundInHierarchy = true;
          // Validate if account exists in specific accounts list
          if (data.accounts && !data.accounts[code]) {
            violations.push(`Account ${code} is not a valid specific account in ${category}.${subcategory}`);
          }
          break;
        }
      }
      if (foundInHierarchy) break;
    }

    if (!foundInHierarchy) {
      violations.push(`Account ${code} does not belong to any valid NAS category`);
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  static validateBalanceRelationships(items: LineItem[]): ValidationResult {
    const violations: string[] = [];

    // Check contra account relationships
    ACCOUNT_RELATIONSHIPS.forEach(relationship => {
      if (relationship.type === 'contra') {
        const mainAccount = items.find(item => item.code === relationship.mainAccount);
        const contraAccount = items.find(item => item.code === relationship.contraAccount);

        if (mainAccount && contraAccount) {
          const isValid = eval(relationship.rule.replace(
            /mainAccount|contraAccount/g,
            (match) => match === 'mainAccount' ? 
              mainAccount.amount.toString() : 
              contraAccount.amount.toString()
          ));

          if (!isValid) {
            violations.push(
              `Invalid relationship between ${mainAccount.code} (${mainAccount.amount}) and ` +
              `${contraAccount.code} (${contraAccount.amount})`
            );
          }
        }
      } else if (relationship.type === 'manufacturing') {
        const relatedAccounts = items.filter(item => 
          relationship.accounts.includes(item.code)
        );

        if (relatedAccounts.length > 0) {
          const sum = relatedAccounts.reduce((acc, item) => acc + item.amount, 0);
          const isValid = eval(relationship.rule.replace('sum', sum.toString()));

          if (!isValid) {
            violations.push(
              `Invalid manufacturing accounts relationship: ${relationship.accounts.join(', ')}`
            );
          }
        }
      }
    });

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  static validateAccount(code: string): ValidationResult {
    const violations: string[] = [];
    let found = false;

    // Check if account exists in NAS structure
    for (const [category, subcategories] of Object.entries(NAS_ACCOUNTS)) {
      for (const [subcategory, data] of Object.entries(subcategories)) {
        if (data.range && this.isInRange(code, data.range[0], data.range[1])) {
          found = true;
          break;
        }
      }
    }

    if (!found) {
      violations.push(`Account ${code} is not a valid NAS account`);
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  static validateBalanceType(code: string, amount: number): ValidationResult {
    const violations: string[] = [];
    const numericCode = parseInt(code);

    // Debit Balance Accounts (should be positive)
    const debitAccounts = [
      { start: 0, end: 2999 },  // Assets
      { start: 8000, end: 9499 }  // Expenses and Manufacturing
    ];

    // Credit Balance Accounts (should be negative)
    const creditAccounts = [
      { start: 3000, end: 3999 },  // Contra Assets
      { start: 4000, end: 5999 },  // Liabilities
      { start: 6000, end: 6999 },  // Equity
      { start: 7000, end: 7999 }   // Revenue
    ];

    const isDebit = debitAccounts.some(range => 
      numericCode >= range.start && numericCode <= range.end
    );
    const isCredit = creditAccounts.some(range => 
      numericCode >= range.start && numericCode <= range.end
    );

    if (isDebit && amount < 0) {
      violations.push(`Account ${code} should have a debit (positive) balance`);
    }
    if (isCredit && amount > 0) {
      violations.push(`Account ${code} should have a credit (negative) balance`);
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  static validateStatementRequirements(items: LineItem[], type: StatementType): ValidationResult {
    const violations: string[] = [];
    
    switch (type) {
      case 'balance-sheet':
        // Validate balance sheet equation
        const assets = this.sumRange(items, 0, 2999);
        const contraAssets = this.sumRange(items, 3000, 3999);
        const liabilities = this.sumRange(items, 4000, 5999);
        const equity = this.sumRange(items, 6000, 6999);

        if (Math.abs((assets + contraAssets) - (liabilities + equity)) > 0.01) {
          violations.push('Balance sheet equation does not balance');
        }
        break;

      case 'income':
        // Validate income statement
        const revenue = this.sumRange(items, 7000, 7999);
        const expenses = this.sumRange(items, 8000, 8999);
        const netIncome = revenue + expenses; // expenses are negative

        if (Math.abs(netIncome - items.reduce((sum, item) => sum + item.amount, 0)) > 0.01) {
          violations.push('Income statement does not balance');
        }
        break;

      case 'cash-flow':
        // Validate cash flow statement
        const operatingCash = items
          .filter(item => item.section.toLowerCase().includes('operating'))
          .reduce((sum, item) => sum + item.amount, 0);
        const investingCash = items
          .filter(item => item.section.toLowerCase().includes('investing'))
          .reduce((sum, item) => sum + item.amount, 0);
        const financingCash = items
          .filter(item => item.section.toLowerCase().includes('financing'))
          .reduce((sum, item) => sum + item.amount, 0);

        const totalCashFlow = operatingCash + investingCash + financingCash;
        if (Math.abs(totalCashFlow - items.reduce((sum, item) => sum + item.amount, 0)) > 0.01) {
          violations.push('Cash flow statement does not balance');
        }
        break;
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  private static isInRange(code: string, start: string, end: string): boolean {
    return code >= start && code <= end;
  }

  private static sumRange(items: LineItem[], start: number, end: number): number {
    return items
      .filter(item => {
        const code = parseInt(item.code);
        return code >= start && code <= end;
      })
      .reduce((sum, item) => sum + item.amount, 0);
  }
}