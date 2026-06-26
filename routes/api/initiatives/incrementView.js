import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'initiatives.json');

export default async (req, res) => {
  try {
    // Check method
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get slug from URL PARAMETER (not body)
    const slug = req.query.slug;

    if (!slug) {
      return res.status(400).json({ error: 'Slug is required' });
    }

    console.log(`Incrementing view for: ${slug}`);

    // Read initiatives data
    let data;
    try {
      data = await fs.readFile(DATA_FILE, 'utf8');
    } catch (readError) {
      console.error('Error reading file:', readError);
      return res.status(500).json({ error: 'Cannot read initiatives file' });
    }

    let initiatives;
    try {
      initiatives = JSON.parse(data);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return res.status(500).json({ error: 'Invalid JSON in initiatives file' });
    }

    // Find and increment view
    const index = initiatives.findIndex(i => i.slug === slug);

    if (index === -1) {
      console.log(`Initiative not found: ${slug}`);
      console.log('Available slugs:', initiatives.map(i => i.slug));
      return res.status(404).json({ error: 'Initiative not found' });
    }

    // Increment views
    initiatives[index].views = (initiatives[index].views || 0) + 1;
    const newViews = initiatives[index].views;

    // Write back to file
    try {
      await fs.writeFile(DATA_FILE, JSON.stringify(initiatives, null, 2));
    } catch (writeError) {
      console.error('Error writing file:', writeError);
      return res.status(500).json({ error: 'Cannot write to initiatives file' });
    }

    console.log(`View incremented successfully. New count: ${newViews}`);

    return res.status(200).json({ 
      success: true, 
      views: newViews,
      slug: slug
    });

  } catch (error) {
    console.error('Error incrementing view:', error);
    return res.status(500).json({ error: error.message });
  }
};