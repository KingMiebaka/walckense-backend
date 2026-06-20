// server.js (at project root)
import 'dotenv/config';
import express from 'express';

const app = express();
app.use(express.json());

// ✅ Add CORS support (for frontend to call backend)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// ✅ Subscribe endpoint (your existing code)
app.post('/api/subscribe', async (req, res) => {
  const { default: handler } = await import('../api/subscribe.js');
  handler(req, res);
});

// ✅ NEW: Initiative API endpoints
app.get('/api/initiatives', async (req, res) => {
  try {
    const { default: handler } = await import('../api/initiatives/list.js');
    handler(req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/initiatives/:slug', async (req, res) => {
  try {
    const { default: handler } = await import('../api/initiatives/get.js');
    handler(req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/initiatives', async (req, res) => {
  try {
    const { default: handler } = await import('../api/initiatives/create.js');
    handler(req, res);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/initiatives/:slug', async (req, res) => {
  try {
    const { default: handler } = await import('../api/initiatives/update.js');
    handler(req, res);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/initiatives/:slug', async (req, res) => {
  try {
    const { default: handler } = await import('../api/initiatives/delete.js');
    handler(req, res);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('✅ Local API running on http://localhost:3000'));