import { LineItem } from '../types/financial';

export const getLineItemValue = (item: LineItem): number => {
  if (!item || typeof item.amount !== 'number') return 0;
  return item.amount;
};

export const matchesSection = (section: string | undefined, pattern: string): boolean => {
  if (!section) return false;
  const normalized = typeof section === 'string' 
    ? section.toLowerCase()
    : section.toString().toLowerCase();
  return normalized.includes(pattern.toLowerCase());
};

export const matchesAccountCode = (code: string | number | undefined, start: number, end: number): boolean => {
  if (!code) return false;
  const numericCode = typeof code === 'number' 
    ? code 
    : parseInt(code.toString().replace(/[^0-9]/g, ''));
  return !isNaN(numericCode) && numericCode >= start && numericCode <= end;
};

export const findLineItems = (
  items: LineItem[] | undefined,
  criteria: {
    section?: string;
    startCode?: number;
    endCode?: number;
  }
): LineItem[] => {
  if (!items || !Array.isArray(items)) return [];

  return items.filter(item => {
    if (criteria.section && !matchesSection(item.section, criteria.section)) {
      return false;
    }
    if (criteria.startCode && criteria.endCode && 
        !matchesAccountCode(item.code, criteria.startCode, criteria.endCode)) {
      return false;
    }
    return true;
  });
};