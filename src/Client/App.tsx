import React, { useState, useEffect, useRef } from 'react';
import { BotControl } from '@/Client/Components/BotControl';
import { LogList } from '@/Client/Components/LogList';
import { BotService } from '@/Client/Services/BotService';
import { WebSocketService } from '@/Client/Services/WebSocketService';
import type { BotState } from '@/Common/Types/BotStatus';
import type { LogEntry } from '@/Common/Types/LogEntry';
import { BotStatus } from '@/Common/Types/BotStatus';
import { Bot } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-4 mb-3">
            <Bot className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-bold text-gray-900">
              LinkedIn Bot Controller
            </h1>
          </div>
          <p className="text-center text-lg text-gray-600">
            Automate your LinkedIn workflow with ease
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BotControl
            botState={botState}
            isLoading={isLoading}
            onStart={handleStart}
            onStop={handleStop}
          />
          <LogList logs={logs} onClear={handleClearLogs} />
        </div>
      </main>

      <footer className="bg-white/95 backdrop-blur-sm border-t border-gray-200 py-6">
        <p className="text-center text-gray-600">
          Built with React + TypeScript + Puppeteer
        </p>
      </footer>
    </div>
  );
};
