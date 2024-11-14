import { AccountEntry, StatementType, GeneratedStatement } from '../types/financial';
import { generateWithOpenAI } from './openai';
import { StatementGenerationError } from './errors';
import { logger } from './logger';
import { RAGMonitor } from './rag/monitor';

// Cache for storing generated statements
const statementCache = new Map<string, Map<StatementType, GeneratedStatement>>();

// Get a unique key for the data to use as cache key
function getDataKey(data: AccountEntry[]): string {
  return JSON.stringify(data.map(entry => ({
    code: entry.accountCode,
    debit: entry.endOfPeriodDebit,
    credit: entry.endOfPeriodCredit
  })));
}

// Order of statement generation
const STATEMENT_ORDER: StatementType[] = ['balance-sheet', 'income', 'cash-flow', 'pnl'];

// Function to generate the next statement in sequence
async function generateNextStatement(data: AccountEntry[], currentType: StatementType) {
  const currentIndex = STATEMENT_ORDER.indexOf(currentType);
  if (currentIndex < STATEMENT_ORDER.length - 1) {
    const nextType = STATEMENT_ORDER[currentIndex + 1];
    try {
      logger.log(`Auto-generating ${nextType} statement`);
      await generateFinancialStatement(data, nextType);
    } catch (error) {
      logger.log(`Error auto-generating ${nextType} statement:`, error);
    }
  }
}

export async function generateFinancialStatement(
  data: AccountEntry[],
  type: StatementType,
  force = false
): Promise<GeneratedStatement> {
  if (!data?.length) {
    throw new StatementGenerationError('No data provided');
  }

  const dataKey = getDataKey(data);
  const cachedStatements = statementCache.get(dataKey);

  // Return cached result if available and not forced regeneration
  if (!force && cachedStatements?.has(type)) {
    logger.log(`Using cached ${type} statement`);
    const cachedStatement = cachedStatements.get(type)!;
    // Start monitoring even for cached statements
    RAGMonitor.getInstance().startMonitoring(cachedStatement, type);
    return cachedStatement;
  }

  try {
    logger.log(`Generating ${type} statement`);
    const result = await generateWithOpenAI(data, type);
    
    // Cache the result
    const currentCache = statementCache.get(dataKey) || new Map();
    currentCache.set(type, result);
    statementCache.set(dataKey, currentCache);

    // Start monitoring the new statement
    RAGMonitor.getInstance().startMonitoring(result, type);

    // Start generating the next statement in sequence
    setTimeout(() => {
      generateNextStatement(data, type);
    }, 1000);
    
    return result;
  } catch (error) {
    logger.log(`Error generating ${type}:`, error);
    throw error;
  }
}

// Function to clear cache for specific data
export function clearStatementCache(data?: AccountEntry[]) {
  if (data) {
    const dataKey = getDataKey(data);
    statementCache.delete(dataKey);
  } else {
    statementCache.clear();
  }
}

// Function to check if statement is cached
export function isStatementCached(data: AccountEntry[], type: StatementType): boolean {
  const dataKey = getDataKey(data);
  return statementCache.get(dataKey)?.has(type) ?? false;
}

// Function to get all cached statements for data
export function getCachedStatements(data: AccountEntry[]): Map<StatementType, GeneratedStatement> {
  const dataKey = getDataKey(data);
  return statementCache.get(dataKey) || new Map();
}