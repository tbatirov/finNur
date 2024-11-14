import { supabase } from '../../config/supabase';
import { ChartOfAccount } from '../../types/supabase';

export async function getChartOfAccounts(companyId: string) {
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .select('*')
    .eq('company_id', companyId)
    .order('code');

  if (error) throw error;
  return data;
}

export async function getAccount(id: string) {
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createAccount(account: Omit<ChartOfAccount, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .insert(account)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAccount(id: string, updates: Partial<ChartOfAccount>) {
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAccount(id: string) {
  const { error } = await supabase
    .from('chart_of_accounts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function bulkCreateAccounts(accounts: Omit<ChartOfAccount, 'id' | 'created_at' | 'updated_at'>[]) {
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .insert(accounts)
    .select();

  if (error) throw error;
  return data;
}