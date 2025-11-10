import type { LogEntry } from '@/Common/Types/LogEntry';

type WebSocketMessageHandler = (logs: LogEntry[]) => void;
type WebSocketLogHandler = (log: LogEntry) => void;
type WebSocketClearHandler = () => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private onInitLogsHandler: WebSocketMessageHandler | null = null;
  private onNewLogHandler: WebSocketLogHandler | null = null;
  private onClearHandler: WebSocketClearHandler | null = null;

  connect(url: string): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'INIT_LOGS':
            if (this.onInitLogsHandler) {
              this.onInitLogsHandler(message.data);
            }
            break;
          case 'NEW_LOG':
            if (this.onNewLogHandler) {
              this.onNewLogHandler(message.data);
            }
            break;
          case 'LOGS_CLEARED':
            if (this.onClearHandler) {
              this.onClearHandler();
            }
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected, attempting to reconnect...');
      this.reconnectTimer = window.setTimeout(() => {
        this.connect(url);
      }, 3000);
    };
  }

  onInitLogs(handler: WebSocketMessageHandler): void {
    this.onInitLogsHandler = handler;
  }

  onNewLog(handler: WebSocketLogHandler): void {
    this.onNewLogHandler = handler;
  }

  onLogsClear(handler: WebSocketClearHandler): void {
    this.onClearHandler = handler;
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

