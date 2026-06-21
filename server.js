import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', (req, res) => {
  res.status(200).send('API is running');
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/subscribe', async (req, res) => {
  const { default: handler } = await import('./api/subscribe.js');
  handler(req, res);
});

app.get('/api/initiatives', async (req, res) => {
  try {
    const { default: handler } = await import('./api/initiatives/list.js');
    handler(req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/initiatives/:slug', async (req, res) => {
  try {
    const { default: handler } = await import('./api/initiatives/get.js');
    handler(req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/initiatives', async (req, res) => {
  try {
    const { default: handler } = await import('./api/initiatives/create.js');
    handler(req, res);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/initiatives/:slug', async (req, res) => {
  try {
    const { default: handler } = await import('./api/initiatives/update.js');
    handler(req, res);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/initiatives/:slug', async (req, res) => {
  try {
    const { default: handler } = await import('./api/initiatives/delete.js');
    handler(req, res);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;

async function start() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }

  app.listen(port, () => {
    console.log(`API running on port ${port}`);
  });
}

start().catch(err => {
  console.error('Startup error:', err);
});