import puppeteer, { Browser, Page } from 'puppeteer';
import { LoggerService } from '@/Server/Services/LoggerService';
import { LogLevel } from '@/Common/Types/LogEntry';
import { BotMessages } from '@/Server/Services/LinkedInBot/Enums/BotMessages';
import { BrowserConfig } from '@/Server/Services/LinkedInBot/Config/BrowserConfig';

export class BrowserManager {
  private logger: LoggerService;

  constructor(logger: LoggerService) {
    this.logger = logger;
  }

  async launchBrowser(): Promise<Browser> {
    this.logger.log({
      level: LogLevel.INFO,
      ...BotMessages.LAUNCHING_BROWSER,
      isAdvanced: true
    });

    const browser = await puppeteer.launch(BrowserConfig.LAUNCH_OPTIONS);

    this.logger.log({
      level: LogLevel.SUCCESS,
      ...BotMessages.BROWSER_LAUNCHED,
      isAdvanced: true
    });

    return browser;
  }

  async createPage(browser: Browser): Promise<Page> {
    const page = await browser.newPage();
    
    await page.setUserAgent(BrowserConfig.USER_AGENT);
    
    this.logger.log({
      level: LogLevel.INFO,
      ...BotMessages.USER_AGENT_SET,
      isAdvanced: true
    });

    return page;
  }

  async closePage(page: Page): Promise<void> {
    await page.close();
    
    this.logger.log({
      level: LogLevel.INFO,
      ...BotMessages.PAGE_CLOSED,
      isAdvanced: true
    });
  }

  async closeBrowser(browser: Browser): Promise<void> {
    await browser.close();
    
    this.logger.log({
      level: LogLevel.INFO,
      ...BotMessages.BROWSER_CLOSED,
      isAdvanced: true
    });
  }
}

