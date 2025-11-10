export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

