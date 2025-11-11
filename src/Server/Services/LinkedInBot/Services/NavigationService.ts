import type { Page } from 'puppeteer';
import { LoggerService } from '@/Server/Services/LoggerService';
import { LogLevel } from '@/Common/Types/LogEntry';
import { BotMessages } from '@/Server/Services/LinkedInBot/Enums/BotMessages';
import { BrowserConfig } from '@/Server/Services/LinkedInBot/Config/BrowserConfig';

export interface NavigationOptions {
  url: string;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
  timeout?: number;
  userMessage?: string;
}

export class NavigationService {
  private logger: LoggerService;

  constructor(logger: LoggerService) {
    this.logger = logger;
  }

  async navigateTo(page: Page, options: NavigationOptions): Promise<void> {
    const {
      url,
      waitUntil = BrowserConfig.WAIT_UNTIL,
      timeout = BrowserConfig.NAVIGATION_TIMEOUT,
      userMessage
    } = options;

    this.logger.log({
      level: LogLevel.INFO,
      message: `Navigating to ${url}`,
      userMessage,
      isAdvanced: true
    });

    await page.goto(url, {
      waitUntil,
      timeout
    });

    this.logger.log({
      level: LogLevel.SUCCESS,
      message: `Successfully navigated to ${url}`,
      userMessage: userMessage ? `${userMessage} - Complete` : undefined,
      isAdvanced: true
    });
  }

  async waitForSelector(page: Page, selector: string, timeout?: number): Promise<void> {
    await page.waitForSelector(selector, { timeout });
    
    this.logger.log({
      level: LogLevel.INFO,
      message: `Element found: ${selector}`,
      isAdvanced: true
    });
  }

  async getCurrentUrl(page: Page): Promise<string> {
    return page.url();
  }
}

