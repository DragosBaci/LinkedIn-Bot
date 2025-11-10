# LinkedIn Bot with React Dashboard

A Puppeteer script built with TypeScript that opens the LinkedIn page, featuring a beautiful React dashboard to monitor bot activity in real-time.

## Features

- 🎨 **Beautiful React UI** - Modern, responsive dashboard with real-time updates
- 🔄 **WebSocket Integration** - Live state updates from the bot to the UI
- 🤖 **Puppeteer Bot** - Automated browser control with full screen mode
- 📊 **Activity Logs** - Complete history of bot actions
- ⚡ **Real-time Status** - See exactly what the bot is doing at any moment
- 🎯 **TypeScript** - Full type safety across frontend and backend

## Architecture

```
┌─────────────────┐         WebSocket         ┌──────────────────┐
│  React Frontend │ ◄─────────────────────── │  Express Server  │
│   (Port 5173)   │                            │   (Port 3001)    │
└─────────────────┘                            └────────┬─────────┘
                                                        │
                                                        │ Controls
                                                        ▼
                                                ┌───────────────┐
                                                │   Puppeteer   │
                                                │     Bot       │
                                                └───────────────┘
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

Install the required dependencies:

```bash
npm install
```

## Usage

### Run Development Mode (Recommended)

Start both the backend server and React frontend:

```bash
npm run dev
```

This will:
1. Start the Express/WebSocket server on `http://localhost:3001`
2. Start the Vite dev server on `http://localhost:5173`
3. Automatically open the dashboard in your browser

### Run Backend Only

If you just want to run the backend server:

```bash
npm run server
```

### Run Frontend Only

If you just want to run the React frontend:

```bash
npm run client
```

## How to Use the Dashboard

1. **Start the Application**
   ```bash
   npm run dev
   ```

2. **Open the Dashboard**
   - The browser should open automatically at `http://localhost:5173`
   - If not, navigate to that URL manually

3. **Launch the Bot**
   - Click the "Start Bot" button in the dashboard
   - Watch the real-time status updates as the bot:
     - Launches the browser
     - Navigates to LinkedIn
     - Displays page information
     - Automatically closes after 60 seconds

4. **Monitor Activity**
   - The status card shows the current bot state
   - The activity log shows a complete history of all actions
   - Use "Clear Logs" to reset the activity log

## Bot States

The bot goes through the following states:

- 🟢 **idle** - Ready to start or finished
- 🟡 **launching** - Starting the browser
- 🔵 **navigating** - Loading LinkedIn
- ✅ **success** - Successfully opened LinkedIn
- ❌ **error** - Something went wrong
- 🔒 **closing** - Shutting down the browser

## Configuration

### Bot Settings (`src/server/bot.ts`)

- Browser timeout: 60 seconds (adjust the `setTimeout` value)
- Headless mode: `false` (set to `true` for headless operation)
- Full screen: enabled by default
- User agent: macOS Chrome

### Server Settings (`src/server/index.ts`)

- WebSocket port: 3001
- CORS: enabled for all origins

### Frontend Settings (`vite.config.ts`)

- Dev server port: 5173
- Auto-open browser: enabled

## Project Structure

```
linkedin-bot/
├── src/
│   ├── client/           # React frontend
│   │   ├── App.tsx       # Main React component
│   │   ├── App.css       # Styles
│   │   └── main.tsx      # React entry point
│   └── server/           # Backend
│       ├── index.ts      # Express + WebSocket server
│       └── bot.ts        # Puppeteer bot logic
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript config (frontend)
├── tsconfig.server.json  # TypeScript config (backend)
└── vite.config.ts        # Vite configuration
```

## Building for Production

Build the React frontend:

```bash
npm run build:client
```

The built files will be in the `dist` directory.

## Extending the Bot

You can extend the bot's functionality in `src/server/bot.ts`:

- **Login to LinkedIn**: Add login logic after navigation
- **Scrape profiles**: Extract profile data
- **Automate connections**: Send connection requests
- **Post content**: Create LinkedIn posts
- **Schedule tasks**: Run the bot on a schedule

Example extension:

```typescript
// In bot.ts, after successful navigation
const loginButton = await page.$('a[data-tracking-control-name="guest_homepage-basic_nav-header-signin"]');
if (loginButton) {
  await loginButton.click();
  // Add your login logic here
}
```

## Troubleshooting

### WebSocket Connection Failed
- Make sure the backend server is running (`npm run server`)
- Check that port 3001 is not blocked by a firewall

### Browser Doesn't Open
- The bot runs in visible mode by default
- Check console for error messages
- Verify Puppeteer installed correctly: `npm install puppeteer`

### Port Already in Use
- Frontend (5173): Change port in `vite.config.ts`
- Backend (3001): Change PORT in `src/server/index.ts`

## Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- WebSocket API
- CSS3

**Backend:**
- Node.js
- Express
- WebSocket (ws)
- Puppeteer
- TypeScript

## License

ISC

## Next Steps

- Add authentication to the dashboard
- Implement bot scheduling
- Add LinkedIn login functionality
- Save activity logs to a database
- Add more bot actions (scraping, posting, etc.)
- Deploy to a cloud service
