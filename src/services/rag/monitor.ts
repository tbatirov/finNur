import { StatementType, GeneratedStatement } from '../../types/financial';
import { logger } from '../logger';
import { NASValidator } from './nas-validator';
import { validateStatement } from '../statement-validator';

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
        // Perform comprehensive validation
        const validations = this.validateStatement(statement, type);
        
        if (validations.length > 0) {
          logger.log(`Validation issues found in ${type}:`, validations);
          
          const updatedStatement = {
            ...statement,
            validations: [
              ...statement.validations,
              `Validation check at ${now.toISOString()}`
            ],
            corrections: [
              ...statement.corrections,
              ...validations
            ]
          };

          this.statements.set(type, updatedStatement);
        }

        this.lastValidation.set(type, now);
      }
    });
  }

  private validateStatement(statement: GeneratedStatement, type: StatementType): string[] {
    const violations: string[] = [];

    // 1. Basic statement validation
    const basicValidation = validateStatement(statement, type);
    if (!basicValidation.isValid) {
      violations.push(...basicValidation.errors);
    }

    // 2. NAS Hierarchy validation
    statement.lineItems.forEach(item => {
      const hierarchyValidation = NASValidator.validateHierarchy(item);
      if (!hierarchyValidation.isValid) {
        violations.push(...hierarchyValidation.violations);
      }
    });

    // 3. Statement requirements validation
    const requirementsValidation = NASValidator.validateStatementRequirements(
      statement.lineItems,
      type
    );
    if (!requirementsValidation.isValid) {
      violations.push(...requirementsValidation.violations);
    }

    // 4. Balance relationships validation
    const relationshipsValidation = NASValidator.validateBalanceRelationships(
      statement.lineItems
    );
    if (!relationshipsValidation.isValid) {
      violations.push(...relationshipsValidation.violations);
    }

    return violations;
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