// Define and export the Company types
export interface CompanyRow {
  id: string;
  name: string;
  code: string;
  tax_id: string;
  address: string | null;
  industry: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CompanyInsert {
  id?: string;
  name: string;
  code: string;
  tax_id: string;
  address?: string | null;
  industry?: string | null;
  user_id: string;
}

export interface CompanyUpdate {
  name?: string;
  code?: string;
  tax_id?: string;
  address?: string | null;
  industry?: string | null;
  updated_at?: string;
}

// Define and export the FiscalYear types
export interface FiscalYearRow {
  id: string;
  company_id: string;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface FiscalYearInsert {
  id?: string;
  company_id: string;
  name: string;
  start_date: string;
  end_date: string;
}

export interface FiscalYearUpdate {
  name?: string;
  start_date?: string;
  end_date?: string;
  updated_at?: string;
}

// Define and export the Statement types
export interface StatementRow {
  id: string;
  company_id: string;
  fiscal_year_id: string;
  month: number;
  type: string;
  data: any;
  created_at: string;
  updated_at: string;
}

export interface StatementInsert {
  id?: string;
  company_id: string;
  fiscal_year_id: string;
  month: number;
  type: string;
  data: any;
}

export interface StatementUpdate {
  data?: any;
  updated_at?: string;
}