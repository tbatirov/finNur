import { API_CONFIG } from '../config/api';
import { AccountEntry, StatementType, GeneratedStatement } from '../types/financial';
import { StatementGenerationError } from './errors';
import { logger } from './logger';
import { buildStructuredPrompt } from './prompt-builder';

export async function generateWithAnthropic(
  data: AccountEntry[],
  type: StatementType
): Promise<GeneratedStatement> {
  if (!API_CONFIG.anthropic.apiKey) {
    throw new StatementGenerationError('Anthropic API key not configured');
  }

  logger.log('Preparing Anthropic request');

  const accountBalances = data.map(entry => ({
    code: entry.accountCode,
    name: entry.accountName,
    balance: entry.endOfPeriodDebit - entry.endOfPeriodCredit
  }));

  const prompt = buildStructuredPrompt(type, accountBalances);

  try {
    const response = await fetch('/api/anthropic/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_CONFIG.anthropic.apiKey
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt
        }],
        system: 'You are a financial statement generator. Return only valid JSON.'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      logger.log('Anthropic request failed:', error);
      throw new Error(error);
    }

    const result = await response.json();
    return JSON.parse(result.content[0].text);
  } catch (error) {
    logger.log('Anthropic generation failed:', error);
    throw new StatementGenerationError(
      'Anthropic generation failed',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}