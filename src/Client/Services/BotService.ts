import type { ApiResponse } from '@/Common/Types/ApiResponse';
import type { BotState } from '@/Common/Types/BotStatus';

const API_BASE_URL = 'http://localhost:3001/api';

export class BotService {
  static async startBot(): Promise<BotState> {
    const response = await fetch(`${API_BASE_URL}/bot/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json() as ApiResponse<BotState>;

    if (!result.success) {
      throw new Error(result.error || 'Failed to start bot');
    }

    return result.data!;
  }

  static async stopBot(): Promise<BotState> {
    const response = await fetch(`${API_BASE_URL}/bot/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json() as ApiResponse<BotState>;

    if (!result.success) {
      throw new Error(result.error || 'Failed to stop bot');
    }

    return result.data!;
  }

  static async getStatus(): Promise<BotState> {
    const response = await fetch(`${API_BASE_URL}/bot/status`);
    const result = await response.json() as ApiResponse<BotState>;

    if (!result.success) {
      throw new Error(result.error || 'Failed to get status');
    }

    return result.data!;
  }
}

