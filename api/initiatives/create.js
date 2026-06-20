// api/initiatives/create.js
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'initiatives.json');

export default async (req, res) => {
  try {
    let initiatives = [];
    
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      initiatives = JSON.parse(data);
    }
    
    initiatives.push(req.body);
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(initiatives, null, 2));
    
    res.status(201).json(req.body);
  } catch (err) {
    console.error('Error creating initiative:', err.message);
    res.status(400).json({ error: err.message });
  }
};