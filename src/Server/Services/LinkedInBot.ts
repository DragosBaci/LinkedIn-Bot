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
      this.logger.log(LogLevel.WARNING, 'Bot is already running', 'Bot is already active');
      throw new Error('Bot is already running');
    }

    // Start logging session - this creates the log file
    this.logger.startSession();

    this.updateState(BotStatus.STARTING, 'Starting browser...');
    this.logger.log(LogLevel.INFO, 'Starting bot...', 'Starting bot...');

    try {
      this.logger.log(LogLevel.INFO, 'Launching Puppeteer browser', undefined, true);
      
      // Launch browser with visible window
      this.browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
          '--start-maximized',
          '--disable-blink-features=AutomationControlled'
        ]
      });

      this.logger.log(LogLevel.SUCCESS, 'Browser launched successfully', 'Browser opened', true);
      this.page = await this.browser.newPage();

      // Set user agent to avoid detection
      await this.page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      this.logger.log(LogLevel.INFO, 'User agent set', undefined, true);
      this.updateState(BotStatus.RUNNING, 'Navigating to LinkedIn...');
      this.logger.log(LogLevel.INFO, 'Navigating to LinkedIn...', 'Opening LinkedIn...');

      // Navigate to LinkedIn
      this.logger.log(LogLevel.INFO, 'Navigating to https://www.linkedin.com', undefined, true);
      await this.page.goto('https://www.linkedin.com', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      this.updateState(BotStatus.RUNNING, 'LinkedIn opened successfully');
      this.logger.log(LogLevel.SUCCESS, 'LinkedIn page loaded successfully', 'LinkedIn opened successfully');

      console.log('LinkedIn opened successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.log(LogLevel.ERROR, `Failed to start bot: ${errorMessage}`, `Failed to start: ${errorMessage}`);
      this.updateState(BotStatus.ERROR, `Error: ${errorMessage}`);
      await this.cleanup();
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.state.status === BotStatus.IDLE) {
      this.logger.log(LogLevel.WARNING, 'Bot is not running', 'Bot is not active');
      throw new Error('Bot is not running');
    }

    this.logger.log(LogLevel.INFO, 'Stopping bot', 'Stopping bot...');
    this.updateState(BotStatus.STOPPING, 'Stopping bot...');
    await this.cleanup();
    this.updateState(BotStatus.IDLE, 'Bot stopped');
    this.logger.log(LogLevel.SUCCESS, 'Bot stopped successfully', 'Bot stopped');
    
    // End logging session
    this.logger.endSession();
  }

  private async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
        this.logger.log(LogLevel.INFO, 'Browser page closed', undefined, true);
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.logger.log(LogLevel.INFO, 'Browser closed', 'Browser closed', true);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.log(LogLevel.ERROR, `Error during cleanup: ${errorMessage}`, undefined, true);
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
