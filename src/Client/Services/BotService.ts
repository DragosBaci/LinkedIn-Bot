import type { ApiResponse } from '@/Common/Types/ApiResponse';
import type { BotState } from '@/Common/Types/BotStatus';
import type { LogEntry } from '@/Common/Types/LogEntry';

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

  static async clearLogs(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/logs/clear`, {
      method: 'POST'
    });

    const result = await response.json() as ApiResponse;

    if (!result.success) {
      throw new Error(result.error || 'Failed to clear logs');
    }
  }
}
