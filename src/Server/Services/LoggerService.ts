import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { WebSocket } from 'ws';
import type { LogEntry, LogOptions } from '@/Common/Types/LogEntry';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.join(__dirname, '../../../Logs');

export class LoggerService {
  private static instance: LoggerService;
  private logs: LogEntry[] = [];
  private logFilePath: string | null = null;
  private wsClients: Set<WebSocket> = new Set();
  private isLoggingActive: boolean = false;

  private constructor() {
    // Don't create log file until needed
  }

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  private initializeLogFile(): void {
    if (this.logFilePath) {
      return; // Already initialized
    }

    // Create Logs directory if it doesn't exist
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
    }

    // Create new log file with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    this.logFilePath = path.join(LOGS_DIR, `bot-log-${timestamp}.txt`);
    
    // Initialize log file
    this.writeToFile('=== Bot Session Started ===\n');
    this.isLoggingActive = true;
  }

  startSession(): void {
    this.initializeLogFile();
  }

  endSession(): void {
    if (this.logFilePath) {
      this.writeToFile('=== Bot Session Ended ===\n\n');
    }
    this.isLoggingActive = false;
    this.logFilePath = null;
  }

  addWebSocketClient(ws: WebSocket): void {
    this.wsClients.add(ws);
    
    // Send all existing logs to the new client
    ws.send(JSON.stringify({
      type: 'INIT_LOGS',
      data: this.logs
    }));

    ws.on('close', () => {
      this.wsClients.delete(ws);
    });
  }

  private broadcast(entry: LogEntry): void {
    const message = JSON.stringify({
      type: 'NEW_LOG',
      data: entry
    });

    this.wsClients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  }

  log(options: LogOptions): void {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level: options.level,
      message: options.message,
      userMessage: options.userMessage,
      isAdvanced: options.isAdvanced ?? false
    };

    this.logs.push(entry);

    // Only write to file if logging is active
    if (this.isLoggingActive && this.logFilePath) {
      const logLine = `[${new Date(entry.timestamp).toISOString()}] [${options.level.toUpperCase()}] ${options.message}\n`;
      this.writeToFile(logLine);
    }

    // Broadcast to WebSocket clients
    this.broadcast(entry);

    // Keep only last 100 logs in memory
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }

  private writeToFile(content: string): void {
    if (!this.logFilePath) {
      return;
    }

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
    
    if (this.isLoggingActive && this.logFilePath) {
      this.writeToFile('\n=== Logs Cleared ===\n');
    }
    
    // Notify all clients
    const message = JSON.stringify({
      type: 'LOGS_CLEARED'
    });

    this.wsClients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }
}
