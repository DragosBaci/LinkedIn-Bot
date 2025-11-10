# LinkedIn Bot

A LinkedIn automation bot with a modern React user interface.

## Features

- Opens LinkedIn in a controlled browser
- Modern React UI built with TypeScript
- Real-time bot status updates
- Easy to use interface

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run in development mode:
```bash
npm run dev
```

This will start both the server (port 3001) and client (port 3000).

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Click "Start Bot" to launch the LinkedIn bot
2. The bot will open LinkedIn in a controlled browser window
3. Monitor the bot status in real-time through the UI
4. Click "Stop Bot" to close the browser and stop the bot

## Project Structure

- `src/Client/` - React frontend application
- `src/Server/` - Express server with Puppeteer bot
- `src/Common/` - Shared types and utilities

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **Automation**: Puppeteer

