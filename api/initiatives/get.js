// api/initiatives/get.js
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'initiatives.json');

export default async (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const initiatives = JSON.parse(data);
    
    const initiative = initiatives.find(i => i.slug === req.params.slug);
    
    if (!initiative) {
      return res.status(404).json({ error: 'Initiative not found' });
    }
    
    res.json(initiative);
  } catch (err) {
    console.error('Error fetching initiative:', err.message);
    res.status(500).json({ error: err.message });
  }
};