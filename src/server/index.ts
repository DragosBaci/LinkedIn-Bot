import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { runLinkedInBot } from './bot';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// WebSocket server
const wss = new WebSocketServer({ server });

let clients: Set<WebSocket> = new Set();

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');
  clients.add(ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received message:', data);
      
      if (data.action === 'start') {
        console.log('Starting LinkedIn bot...');
        runLinkedInBot((state) => {
          console.log('Bot state update:', state);
          // Broadcast state to all connected clients
          clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(state));
            }
          });
        });
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  // Send initial state
  ws.send(JSON.stringify({
    status: 'idle',
    message: 'Ready to start',
    timestamp: new Date().toISOString()
  }));
});

console.log('WebSocket server running on ws://localhost:3001');

