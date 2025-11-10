import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { BotController } from '@/Server/Controllers/BotController';
import { LoggerService } from '@/Server/Services/LoggerService';

const app = express();
const PORT = 3001;
const WS_PORT = 3002;

app.use(cors());
app.use(express.json());

const botController = new BotController();
const logger = LoggerService.getInstance();

// API Routes
app.post('/api/bot/start', async (req, res) => {
  const result = await botController.startBot();
  res.json(result);
});

app.post('/api/bot/stop', async (req, res) => {
  const result = await botController.stopBot();
  res.json(result);
});

app.post('/api/logs/clear', (req, res) => {
  logger.clearLogs();
  res.json({ success: true });
});

// Start HTTP server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Start WebSocket server
const server = createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  logger.addWebSocketClient(ws);
});

server.listen(WS_PORT, () => {
  console.log(`🔌 WebSocket server running on ws://localhost:${WS_PORT}`);
});
