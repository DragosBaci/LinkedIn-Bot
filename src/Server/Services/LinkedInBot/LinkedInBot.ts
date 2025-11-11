import puppeteer, { Browser, Page } from 'puppeteer';
import { BotStatus, type BotState, type BotStatusType } from '@/Common/Types/BotStatus';
import { LoggerService } from '@/Server/Services/LoggerService';
import { LogLevel } from '@/Common/Types/LogEntry';
import { BotMessages } from '@/Server/Services/LinkedInBot/Enums/BotMessages';

export class LinkedInBot {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private state: BotState;
  private logger: LoggerService;

  constructor() {
    this.state = {
      status: BotStatus.IDLE,
      message: BotMessages.IDLE.message,
      timestamp: Date.now()
    };
    this.logger = LoggerService.getInstance();
  }

  async start(): Promise<void> {
    if (this.state.status === BotStatus.RUNNING) {
      this.logger.log({
        level: LogLevel.WARNING,
        ...BotMessages.ALREADY_RUNNING
      });
      throw new Error(BotMessages.ALREADY_RUNNING.message);
    }

    // Start logging session - this creates the log file
    this.logger.startSession();

    this.updateState(BotStatus.STARTING, BotMessages.STARTING.message);
    this.logger.log({
      level: LogLevel.INFO,
      ...BotMessages.STARTING
    });

    try {
      this.logger.log({
        level: LogLevel.INFO,
        ...BotMessages.LAUNCHING_BROWSER,
        isAdvanced: true
      });
      
      // Launch browser with visible window
      this.browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
          '--start-maximized',
          '--disable-blink-features=AutomationControlled'
        ]
      });

      this.logger.log({
        level: LogLevel.SUCCESS,
        ...BotMessages.BROWSER_LAUNCHED,
        isAdvanced: true
      });
      this.page = await this.browser.newPage();

      // Set user agent to avoid detection
      await this.page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      this.logger.log({
        level: LogLevel.INFO,
        ...BotMessages.USER_AGENT_SET,
        isAdvanced: true
      });
      this.updateState(BotStatus.RUNNING, BotMessages.NAVIGATING_LINKEDIN.message);
      this.logger.log({
        level: LogLevel.INFO,
        ...BotMessages.NAVIGATING_LINKEDIN
      });

      // Navigate to LinkedIn
      this.logger.log({
        level: LogLevel.INFO,
        ...BotMessages.NAVIGATING_URL,
        isAdvanced: true
      });
      await this.page.goto('https://www.linkedin.com', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      this.updateState(BotStatus.RUNNING, BotMessages.LINKEDIN_LOADED.message);
      this.logger.log({
        level: LogLevel.SUCCESS,
        ...BotMessages.LINKEDIN_LOADED
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : BotMessages.UNKNOWN_ERROR.message;
      this.logger.log({
        level: LogLevel.ERROR,
        ...BotMessages.START_ERROR(errorMessage)
      });
      this.updateState(BotStatus.ERROR, `Error: ${errorMessage}`);
      await this.cleanup();
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.state.status === BotStatus.IDLE) {
      this.logger.log({
        level: LogLevel.WARNING,
        ...BotMessages.NOT_RUNNING
      });
      throw new Error(BotMessages.NOT_RUNNING.message);
    }

    this.logger.log({
      level: LogLevel.INFO,
      ...BotMessages.STOPPING
    });
    this.updateState(BotStatus.STOPPING, BotMessages.STOPPING.message);
    await this.cleanup();
    this.updateState(BotStatus.IDLE, BotMessages.STOPPED.message);
    this.logger.log({
      level: LogLevel.SUCCESS,
      ...BotMessages.STOPPED
    });
    
    // End logging session
    this.logger.endSession();
  }

  private async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
        this.logger.log({
          level: LogLevel.INFO,
          ...BotMessages.PAGE_CLOSED,
          isAdvanced: true
        });
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.logger.log({
          level: LogLevel.INFO,
          ...BotMessages.BROWSER_CLOSED,
          isAdvanced: true
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : BotMessages.UNKNOWN_ERROR.message;
      this.logger.log({
        level: LogLevel.ERROR,
        ...BotMessages.CLEANUP_ERROR(errorMessage),
        isAdvanced: true
      });
    }
  }

  private updateState(status: BotStatusType, message: string): void {
    this.state = {
      status,
      message,
      timestamp: Date.now()
    };
    this.logger.log({
      level: LogLevel.INFO,
      ...BotMessages.BOT_STATUS(status, message)
    });
  }

  getState(): BotState {
    return { ...this.state };
  }
}

