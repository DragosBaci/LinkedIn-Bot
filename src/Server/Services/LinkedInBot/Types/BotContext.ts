import type { Browser, Page } from 'puppeteer';
import type { BotState } from '@/Common/Types/BotStatus';

export interface BotContext {
  browser: Browser | null;
  page: Page | null;
  state: BotState;
}

