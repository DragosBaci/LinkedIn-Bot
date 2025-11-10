import puppeteer, { Browser, Page } from 'puppeteer';
import { BotStatus } from '../common/types/bot-status';
import { BotMessages } from '../common/constants/bot-messages';
import { createBotState } from '../common/utils/bot-helpers';

export interface BotState {
  status: BotStatus;
  message: string;
  timestamp: string;
  pageTitle?: string;
  url?: string;
}

type StateCallback = (state: BotState) => void;

let isRunning = false;

export async function runLinkedInBot(onStateChange: StateCallback): Promise<void> {
  if (isRunning) {
    onStateChange(createBotState(BotStatus.ERROR, BotMessages.ALREADY_RUNNING));
    return;
  }

  isRunning = true;
  let browser: Browser | null = null;

  try {
    onStateChange(createBotState(BotStatus.LAUNCHING, BotMessages.LAUNCHING_BROWSER));

    // Launch browser with visible window
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: [
        '--start-maximized',
        '--start-fullscreen',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    onStateChange(createBotState(BotStatus.LAUNCHING, BotMessages.BROWSER_LAUNCHED));

    // Create a new page
    const page: Page = await browser.newPage();

    onStateChange(createBotState(BotStatus.NAVIGATING, BotMessages.NAVIGATING));

    // Navigate to LinkedIn
    await page.goto('https://www.linkedin.com', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const pageTitle = await page.title();
    const url = page.url();

    onStateChange(createBotState(BotStatus.SUCCESS, BotMessages.SUCCESS, { pageTitle, url }));

    // Keep the browser open for 60 seconds
    await new Promise(resolve => setTimeout(resolve, 60000));

    onStateChange(createBotState(BotStatus.CLOSING, BotMessages.CLOSING));

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    onStateChange(createBotState(BotStatus.ERROR, BotMessages.ERROR(errorMessage)));
  } finally {
    if (browser) {
      await browser.close();
      onStateChange(createBotState(BotStatus.IDLE, BotMessages.BROWSER_CLOSED));
    }
    isRunning = false;
  }
}

