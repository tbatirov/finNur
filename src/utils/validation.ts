import { z } from 'zod';
import { AccountEntrySchema, GeneratedStatementSchema } from '../types/financial';

export function validateEnvironmentVariables(requiredVars: string[]) {
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
}

export function validateFinancialData(data: unknown): boolean {
  try {
    z.array(AccountEntrySchema).parse(data);
    return true;
  } catch {
    return false;
  }
}

export function validateStatement(statement: unknown): boolean {
  try {
    GeneratedStatementSchema.parse(statement);
    return true;
  } catch {
    return false;
  }
}

export function validateAccountCode(code: string): boolean {
  // Ensure code is exactly 4 digits
  return /^\d{4}$/.test(code);
}

// Helper function to format account code
export function formatAccountCode(code: string | number): string {
  return code.toString().padStart(4, '0');
}

export function validateDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end && !isNaN(start.getTime()) && !isNaN(end.getTime());
}

export function sanitizeNumber(value: unknown): number {
  const num = Number(value);
  return isNaN(num) ? 0 : Number(num.toFixed(2));
}