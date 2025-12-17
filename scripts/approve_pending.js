const mongoose = require('mongoose');
require('dotenv').config();

const Event = require('../models/Event');
const Article = require('../models/Article');

async function run() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI not set in environment. Please set it in server/.env');
    process.exit(1);
  }

  try {
  // mongoose v6+ uses sensible defaults; avoid passing deprecated/unsupported options
  await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const eventResult = await Event.updateMany({ status: 'pending' }, { $set: { status: 'approved' } });
    console.log(`Events updated: ${eventResult.nModified ?? eventResult.modifiedCount ?? eventResult.n}`);

    const articleResult = await Article.updateMany({ status: 'pending' }, { $set: { status: 'approved' } });
    console.log(`Articles updated: ${articleResult.nModified ?? articleResult.modifiedCount ?? articleResult.n}`);

    console.log('Done. Exiting.');
    process.exit(0);
  } catch (err) {
    console.error('Error while updating documents:', err);
    process.exit(1);
  }
}

run();
