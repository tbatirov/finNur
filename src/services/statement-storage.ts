import { GeneratedStatement } from '../types/financial';

const STATEMENTS_KEY = 'statements';

interface StoredStatements {
  [companyId: string]: {
    [fiscalYearId: string]: {
      [month: number]: {
        [statementType: string]: GeneratedStatement;
      };
    };
  };
}

export async function saveStatements(
  companyId: string,
  fiscalYearId: string,
  month: number,
  statements: Record<string, GeneratedStatement>
): Promise<void> {
  const storedData = localStorage.getItem(STATEMENTS_KEY);
  const allStatements: StoredStatements = storedData ? JSON.parse(storedData) : {};

  // Initialize nested structure if it doesn't exist
  if (!allStatements[companyId]) {
    allStatements[companyId] = {};
  }
  if (!allStatements[companyId][fiscalYearId]) {
    allStatements[companyId][fiscalYearId] = {};
  }
  if (!allStatements[companyId][fiscalYearId][month]) {
    allStatements[companyId][fiscalYearId][month] = {};
  }

  // Save statements
  allStatements[companyId][fiscalYearId][month] = statements;
  localStorage.setItem(STATEMENTS_KEY, JSON.stringify(allStatements));
}

export async function getMonthlyStatements(
  companyId: string,
  fiscalYearId: string,
  month: number
): Promise<Record<string, GeneratedStatement> | null> {
  const storedData = localStorage.getItem(STATEMENTS_KEY);
  if (!storedData) return null;

  const allStatements: StoredStatements = JSON.parse(storedData);
  return allStatements[companyId]?.[fiscalYearId]?.[month] || null;
}

export async function getFiscalYearStatements(
  companyId: string,
  fiscalYearId: string
): Promise<Record<number, Record<string, GeneratedStatement>>> {
  const storedData = localStorage.getItem(STATEMENTS_KEY);
  if (!storedData) return {};

  const allStatements: StoredStatements = JSON.parse(storedData);
  return allStatements[companyId]?.[fiscalYearId] || {};
}

export async function checkExistingStatements(
  companyId: string,
  fiscalYearId: string,
  month: number
): Promise<boolean> {
  const statements = await getMonthlyStatements(companyId, fiscalYearId, month);
  return statements !== null;
}

export async function deleteStatements(
  companyId: string,
  fiscalYearId: string,
  month?: number
): Promise<void> {
  const storedData = localStorage.getItem(STATEMENTS_KEY);
  if (!storedData) return;

  const allStatements: StoredStatements = JSON.parse(storedData);
  
  if (!allStatements[companyId]?.[fiscalYearId]) return;

  if (month !== undefined) {
    // Delete specific month
    delete allStatements[companyId][fiscalYearId][month];
  } else {
    // Delete entire fiscal year
    delete allStatements[companyId][fiscalYearId];
  }

  localStorage.setItem(STATEMENTS_KEY, JSON.stringify(allStatements));
}