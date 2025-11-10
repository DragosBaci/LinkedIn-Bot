export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  userMessage?: string; // Simplified message for users
  isAdvanced?: boolean; // If true, only show in advanced mode
}
