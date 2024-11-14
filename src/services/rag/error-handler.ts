import { logger } from '../logger';
import { StatementType } from '../../types/financial';

export class RAGErrorHandler {
  private static instance: RAGErrorHandler;
  private errors: Map<string, Error[]> = new Map();

  private constructor() {}

  static getInstance(): RAGErrorHandler {
    if (!this.instance) {
      this.instance = new RAGErrorHandler();
    }
    return this.instance;
  }

  logError(type: StatementType, error: Error): void {
    const errors = this.errors.get(type) || [];
    errors.push(error);
    this.errors.set(type, errors);
    logger.log(`RAG Error in ${type}:`, error);
  }

  getErrors(type: StatementType): Error[] {
    return this.errors.get(type) || [];
  }

  clearErrors(type: StatementType): void {
    this.errors.delete(type);
  }

  hasErrors(type: StatementType): boolean {
    return (this.errors.get(type)?.length || 0) > 0;
  }
}