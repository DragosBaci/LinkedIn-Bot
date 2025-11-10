export const LogLevel = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  userMessage?: string; // Simplified message for users
  isAdvanced?: boolean; // If true, only show in advanced mode
}
