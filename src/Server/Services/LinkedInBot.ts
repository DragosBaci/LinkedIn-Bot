import puppeteer, { Browser, Page } from 'puppeteer';
import { BotStatus, type BotState, type BotStatusType } from '@/Common/Types/BotStatus';
import { LoggerService } from '@/Server/Services/LoggerService';
import { LogLevel } from '@/Common/Types/LogEntry';

export class LinkedInBot {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private state: BotState;
  private logger: LoggerService;

  constructor() {
    this.state = {
      status: BotStatus.IDLE,
      message: 'Bot is idle',
      timestamp: Date.now()
    };
    this.logger = LoggerService.getInstance();
  }

  async start(): Promise<void> {
    if (this.state.status === BotStatus.RUNNING) {
      this.logger.log({
        level: LogLevel.WARNING,
        message: 'Bot is already running',
        userMessage: 'Bot is already active'
      });
      throw new Error('Bot is already running');
    }

    // Start logging session - this creates the log file
    this.logger.startSession();

    this.updateState(BotStatus.STARTING, 'Starting browser...');
    this.logger.log({
      level: LogLevel.INFO,
      message: 'Starting bot...',
      userMessage: 'Starting bot...'
    });

    try {
      this.logger.log({
        level: LogLevel.INFO,
        message: 'Launching Puppeteer browser',
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
        message: 'Browser launched successfully',
        userMessage: 'Browser opened',
        isAdvanced: true
      });
      this.page = await this.browser.newPage();

      // Set user agent to avoid detection
      await this.page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      this.logger.log({
        level: LogLevel.INFO,
        message: 'User agent set',
        isAdvanced: true
      });
      this.updateState(BotStatus.RUNNING, 'Navigating to LinkedIn...');
      this.logger.log({
        level: LogLevel.INFO,
        message: 'Navigating to LinkedIn...',
        userMessage: 'Opening LinkedIn...'
      });

      // Navigate to LinkedIn
      this.logger.log({
        level: LogLevel.INFO,
        message: 'Navigating to https://www.linkedin.com',
        isAdvanced: true
      });
      await this.page.goto('https://www.linkedin.com', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      this.updateState(BotStatus.RUNNING, 'LinkedIn opened successfully');
      this.logger.log({
        level: LogLevel.SUCCESS,
        message: 'LinkedIn page loaded successfully',
        userMessage: 'LinkedIn opened successfully'
      });

      console.log('LinkedIn opened successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.log({
        level: LogLevel.ERROR,
        message: `Failed to start bot: ${errorMessage}`,
        userMessage: `Failed to start: ${errorMessage}`
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
        message: 'Bot is not running',
        userMessage: 'Bot is not active'
      });
      throw new Error('Bot is not running');
    }

    this.logger.log({
      level: LogLevel.INFO,
      message: 'Stopping bot',
      userMessage: 'Stopping bot...'
    });
    this.updateState(BotStatus.STOPPING, 'Stopping bot...');
    await this.cleanup();
    this.updateState(BotStatus.IDLE, 'Bot stopped');
    this.logger.log({
      level: LogLevel.SUCCESS,
      message: 'Bot stopped successfully',
      userMessage: 'Bot stopped'
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
          message: 'Browser page closed',
          isAdvanced: true
        });
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.logger.log({
          level: LogLevel.INFO,
          message: 'Browser closed',
          userMessage: 'Browser closed',
          isAdvanced: true
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.log({
        level: LogLevel.ERROR,
        message: `Error during cleanup: ${errorMessage}`,
        isAdvanced: true
      });
      console.error('Error during cleanup:', error);
    }
  }

  private updateState(status: BotStatusType, message: string): void {
    this.state = {
      status,
      message,
      timestamp: Date.now()
    };
    console.log(`[Bot Status] ${status}: ${message}`);
  }

  getState(): BotState {
    return { ...this.state };
  }
}
