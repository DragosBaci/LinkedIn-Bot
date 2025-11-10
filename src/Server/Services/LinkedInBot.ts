import puppeteer, { Browser, Page } from 'puppeteer';
import { BotStatus, type BotState, type BotStatusType } from '@/Common/Types/BotStatus';
import { LoggerService } from '@/Server/Services/LoggerService';

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
      this.logger.log('warning', 'Bot is already running');
      throw new Error('Bot is already running');
    }

    this.updateState(BotStatus.STARTING, 'Starting browser...');

    try {
      this.logger.log('info', 'Launching Puppeteer browser');
      
      // Launch browser with visible window
      this.browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
          '--start-maximized',
          '--disable-blink-features=AutomationControlled'
        ]
      });

      this.logger.log('success', 'Browser launched successfully');
      this.page = await this.browser.newPage();

      // Set user agent to avoid detection
      await this.page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      this.logger.log('info', 'User agent set');
      this.updateState(BotStatus.RUNNING, 'Navigating to LinkedIn...');

      // Navigate to LinkedIn
      this.logger.log('info', 'Navigating to https://www.linkedin.com');
      await this.page.goto('https://www.linkedin.com', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      this.updateState(BotStatus.RUNNING, 'LinkedIn opened successfully');
      this.logger.log('success', 'LinkedIn page loaded successfully');

      console.log('✅ LinkedIn opened successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.log('error', `Failed to start bot: ${errorMessage}`);
      this.updateState(BotStatus.ERROR, `Error: ${errorMessage}`);
      await this.cleanup();
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.state.status === BotStatus.IDLE) {
      this.logger.log('warning', 'Bot is not running');
      throw new Error('Bot is not running');
    }

    this.logger.log('info', 'Stopping bot');
    this.updateState(BotStatus.STOPPING, 'Stopping bot...');
    await this.cleanup();
    this.updateState(BotStatus.IDLE, 'Bot stopped');
    this.logger.log('success', 'Bot stopped successfully');
  }

  private async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
        this.logger.log('info', 'Browser page closed');
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.logger.log('info', 'Browser closed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.log('error', `Error during cleanup: ${errorMessage}`);
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
