import { StatementType, GeneratedStatement } from '../../types/financial';
import { logger } from '../logger';
import { validateStatement } from '../statement-validator';
import { RuleRetriever } from './retriever';

export class RAGMonitor {
  private static instance: RAGMonitor;
  private monitoringInterval: NodeJS.Timer | null = null;
  private statements: Map<StatementType, GeneratedStatement> = new Map();
  private lastValidation: Map<StatementType, Date> = new Map();
  private validationInterval = 5000; // 5 seconds

  private constructor() {}

  static getInstance(): RAGMonitor {
    if (!this.instance) {
      this.instance = new RAGMonitor();
    }
    return this.instance;
  }

  startMonitoring(statement: GeneratedStatement, type: StatementType): void {
    this.statements.set(type, statement);
    this.lastValidation.set(type, new Date());
    logger.log(`Started monitoring ${type} statement`);

    if (!this.monitoringInterval) {
      this.monitoringInterval = setInterval(() => this.checkStatements(), this.validationInterval);
    }
  }

  stopMonitoring(type: StatementType): void {
    this.statements.delete(type);
    this.lastValidation.delete(type);
    logger.log(`Stopped monitoring ${type} statement`);

    if (this.statements.size === 0 && this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private checkStatements(): void {
    const now = new Date();
    this.statements.forEach((statement, type) => {
      const lastCheck = this.lastValidation.get(type) || new Date(0);
      if (now.getTime() - lastCheck.getTime() >= this.validationInterval) {
        const validation = validateStatement(statement, type);
        const ruleValidation = RuleRetriever.validateStatement(type, statement.lineItems, statement.total);
        
        if (!validation.isValid || !ruleValidation.isValid) {
          logger.log(`Validation issues found in ${type}:`, {
            standardValidation: validation.errors,
            ruleViolations: ruleValidation.violations
          });
          
          const updatedStatement = {
            ...statement,
            validations: [
              ...statement.validations,
              `Validation check at ${now.toISOString()}`
            ],
            corrections: [
              ...statement.corrections,
              ...validation.errors,
              ...ruleValidation.violations.map(v => 
                `Rule violation: ${v.rule.description} in ${v.items.map(i => i.description).join(', ')}`
              )
            ]
          };

          this.statements.set(type, updatedStatement);
        }

        this.lastValidation.set(type, now);
      }
    });
  }

  getStatus(type: StatementType): 'red' | 'amber' | 'green' {
    const statement = this.statements.get(type);
    if (!statement) return 'red';

    const hasErrors = statement.corrections.some(c => 
      c.toLowerCase().includes('error') || 
      c.toLowerCase().includes('invalid') ||
      c.toLowerCase().includes('violation')
    );
    
    const hasWarnings = statement.corrections.some(c => 
      c.toLowerCase().includes('warning') || 
      c.toLowerCase().includes('check')
    );

    if (hasErrors) return 'red';
    if (hasWarnings) return 'amber';
    return 'green';
  }

  getMonitoredStatement(type: StatementType): GeneratedStatement | null {
    return this.statements.get(type) || null;
  }

  isMonitoring(type: StatementType): boolean {
    return this.statements.has(type);
  }
}