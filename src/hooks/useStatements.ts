import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStatements, saveStatement } from '../services/api/statements';
import { StatementData } from '../types/financial';

export function useStatements(companyId: string, fiscalYearId: string, month: number) {
  return useQuery({
    queryKey: ['statements', companyId, fiscalYearId, month],
    queryFn: () => getStatements(companyId, fiscalYearId, month),
    enabled: Boolean(companyId && fiscalYearId && month)
  });
}

export function useSaveStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StatementData) => saveStatement(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['statements', variables.company_id, variables.fiscal_year_id, variables.month]
      });
    }
  });
}