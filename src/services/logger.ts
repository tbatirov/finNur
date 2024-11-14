export class Logger {
  private static instance: Logger;
  private logs: Array<{ timestamp: string; message: string; data?: any }> = [];
  private maxLogs = 1000;

  private constructor() {}

  static getInstance(): Logger {
    if (!this.instance) {
      this.instance = new Logger();
    }
    return this.instance;
  }

  log(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`, data || '');
    
    this.logs.unshift({ timestamp, message, data });
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  getLogs(limit?: number): Array<{ timestamp: string; message: string; data?: any }> {
    return limit ? this.logs.slice(0, limit) : [...this.logs];
  }

  getLogsByType(type: string, limit?: number): Array<{ timestamp: string; message: string; data?: any }> {
    const filtered = this.logs.filter(log => log.message.toLowerCase().includes(type.toLowerCase()));
    return limit ? filtered.slice(0, limit) : filtered;
  }

  clear(): void {
    this.logs = [];
  }
}

export const logger = Logger.getInstance();