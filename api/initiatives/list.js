import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const initiativesPath = path.join(__dirname, '..', '..', '..', 'initiatives.json');

export default async function handler(req, res) {
  try {
    const raw = await fs.readFile(initiativesPath, 'utf-8');
    const initiatives = JSON.parse(raw);

    return res.status(200).json({
      initiatives,
      total: initiatives.length,
      page: 1,
      limit: initiatives.length,
    });
  } catch (error) {
    console.error('Error listing initiatives:', error);
    return res.status(500).json({ error: 'Failed to list initiatives' });
  }
}