export const BrowserConfig = {
  LAUNCH_OPTIONS: {
    headless: false,
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled'
    ]
  },

  USER_AGENT: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

  NAVIGATION_TIMEOUT: 30000,
  
  WAIT_UNTIL: 'networkidle2' as const
};

