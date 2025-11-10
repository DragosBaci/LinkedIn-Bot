import puppeteer, { Browser, Page } from 'puppeteer';
import { BotStatus, type BotState, type BotStatusType } from '@/Common/Types/BotStatus';

export class LinkedInBot {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private state: BotState;

  constructor() {
    this.state = {
      status: BotStatus.IDLE,
      message: 'Bot is idle',
      timestamp: Date.now()
    };
  }

  async start(): Promise<void> {
    if (this.state.status === BotStatus.RUNNING) {
      throw new Error('Bot is already running');
    }

    this.updateState(BotStatus.STARTING, 'Starting browser...');

    try {
      // Launch browser with visible window
      this.browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
          '--start-maximized',
          '--disable-blink-features=AutomationControlled'
        ]
      });

      this.page = await this.browser.newPage();

      // Set user agent to avoid detection
      await this.page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      this.updateState(BotStatus.RUNNING, 'Navigating to LinkedIn...');

      // Navigate to LinkedIn
      await this.page.goto('https://www.linkedin.com', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      this.updateState(BotStatus.RUNNING, 'LinkedIn opened successfully');

      console.log('✅ LinkedIn opened successfully');
    } catch (error) {
      this.updateState(
        BotStatus.ERROR,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      await this.cleanup();
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.state.status === BotStatus.IDLE) {
      throw new Error('Bot is not running');
    }

    this.updateState(BotStatus.STOPPING, 'Stopping bot...');
    await this.cleanup();
    this.updateState(BotStatus.IDLE, 'Bot stopped');
  }

  private async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    } catch (error) {
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

