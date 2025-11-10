import express from 'express';
import cors from 'cors';
import { BotController } from '@/Server/Controllers/BotController';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const botController = new BotController();

// API Routes
app.post('/api/bot/start', async (req, res) => {
  const result = await botController.startBot();
  res.json(result);
});

app.post('/api/bot/stop', async (req, res) => {
  const result = await botController.stopBot();
  res.json(result);
});

app.get('/api/bot/status', (req, res) => {
  const status = botController.getStatus();
  res.json({ success: true, data: status });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

