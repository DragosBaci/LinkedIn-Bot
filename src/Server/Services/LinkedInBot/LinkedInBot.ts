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

      // Click Gmail login button and wait for sign-in
      await this.clickGmailLogin();
      
      // Wait for Google sign-in to complete
      await this.waitForSignInComplete();

      // Start scrolling the feed
      await this.scrollFeed();

    } catch (error) {
      // Don't close browser on error - keep it open for debugging
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
    
    // Only close browser when explicitly stopped
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

  private async waitForSignInComplete(): Promise<void> {
    if (!this.page || !this.browser) throw new Error('No page or browser available');

    this.logEmitter.emit(LogEventType.WAITING_FOR_SIGN_IN_COMPLETE);
    this.updateState(BotStatus.RUNNING, BotMessages.WAITING_FOR_SIGN_IN_COMPLETE.message);

    // Check for existing popup windows first
    const pages = await this.browser.pages();
    let popup: Page | null = null;
    
    for (const page of pages) {
      const url = page.url();
      if (url.includes('accounts.google.com')) {
        popup = page;
        break;
      }
    }

    // If no popup found, wait for one to appear
    if (!popup) {
      const popupPromise = new Promise<Page | null>((resolve) => {
        const timeout = setTimeout(() => resolve(null), 15000); // Wait 15 seconds for popup
        
        const listener = (target: any) => {
          if (target.type() === 'page') {
            target.page().then((page: Page) => {
              const url = page.url();
              if (url.includes('accounts.google.com')) {
                clearTimeout(timeout);
                this.browser?.off('targetcreated', listener);
                resolve(page);
              }
            }).catch(() => {
              // Continue waiting
            });
          }
        };
        
        this.browser?.on('targetcreated', listener);
      });

      popup = await popupPromise;
    }
    
    if (popup) {
      // Wait for popup to close (user completes sign-in)
      while (popup && !popup.isClosed()) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Wait a bit for redirect to complete
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Now check for logged-in indicators on the main page
    const maxWaitTime = 2 * 60 * 1000; // 2 minutes max wait after popup closes
    const checkInterval = 2000; // Check every 2 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      try {
        // Wait for page to potentially navigate
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const currentUrl = this.page.url();
        
        // Check if we're on LinkedIn (not on login page)
        if (currentUrl.includes('linkedin.com') && !currentUrl.includes('/login')) {
          // Check for logged-in indicators
          const loggedInIndicators = [
            'nav__button-secondary', // Sign out button
            'global-nav__me', // Profile menu
            'feed-container', // Feed container
            '[data-test-id="nav__profile"]', // Profile nav item
            'nav__button--me', // Profile button
            'artdeco-button--primary', // Primary buttons that appear when logged in
            'main', // Main content area
            '[data-test-id="feed-container"]' // Feed container
          ];

          for (const selector of loggedInIndicators) {
            try {
              await this.page.waitForSelector(selector, { timeout: 2000 });
              // Found a logged-in indicator
              this.logEmitter.emit(LogEventType.SIGN_IN_COMPLETE);
              this.updateState(BotStatus.RUNNING, BotMessages.SIGN_IN_COMPLETE.message);
              return;
            } catch {
              continue;
            }
          }

          // Also check if we can see the feed or profile elements
          const hasFeed = await this.page.evaluate(() => {
            return document.querySelector('main') !== null || 
                   document.querySelector('[data-test-id="feed-container"]') !== null ||
                   document.querySelector('.feed-container') !== null ||
                   document.querySelector('nav') !== null;
          });

          if (hasFeed) {
            this.logEmitter.emit(LogEventType.SIGN_IN_COMPLETE);
            this.updateState(BotStatus.RUNNING, BotMessages.SIGN_IN_COMPLETE.message);
            return;
          }
        }

        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      } catch (error) {
        // Continue waiting even if there's an error checking
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }
    }

    // If we get here, check one more time with a simpler check
    try {
      const currentUrl = this.page.url();
      if (currentUrl.includes('linkedin.com') && !currentUrl.includes('/login')) {
        // Assume we're logged in if we're on LinkedIn and not on login page
        this.logEmitter.emit(LogEventType.SIGN_IN_COMPLETE);
        this.updateState(BotStatus.RUNNING, BotMessages.SIGN_IN_COMPLETE.message);
        return;
      }
    } catch {
      // Continue
    }

    // If we get here, we've waited but sign-in might still be in progress
    // Don't throw error - just log that we're still waiting
    this.logEmitter.emit(LogEventType.WAITING_FOR_SIGN_IN_COMPLETE);
  }

  /**
   * Scroll the LinkedIn feed with human-like behavior
   */
  private async scrollFeed(): Promise<void> {
    if (!this.page) throw new Error('No page available');

    // Wait for feed to be ready before starting to scroll
    await this.humanDelay(3000, 5000); // Wait 3-5 seconds before starting

    this.logEmitter.emit(LogEventType.SCROLLING_FEED);
    this.updateState(BotStatus.RUNNING, BotMessages.SCROLLING_FEED.message);

    // Navigate to feed if not already there
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/feed') && !currentUrl.includes('linkedin.com/feed')) {
      await this.navigateTo(LinkedInConfig.URLS.FEED);
      await this.humanDelay(3000, 5000); // Wait for feed to load after navigation
    }

    let previousScrollHeight = 0;
    let noChangeCount = 0;
    const maxNoChangeIterations = 3; // If scroll height doesn't change 3 times, we've reached bottom

    while (noChangeCount < maxNoChangeIterations) {
      // Get current scroll position and height
      const { scrollHeight, scrollTop, clientHeight } = await this.page.evaluate(() => {
        return {
          scrollHeight: document.documentElement.scrollHeight,
          scrollTop: document.documentElement.scrollTop || window.pageYOffset,
          clientHeight: window.innerHeight
        };
      });

      // Check if we've reached the bottom
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px threshold

      if (isAtBottom) {
        this.logEmitter.emit(LogEventType.REACHED_BOTTOM);
        
        // Try to find and click "See new posts" button
        const clicked = await this.clickSeeNewPosts();
        
        if (clicked) {
          // Wait a bit after clicking
          await this.humanDelay(2000, 3000);
          noChangeCount = 0; // Reset counter since new content might have loaded
          previousScrollHeight = 0; // Reset to check for new content
          continue;
        } else {
          // If button not found, we're truly at the bottom
          break;
        }
      }

      // Human-like scrolling: scroll in chunks with random pauses
      await this.humanScroll();

      // Wait with random delay between scrolls (1-3 seconds)
      await this.humanDelay(1000, 3000);

      // Check if scroll height changed
      const newScrollHeight = await this.page.evaluate(() => document.documentElement.scrollHeight);
      
      if (newScrollHeight === previousScrollHeight) {
        noChangeCount++;
      } else {
        noChangeCount = 0;
        previousScrollHeight = newScrollHeight;
      }
    }
  }

  /**
   * Human-like scrolling: smooth scroll in chunks
   */
  private async humanScroll(): Promise<void> {
    if (!this.page) return;

    // Scroll in multiple small chunks to simulate human behavior
    const scrollChunks = Math.floor(Math.random() * 3) + 2; // 2-4 chunks
    const chunkSize = Math.floor(Math.random() * 300) + 200; // 200-500px per chunk

    for (let i = 0; i < scrollChunks; i++) {
      await this.page.evaluate((scrollAmount) => {
        window.scrollBy({
          top: scrollAmount,
          behavior: 'smooth'
        });
      }, chunkSize);

      // Small random pause between chunks (100-300ms)
      await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 200) + 100));
    }
  }

  /**
   * Random delay to simulate human behavior
   */
  private async humanDelay(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Click the "See new posts" button if available
   */
  private async clickSeeNewPosts(): Promise<boolean> {
    if (!this.page) return false;

    this.logEmitter.emit(LogEventType.CLICKING_SEE_NEW_POSTS);

    // Common selectors for "See new posts" button
    const selectors = [
      'button[aria-label*="new posts" i]',
      'button[aria-label*="See new posts" i]',
      'button:has-text("See new posts")',
      'button:has-text("See new updates")',
      '[data-test-id="see-new-posts-button"]',
      '.feed-new-update-pill button',
      'button.feed-new-update-pill',
      'button[class*="new-update"]',
      'button[class*="see-new"]'
    ];

    for (const selector of selectors) {
      try {
        const button = await this.page.$(selector);
        if (button) {
          // Scroll button into view
          await button.scrollIntoView();
          await this.humanDelay(500, 1000);
          
          // Click with human-like delay
          await button.click();
          await this.humanDelay(500, 1000);
          
          this.logEmitter.emit(LogEventType.SEE_NEW_POSTS_CLICKED);
          return true;
        }
      } catch {
        continue;
      }
    }

    // Also try finding by text content using evaluate
    try {
      const buttonFound = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const found = buttons.find(btn => {
          const text = btn.textContent?.toLowerCase() || '';
          return text.includes('see new posts') || text.includes('see new updates');
        });
        
        if (found) {
          found.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return true;
        }
        return false;
      });

      if (buttonFound) {
        await this.humanDelay(500, 1000);
        
        // Click the button
        await this.page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const found = buttons.find(btn => {
            const text = btn.textContent?.toLowerCase() || '';
            return text.includes('see new posts') || text.includes('see new updates');
          });
          if (found && found instanceof HTMLElement) {
            found.click();
          }
        });
        
        await this.humanDelay(500, 1000);
        this.logEmitter.emit(LogEventType.SEE_NEW_POSTS_CLICKED);
        return true;
      }
    } catch {
      // Button not found, continue
    }

    return false;
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
