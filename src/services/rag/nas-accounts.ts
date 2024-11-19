import { StatementType } from '../../types/financial';

export const NAS_ACCOUNTS = {
  // Current Assets (0100-0999)
  assets: {
    current: {
      cash: {
        range: ['0100', '0199'],
        accounts: {
          '0100': 'Cash in National Currency',
          '0110': 'Cash in Foreign Currency',
          '0120': 'Cash Equivalents'
        }
      },
      shortTermInvestments: {
        range: ['0200', '0299'],
        accounts: {
          '0200': 'Short-term Investments',
          '0210': 'Short-term Securities',
          '0220': 'Short-term Loans Given'
        }
      },
      receivables: {
        range: ['0300', '0399'],
        accounts: {
          '0300': 'Trade Receivables',
          '0310': 'Notes Receivable',
          '0320': 'Subsidiary Receivables',
          '0330': 'Employee Receivables'
        }
      },
      inventory: {
        range: ['0400', '0499'],
        accounts: {
          '0400': 'Raw Materials',
          '0410': 'Work in Progress',
          '0420': 'Finished Goods',
          '0430': 'Merchandise',
          '0440': 'Spare Parts'
        }
      },
      prepaid: {
        range: ['0500', '0599'],
        accounts: {
          '0500': 'Prepaid Expenses',
          '0510': 'Prepaid Taxes',
          '0520': 'Deferred VAT'
        }
      }
    },
    noncurrent: {
      fixedAssets: {
        range: ['0800', '0899'],
        accounts: {
          '0800': 'Land',
          '0810': 'Buildings',
          '0820': 'Equipment',
          '0830': 'Vehicles',
          '0840': 'Office Equipment'
        }
      },
      intangible: {
        range: ['0900', '0999'],
        accounts: {
          '0900': 'Patents',
          '0910': 'Licenses',
          '0920': 'Software',
          '0930': 'Goodwill'
        }
      }
    }
  },

  // Manufacturing Accounts (9000-9499)
  manufacturing: {
    materials: {
      range: ['9000', '9099'],
      accounts: {
        '9000': 'Direct Materials',
        '9010': 'Indirect Materials',
        '9020': 'Material Price Variance',
        '9030': 'Material Usage Variance'
      }
    },
    labor: {
      range: ['9100', '9199'],
      accounts: {
        '9100': 'Direct Labor',
        '9110': 'Indirect Labor',
        '9120': 'Labor Rate Variance',
        '9130': 'Labor Efficiency Variance'
      }
    },
    overhead: {
      range: ['9200', '9299'],
      accounts: {
        '9200': 'Manufacturing Overhead',
        '9210': 'Variable Overhead',
        '9220': 'Fixed Overhead',
        '9230': 'Overhead Variance'
      }
    },
    wip: {
      range: ['9300', '9399'],
      accounts: {
        '9300': 'Work in Process',
        '9310': 'WIP - Materials',
        '9320': 'WIP - Labor',
        '9330': 'WIP - Overhead'
      }
    }
  },

  // Contra Accounts (3000-3999)
  contra: {
    depreciation: {
      range: ['3000', '3199'],
      accounts: {
        '3000': 'Accumulated Depreciation - Buildings',
        '3010': 'Accumulated Depreciation - Equipment',
        '3020': 'Accumulated Depreciation - Vehicles'
      }
    },
    amortization: {
      range: ['3200', '3399'],
      accounts: {
        '3200': 'Accumulated Amortization - Patents',
        '3210': 'Accumulated Amortization - Licenses',
        '3220': 'Accumulated Amortization - Software'
      }
    },
    allowances: {
      range: ['3400', '3999'],
      accounts: {
        '3400': 'Allowance for Doubtful Accounts',
        '3410': 'Inventory Obsolescence Reserve',
        '3420': 'Allowance for Sales Returns'
      }
    }
  }
};

export const ACCOUNT_RELATIONSHIPS = [
  {
    type: 'contra',
    mainAccount: '0300', // Receivables
    contraAccount: '3400', // Allowance for Doubtful Accounts
    rule: 'mainAccount >= Math.abs(contraAccount)'
  },
  {
    type: 'contra',
    mainAccount: '0800', // Fixed Assets
    contraAccount: '3000', // Accumulated Depreciation
    rule: 'mainAccount >= Math.abs(contraAccount)'
  },
  {
    type: 'manufacturing',
    accounts: ['9000', '9100', '9200'],
    rule: 'sum > 0'
  }
];

export const STATEMENT_REQUIREMENTS: Record<StatementType, string[]> = {
  'balance-sheet': ['0100', '0200', '0300', '0400', '2000', '3000'],
  'income': ['4000', '5000', '5100', '5200'],
  'cash-flow': ['0100', '0200', '4000', '5000'],
  'pnl': ['4000', '5000', '5100', '9000', '9100', '9200']
};

export const INDUSTRY_RULES = {
  manufacturing: {
    requiredAccounts: ['9000', '9100', '9200', '9300'],
    ratios: {
      'materialCost': {
        calculation: '9000 / 5000',
        threshold: 0.4
      },
      'overheadRate': {
        calculation: '9200 / (9000 + 9100)',
        threshold: 0.3
      }
    }
  },
  trading: {
    requiredAccounts: ['0400', '5000'],
    ratios: {
      'inventoryTurnover': {
        calculation: '5000 / 0400',
        threshold: 4
      }
    }
  }
};