export const BotStatus = {
  IDLE: 'idle',
  STARTING: 'starting',
  RUNNING: 'running',
  STOPPING: 'stopping',
  ERROR: 'error'
} as const;

export type BotStatusType = typeof BotStatus[keyof typeof BotStatus];

export interface BotState {
  status: BotStatusType;
  message: string;
  timestamp: number;
}

