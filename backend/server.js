const express = require('express');
const { corsMiddleware, securityHeadersMiddleware, rateLimitMiddleware } = require('./middleware/security');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(corsMiddleware);
app.use(securityHeadersMiddleware);
app.use(rateLimitMiddleware(100, 60000));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.get('/api/sensor', (req, res) => {
  res.json({ alcohol: 0.02, vibration: 120, distance: 45, impact: 0.5, lcd_display: 'Normal' });
});

app.get('/api/sensor/history', (req, res) => {
  const data = [];
  const now = Date.now();
  for (let i = 0; i < 50; i++) {
    data.push({
      id: i,
      timestamp: now - i * 60000,
      alcohol: Math.random() * 0.08,
      vibration: Math.random() * 2000,
      distance: Math.random() * 100,
      impact: Math.random() * 5,
    });
  }
  res.json(data);
});

app.get('/api/accidents', (req, res) => {
  res.json([]);
});

app.get('/api/stats', (req, res) => {
  res.json({ total_accidents: 0, max_impact: 0, avg_alcohol: 0 });
});

app.post('/api/sensor', (req, res) => {
  res.json({ success: true, timestamp: new Date().toISOString() });
});

app.post('/api/accident', (req, res) => {
  res.json({ success: true, id: Date.now() });
});

app.use(express.static(path.join(__dirname, 'dashboard', 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SafeDrive server running on port ${PORT}`);
});

module.exports = app;