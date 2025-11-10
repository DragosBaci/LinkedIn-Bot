import { useEffect, useState } from 'react';
import './App.css';

interface BotState {
  status: 'idle' | 'launching' | 'navigating' | 'success' | 'error' | 'closing';
  message: string;
  timestamp: string;
  pageTitle?: string;
  url?: string;
}

interface LogEntry extends BotState {
  id: string;
}

function App() {
  const [botState, setBotState] = useState<BotState>({
    status: 'idle',
    message: 'Connecting to server...',
    timestamp: new Date().toISOString()
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:3001');

    websocket.onopen = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    };

    websocket.onmessage = (event) => {
      const state: BotState = JSON.parse(event.data);
      setBotState(state);
      setLogs(prev => [...prev, { ...state, id: Date.now().toString() }]);
    };

    websocket.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const startBot = () => {
    console.log('Start bot button clicked');
    console.log('WebSocket state:', ws?.readyState);
    console.log('Is connected:', isConnected);
    console.log('Bot status:', botState.status);
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('Sending start command to server');
      ws.send(JSON.stringify({ action: 'start' }));
    } else {
      console.error('WebSocket is not open');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getStatusColor = (status: BotState['status']) => {
    switch (status) {
      case 'idle': return '#6c757d';
      case 'launching': return '#ffc107';
      case 'navigating': return '#17a2b8';
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'closing': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status: BotState['status']) => {
    switch (status) {
      case 'idle': return '⚪';
      case 'launching': return '🚀';
      case 'navigating': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
      case 'closing': return '🔒';
      default: return '⚪';
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🤖 LinkedIn Bot Dashboard</h1>
        <div className="connection-status" style={{ 
          backgroundColor: isConnected ? '#28a745' : '#dc3545' 
        }}>
          {isConnected ? '● Connected' : '● Disconnected'}
        </div>
      </header>

      <div className="container">
        <div className="main-section">
          <div className="status-card">
            <div className="status-header">
              <h2>Current Status</h2>
              <button 
                onClick={startBot} 
                disabled={!isConnected || botState.status !== 'idle'}
                className="start-button"
              >
                Start Bot
              </button>
            </div>
            
            <div className="status-content">
              <div className="status-badge" style={{ backgroundColor: getStatusColor(botState.status) }}>
                <span className="status-icon">{getStatusIcon(botState.status)}</span>
                <span className="status-text">{botState.status.toUpperCase()}</span>
              </div>
              
              <div className="status-details">
                <div className="detail-row">
                  <strong>Message:</strong>
                  <span>{botState.message}</span>
                </div>
                
                {botState.pageTitle && (
                  <div className="detail-row">
                    <strong>Page Title:</strong>
                    <span>{botState.pageTitle}</span>
                  </div>
                )}
                
                {botState.url && (
                  <div className="detail-row">
                    <strong>URL:</strong>
                    <span className="url-text">{botState.url}</span>
                  </div>
                )}
                
                <div className="detail-row">
                  <strong>Last Update:</strong>
                  <span>{new Date(botState.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="logs-section">
            <div className="logs-header">
              <h2>Activity Log</h2>
              <button onClick={clearLogs} className="clear-button">
                Clear Logs
              </button>
            </div>
            
            <div className="logs-container">
              {logs.length === 0 ? (
                <div className="no-logs">No activity yet. Click "Start Bot" to begin.</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="log-entry">
                    <span className="log-time">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="log-icon">{getStatusIcon(log.status)}</span>
                    <span className="log-status" style={{ color: getStatusColor(log.status) }}>
                      [{log.status}]
                    </span>
                    <span className="log-message">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

