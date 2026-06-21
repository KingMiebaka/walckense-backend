import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

// Simple CORS - allows ALL origins (localhost and production)
app.use(cors());

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const initiativesPath = path.join(__dirname, '..', 'initiatives.json');

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('MONGODB_URI not set, skipping database connection');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('Starting API without MongoDB...');
  }
}

connectDB();

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

async function readInitiatives() {
  const raw = await fs.readFile(initiativesPath, 'utf-8');
  return JSON.parse(raw);
}

async function writeInitiatives(initiatives) {
  await fs.writeFile(initiativesPath, JSON.stringify(initiatives, null, 2), 'utf-8');
}

// Removed /api prefix from routes
app.get('/initiatives/list', async (req, res) => {
  try {
    const initiatives = await readInitiatives();
    res.status(200).json({
      initiatives,
      total: initiatives.length,
      page: 1,
      limit: initiatives.length,
    });
  } catch (error) {
    console.error('Error listing initiatives:', error);
    res.status(500).json({ error: 'Failed to list initiatives' });
  }
});

// Removed /api prefix from routes
app.get('/initiatives/:slug', async (req, res) => {
  try {
    const initiatives = await readInitiatives();
    const initiative = initiatives.find((item) => item.slug === req.params.slug);

    if (!initiative) {
      return res.status(404).json({ error: 'Initiative not found' });
    }

    return res.status(200).json(initiative);
  } catch (error) {
    console.error('Error fetching initiative:', error);
    return res.status(500).json({ error: 'Failed to fetch initiative' });
  }
});

// Removed /api prefix from routes
app.post('/initiatives', async (req, res) => {
  try {
    const initiatives = await readInitiatives();

    if (!req.body?.slug) {
      return res.status(400).json({ error: 'slug is required' });
    }

    if (initiatives.some((item) => item.slug === req.body.slug)) {
      return res.status(400).json({ error: 'Initiative slug already exists' });
    }

    initiatives.push(req.body);
    await writeInitiatives(initiatives);

    return res.status(201).json(req.body);
  } catch (error) {
    console.error('Error creating initiative:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Removed /api prefix from routes
app.put('/initiatives/:slug', async (req, res) => {
  try {
    const initiatives = await readInitiatives();
    const index = initiatives.findIndex((item) => item.slug === req.params.slug);

    if (index === -1) {
      return res.status(404).json({ error: 'Initiative not found' });
    }

    initiatives[index] = {
      ...initiatives[index],
      ...req.body,
      slug: req.params.slug,
      updatedAt: new Date().toISOString(),
    };

    await writeInitiatives(initiatives);

    return res.status(200).json(initiatives[index]);
  } catch (error) {
    console.error('Error updating initiative:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Removed /api prefix from routes
app.delete('/initiatives/:slug', async (req, res) => {
  try {
    const initiatives = await readInitiatives();
    const filtered = initiatives.filter((item) => item.slug !== req.params.slug);

    if (filtered.length === initiatives.length) {
      return res.status(404).json({ error: 'Initiative not found' });
    }

    await writeInitiatives(filtered);

    return res.status(200).json({ message: 'Initiative deleted successfully' });
  } catch (error) {
    console.error('Error deleting initiative:', error);
    return res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});