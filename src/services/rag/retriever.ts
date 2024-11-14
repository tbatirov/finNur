import { StatementType, AccountEntry, LineItem } from '../../types/financial';
import { accountingRules, AccountingRule } from './knowledge-base';
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
    
    const codeRange = rule.code.split('-').map(Number);
    const relevantItems = rule.code === 'all' ? lineItems : 
      lineItems.filter(item => {
        const code = parseInt(item.section.toString().split(' ')[0]);
        return code >= codeRange[0] && code <= codeRange[1];
      });

    if (relevantItems.length === 0) return true;

    try {
      // Create evaluation context
      const evalContext = {
        balance: relevantItems[0]?.amount || 0,
        totalAssets: this.calculateTotal(lineItems, [1000, 2999]),
        totalLiabilities: this.calculateTotal(lineItems, [3000, 5999]),
        totalEquity: this.calculateTotal(lineItems, [6000, 8999]),
        revenue: this.calculateTotal(lineItems, [9000, 9099]),
        expenses: this.calculateTotal(lineItems, [9100, 9399]),
        otherIncome: this.calculateTotal(lineItems, [9400, 9499]),
        netIncome: total,
        isContraAccount: (item: LineItem) => 
          item.description.toLowerCase().includes('contra') ||
          item.description.toLowerCase().includes('allowance') ||
          item.description.toLowerCase().includes('depreciation'),
        isAbnormalBalance: (item: LineItem) =>
          Math.sign(item.amount) !== this.getExpectedSign(parseInt(item.section.toString()))
      };

      // Evaluate rule
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
        const code = parseInt(item.section.toString().split(' ')[0]);
        return code >= range[0] && code <= range[1];
      })
      .reduce((sum, item) => sum + item.amount, 0);
  }

  private static getExpectedSign(code: number): number {
    if (code >= 1000 && code <= 2999) return 1; // Assets
    if (code >= 3000 && code <= 8999) return 1; // Liabilities & Equity
    if (code >= 9000 && code <= 9099) return 1; // Revenue
    if (code >= 9100 && code <= 9399) return -1; // Expenses
    if (code >= 9400 && code <= 9499) return 1; // Other Income
    if (code >= 9500 && code <= 9799) return -1; // Other Expenses
    return 1;
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
          const code = parseInt(item.section.toString().split(' ')[0]);
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