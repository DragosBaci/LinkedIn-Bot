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
  LOOKING_FOR_GMAIL_BUTTON: {
    message: 'Looking for Gmail login button',
    userMessage: 'Searching for Gmail login option...'
  },
  GMAIL_BUTTON_FOUND: {
    message: 'Gmail login button found',
    userMessage: 'Gmail login option found'
  },
  GMAIL_BUTTON_CLICKED: {
    message: 'Gmail login button clicked',
    userMessage: 'Proceeding with Gmail login...'
  },
  GMAIL_LOGIN_PAGE_LOADED: {
    message: 'Gmail login page loaded',
    userMessage: 'Gmail login page ready'
  },
  GMAIL_BUTTON_NOT_FOUND: {
    message: 'Gmail login button not found on page',
    userMessage: 'Could not find Gmail login option'
  },
  LOOKING_FOR_IFRAME: {
    message: 'Looking for Google Sign-In iframe',
    userMessage: 'Searching for login options...'
  },
  FOUND_FRAMES: (count: number) => ({
    message: `Found ${count} frames on the page`
  }),
  CHECKING_FRAME: (frameUrl: string) => ({
    message: `Checking frame: ${frameUrl}`
  }),
  FOUND_GOOGLE_IFRAME: {
    message: 'Found Google Sign-In iframe',
    userMessage: 'Found Google login'
  },
  LOOKING_FOR_BUTTON_IN_IFRAME: {
    message: 'Looking for button inside iframe'
  },
  IFRAME_NOT_FOUND_FALLBACK: {
    message: 'Google iframe not found, trying regular selectors',
    userMessage: 'Trying alternative login method...'
  },
  GMAIL_BUTTON_FOUND_WITH_SELECTOR: (selector: string) => ({
    message: `Gmail button found with selector: ${selector}`,
    userMessage: 'Gmail button found'
  }),
  WAITING_FOR_USER_ACCOUNT_SELECTION: {
    message: 'Waiting for user to manually select Google account',
    userMessage: 'Please select your Google account in the browser'
  },
  GOOGLE_POPUP_WAITING_FOR_USER: {
    message: 'Google login popup opened, waiting for user action',
    userMessage: 'Please select your Google account in the popup'
  },
  GMAIL_CLICK_FAILED: (errorMessage: string) => ({
    message: `Failed to click Gmail button: ${errorMessage}`,
    userMessage: 'Failed to proceed with Gmail login'
  }),
  NAVIGATING_TO_URL: (url: string, userMessage?: string) => ({
    message: `Navigating to ${url}`,
    userMessage
  }),
  NAVIGATION_SUCCESS: (url: string, userMessage?: string) => ({
    message: `Successfully navigated to ${url}`,
    userMessage: userMessage ? `${userMessage} - Complete` : undefined
  }),
  ELEMENT_FOUND: (selector: string) => ({
    message: `Element found: ${selector}`
  }),
  ERROR_WITH_CONTEXT: (context: string, errorMessage: string) => ({
    message: `${context}: ${errorMessage}`,
    userMessage: context
  }),
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

