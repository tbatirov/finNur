export const STATEMENT_SECTIONS = {
  'balance-sheet': {
    assets_current: {
      codes: ['1000', '1200', '1500', '1600'],
      title: 'Current Assets',
      categories: {
        cash: ['1000', '1099'],
        receivables: ['1200', '1299'],
        inventory: ['1500', '1599'],
        investments: ['1600', '1699']
      }
    },
    assets_noncurrent: {
      codes: ['2000', '2900'],
      title: 'Non-Current Assets',
      categories: {
        fixedAssets: ['2000', '2099'],
        intangibles: ['2400', '2499'],
        investments: ['2700', '2799']
      }
    },
    liabilities_current: {
      codes: ['3000', '3900'],
      title: 'Current Liabilities',
      categories: {
        payables: ['3000', '3099'],
        shortTermDebt: ['3100', '3199'],
        taxes: ['3300', '3399']
      }
    },
    liabilities_noncurrent: {
      codes: ['4000', '4900'],
      title: 'Non-Current Liabilities',
      categories: {
        longTermDebt: ['4000', '4099'],
        bonds: ['4200', '4299'],
        provisions: ['4700', '4799']
      }
    },
    equity: {
      codes: ['5000', '5900'],
      title: 'Equity',
      categories: {
        capital: ['5000', '5099'],
        reserves: ['5200', '5299'],
        retained: ['5300', '5399']
      }
    }
  },
  'income': {
    revenue: {
      codes: ['9000', '9099'],
      title: 'Revenue',
      categories: {
        operating: ['9000', '9049'],
        other: ['9050', '9099']
      }
    },
    costOfSales: {
      codes: ['9100', '9199'],
      title: 'Cost of Sales',
      categories: {
        direct: ['9100', '9149'],
        indirect: ['9150', '9199']
      }
    },
    operatingExpenses: {
      codes: ['9200', '9399'],
      title: 'Operating Expenses',
      categories: {
        selling: ['9200', '9249'],
        administrative: ['9250', '9299'],
        other: ['9300', '9399']
      }
    }
  },
  'cash-flow': {
    operating: {
      codes: ['1000', '1200', '3000', '9000'],
      title: 'Operating Activities',
      categories: {
        receipts: ['9000', '9050'],
        payments: ['9100', '9399'],
        workingCapital: ['1200', '3000']
      }
    },
    investing: {
      codes: ['1500', '1600', '1700', '1800'],
      title: 'Investing Activities',
      categories: {
        assetPurchases: ['1600', '1700'],
        investments: ['1500', '1550'],
        proceeds: ['9400', '9450']
      }
    },
    financing: {
      codes: ['3100', '4000', '6000'],
      title: 'Financing Activities',
      categories: {
        equity: ['6000', '6099'],
        borrowings: ['4000', '4099'],
        shortTerm: ['3100', '3199']
      }
    }
  }
} as const;

export function getSectionForAccount(code: string, type: keyof typeof STATEMENT_SECTIONS): string {
  const sections = STATEMENT_SECTIONS[type];
  const numericCode = parseInt(code);

  for (const [sectionId, section] of Object.entries(sections)) {
    const codeRanges = section.codes.map(c => {
      if (c.includes('-')) {
        const [start, end] = c.split('-').map(Number);
        return { start, end };
      }
      return { start: parseInt(c), end: parseInt(c) + 99 };
    });

    if (codeRanges.some(range => numericCode >= range.start && numericCode <= range.end)) {
      return sectionId;
    }
  }

  return 'other';
}

export const SECTION_TITLES = {
  'balance-sheet': {
    assets_current: 'Current Assets',
    assets_noncurrent: 'Non-Current Assets',
    liabilities_current: 'Current Liabilities',
    liabilities_noncurrent: 'Non-Current Liabilities',
    equity: 'Equity'
  },
  'income': {
    revenue: 'Revenue',
    costOfSales: 'Cost of Sales',
    operatingExpenses: 'Operating Expenses'
  },
  'cash-flow': {
    operating: 'Operating Activities',
    investing: 'Investing Activities',
    financing: 'Financing Activities'
  }
} as const;