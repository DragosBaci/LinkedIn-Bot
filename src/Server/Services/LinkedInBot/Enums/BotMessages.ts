import { BotStatusType } from "@/Common/Types/BotStatus";

export const BotMessages = {
  IDLE: {
    message: 'Bot is idle',
    userMessage: 'Bot is idle'
  },
  ALREADY_RUNNING: {
    message: 'Bot is already running',
    userMessage: 'Bot is already active'
  },
  STARTING: {
    message: 'Starting bot...',
    userMessage: 'Starting bot...'
  },
  LAUNCHING_BROWSER: {
    message: 'Launching Puppeteer browser'
  },
  BROWSER_LAUNCHED: {
    message: 'Browser launched successfully',
    userMessage: 'Browser opened'
  },
  USER_AGENT_SET: {
    message: 'User agent set'
  },
  NAVIGATING_LINKEDIN: {
    message: 'Navigating to LinkedIn...',
    userMessage: 'Opening LinkedIn...'
  },
  NAVIGATING_URL: {
    message: 'Navigating to https://www.linkedin.com'
  },
  LINKEDIN_LOADED: {
    message: 'LinkedIn page loaded successfully',
    userMessage: 'LinkedIn opened successfully'
  },
  NOT_RUNNING: {
    message: 'Bot is not running',
    userMessage: 'Bot is not active'
  },
  STOPPING: {
    message: 'Stopping bot',
    userMessage: 'Stopping bot...'
  },
  STOPPED: {
    message: 'Bot stopped successfully',
    userMessage: 'Bot stopped'
  },
  PAGE_CLOSED: {
    message: 'Browser page closed'
  },
  BROWSER_CLOSED: {
    message: 'Browser closed',
    userMessage: 'Browser closed'
  },
  UNKNOWN_ERROR: {
    message: 'Unknown error',
    userMessage: 'An unknown error occurred'
  },
  BOT_STATUS: (status: BotStatusType, message: string) => ({
    message: `[Bot Status] ${status}: ${message}`,
    userMessage: `[Bot Status] ${status}: ${message}`
  }),
  START_ERROR: (errorMessage: string) => ({
    message: `Failed to start bot: ${errorMessage}`,
    userMessage: `Failed to start: ${errorMessage}`
  }),
  CLEANUP_ERROR: (errorMessage: string) => ({
    message: `Error during cleanup: ${errorMessage}`
  })
} as const;

