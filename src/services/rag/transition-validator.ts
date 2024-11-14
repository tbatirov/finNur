import { LineItem, StatementType } from '../../types/financial';
import { STATEMENT_SECTIONS, getSectionForAccount } from '../statement-structure';
import { logger } from '../logger';

export class TransitionValidator {
  static validateTransition(
    item: LineItem,
    fromSection: string,
    toSection: string,
    type: StatementType
  ): { isValid: boolean; reason?: string } {
    logger.log(`Validating transition for item ${item.description} from ${fromSection} to ${toSection}`);

    // Get the correct section based on account code
    const expectedSection = getSectionForAccount(
      typeof item.section === 'string' ? item.section.split(' ')[0] : item.section.code,
      type
    );

    // If moving to the expected section, always allow
    if (toSection === expectedSection) {
      return { isValid: true };
    }

    // Check if the transition follows accounting rules
    const validTransition = this.isValidTransition(fromSection, toSection, type);
    if (!validTransition.isValid) {
      return validTransition;
    }

    // Additional validation based on statement type
    switch (type) {
      case 'balance-sheet':
        return this.validateBalanceSheetTransition(item, toSection);
      case 'income':
        return this.validateIncomeStatementTransition(item, toSection);
      case 'cash-flow':
        return this.validateCashFlowTransition(item, toSection);
      case 'pnl':
        return this.validatePnLTransition(item, toSection);
      default:
        return { isValid: true };
    }
  }

  private static isValidTransition(
    from: string,
    to: string,
    type: StatementType
  ): { isValid: boolean; reason?: string } {
    // Get valid sections for the statement type
    const validSections = Object.keys(STATEMENT_SECTIONS[type]);
    
    // Check if both sections are valid for this statement type
    if (!validSections.includes(from) && from !== 'other') {
      return { 
        isValid: false,
        reason: `Invalid source section: ${from}`
      };
    }
    
    if (!validSections.includes(to) && to !== 'other') {
      return {
        isValid: false,
        reason: `Invalid target section: ${to}`
      };
    }

    return { isValid: true };
  }

  private static validateBalanceSheetTransition(
    item: LineItem,
    toSection: string
  ): { isValid: boolean; reason?: string } {
    const code = typeof item.section === 'string' 
      ? parseInt(item.section.split(' ')[0])
      : parseInt(item.section.code);

    // Assets (1000-2999)
    if (code >= 1000 && code <= 2999) {
      if (!toSection.startsWith('assets_')) {
        return {
          isValid: false,
          reason: 'Asset accounts must remain in assets sections'
        };
      }
    }
    
    // Liabilities (3000-5999)
    if (code >= 3000 && code <= 5999) {
      if (!toSection.startsWith('liabilities_')) {
        return {
          isValid: false,
          reason: 'Liability accounts must remain in liabilities sections'
        };
      }
    }
    
    // Equity (6000-8999)
    if (code >= 6000 && code <= 8999) {
      if (toSection !== 'equity') {
        return {
          isValid: false,
          reason: 'Equity accounts must remain in equity section'
        };
      }
    }

    return { isValid: true };
  }

  private static validateIncomeStatementTransition(
    item: LineItem,
    toSection: string
  ): { isValid: boolean; reason?: string } {
    const code = typeof item.section === 'string'
      ? parseInt(item.section.split(' ')[0])
      : parseInt(item.section.code);

    // Revenue (9000-9099)
    if (code >= 9000 && code <= 9099) {
      if (toSection !== 'revenue') {
        return {
          isValid: false,
          reason: 'Revenue accounts must remain in revenue section'
        };
      }
    }

    // Expenses (9100-9399)
    if (code >= 9100 && code <= 9399) {
      if (!['costOfSales', 'operatingExpenses'].includes(toSection)) {
        return {
          isValid: false,
          reason: 'Expense accounts must be in cost of sales or operating expenses'
        };
      }
    }

    return { isValid: true };
  }

  private static validateCashFlowTransition(
    item: LineItem,
    toSection: string
  ): { isValid: boolean; reason?: string } {
    // Cash flow allows more flexibility in categorization
    return { isValid: true };
  }

  private static validatePnLTransition(
    item: LineItem,
    toSection: string
  ): { isValid: boolean; reason?: string } {
    return this.validateIncomeStatementTransition(item, toSection);
  }
}