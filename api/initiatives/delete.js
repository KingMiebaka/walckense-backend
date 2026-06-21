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
    const initiatives = raw.trim() ? JSON.parse(raw) : [];

    const filtered = initiatives.filter((item) => item.slug !== slug);

    if (filtered.length === initiatives.length) {
      return res.status(404).json({ error: 'Initiative not found' });
    }

    await fs.writeFile(initiativesPath, JSON.stringify(filtered, null, 2), 'utf-8');

    return res.status(200).json({ message: 'Initiative deleted successfully' });
  } catch (error) {
    console.error('Error deleting initiative:', error);
    return res.status(500).json({ error: error.message });
  }
}