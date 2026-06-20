
// api/initiatives/delete.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/walckense-initiatives';

if (!mongoose.connection.readyState) {
  mongoose.connect(MONGODB_URI);
}

const initiativeSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  shortSummary: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, required: true },
  status: { type: String, required: true },
  location: { type: String, required: true },
  fieldDate: { type: String, required: true },
  preparedBy: { type: String, required: true },
  preparedFor: { type: String },
  reportDate: { type: String, required: true },
  country: { type: String },
  state: { type: String },
  lga: { type: String },
  community: { type: String },
  sitesVisited: { type: Array, default: [] },
  gps: { type: Object, default: {} },
  geography: { type: Object, default: {} },
  keyFindings: { type: Array, default: [] },
  images: { type: Array, default: [] },
  immediateActions: { type: Array, default: [] },
  shortTermActions: { type: Array, default: [] },
  mediumTermActions: { type: Array, default: [] },
  ongoingActions: { type: Array, default: [] },
  chartData: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Initiative = mongoose.model('Initiative', initiativeSchema);

export default async (req, res) => {
  try {
    const initiative = await Initiative.findOneAndDelete({ slug: req.params.slug });
    
    if (!initiative) {
      return res.status(404).json({ error: 'Initiative not found' });
    }
    
    res.json({ message: 'Initiative deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};