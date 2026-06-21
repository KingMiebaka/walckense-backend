import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const initiativesPath = path.join(__dirname, '..', '..', '..', 'initiatives.json');

export default async function handler(req, res) {
  try {
    const raw = await fs.readFile(initiativesPath, 'utf-8');
    const initiatives = raw.trim() ? JSON.parse(raw) : [];

    if (!req.body || !req.body.slug) {
      return res.status(400).json({ error: 'slug is required' });
    }

    const exists = initiatives.some((item) => item.slug === req.body.slug);
    if (exists) {
      return res.status(400).json({ error: 'Initiative slug already exists' });
    }

    initiatives.push(req.body);

    await fs.writeFile(initiativesPath, JSON.stringify(initiatives, null, 2), 'utf-8');

    return res.status(201).json(req.body);
  } catch (error) {
    console.error('Error creating initiative:', error);
    return res.status(500).json({ error: error.message });
  }
}