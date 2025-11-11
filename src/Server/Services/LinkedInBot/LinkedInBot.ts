import puppeteer, { Browser, Page } from 'puppeteer';
import { BotStatus, type BotState, type BotStatusType } from '@/Common/Types/BotStatus';
import { LoggerService } from '@/Server/Services/LoggerService';
import { BrowserConfig } from '@/Server/Services/LinkedInBot/Config/BrowserConfig';
import { LinkedInConfig } from '@/Server/Services/LinkedInBot/Config/LinkedInConfig';
import { BotMessages } from '@/Server/Services/LinkedInBot/Enums/BotMessages';
import { LogEventEmitter, LogObserver, LogEventType } from '@/Server/Services/LinkedInBot/Events/LogObserver';

export class LinkedInBot {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private state: BotState;
  private logger: LoggerService;
  private logEmitter: LogEventEmitter;

  constructor() {
    this.logger = LoggerService.getInstance();
    const logObserver = new LogObserver(this.logger);
    this.logEmitter = new LogEventEmitter(logObserver);
    
    this.state = {
      status: BotStatus.IDLE,
      message: BotMessages.IDLE.message,
      timestamp: Date.now()
    };
  }

  async start(): Promise<void> {
    if (this.state.status === BotStatus.RUNNING) {
      this.logEmitter.emit(LogEventType.BOT_ALREADY_RUNNING);
      throw new Error(BotMessages.ALREADY_RUNNING.message);
    }

    this.logger.startSession();
    this.updateState(BotStatus.STARTING, BotMessages.STARTING.message);
    this.logEmitter.emit(LogEventType.BOT_STARTING);

    try {
      // Launch browser and setup
      this.browser = await puppeteer.launch(BrowserConfig.LAUNCH_OPTIONS);
      this.page = await this.browser.newPage();
      await this.page.setUserAgent(BrowserConfig.USER_AGENT);

      // Navigate to LinkedIn
      this.updateState(BotStatus.RUNNING, BotMessages.NAVIGATING_LINKEDIN.message);
      this.logEmitter.emit(LogEventType.NAVIGATING_LINKEDIN);
      await this.navigateTo(LinkedInConfig.BASE_URL, BotMessages.NAVIGATING_LINKEDIN.userMessage);

      this.updateState(BotStatus.RUNNING, BotMessages.LINKEDIN_LOADED.message);
      this.logEmitter.emit(LogEventType.LINKEDIN_LOADED);

      // Click Gmail login button
      await this.clickGmailLogin();

    } catch (error) {
      await this.cleanup();
      const errorMessage = error instanceof Error ? error.message : BotMessages.UNKNOWN_ERROR.message;
      this.updateState(BotStatus.ERROR, `Error: ${errorMessage}`);
      this.logEmitter.emit(LogEventType.START_ERROR, { errorMessage });
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.state.status === BotStatus.IDLE) {
      this.logEmitter.emit(LogEventType.BOT_NOT_RUNNING);
      throw new Error(BotMessages.NOT_RUNNING.message);
    }

    this.logEmitter.emit(LogEventType.BOT_STOPPING);
    this.updateState(BotStatus.STOPPING, BotMessages.STOPPING.message);
    await this.cleanup();
    this.updateState(BotStatus.IDLE, BotMessages.STOPPED.message);
    this.logEmitter.emit(LogEventType.BOT_STOPPED);

    this.logger.endSession();
  }

  getState(): BotState {
    return { ...this.state };
  }

  private updateState(status: BotStatusType, message: string): void {
    this.state = {
      status,
      message,
      timestamp: Date.now()
    };
  }

  private async navigateTo(url: string, userMessage?: string): Promise<void> {
    if (!this.page) throw new Error('No page available');

    await this.page.goto(url, {
      waitUntil: BrowserConfig.WAIT_UNTIL,
      timeout: BrowserConfig.NAVIGATION_TIMEOUT
    });
  }

  private async clickGmailLogin(): Promise<void> {
    if (!this.page) throw new Error('No page available');

    this.logEmitter.emit(LogEventType.LOOKING_FOR_GMAIL_BUTTON);

    try {
      // Look for Google Sign-In iframe
      await new Promise(resolve => setTimeout(resolve, 2000));
      const frames = this.page.frames();

      let googleFrame = null;
      for (const frame of frames) {
        if (frame.url().includes('accounts.google.com/gsi')) {
          googleFrame = frame;
          break;
        }
      }

      if (googleFrame) {
        await googleFrame.waitForSelector('div[role="button"]', { timeout: 5000 });
        await googleFrame.click('div[role="button"]');
        this.logEmitter.emit(LogEventType.GMAIL_BUTTON_CLICKED);
      } else {
        // Fallback: try regular selectors
        const selectors = [
          'button[aria-label*="Google"]',
          'button[data-tracking-control-name*="google"]',
          'a[href*="google"]',
          'button:has-text("Continue with Google")',
          'button:has-text("Sign in with Google")',
          '.sign-in-with-google-button',
          '[data-test-id*="google"]'
        ];

        let buttonFound = false;
        for (const selector of selectors) {
          try {
            await this.page.waitForSelector(selector, { timeout: 3000 });
            await this.page.click(selector);
            buttonFound = true;
            break;
          } catch {
            continue;
          }
        }

        if (!buttonFound) {
          this.logEmitter.emit(LogEventType.GMAIL_BUTTON_NOT_FOUND);
          throw new Error('Gmail login button not found');
        }

        this.logEmitter.emit(LogEventType.GMAIL_BUTTON_CLICKED);
      }

      // Wait for navigation
      try {
        await this.page.waitForNavigation({ 
          waitUntil: 'networkidle2',
          timeout: 10000 
        });
      } catch {
        // Popup opened, continue
      }

      this.logEmitter.emit(LogEventType.WAITING_FOR_USER_ACCOUNT_SELECTION);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : BotMessages.UNKNOWN_ERROR.message;
      this.logEmitter.emit(LogEventType.GMAIL_CLICK_FAILED, { errorMessage });
      throw error;
    }
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
      // Silently handle cleanup errors
    }
  }
}
