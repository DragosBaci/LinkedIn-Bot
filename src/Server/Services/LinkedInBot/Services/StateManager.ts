import type { BotState } from '@/Common/Types/BotStatus';
import { BotStatus, type BotStatusType } from '@/Common/Types/BotStatus';
import { LoggerService } from '@/Server/Services/LoggerService';
import { LogLevel } from '@/Common/Types/LogEntry';
import { BotMessages } from '@/Server/Services/LinkedInBot/Enums/BotMessages';

export class StateManager {
  private state: BotState;
  private logger: LoggerService;

  constructor(logger: LoggerService) {
    this.logger = logger;
    this.state = {
      status: BotStatus.IDLE,
      message: BotMessages.IDLE.message,
      timestamp: Date.now()
    };
  }

  updateState(status: BotStatusType, message: string): void {
    this.state = {
      status,
      message,
      timestamp: Date.now()
    };

    this.logger.log({
      level: LogLevel.INFO,
      ...BotMessages.BOT_STATUS(status, message),
      isAdvanced: true
    });
  }

  getState(): BotState {
    return { ...this.state };
  }

  isRunning(): boolean {
    return this.state.status === BotStatus.RUNNING;
  }

  isIdle(): boolean {
    return this.state.status === BotStatus.IDLE;
  }

  getStatus(): BotStatusType {
    return this.state.status;
  }
}

