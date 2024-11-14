export interface Company {
  id: string;
  name: string;
  taxId: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  industry?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FiscalYear {
  id: string;
  companyId: string;
  name: string;
  start_date: string;
  end_date: string;
}

export interface FiscalMonth {
  year: string;
  month: number;
  statements: string[]; // IDs of statements
}