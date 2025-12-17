require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Article = require('../models/Article');

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not set in .env');
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const evResult = await Event.updateMany({ status: { $ne: 'approved' } }, { $set: { status: 'approved' } });
    console.log(`Events modified: ${evResult.modifiedCount || evResult.nModified || evResult.modified || 0}`);

    const artResult = await Article.updateMany({ status: { $ne: 'approved' } }, { $set: { status: 'approved' } });
    console.log(`Articles modified: ${artResult.modifiedCount || artResult.nModified || artResult.modified || 0}`);

    await mongoose.disconnect();
    console.log('Done. Disconnected.');
    process.exit(0);
  } catch (err) {
    console.error('Error in approveContent script:', err);
    process.exit(1);
  }
}

run();
