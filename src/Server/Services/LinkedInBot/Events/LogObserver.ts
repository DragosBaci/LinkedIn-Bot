import { LogLevel } from '@/Common/Types/LogEntry';
import { LoggerService } from '@/Server/Services/LoggerService';
import { BotMessages } from '@/Server/Services/LinkedInBot/Enums/BotMessages';

/**
 * Event types for logging - simplified to only essential user-facing logs
 */
export enum LogEventType {
  // Bot lifecycle
  BOT_STARTING = 'BOT_STARTING',
  BOT_ALREADY_RUNNING = 'BOT_ALREADY_RUNNING',
  BOT_STOPPING = 'BOT_STOPPING',
  BOT_STOPPED = 'BOT_STOPPED',
  BOT_NOT_RUNNING = 'BOT_NOT_RUNNING',
  
  // Navigation
  NAVIGATING_LINKEDIN = 'NAVIGATING_LINKEDIN',
  LINKEDIN_LOADED = 'LINKEDIN_LOADED',
  
  // Gmail login
  LOOKING_FOR_GMAIL_BUTTON = 'LOOKING_FOR_GMAIL_BUTTON',
  GMAIL_BUTTON_CLICKED = 'GMAIL_BUTTON_CLICKED',
  GMAIL_BUTTON_NOT_FOUND = 'GMAIL_BUTTON_NOT_FOUND',
  WAITING_FOR_USER_ACCOUNT_SELECTION = 'WAITING_FOR_USER_ACCOUNT_SELECTION',
  WAITING_FOR_SIGN_IN_COMPLETE = 'WAITING_FOR_SIGN_IN_COMPLETE',
  SIGN_IN_COMPLETE = 'SIGN_IN_COMPLETE',
  
  // Errors
  START_ERROR = 'START_ERROR',
  GMAIL_CLICK_FAILED = 'GMAIL_CLICK_FAILED'
}

/**
 * Simple log event interface
 */
export interface LogEvent {
  type: LogEventType;
  data?: Record<string, unknown>;
}

/**
 * LogObserver - Handles all logging logic based on event types
 */
export class LogObserver {
  private logger: LoggerService;

  constructor(logger: LoggerService) {
    this.logger = logger;
  }

  /**
   * Handle a log event - automatically determines what to log based on event type
   */
  handleEvent(event: LogEvent): void {
    const config = this.getLogConfig(event);
    if (config) {
      this.logger.log({
        level: config.level,
        message: config.message,
        userMessage: config.userMessage,
        isAdvanced: config.isAdvanced
      });
    }
  }

  /**
   * Get log configuration based on event type
   */
  private getLogConfig(event: LogEvent): {
    level: LogLevel;
    message: string;
    userMessage?: string;
    isAdvanced?: boolean;
  } | null {
    switch (event.type) {
      // Bot lifecycle
      case LogEventType.BOT_STARTING:
        return { level: LogLevel.INFO, ...BotMessages.STARTING };
      case LogEventType.BOT_ALREADY_RUNNING:
        return { level: LogLevel.WARNING, ...BotMessages.ALREADY_RUNNING };
      case LogEventType.BOT_STOPPING:
        return { level: LogLevel.INFO, ...BotMessages.STOPPING };
      case LogEventType.BOT_STOPPED:
        return { level: LogLevel.SUCCESS, ...BotMessages.STOPPED };
      case LogEventType.BOT_NOT_RUNNING:
        return { level: LogLevel.WARNING, ...BotMessages.NOT_RUNNING };

      // Navigation
      case LogEventType.NAVIGATING_LINKEDIN:
        return { level: LogLevel.INFO, ...BotMessages.NAVIGATING_LINKEDIN };
      case LogEventType.LINKEDIN_LOADED:
        return { level: LogLevel.SUCCESS, ...BotMessages.LINKEDIN_LOADED };

      // Gmail login
      case LogEventType.LOOKING_FOR_GMAIL_BUTTON:
        return { level: LogLevel.INFO, ...BotMessages.LOOKING_FOR_GMAIL_BUTTON };
      case LogEventType.GMAIL_BUTTON_CLICKED:
        return { level: LogLevel.SUCCESS, ...BotMessages.GMAIL_BUTTON_CLICKED };
      case LogEventType.GMAIL_BUTTON_NOT_FOUND:
        return { level: LogLevel.WARNING, ...BotMessages.GMAIL_BUTTON_NOT_FOUND };
      case LogEventType.WAITING_FOR_USER_ACCOUNT_SELECTION:
        return { level: LogLevel.INFO, ...BotMessages.WAITING_FOR_USER_ACCOUNT_SELECTION };
      case LogEventType.WAITING_FOR_SIGN_IN_COMPLETE:
        return { level: LogLevel.INFO, ...BotMessages.WAITING_FOR_SIGN_IN_COMPLETE };
      case LogEventType.SIGN_IN_COMPLETE:
        return { level: LogLevel.SUCCESS, ...BotMessages.SIGN_IN_COMPLETE };

      // Errors
      case LogEventType.START_ERROR:
        return {
          level: LogLevel.ERROR,
          ...BotMessages.START_ERROR(event.data?.errorMessage as string)
        };
      case LogEventType.GMAIL_CLICK_FAILED:
        return {
          level: LogLevel.ERROR,
          ...BotMessages.GMAIL_CLICK_FAILED(event.data?.errorMessage as string)
        };

      default:
        return null;
    }
  }
}

/**
 * Simple event emitter
 */
export class LogEventEmitter {
  constructor(private observer: LogObserver) {}

  emit(type: LogEventType, data?: Record<string, unknown>): void {
    this.observer.handleEvent({ type, data });
  }
}
