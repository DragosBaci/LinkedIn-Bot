import puppeteer, { Browser, Page } from 'puppeteer';

export interface BotState {
  status: 'idle' | 'launching' | 'navigating' | 'success' | 'error' | 'closing';
  message: string;
  timestamp: string;
  pageTitle?: string;
  url?: string;
}

type StateCallback = (state: BotState) => void;

let isRunning = false;

export async function runLinkedInBot(onStateChange: StateCallback): Promise<void> {
  if (isRunning) {
    onStateChange({
      status: 'error',
      message: 'Bot is already running',
      timestamp: new Date().toISOString()
    });
    return;
  }

  isRunning = true;
  let browser: Browser | null = null;

  try {
    onStateChange({
      status: 'launching',
      message: 'Launching browser...',
      timestamp: new Date().toISOString()
    });

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

    onStateChange({
      status: 'launching',
      message: 'Browser launched successfully!',
      timestamp: new Date().toISOString()
    });

    // Create a new page
    const page: Page = await browser.newPage();

    // Set user agent to avoid detection
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    );

    onStateChange({
      status: 'navigating',
      message: 'Navigating to LinkedIn...',
      timestamp: new Date().toISOString()
    });

    // Navigate to LinkedIn
    await page.goto('https://www.linkedin.com', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const pageTitle = await page.title();
    const url = page.url();

    onStateChange({
      status: 'success',
      message: 'Successfully opened LinkedIn!',
      pageTitle,
      url,
      timestamp: new Date().toISOString()
    });

    // Keep the browser open for 60 seconds
    await new Promise(resolve => setTimeout(resolve, 60000));

    onStateChange({
      status: 'closing',
      message: 'Closing browser...',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    onStateChange({
      status: 'error',
      message: `Error: ${errorMessage}`,
      timestamp: new Date().toISOString()
    });
  } finally {
    if (browser) {
      await browser.close();
      onStateChange({
        status: 'idle',
        message: 'Browser closed',
        timestamp: new Date().toISOString()
      });
    }
    isRunning = false;
  }
}

