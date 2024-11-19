import { StatementType } from '../../types/financial';

export interface AccountCode {
  code: string;
  nameUz: string;
  nameEn: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'memo';
  category: string;
  normalBalance: 'debit' | 'credit';
}

// NAS Uzbekistan Chart of Accounts (from lex.uz/acts/417624)
export const NAS_ACCOUNTS: AccountCode[] = [
  // Current Assets (0100-0999)
  { code: '0100', nameUz: 'Kassa', nameEn: 'Cash on Hand', type: 'asset', category: 'current', normalBalance: 'debit' },
  { code: '0110', nameUz: 'Valyuta kassasi', nameEn: 'Foreign Currency Cash', type: 'asset', category: 'current', normalBalance: 'debit' },
  { code: '0200', nameUz: 'Hisob-kitob schyoti', nameEn: 'Settlement Account', type: 'asset', category: 'current', normalBalance: 'debit' },
  { code: '0210', nameUz: 'Valyuta schyoti', nameEn: 'Foreign Currency Account', type: 'asset', category: 'current', normalBalance: 'debit' },
  { code: '0300', nameUz: 'Qisqa muddatli investitsiyalar', nameEn: 'Short-term Investments', type: 'asset', category: 'current', normalBalance: 'debit' },
  { code: '0400', nameUz: 'Olinadigan schetlar', nameEn: 'Accounts Receivable', type: 'asset', category: 'current', normalBalance: 'debit' },
  { code: '0500', nameUz: 'Tovar-moddiy zaxiralar', nameEn: 'Inventory', type: 'asset', category: 'current', normalBalance: 'debit' },
  { code: '0600', nameUz: 'Kelgusi davr xarajatlari', nameEn: 'Prepaid Expenses', type: 'asset', category: 'current', normalBalance: 'debit' },

  // Non-current Assets (1000-2999)
  { code: '1000', nameUz: 'Asosiy vositalar', nameEn: 'Fixed Assets', type: 'asset', category: 'non-current', normalBalance: 'debit' },
  { code: '1100', nameUz: 'Nomoddiy aktivlar', nameEn: 'Intangible Assets', type: 'asset', category: 'non-current', normalBalance: 'debit' },
  { code: '1200', nameUz: 'Uzoq muddatli investitsiyalar', nameEn: 'Long-term Investments', type: 'asset', category: 'non-current', normalBalance: 'debit' },

  // Contra Accounts (3000-3999)
  { code: '3000', nameUz: 'Asosiy vositalar amortizatsiyasi', nameEn: 'Accumulated Depreciation - Fixed Assets', type: 'asset', category: 'contra', normalBalance: 'credit' },
  { code: '3100', nameUz: 'Nomoddiy aktivlar amortizatsiyasi', nameEn: 'Accumulated Amortization - Intangible Assets', type: 'asset', category: 'contra', normalBalance: 'credit' },

  // Current Liabilities (4000-4999)
  { code: '4000', nameUz: 'Toʻlanadigan schetlar', nameEn: 'Accounts Payable', type: 'liability', category: 'current', normalBalance: 'credit' },
  { code: '4100', nameUz: 'Qisqa muddatli bank kreditlari', nameEn: 'Short-term Bank Loans', type: 'liability', category: 'current', normalBalance: 'credit' },
  { code: '4200', nameUz: 'Soliqlar boʻyicha qarz', nameEn: 'Tax Payable', type: 'liability', category: 'current', normalBalance: 'credit' },
  { code: '4300', nameUz: 'Mehnatga haq toʻlash boʻyicha qarz', nameEn: 'Wages Payable', type: 'liability', category: 'current', normalBalance: 'credit' },

  // Long-term Liabilities (5000-5999)
  { code: '5000', nameUz: 'Uzoq muddatli bank kreditlari', nameEn: 'Long-term Bank Loans', type: 'liability', category: 'non-current', normalBalance: 'credit' },
  { code: '5100', nameUz: 'Uzoq muddatli qarzlar', nameEn: 'Long-term Debt', type: 'liability', category: 'non-current', normalBalance: 'credit' },

  // Equity (6000-6999)
  { code: '6000', nameUz: 'Ustav kapitali', nameEn: 'Charter Capital', type: 'equity', category: 'capital', normalBalance: 'credit' },
  { code: '6100', nameUz: 'Rezerv kapitali', nameEn: 'Reserve Capital', type: 'equity', category: 'capital', normalBalance: 'credit' },
  { code: '6200', nameUz: 'Qoʻshilgan kapital', nameEn: 'Additional Paid-in Capital', type: 'equity', category: 'capital', normalBalance: 'credit' },
  { code: '6300', nameUz: 'Taqsimlanmagan foyda', nameEn: 'Retained Earnings', type: 'equity', category: 'capital', normalBalance: 'credit' },

  // Revenue (7000-7999)
  { code: '7000', nameUz: 'Asosiy faoliyatdan tushum', nameEn: 'Revenue from Main Activities', type: 'revenue', category: 'operating', normalBalance: 'credit' },
  { code: '7100', nameUz: 'Boshqa operatsion daromadlar', nameEn: 'Other Operating Revenue', type: 'revenue', category: 'operating', normalBalance: 'credit' },
  { code: '7500', nameUz: 'Moliyaviy faoliyatdan daromadlar', nameEn: 'Financial Income', type: 'revenue', category: 'financial', normalBalance: 'credit' },

  // Expenses (8000-8999)
  { code: '8000', nameUz: 'Sotilgan mahsulot tannarxi', nameEn: 'Cost of Goods Sold', type: 'expense', category: 'operating', normalBalance: 'debit' },
  { code: '8100', nameUz: 'Davr xarajatlari', nameEn: 'Period Expenses', type: 'expense', category: 'operating', normalBalance: 'debit' },
  { code: '8500', nameUz: 'Moliyaviy faoliyat boʻyicha xarajatlar', nameEn: 'Financial Expenses', type: 'expense', category: 'financial', normalBalance: 'debit' },
  { code: '8600', nameUz: 'Favqulodda zararlar', nameEn: 'Extraordinary Losses', type: 'expense', category: 'other', normalBalance: 'debit' },
  { code: '8700', nameUz: 'Daromad (foyda) soligʻi', nameEn: 'Income Tax', type: 'expense', category: 'tax', normalBalance: 'debit' }
];

export function validateAccountCode(code: string): boolean {
  return NAS_ACCOUNTS.some(account => account.code === code);
}

export function getAccountInfo(code: string): AccountCode | undefined {
  return NAS_ACCOUNTS.find(account => account.code === code);
}

export function validateAccountType(code: string, expectedType: AccountCode['type']): boolean {
  const account = getAccountInfo(code);
  return account?.type === expectedType;
}

export function validateNormalBalance(code: string, amount: number): boolean {
  const account = getAccountInfo(code);
  if (!account) return false;

  // For debit normal balance, amount should be positive
  // For credit normal balance, amount should be negative
  return account.normalBalance === 'debit' ? amount >= 0 : amount <= 0;
}

export function getAccountRange(type: StatementType): { start: string; end: string } {
  switch (type) {
    case 'balance-sheet':
      return { start: '0100', end: '5999' };
    case 'income':
    case 'pnl':
      return { start: '7000', end: '8999' };
    case 'cash-flow':
      return { start: '0100', end: '8999' };
    default:
      throw new Error(`Invalid statement type: ${type}`);
  }
}