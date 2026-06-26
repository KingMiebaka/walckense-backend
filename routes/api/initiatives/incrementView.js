import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'initiatives.json');

export default async (req, res) => {
  try {
    // Check method
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get slug from QUERY PARAM (not URL)
    const slug = req.query.slug;

    if (!slug) {
      console.log('No slug provided in query');
      return res.status(400).json({ error: 'Slug is required in query parameter' });
    }

    console.log(`Incrementing view for: ${slug}`);

    // Read initiatives data
    let data;
    try {
      data = await fs.readFile(DATA_FILE, 'utf8');
      console.log('File read successfully');
    } catch (readError) {
      console.error('Error reading file:', readError.message);
      return res.status(500).json({ error: 'Cannot read initiatives file: ' + readError.message });
    }

    let initiatives;
    try {
      initiatives = JSON.parse(data);
      console.log(`JSON parsed, found ${initiatives.length} initiatives`);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError.message);
      return res.status(500).json({ error: 'Invalid JSON in initiatives file: ' + parseError.message });
    }

    // Find initiative
    const index = initiatives.findIndex(i => i.slug === slug);

    if (index === -1) {
      console.log(`Initiative not found: ${slug}`);
      console.log('Available slugs:', initiatives.map(i => i.slug));
      return res.status(404).json({ 
        error: 'Initiative not found',
        slug: slug,
        available: initiatives.map(i => i.slug)
      });
    }

    // Increment views
    initiatives[index].views = (initiatives[index].views || 0) + 1;
    const newViews = initiatives[index].views;

    // Write back to file
    try {
      await fs.writeFile(DATA_FILE, JSON.stringify(initiatives, null, 2));
      console.log('File written successfully');
    } catch (writeError) {
      console.error('Error writing file:', writeError.message);
      return res.status(500).json({ error: 'Cannot write to initiatives file: ' + writeError.message });
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