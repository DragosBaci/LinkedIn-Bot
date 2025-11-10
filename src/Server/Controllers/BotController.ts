import { LinkedInBot } from '@/Server/Services/LinkedInBot';
import type { ApiResponse } from '@/Common/Types/ApiResponse';
import type { BotState } from '@/Common/Types/BotStatus';

export class BotController {
  private bot: LinkedInBot;

  constructor() {
    this.bot = new LinkedInBot();
  }

  async startBot(): Promise<ApiResponse<BotState>> {
    try {
      await this.bot.start();
      return {
        success: true,
        data: this.bot.getState()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start bot'
      };
    }
  }

  async stopBot(): Promise<ApiResponse<BotState>> {
    try {
      await this.bot.stop();
      return {
        success: true,
        data: this.bot.getState()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to stop bot'
      };
    }
  }

  getStatus(): BotState {
    return this.bot.getState();
  }
}

