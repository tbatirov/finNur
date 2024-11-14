import { supabase } from '../../config/client';
import { FiscalYear } from '../../types/company';

export async function getFiscalYears(companyId: string) {
  try {
    const { data, error } = await supabase
      .from('fiscal_years')
      .select('*')
      .eq('company_id', companyId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching fiscal years:', error);
    return [];
  }
}

export async function getFiscalYear(id: string) {
  try {
    const { data, error } = await supabase
      .from('fiscal_years')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching fiscal year:', error);
    return null;
  }
}

export async function addFiscalYear(fiscalYear: Omit<FiscalYear, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('fiscal_years')
      .insert({
        company_id: fiscalYear.companyId,
        name: fiscalYear.name,
        start_date: fiscalYear.start_date,
        end_date: fiscalYear.end_date
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding fiscal year:', error);
    throw error;
  }
}

export async function updateFiscalYear(id: string, updates: Partial<FiscalYear>) {
  try {
    const { data, error } = await supabase
      .from('fiscal_years')
      .update({
        name: updates.name,
        start_date: updates.start_date,
        end_date: updates.end_date
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating fiscal year:', error);
    throw error;
  }
}

export async function deleteFiscalYear(id: string) {
  try {
    const { error } = await supabase
      .from('fiscal_years')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting fiscal year:', error);
    throw error;
  }
}