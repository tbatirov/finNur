import { StatementType } from '../../types/financial';

export interface LegalRequirement {
  id: string;
  article: string;
  description: string;
  applicableTypes: StatementType[];
  validation: string;
}

// Uzbekistan Law "On Accounting" (No. 279-I from 30.08.1996)
export const UZ_ACCOUNTING_LAW: LegalRequirement[] = [
  {
    id: 'art4-1',
    article: 'Article 4',
    description: 'Continuous recording of business operations from document registration',
    applicableTypes: ['balance-sheet', 'income', 'cash-flow', 'pnl'],
    validation: 'item.section && item.description && item.amount !== undefined'
  },
  {
    id: 'art7-1',
    article: 'Article 7',
    description: 'Double-entry bookkeeping requirement',
    applicableTypes: ['balance-sheet'],
    validation: 'totalDebits === totalCredits'
  },
  {
    id: 'art10-1',
    article: 'Article 10',
    description: 'Assets must be valued in Uzbek Soum',
    applicableTypes: ['balance-sheet', 'income', 'cash-flow', 'pnl'],
    validation: 'typeof item.amount === "number"'
  },
  {
    id: 'art11-1',
    article: 'Article 11',
    description: 'Primary documents must contain mandatory details',
    applicableTypes: ['balance-sheet', 'income', 'cash-flow', 'pnl'],
    validation: 'item.code && item.code.length === 4'
  },
  {
    id: 'art15-1',
    article: 'Article 15',
    description: 'Inventory of assets and liabilities',
    applicableTypes: ['balance-sheet'],
    validation: 'hasInventoryReconciliation'
  },
  {
    id: 'art17-1',
    article: 'Article 17',
    description: 'Financial statements must be prepared in Uzbek/Russian',
    applicableTypes: ['balance-sheet', 'income', 'cash-flow', 'pnl'],
    validation: 'isValidLanguage(item.description)'
  }
];

// Validation helper functions
export function validateLegalRequirements(
  type: StatementType,
  data: any
): { isValid: boolean; violations: string[] } {
  const applicableRequirements = UZ_ACCOUNTING_LAW.filter(req => 
    req.applicableTypes.includes(type)
  );

  const violations: string[] = [];

  for (const requirement of applicableRequirements) {
    try {
      const isValid = new Function('item', 'return ' + requirement.validation)(data);
      if (!isValid) {
        violations.push(`${requirement.article}: ${requirement.description}`);
      }
    } catch (error) {
      violations.push(`Failed to validate ${requirement.article}`);
    }
  }

  return {
    isValid: violations.length === 0,
    violations
  };
}

// Language validation (Uzbek/Russian requirement)
const CYRILLIC_PATTERN = /[\u0400-\u04FF]/;
export function isValidLanguage(text: string): boolean {
  return CYRILLIC_PATTERN.test(text) || text.trim().length === 0;
}

// Double-entry validation
export function validateDoubleEntry(items: any[]): boolean {
  const totalDebits = items.reduce((sum, item) => sum + (item.debit || 0), 0);
  const totalCredits = items.reduce((sum, item) => sum + (item.credit || 0), 0);
  return Math.abs(totalDebits - totalCredits) < 0.01; // Allow for small rounding differences
}