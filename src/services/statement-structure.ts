import { StatementType } from '../types/financial';

// Helper function to ensure 4-digit code format
function formatCode(code: string): string {
  return code.padStart(4, '0');
}

export const STATEMENT_SECTIONS = {
  'balance-sheet': {
    assets_current: {
      codes: [formatCode('0100'), formatCode('0999')],
      title: 'Current Assets',
      categories: {
        cash: [formatCode('0100'), formatCode('0199')],
        investments: [formatCode('0200'), formatCode('0299')],
        receivables: [formatCode('0300'), formatCode('0399')],
        inventory: [formatCode('0400'), formatCode('0499')],
        prepaid: [formatCode('0500'), formatCode('0599')],
        other: [formatCode('0600'), formatCode('0999')]
      }
    },
    assets_noncurrent: {
      codes: [formatCode('1000'), formatCode('2999')],
      title: 'Non-Current Assets',
      categories: {
        investments: [formatCode('1000'), formatCode('1099')],
        fixed: [formatCode('1100'), formatCode('1199')],
        intangible: [formatCode('1200'), formatCode('1299')],
        biological: [formatCode('1500'), formatCode('1599')],
        deferred: [formatCode('1600'), formatCode('1699')],
        other: [formatCode('1700'), formatCode('2999')]
      }
    },
    contra_assets: {
      codes: [formatCode('3000'), formatCode('3999')],
      title: 'Contra Assets',
      categories: {
        depreciation: [formatCode('3000'), formatCode('3199')],
        amortization: [formatCode('3200'), formatCode('3399')],
        allowances: [formatCode('3400'), formatCode('3999')]
      }
    },
    liabilities_current: {
      codes: [formatCode('4000'), formatCode('4999')],
      title: 'Current Liabilities',
      categories: {
        payables: [formatCode('4000'), formatCode('4099')],
        loans: [formatCode('4100'), formatCode('4199')],
        tax: [formatCode('4200'), formatCode('4299')],
        employee: [formatCode('4300'), formatCode('4399')],
        other: [formatCode('4400'), formatCode('4999')]
      }
    },
    liabilities_noncurrent: {
      codes: [formatCode('5000'), formatCode('5999')],
      title: 'Non-Current Liabilities',
      categories: {
        loans: [formatCode('5000'), formatCode('5099')],
        bonds: [formatCode('5100'), formatCode('5199')],
        lease: [formatCode('5200'), formatCode('5299')],
        deferred: [formatCode('5300'), formatCode('5399')],
        other: [formatCode('5400'), formatCode('5999')]
      }
    },
    equity: {
      codes: [formatCode('6000'), formatCode('6999')],
      title: 'Equity',
      categories: {
        capital: [formatCode('6000'), formatCode('6099')],
        additional: [formatCode('6100'), formatCode('6199')],
        reserves: [formatCode('6200'), formatCode('6299')],
        retained: [formatCode('6300'), formatCode('6399')],
        revaluation: [formatCode('6400'), formatCode('6499')],
        other: [formatCode('6500'), formatCode('6999')]
      }
    }
  },
  'income': {
    revenue: {
      codes: [formatCode('7000'), formatCode('7999')],
      title: 'Revenue',
      categories: {
        operating: [formatCode('7000'), formatCode('7499')],
        financial: [formatCode('7500'), formatCode('7699')],
        other: [formatCode('7700'), formatCode('7999')]
      }
    },
    expenses: {
      codes: [formatCode('8000'), formatCode('8999')],
      title: 'Expenses',
      categories: {
        cost_of_sales: [formatCode('8000'), formatCode('8099')],
        operating: [formatCode('8100'), formatCode('8499')],
        financial: [formatCode('8500'), formatCode('8699')],
        other: [formatCode('8700'), formatCode('8999')]
      }
    },
    manufacturing: {
      codes: [formatCode('9000'), formatCode('9499')],
      title: 'Manufacturing',
      categories: {
        materials: [formatCode('9000'), formatCode('9099')],
        labor: [formatCode('9100'), formatCode('9199')],
        overhead: [formatCode('9200'), formatCode('9299')],
        wip: [formatCode('9300'), formatCode('9399')],
        finished: [formatCode('9400'), formatCode('9499')]
      }
    }
  },
  'cash-flow': {
    operating: {
      codes: [formatCode('7000'), formatCode('8999')],
      title: 'Operating Activities',
      categories: {
        receipts: [formatCode('7000'), formatCode('7999')],
        payments: [formatCode('8000'), formatCode('8999')]
      }
    },
    investing: {
      codes: [formatCode('1000'), formatCode('2999')],
      title: 'Investing Activities',
      categories: {
        acquisitions: [formatCode('1000'), formatCode('1999')],
        disposals: [formatCode('2000'), formatCode('2999')]
      }
    },
    financing: {
      codes: [formatCode('4000'), formatCode('6999')],
      title: 'Financing Activities',
      categories: {
        debt: [formatCode('4000'), formatCode('5999')],
        equity: [formatCode('6000'), formatCode('6999')]
      }
    }
  },
  'pnl': {
    revenue: {
      codes: [formatCode('7000'), formatCode('7999')],
      title: 'Revenue',
      categories: {
        operating: [formatCode('7000'), formatCode('7499')],
        financial: [formatCode('7500'), formatCode('7699')],
        other: [formatCode('7700'), formatCode('7999')]
      }
    },
    expenses: {
      codes: [formatCode('8000'), formatCode('8999')],
      title: 'Expenses',
      categories: {
        cost_of_sales: [formatCode('8000'), formatCode('8099')],
        operating: [formatCode('8100'), formatCode('8499')],
        financial: [formatCode('8500'), formatCode('8699')],
        other: [formatCode('8700'), formatCode('8999')]
      }
    }
  }
} as const;

