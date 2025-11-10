import React, { useState, useEffect, useRef } from 'react';
import { BotControl } from '@/Client/Components/BotControl';
import { LogList } from '@/Client/Components/LogList';
import { BotService } from '@/Client/Services/BotService';
import { WebSocketService } from '@/Client/Services/WebSocketService';
import type { BotState } from '@/Common/Types/BotStatus';
import type { LogEntry } from '@/Common/Types/LogEntry';
import { BotStatus } from '@/Common/Types/BotStatus';

const WS_URL = 'ws://localhost:3002';

export const App: React.FC = () => {
  const [botState, setBotState] = useState<BotState>({
    status: BotStatus.IDLE,
    message: 'Bot is idle',
    timestamp: Date.now()
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wsServiceRef = useRef<WebSocketService | null>(null);

  useEffect(() => {
    // Initialize WebSocket service
    const wsService = new WebSocketService();
    wsServiceRef.current = wsService;

    // Set up WebSocket handlers
    wsService.onInitLogs((initialLogs) => {
      setLogs(initialLogs);
    });

    wsService.onNewLog((newLog) => {
      setLogs((prevLogs) => [...prevLogs, newLog]);
    });

    wsService.onLogsClear(() => {
      setLogs([]);
    });

    // Connect to WebSocket
    wsService.connect(WS_URL);

    return () => {
      wsService.disconnect();
    };
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

  const handleClearLogs = async () => {
    try {
      await BotService.clearLogs();
      // Logs will be cleared via WebSocket notification
    } catch (error) {
      console.error('Failed to clear logs:', error);
      alert('Failed to clear logs. Check console for details.');
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
          <BotControl
            botState={botState}
            isLoading={isLoading}
            onStart={handleStart}
            onStop={handleStop}
          />
          <LogList logs={logs} onClear={handleClearLogs} />
        </div>
      </main>

      <footer className="app-footer">
        <p>Built with React + TypeScript + Puppeteer</p>
      </footer>
    </div>
  );
};
