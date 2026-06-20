// api/initiatives/list.js
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'initiatives.json');

export default async (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const initiatives = JSON.parse(data);
    
    res.json({
      initiatives: initiatives,
      total: initiatives.length,
      page: 1,
      limit: initiatives.length
    });
  } catch (err) {
    console.error('Error listing initiatives:', err.message);
    res.status(500).json({ error: err.message });
  }
};