// Update CompanyRow interface
export interface CompanyRow {
  id: string;
  name: string;
  code: string;
  tax_id: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  industry?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyInsert {
  id?: string;
  name: string;
  code: string;
  tax_id: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  industry?: string | null;
  user_id: string;
}

export interface CompanyUpdate {
  name?: string;
  code?: string;
  tax_id?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  industry?: string | null;
  updated_at?: string;
}

// Rest of the types remain the same...