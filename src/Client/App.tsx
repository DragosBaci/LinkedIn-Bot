import React, { useState, useEffect } from 'react';
import { BotControl } from '@/Client/Components/BotControl';
import { BotStatusDisplay } from '@/Client/Components/BotStatusDisplay';
import { BotService } from '@/Client/Services/BotService';
import type { BotState } from '@/Common/Types/BotStatus';
import { BotStatus } from '@/Common/Types/BotStatus';

export const App: React.FC = () => {
  const [botState, setBotState] = useState<BotState>({
    status: BotStatus.IDLE,
    message: 'Bot is idle',
    timestamp: Date.now()
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Poll for status updates
    const interval = setInterval(async () => {
      try {
        const status = await BotService.getStatus();
        setBotState(status);
      } catch (error) {
        console.error('Failed to fetch bot status:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const newState = await BotService.startBot();
      setBotState(newState);
    } catch (error) {
      console.error('Failed to start bot:', error);
      alert('Failed to start bot. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    setIsLoading(true);
    try {
      const newState = await BotService.stopBot();
      setBotState(newState);
    } catch (error) {
      console.error('Failed to stop bot:', error);
      alert('Failed to stop bot. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="icon">🤖</span>
            LinkedIn Bot Controller
          </h1>
          <p className="app-subtitle">Automate your LinkedIn workflow with ease</p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <BotStatusDisplay botState={botState} />
          <BotControl
            botState={botState}
            isLoading={isLoading}
            onStart={handleStart}
            onStop={handleStop}
          />
        </div>
      </main>

      <footer className="app-footer">
        <p>Built with React + TypeScript + Puppeteer</p>
      </footer>
    </div>
  );
};

