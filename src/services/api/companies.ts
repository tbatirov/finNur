import { supabase } from '../../config/client';
import { CompanyRow, CompanyInsert, CompanyUpdate } from '../../types/supabase';

export async function getCompanies(userId: string) {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
}

export async function getCompany(id: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching company:', error);
    return null;
  }
}

export async function createCompany(company: Omit<CompanyInsert, 'id' | 'created_at' | 'updated_at'>, userId: string) {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert({ ...company, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
}

export async function updateCompany(id: string, updates: Partial<CompanyUpdate>, userId: string) {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
}

export async function deleteCompany(id: string, userId: string) {
  try {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting company:', error);
    throw error;
  }
}