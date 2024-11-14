import { AIProvider } from './ai-provider';
import { API_CONFIG } from '../config/api';
import { logger } from './logger';

export async function checkAIConnection(provider: AIProvider): Promise<boolean> {
  logger.log(`Checking ${provider} connection...`);

  try {
    if (provider === 'openai') {
      if (!API_CONFIG.openai.apiKey) {
        logger.log('OpenAI API key not configured');
        return false;
      }

      const response = await fetch('/api/openai/models', {
        headers: {
          'Authorization': `Bearer ${API_CONFIG.openai.apiKey}`
        }
      });

      if (!response.ok) {
        logger.log('OpenAI connection failed:', await response.text());
        return false;
      }

      return true;
    } else {
      if (!API_CONFIG.anthropic.apiKey) {
        logger.log('Anthropic API key not configured');
        return false;
      }

      const response = await fetch('/api/anthropic/health', {
        headers: {
          'x-api-key': API_CONFIG.anthropic.apiKey
        }
      });

      if (!response.ok) {
        logger.log('Anthropic connection failed:', await response.text());
        return false;
      }

      return true;
    }
  } catch (error) {
    logger.log(`${provider} connection check failed:`, error);
    return false;
  }
}