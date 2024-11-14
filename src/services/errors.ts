export class StatementGenerationError extends Error {
  constructor(
    message: string,
    public details?: {
      response?: string;
      error?: any;
      errors?: string[];
      statement?: any;
      apiError?: string;
    }
  ) {
    super(message);
    this.name = 'StatementGenerationError';
  }
}