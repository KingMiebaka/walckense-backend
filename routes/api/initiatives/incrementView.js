// backend/routes/api/initiatives/incrementView.js

import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'initiatives.json');

export default async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { slug } = req.body;

    if (!slug) {
      return res.status(400).json({ error: 'Slug is required' });
    }

    // Read initiatives data
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const initiatives = JSON.parse(data);

    // Find and increment view
    const initiative = initiatives.find(i => i.slug === slug);

    if (!initiative) {
      return res.status(404).json({ error: 'Initiative not found' });
    }

    // Increment views
    initiative.views = (initiative.views || 0) + 1;

    // Update data
    const updatedIndex = initiatives.findIndex(i => i.slug === slug);
    initiatives[updatedIndex] = initiative;

    // Write back to file
    await fs.writeFile(DATA_FILE, JSON.stringify(initiatives, null, 2), 'utf8');

    return res.status(200).json({ 
      success: true, 
      views: initiative.views 
    });

  } catch (error) {
    console.error('Error incrementing view:', error);
    return res.status(500).json({ error: 'Failed to increment view' });
  }
};