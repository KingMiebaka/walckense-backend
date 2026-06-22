import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

function readInitiatives() {
  // Clear require cache so we always get fresh data
  const filePath = path.join(__dirname, 'initiatives.json');
  delete require.cache[filePath];
  return require('./initiatives.json');
}

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/initiatives/list', (req, res) => {
  try {
    const initiatives = readInitiatives();
    res.status(200).json({
      initiatives,
      total: initiatives.length,
      page: 1,
      limit: initiatives.length,
    });
  } catch (error) {
    console.error('Error listing initiatives:', error);
    res.status(500).json({ error: 'Failed to list initiatives', details: error.message });
  }
});

app.get('/initiatives/:slug', (req, res) => {
  try {
    const initiatives = readInitiatives();
    const initiative = initiatives.find((item) => item.slug === req.params.slug);
    if (!initiative) {
      return res.status(404).json({ error: 'Initiative not found' });
    }
    return res.status(200).json(initiative);
  } catch (error) {
    console.error('Error fetching initiative:', error);
    return res.status(500).json({ error: 'Failed to fetch initiative', details: error.message });
  }
});

app.post('/initiatives', (req, res) => {
  try {
    const initiatives = readInitiatives();
    if (!req.body?.slug) {
      return res.status(400).json({ error: 'slug is required' });
    }
    if (initiatives.some((item) => item.slug === req.body.slug)) {
      return res.status(400).json({ error: 'Initiative slug already exists' });
    }
    initiatives.push(req.body);
    return res.status(201).json(req.body);
  } catch (error) {
    console.error('Error creating initiative:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.put('/initiatives/:slug', (req, res) => {
  try {
    const initiatives = readInitiatives();
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
    return res.status(200).json(initiatives[index]);
  } catch (error) {
    console.error('Error updating initiative:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.delete('/initiatives/:slug', (req, res) => {
  try {
    const initiatives = readInitiatives();
    const filtered = initiatives.filter((item) => item.slug !== req.params.slug);
    if (filtered.length === initiatives.length) {
      return res.status(404).json({ error: 'Initiative not found' });
    }
    return res.status(200).json({ message: 'Initiative deleted successfully' });
  } catch (error) {
    console.error('Error deleting initiative:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}