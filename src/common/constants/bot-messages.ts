export const BotMessages = {
  ALREADY_RUNNING: 'Bot is already running',
  LAUNCHING_BROWSER: 'Launching browser...',
  BROWSER_LAUNCHED: 'Browser launched successfully!',
  NAVIGATING: 'Navigating to LinkedIn...',
  SUCCESS: 'Successfully opened LinkedIn!',
  CLOSING: 'Closing browser...',
  BROWSER_CLOSED: 'Browser closed',
  ERROR: (message: string) => `Error: ${message}`
} as const;

