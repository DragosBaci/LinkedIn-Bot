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
        ...BotMessages.LOOKING_FOR_IFRAME,
        isAdvanced: true
      });

      // Wait for iframes to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get all iframes on the page
      const frames = context.page.frames();
      
      this.logger.log({
        level: LogLevel.INFO,
        ...BotMessages.FOUND_FRAMES(frames.length),
        isAdvanced: true
      });

      let googleFrame = null;

      // Look for the Google Sign-In iframe
      for (const frame of frames) {
        const frameUrl = frame.url();
        this.logger.log({
          level: LogLevel.INFO,
          ...BotMessages.CHECKING_FRAME(frameUrl),
          isAdvanced: true
        });

        // Check if it's the Google Sign-In iframe
        if (frameUrl.includes('accounts.google.com/gsi')) {
          googleFrame = frame;
          this.logger.log({
            level: LogLevel.SUCCESS,
            ...BotMessages.FOUND_GOOGLE_IFRAME,
            isAdvanced: true
          });
          break;
        }
      }

      // If iframe button found, click it
      if (googleFrame) {
        this.logger.log({
          level: LogLevel.INFO,
          ...BotMessages.LOOKING_FOR_BUTTON_IN_IFRAME,
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
          ...BotMessages.IFRAME_NOT_FOUND_FALLBACK,
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
          ...BotMessages.GMAIL_BUTTON_FOUND_WITH_SELECTOR(usedSelector),
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
          ...BotMessages.WAITING_FOR_USER_ACCOUNT_SELECTION
        });
      } catch {
        // Navigation might not complete if popup opens
        this.logger.log({
          level: LogLevel.INFO,
          ...BotMessages.GOOGLE_POPUP_WAITING_FOR_USER
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : BotMessages.UNKNOWN_ERROR.message;
      this.logger.log({
        level: LogLevel.ERROR,
        ...BotMessages.GMAIL_CLICK_FAILED(errorMessage)
      });
      throw error;
    }
  }
}

