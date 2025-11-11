import { LoggerService } from '@/Server/Services/LoggerService';
import { LogLevel } from '@/Common/Types/LogEntry';
import { BotMessages } from '@/Server/Services/LinkedInBot/Enums/BotMessages';

export class ErrorHandler {
  private logger: LoggerService;

  constructor(logger: LoggerService) {
    this.logger = logger;
  }

  extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return BotMessages.UNKNOWN_ERROR.message;
  }

  logError(error: unknown, context: string, isAdvanced: boolean = true): void {
    const errorMessage = this.extractErrorMessage(error);
    
    this.logger.log({
      level: LogLevel.ERROR,
      ...BotMessages.ERROR_WITH_CONTEXT(context, errorMessage),
      isAdvanced
    });
  }

  handleStartError(error: unknown): never {
    const errorMessage = this.extractErrorMessage(error);
    
    this.logger.log({
      level: LogLevel.ERROR,
      ...BotMessages.START_ERROR(errorMessage)
    });

    throw error;
  }

  handleCleanupError(error: unknown): void {
    const errorMessage = this.extractErrorMessage(error);
    
    this.logger.log({
      level: LogLevel.ERROR,
      ...BotMessages.CLEANUP_ERROR(errorMessage),
      isAdvanced: true
    });
  }
}

