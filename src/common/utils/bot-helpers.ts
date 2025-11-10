import { BotState } from '../../server/bot';

export function createBotState(
  status: BotState['status'],
  message: string,
  options?: Partial<Pick<BotState, 'pageTitle' | 'url'>>
): BotState {
  return {
    status,
    message,
    timestamp: new Date().toISOString(),
    ...options
  };
}

