export const ACCOUNT_NAMES = {
  '0100': {
    ru: 'Денежные средства в кассе',
    en: 'Cash on hand'
  },
  '0200': {
    ru: 'Денежные средства на расчетном счете',
    en: 'Cash in bank'
  },
  '0300': {
    ru: 'Краткосрочные инвестиции',
    en: 'Short-term investments'
  },
  '0400': {
    ru: 'Счета к получению',
    en: 'Accounts receivable'
  },
  '0500': {
    ru: 'Резерв по сомнительным долгам',
    en: 'Allowance for doubtful accounts'
  },
  '0600': {
    ru: 'Товарно-материальные запасы',
    en: 'Inventory'
  },
  '0700': {
    ru: 'Предоплаченные расходы',
    en: 'Prepaid expenses'
  },
  '0800': {
    ru: 'Долгосрочные инвестиции',
    en: 'Long-term investments'
  },
  '0900': {
    ru: 'Основные средства',
    en: 'Fixed assets'
  },
  '1000': {
    ru: 'Накопленная амортизация - основные средства',
    en: 'Accumulated depreciation - fixed assets'
  },
  '1100': {
    ru: 'Нематериальные активы',
    en: 'Intangible assets'
  },
  '1200': {
    ru: 'Накопленная амортизация - нематериальные активы',
    en: 'Accumulated amortization - intangible assets'
  },
  // Liabilities
  '2000': {
    ru: 'Краткосрочные кредиты и займы',
    en: 'Short-term loans'
  },
  '2100': {
    ru: 'Счета к оплате',
    en: 'Accounts payable'
  },
  '2200': {
    ru: 'Начисленные обязательства',
    en: 'Accrued liabilities'
  },
  '2300': {
    ru: 'Налоги к оплате',
    en: 'Taxes payable'
  },
  '2400': {
    ru: 'Долгосрочные кредиты и займы',
    en: 'Long-term loans'
  },
  // Equity
  '3000': {
    ru: 'Уставный капитал',
    en: 'Charter capital'
  },
  '3100': {
    ru: 'Добавленный капитал',
    en: 'Additional paid-in capital'
  },
  '3200': {
    ru: 'Резервный капитал',
    en: 'Reserve capital'
  },
  '3300': {
    ru: 'Нераспределенная прибыль',
    en: 'Retained earnings'
  },
  // Revenue and Expenses
  '4000': {
    ru: 'Выручка от реализации',
    en: 'Sales revenue'
  },
  '4100': {
    ru: 'Прочие доходы',
    en: 'Other income'
  },
  '5000': {
    ru: 'Себестоимость реализации',
    en: 'Cost of sales'
  },
  '5100': {
    ru: 'Коммерческие расходы',
    en: 'Selling expenses'
  },
  '5200': {
    ru: 'Административные расходы',
    en: 'Administrative expenses'
  },
  '5300': {
    ru: 'Прочие операционные расходы',
    en: 'Other operating expenses'
  }
} as const;

export function getAccountName(code: string, language: 'ru' | 'en' = 'en'): string {
  const baseCode = code.substring(0, 4);
  return ACCOUNT_NAMES[baseCode]?.[language] || code;
}

export function isContraAccount(name: string): boolean {
  const ruContraTerms = ['износ', 'амортизация', 'резерв'];
  const enContraTerms = ['depreciation', 'amortization', 'allowance'];
  
  const nameLower = name.toLowerCase();
  return ruContraTerms.some(term => nameLower.includes(term)) ||
         enContraTerms.some(term => nameLower.includes(term));
}

export function getAccountType(name: string): 'active' | 'passive' | 'contra' {
  if (isContraAccount(name)) return 'contra';
  
  const passiveRuTerms = ['капитал', 'обязательства', 'доходы', 'прибыль'];
  const passiveEnTerms = ['capital', 'liabilities', 'revenue', 'income', 'earnings'];
  
  const nameLower = name.toLowerCase();
  
  if (passiveRuTerms.some(term => nameLower.includes(term)) ||
      passiveEnTerms.some(term => nameLower.includes(term))) {
    return 'passive';
  }
  
  return 'active';
}