import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const initiativesPath = path.join(__dirname, '..', '..', '..', 'initiatives.json');

export default async function handler(req, res) {
  try {
    const { slug } = req.params;

    const raw = await fs.readFile(initiativesPath, 'utf-8');
    const initiatives = JSON.parse(raw);

    const initiative = initiatives.find((item) => item.slug === slug);

    if (!initiative) {
      return res.status(404).json({ error: 'Initiative not found' });
    }

    return res.status(200).json(initiative);
  } catch (error) {
    console.error('Error fetching initiative:', error);
    return res.status(500).json({ error: 'Failed to fetch initiative' });
  }
}