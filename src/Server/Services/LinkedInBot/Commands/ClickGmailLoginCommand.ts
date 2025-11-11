import { LogLevel } from '@/Common/Types/LogEntry';
import { LoggerService } from '@/Server/Services/LoggerService';
import { BotMessages } from '@/Server/Services/LinkedInBot/Enums/BotMessages';
import type { BotContext } from '@/Server/Services/LinkedInBot/Types/BotContext';
import type { ICommand } from '@/Server/Services/LinkedInBot/Commands/ICommand';

export class ClickGmailLoginCommand implements ICommand {
  private logger: LoggerService;

  constructor(logger: LoggerService) {
    this.logger = logger;
  }

  getName(): string {
    return 'ClickGmailLoginCommand';
  }

  canExecute(context: BotContext): boolean {
    return context.page !== null;
  }

  async execute(context: BotContext): Promise<void> {
    if (!context.page) {
      throw new Error('No page available');
    }

    this.logger.log({
      level: LogLevel.INFO,
      ...BotMessages.LOOKING_FOR_GMAIL_BUTTON
    });

    try {
      // First, try to find the iframe containing the Google Sign-In button
      this.logger.log({
        level: LogLevel.INFO,
        message: 'Looking for Google Sign-In iframe',
        userMessage: 'Searching for login options...',
        isAdvanced: true
      });

      // Wait for iframes to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get all iframes on the page
      const frames = context.page.frames();
      
      this.logger.log({
        level: LogLevel.INFO,
        message: `Found ${frames.length} frames on the page`,
        isAdvanced: true
      });

      let googleFrame = null;

      // Look for the Google Sign-In iframe
      for (const frame of frames) {
        const frameUrl = frame.url();
        this.logger.log({
          level: LogLevel.INFO,
          message: `Checking frame: ${frameUrl}`,
          isAdvanced: true
        });

        // Check if it's the Google Sign-In iframe
        if (frameUrl.includes('accounts.google.com/gsi')) {
          googleFrame = frame;
          this.logger.log({
            level: LogLevel.SUCCESS,
            message: 'Found Google Sign-In iframe',
            userMessage: 'Found Google login',
            isAdvanced: true
          });
          break;
        }
      }

      // If iframe button found, click it
      if (googleFrame) {
        this.logger.log({
          level: LogLevel.INFO,
          message: 'Looking for button inside iframe',
          isAdvanced: true
        });

        // Wait for button inside iframe
        await googleFrame.waitForSelector('div[role="button"]', { timeout: 5000 });
        
        // Click the button inside the iframe
        await googleFrame.click('div[role="button"]');

        this.logger.log({
          level: LogLevel.SUCCESS,
          ...BotMessages.GMAIL_BUTTON_CLICKED
        });
      } else {
        // Fallback: try to find regular button on the page (not in iframe)
        this.logger.log({
          level: LogLevel.INFO,
          message: 'Google iframe not found, trying regular selectors',
          userMessage: 'Trying alternative login method...',
          isAdvanced: true
        });

        const gmailButtonSelectors = [
          'button[aria-label*="Google"]',
          'button[data-tracking-control-name*="google"]',
          'a[href*="google"]',
          'button:has-text("Continue with Google")',
          'button:has-text("Sign in with Google")',
          '.sign-in-with-google-button',
          '[data-test-id*="google"]'
        ];

        let buttonFound = false;
        let usedSelector = '';

        for (const selector of gmailButtonSelectors) {
          try {
            await context.page.waitForSelector(selector, { timeout: 3000 });
            usedSelector = selector;
            buttonFound = true;
            break;
          } catch {
            continue;
          }
        }

        if (!buttonFound) {
          this.logger.log({
            level: LogLevel.WARNING,
            ...BotMessages.GMAIL_BUTTON_NOT_FOUND
          });
          throw new Error('Gmail login button not found');
        }

        this.logger.log({
          level: LogLevel.INFO,
          message: `Gmail button found with selector: ${usedSelector}`,
          userMessage: 'Gmail button found',
          isAdvanced: true
        });

        await context.page.click(usedSelector);

        this.logger.log({
          level: LogLevel.SUCCESS,
          ...BotMessages.GMAIL_BUTTON_CLICKED
        });
      }

      // Wait for navigation to Google login page
      try {
        await context.page.waitForNavigation({ 
          waitUntil: 'networkidle2',
          timeout: 10000 
        });

        this.logger.log({
          level: LogLevel.SUCCESS,
          ...BotMessages.GMAIL_LOGIN_PAGE_LOADED
        });

        // Log that we're waiting for user to select account
        this.logger.log({
          level: LogLevel.INFO,
          message: 'Waiting for user to manually select Google account',
          userMessage: 'Please select your Google account in the browser'
        });
      } catch {
        // Navigation might not complete if popup opens
        this.logger.log({
          level: LogLevel.INFO,
          message: 'Google login popup opened, waiting for user action',
          userMessage: 'Please select your Google account in the popup'
        });
      }

    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        message: `Failed to click Gmail button: ${error instanceof Error ? error.message : 'Unknown error'}`,
        userMessage: 'Failed to proceed with Gmail login'
      });
      throw error;
    }
  }
}

