import { BotStatus } from '@/Common/Types/BotStatus';
import type { BotState } from '@/Common/Types/BotStatus';
import { LoggerService } from '@/Server/Services/LoggerService';
import { LogLevel } from '@/Common/Types/LogEntry';
import { BotMessages } from '@/Server/Services/LinkedInBot/Enums/BotMessages';
import { BrowserManager } from '@/Server/Services/LinkedInBot/Services/BrowserManager';
import { NavigationService } from '@/Server/Services/LinkedInBot/Services/NavigationService';
import { StateManager } from '@/Server/Services/LinkedInBot/Services/StateManager';
import { ErrorHandler } from '@/Server/Services/LinkedInBot/Utils/ErrorHandler';
import { StartCommand } from '@/Server/Services/LinkedInBot/Commands/StartCommand';
import type { BotContext } from '@/Server/Services/LinkedInBot/Types/BotContext';

/**
 * LinkedInBot - Main orchestrator for LinkedIn automation
 * 
 * This class coordinates various services and commands to automate LinkedIn actions.
 * It follows a modular architecture where each responsibility is handled by a dedicated service.
 * 
 * Architecture:
 * - Services: Handle specific concerns (browser, navigation, state)
 * - Commands: Implement discrete actions (start, stop, navigate, etc.)
 * - Managers: Coordinate complex operations
 * - Utils: Provide helper functionality
 */
export class LinkedInBot {
  private context: BotContext;
  private logger: LoggerService;
  private browserManager: BrowserManager;
  private navigationService: NavigationService;
  private stateManager: StateManager;
  private errorHandler: ErrorHandler;

  constructor() {
    this.logger = LoggerService.getInstance();
    this.browserManager = new BrowserManager(this.logger);
    this.navigationService = new NavigationService(this.logger);
    this.stateManager = new StateManager(this.logger);
    this.errorHandler = new ErrorHandler(this.logger);

    this.context = {
      browser: null,
      page: null,
      state: this.stateManager.getState()
    };
  }

  /**
   * Start the bot and navigate to LinkedIn
   */
  async start(): Promise<void> {
    if (this.stateManager.isRunning()) {
      this.logger.log({
        level: LogLevel.WARNING,
        ...BotMessages.ALREADY_RUNNING
      });
      throw new Error(BotMessages.ALREADY_RUNNING.message);
    }

    // Start logging session
    this.logger.startSession();

    try {
      // Execute start command
      const startCommand = new StartCommand({
        logger: this.logger,
        browserManager: this.browserManager,
        navigationService: this.navigationService,
        stateManager: this.stateManager
      });

      await startCommand.execute(this.context);
      
      // Update context state
      this.context.state = this.stateManager.getState();

    } catch (error) {
      await this.cleanup();
      this.stateManager.updateState(
        BotStatus.ERROR,
        `Error: ${this.errorHandler.extractErrorMessage(error)}`
      );
      this.errorHandler.handleStartError(error);
    }
  }

  /**
   * Stop the bot and clean up resources
   */
  async stop(): Promise<void> {
    if (this.stateManager.isIdle()) {
      this.logger.log({
        level: LogLevel.WARNING,
        ...BotMessages.NOT_RUNNING
      });
      throw new Error(BotMessages.NOT_RUNNING.message);
    }

    this.logger.log({
      level: LogLevel.INFO,
      ...BotMessages.STOPPING
    });

    this.stateManager.updateState(BotStatus.STOPPING, BotMessages.STOPPING.message);
    
    await this.cleanup();
    
    this.stateManager.updateState(BotStatus.IDLE, BotMessages.STOPPED.message);
    
    this.logger.log({
      level: LogLevel.SUCCESS,
      ...BotMessages.STOPPED
    });

    // End logging session
    this.logger.endSession();
  }

  /**
   * Get the current bot state
   */
  getState(): BotState {
    return this.stateManager.getState();
  }

  /**
   * Clean up browser resources
   */
  private async cleanup(): Promise<void> {
    try {
      if (this.context.page) {
        await this.browserManager.closePage(this.context.page);
        this.context.page = null;
      }

      if (this.context.browser) {
        await this.browserManager.closeBrowser(this.context.browser);
        this.context.browser = null;
      }
    } catch (error) {
      this.errorHandler.handleCleanupError(error);
    }
  }
}

