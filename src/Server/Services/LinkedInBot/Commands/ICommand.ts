import type { BotContext } from '@/Server/Services/LinkedInBot/Types/BotContext';

/**
 * Command interface for implementing LinkedIn bot actions
 * This enables adding new commands without modifying existing code
 */
export interface ICommand {
  /**
   * Execute the command
   * @param context - The bot context containing browser, page, and state
   * @returns Promise that resolves when command is complete
   */
  execute(context: BotContext): Promise<void>;

  /**
   * Validate if the command can be executed
   * @param context - The bot context containing browser, page, and state
   * @returns true if command can execute, false otherwise
   */
  canExecute(context: BotContext): boolean;

  /**
   * Get command name for logging
   */
  getName(): string;
}

