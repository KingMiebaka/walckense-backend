import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'initiatives.json');

export default async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const slug = req.query.slug;

    if (!slug) {
      console.log('No slug provided');
      return res.status(400).json({ error: 'Slug is required' });
    }

    console.log(`Incrementing view for: ${slug}`);

    let data;
    try {
      data = await fs.readFile(DATA_FILE, 'utf8');
    } catch (readError) {
      console.error('Read error:', readError.message);
      return res.status(500).json({ error: 'Cannot read file: ' + readError.message });
    }

    let initiatives;
    try {
      initiatives = JSON.parse(data);
    } catch (parseError) {
      console.error('Parse error:', parseError.message);
      return res.status(500).json({ error: 'Invalid JSON: ' + parseError.message });
    }

    const index = initiatives.findIndex(i => i.slug === slug);

    if (index === -1) {
      console.log(`Not found: ${slug}`);
      console.log('Available:', initiatives.map(i => i.slug));
      return res.status(404).json({ error: 'Initiative not found' });
    }

    initiatives[index].views = (initiatives[index].views || 0) + 1;
    const newViews = initiatives[index].views;

    await fs.writeFile(DATA_FILE, JSON.stringify(initiatives, null, 2));

    console.log(`Success! New count: ${newViews}`);

    return res.status(200).json({ 
      success: true, 
      views: newViews,
      slug: slug
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
};