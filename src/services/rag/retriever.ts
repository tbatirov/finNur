import { StatementType, LineItem } from '../../types/financial';
import { accountingRules, AccountingRule } from './knowledge-base';
import { validateAccountCode, validateNormalBalance, getAccountRange } from './chart-of-accounts';
import { logger } from '../logger';

interface ValidationContext {
  type: StatementType;
  lineItems: LineItem[];
  total: number;
}

export class RuleRetriever {
  private static validateRule(rule: AccountingRule, context: ValidationContext): boolean {
    const { type, lineItems, total } = context;
    
    if (!rule.type.includes(type)) return true; // Skip rules not applicable to statement type

    // First validate account codes against NAS chart of accounts
    const hasInvalidCodes = lineItems.some(item => !validateAccountCode(item.code));
    if (hasInvalidCodes) {
      logger.log('Invalid account codes found');
      return false;
    }

    // Validate normal balances
    const hasInvalidBalances = lineItems.some(item => !validateNormalBalance(item.code, item.amount));
    if (hasInvalidBalances) {
      logger.log('Invalid normal balances found');
      return false;
    }

    // Validate account ranges for statement type
    const range = getAccountRange(type);
    const hasInvalidRanges = lineItems.some(item => 
      item.code < range.start || item.code > range.end
    );
    if (hasInvalidRanges) {
      logger.log('Accounts outside valid range for statement type');
      return false;
    }

    // Evaluate the specific rule
    try {
      const evalContext = {
        balance: lineItems[0]?.amount || 0,
        totalAssets: this.calculateTotal(lineItems, [1000, 2999]),
        totalLiabilities: this.calculateTotal(lineItems, [3000, 5999]),
        totalEquity: this.calculateTotal(lineItems, [6000, 8999]),
        revenue: this.calculateTotal(lineItems, [9000, 9099]),
        expenses: this.calculateTotal(lineItems, [9100, 9399]),
        otherIncome: this.calculateTotal(lineItems, [9400, 9499]),
        netIncome: total
      };

      return new Function(...Object.keys(evalContext), `return ${rule.validation}`)
        (...Object.values(evalContext));
    } catch (error) {
      logger.log(`Rule evaluation error for ${rule.id}:`, error);
      return false;
    }
  }

  private static calculateTotal(items: LineItem[], range: [number, number]): number {
    return items
      .filter(item => {
        const code = parseInt(item.code);
        return code >= range[0] && code <= range[1];
      })
      .reduce((sum, item) => sum + item.amount, 0);
  }

  static validateStatement(type: StatementType, lineItems: LineItem[], total: number): {
    isValid: boolean;
    violations: Array<{ rule: AccountingRule; items: LineItem[] }>;
  } {
    const context: ValidationContext = { type, lineItems, total };
    const violations: Array<{ rule: AccountingRule; items: LineItem[] }> = [];

    accountingRules.forEach(rule => {
      if (!this.validateRule(rule, context)) {
        const violatingItems = lineItems.filter(item => {
          const code = parseInt(item.code);
          const range = rule.code.split('-').map(Number);
          return code >= range[0] && code <= range[1];
        });
        violations.push({ rule, items: violatingItems });
      }
    });

    return {
      isValid: violations.length === 0,
      violations
    };
  }
}