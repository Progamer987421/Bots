require('dotenv').config();
const express = require('express');
const BotManager = require('./botManager');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const manager = new BotManager();

const auth = (req, res, next) => {
  const key = req.headers['x-admin-key'] || req.query.key;
  if (process.env.ADMIN_KEY && key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// ── Routes ────────────────────────────────────────────────────────
app.get('/status', auth, (req, res) => {
  res.json(manager.getStatus());
});

app.get('/accounts', auth, (req, res) => {
  res.json(manager.getAccounts());
});

app.post('/bot/create', auth, (req, res) => {
  const { count } = req.body;
  const result = manager.createBots(count || 1);
  res.json(result);
});

app.post('/bot/:id/kill', auth, (req, res) => {
  res.json(manager.killBot(req.params.id));
});

app.post('/bot/:id/chat', auth, (req, res) => {
  res.json(manager.sendChat(req.params.id, req.body.message));
});

app.get('/bot/:id/logs', auth, (req, res) => {
  res.json(manager.getLogs(req.params.id));
});

app.post('/killall', auth, (req, res) => {
  manager.killAll();
  res.json({ success: true });
});

app.get('/health', (req, res) => res.send('OK'));
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[AppleMC BotManager] Running on port ${PORT}`);
});

// Self-ping for Replit free tier
if (process.env.REPLIT_URL) {
  const https = require('https');
  setInterval(() => {
    https.get(`${process.env.REPLIT_URL}/health`, () => {}).on('error', () => {});
  }, 240000);
}
