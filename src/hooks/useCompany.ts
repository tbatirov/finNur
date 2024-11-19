import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCompanies, createCompany, updateCompany, deleteCompany } from '../services/api/companies';
import { CompanyInsert, CompanyUpdate } from '../types/supabase';

export function useCompanies(userId: string) {
  return useQuery({
    queryKey: ['companies', userId],
    queryFn: () => getCompanies(userId),
    enabled: Boolean(userId)
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, userId }: { data: CompanyInsert; userId: string }) => 
      createCompany(data, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['companies', variables.userId]
      });
    }
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates, userId }: { id: string; updates: CompanyUpdate; userId: string }) => 
      updateCompany(id, updates, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['companies', variables.userId]
      });
    }
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => 
      deleteCompany(id, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['companies', variables.userId]
      });
    }
  });
}