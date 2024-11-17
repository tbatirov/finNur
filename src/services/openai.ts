import OpenAI from 'openai';
import { API_CONFIG } from '../config/api';
import { AccountEntry, StatementType, GeneratedStatement } from '../types/financial';
import { StatementGenerationError } from './errors';
import { logger } from './logger';
import { buildStructuredPrompt } from './prompt-builder';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractJSON(content: string): string {
  try {
    JSON.parse(content);
    return content;
  } catch {
    const jsonMatch = content.match(/```(?:json)?\n([\s\S]*?)\n```/) || 
                     content.match(/`([\s\S]*?)`/) ||
                     [null, content.trim()];
    return jsonMatch[1].trim();
  }
}

export async function generateWithOpenAI(
  data: AccountEntry[],
  type: StatementType,
  retryCount = 0
): Promise<GeneratedStatement> {
  if (!API_CONFIG.openai.apiKey) {
    throw new StatementGenerationError('OpenAI API key not configured');
  }

  try {
    logger.log(`Starting ${type} generation with OpenAI`);

    const openai = new OpenAI({
      apiKey: API_CONFIG.openai.apiKey,
      dangerouslyAllowBrowser: true
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a financial statement generator following Uzbekistan NAS standards. Return only valid JSON without any markdown or explanations."
        },
        {
          role: "user",
          content: buildStructuredPrompt(type, data)
        }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    logger.log('Received response from OpenAI');

    try {
      const jsonContent = extractJSON(content);
      const result = JSON.parse(jsonContent);
      logger.log('Successfully parsed OpenAI response');
      return result;
    } catch (error) {
      logger.log('Failed to parse OpenAI response:', content);
      throw new Error('Invalid JSON response');
    }
  } catch (error) {
    logger.log('OpenAI generation failed:', error);

    if (retryCount < MAX_RETRIES) {
      logger.log(`Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
      await delay(RETRY_DELAY * Math.pow(2, retryCount));
      return generateWithOpenAI(data, type, retryCount + 1);
    }

    throw new StatementGenerationError(
      'Failed to generate statement',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}