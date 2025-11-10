import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { LogEntry } from '@/Common/Types/LogEntry';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.join(__dirname, '../../../Logs');

export class LoggerService {
  private static instance: LoggerService;
  private logs: LogEntry[] = [];
  private logFilePath: string;

  private constructor() {
    // Create Logs directory if it doesn't exist
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
    }

    // Create new log file with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    this.logFilePath = path.join(LOGS_DIR, `bot-log-${timestamp}.txt`);
    
    // Initialize log file
    this.writeToFile('=== Bot Session Started ===\n');
    this.log('info', 'Bot session initialized');
  }

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  log(level: LogEntry['level'], message: string): void {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      message
    };

    this.logs.push(entry);

    // Write to file
    const logLine = `[${new Date(entry.timestamp).toISOString()}] [${level.toUpperCase()}] ${message}\n`;
    this.writeToFile(logLine);

    // Keep only last 100 logs in memory
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }

  private writeToFile(content: string): void {
    try {
      fs.appendFileSync(this.logFilePath, content, 'utf8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
    this.writeToFile('\n=== Logs Cleared ===\n');
  }
}

