import { supabase } from '../../config/client';
import { SavedStatement, StatementData, GeneratedStatement } from '../../types/financial';

export async function getStatements(
  companyId: string,
  fiscalYearId: string,
  month: number
): Promise<SavedStatement[]> {
  try {
    const { data, error } = await supabase
      .from('statements')
      .select('*')
      .eq('company_id', companyId)
      .eq('fiscal_year_id', fiscalYearId)
      .eq('month', month);

    if (error) throw error;

    // Transform and validate the data
    return (data || []).map(item => {
      try {
        // Handle nested statement structure
        const statementData = item.data[item.type] as GeneratedStatement;
        
        if (!statementData) {
          console.warn(`No data found for statement type ${item.type}`);
          return null;
        }

        return {
          id: item.id,
          type: item.type,
          statement: {
            lineItems: statementData.lineItems || [],
            subtotals: statementData.subtotals || [],
            total: statementData.total || 0,
            validations: statementData.validations || [],
            corrections: statementData.corrections || []
          },
          createdAt: item.created_at,
          updatedAt: item.updated_at
        };
      } catch (err) {
        console.error('Error processing statement:', err);
        return null;
      }
    }).filter(Boolean) as SavedStatement[]; // Remove any null values
  } catch (error) {
    console.error('Error fetching statements:', error);
    throw error;
  }
}

export async function saveStatement(statement: StatementData): Promise<SavedStatement> {
  try {
    // Structure the data correctly for storage
    const statementData = statement.data;

    const { data, error } = await supabase
      .from('statements')
      .upsert({
        company_id: statement.company_id,
        fiscal_year_id: statement.fiscal_year_id,
        month: statement.month,
        type: statement.type,
        data: statementData
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      type: data.type,
      statement: data.data[data.type] as GeneratedStatement,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error saving statement:', error);
    throw error;
  }
}