// Export section titles for each statement type
export const SECTION_TITLES = {
  'balance-sheet': {
    assets_current: 'Current Assets',
    assets_noncurrent: 'Non-Current Assets',
    contra_assets: 'Contra Assets',
    liabilities_current: 'Current Liabilities',
    liabilities_noncurrent: 'Non-Current Liabilities',
    equity: 'Equity'
  },
  'income': {
    revenue: 'Revenue',
    expenses: 'Expenses',
    manufacturing: 'Manufacturing'
  },
  'cash-flow': {
    operating: 'Operating Activities',
    investing: 'Investing Activities',
    financing: 'Financing Activities'
  },
  'pnl': {
    revenue: 'Revenue',
    expenses: 'Expenses'
  }
} as const;

export function getSectionForAccount(code: string, type: keyof typeof STATEMENT_SECTIONS): string {
  const sections = STATEMENT_SECTIONS[type];
  const paddedCode = code.padStart(4, '0');

  for (const [sectionId, section] of Object.entries(sections)) {
    const codeRanges = section.codes.map(c => {
      if (c.includes('-')) {
        const [start, end] = c.split('-').map(code => code.padStart(4, '0'));
        return { start, end };
      }
      return { 
        start: c.padStart(4, '0'),
        end: (parseInt(c) + 99).toString().padStart(4, '0')
      };
    });

    if (codeRanges.some(range => paddedCode >= range.start && paddedCode <= range.end)) {
      return sectionId;
    }
  }

  return 'other';
}

export function getSectionTitle(type: StatementType, section: string): string {
  return SECTION_TITLES[type]?.[section] || section;
}

export function getCategories(type: StatementType, section: string) {
  return STATEMENT_SECTIONS[type]?.[section]?.categories || {};
}

export function validateAccountCode(code: string, type: StatementType, section: string): boolean {
  const paddedCode = code.padStart(4, '0');
  const sectionConfig = STATEMENT_SECTIONS[type]?.[section];
  
  if (!sectionConfig) return false;

  return sectionConfig.codes.some(range => {
    const [start, end] = Array.isArray(range) ? range : [range, range];
    return paddedCode >= start && paddedCode <= end;
  });
}