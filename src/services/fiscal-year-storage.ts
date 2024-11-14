import { v4 as uuidv4 } from 'uuid';
import { FiscalYear } from '../types/company';

const FISCAL_YEARS_KEY = 'fiscal_years';

export async function getFiscalYears(companyId: string): Promise<FiscalYear[]> {
  const storedData = localStorage.getItem(FISCAL_YEARS_KEY);
  const allFiscalYears = storedData ? JSON.parse(storedData) : {};
  return allFiscalYears[companyId] || [];
}

export async function addFiscalYear(companyId: string, fiscalYear: Omit<FiscalYear, 'id'>): Promise<FiscalYear> {
  const storedData = localStorage.getItem(FISCAL_YEARS_KEY);
  const allFiscalYears = storedData ? JSON.parse(storedData) : {};
  
  const newFiscalYear: FiscalYear = {
    ...fiscalYear,
    id: uuidv4(),
    companyId
  };

  allFiscalYears[companyId] = [...(allFiscalYears[companyId] || []), newFiscalYear];
  localStorage.setItem(FISCAL_YEARS_KEY, JSON.stringify(allFiscalYears));
  
  return newFiscalYear;
}

export async function updateFiscalYear(fiscalYear: FiscalYear): Promise<FiscalYear> {
  const storedData = localStorage.getItem(FISCAL_YEARS_KEY);
  const allFiscalYears = storedData ? JSON.parse(storedData) : {};
  
  const companyYears = allFiscalYears[fiscalYear.companyId] || [];
  const updatedYears = companyYears.map((year: FiscalYear) => 
    year.id === fiscalYear.id ? fiscalYear : year
  );
  
  allFiscalYears[fiscalYear.companyId] = updatedYears;
  localStorage.setItem(FISCAL_YEARS_KEY, JSON.stringify(allFiscalYears));
  
  return fiscalYear;
}

export async function deleteFiscalYear(companyId: string, fiscalYearId: string): Promise<void> {
  const storedData = localStorage.getItem(FISCAL_YEARS_KEY);
  const allFiscalYears = storedData ? JSON.parse(storedData) : {};
  
  const companyYears = allFiscalYears[companyId] || [];
  allFiscalYears[companyId] = companyYears.filter((year: FiscalYear) => year.id !== fiscalYearId);
  
  localStorage.setItem(FISCAL_YEARS_KEY, JSON.stringify(allFiscalYears));
}