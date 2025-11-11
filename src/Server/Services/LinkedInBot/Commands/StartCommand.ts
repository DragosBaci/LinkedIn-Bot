import { BotStatus } from '@/Common/Types/BotStatus';
import { LogLevel } from '@/Common/Types/LogEntry';
import { LoggerService } from '@/Server/Services/LoggerService';
import { BotMessages } from '@/Server/Services/LinkedInBot/Enums/BotMessages';
import { LinkedInConfig } from '@/Server/Services/LinkedInBot/Config/LinkedInConfig';
import { BrowserManager } from '@/Server/Services/LinkedInBot/Services/BrowserManager';
import { NavigationService } from '@/Server/Services/LinkedInBot/Services/NavigationService';
import { StateManager } from '@/Server/Services/LinkedInBot/Services/StateManager';
import type { BotContext } from '@/Server/Services/LinkedInBot/Types/BotContext';
import type { ICommand } from './ICommand';

export class StartCommand implements ICommand {
  private logger: LoggerService;
  private browserManager: BrowserManager;
  private navigationService: NavigationService;
  private stateManager: StateManager;

  constructor({
    logger,
    browserManager,
    navigationService,
    stateManager
  }: {
    logger: LoggerService;
    browserManager: BrowserManager;
    navigationService: NavigationService;
    stateManager: StateManager;
  }) {
    this.logger = logger;
    this.browserManager = browserManager;
    this.navigationService = navigationService;
    this.stateManager = stateManager;
  }

  getName(): string {
    return 'StartCommand';
  }

  canExecute(context: BotContext): boolean {
    return context.state.status !== BotStatus.RUNNING;
  }

  async execute(context: BotContext): Promise<void> {
    this.stateManager.updateState(BotStatus.STARTING, BotMessages.STARTING.message);
    
    this.logger.log({
      level: LogLevel.INFO,
      ...BotMessages.STARTING
    });

    // Launch browser and create page
    context.browser = await this.browserManager.launchBrowser();
    context.page = await this.browserManager.createPage(context.browser);

    // Navigate to LinkedIn
    this.stateManager.updateState(BotStatus.RUNNING, BotMessages.NAVIGATING_LINKEDIN.message);
    
    this.logger.log({
      level: LogLevel.INFO,
      ...BotMessages.NAVIGATING_LINKEDIN
    });

    await this.navigationService.navigateTo(context.page, {
      url: LinkedInConfig.BASE_URL,
      userMessage: BotMessages.NAVIGATING_LINKEDIN.userMessage
    });

    this.stateManager.updateState(BotStatus.RUNNING, BotMessages.LINKEDIN_LOADED.message);
    
    this.logger.log({
      level: LogLevel.SUCCESS,
      ...BotMessages.LINKEDIN_LOADED
    });
  }
}

