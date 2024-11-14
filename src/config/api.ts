export const API_CONFIG = {
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  },
  anthropic: {
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
  }
};