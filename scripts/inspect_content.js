const mongoose = require('mongoose');
require('dotenv').config();

const Event = require('../models/Event');
const Article = require('../models/Article');
const Gallery = require('../models/Gallery');
const Notice = require('../models/Notice');
const Poll = require('../models/Poll');

async function run() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI not set in environment. Please set it in server/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const eventTotal = await Event.countDocuments();
    const eventApproved = await Event.countDocuments({ status: 'approved' });
    const eventPending = await Event.countDocuments({ status: 'pending' });

    console.log(`Events - total: ${eventTotal}, approved: ${eventApproved}, pending: ${eventPending}`);
    if (eventTotal > 0) {
      const one = await Event.findOne().limit(1).lean();
      console.log('Sample event (first):', one);
    }

    const artTotal = await Article.countDocuments();
    const artApproved = await Article.countDocuments({ status: 'approved' });
    const artPending = await Article.countDocuments({ status: 'pending' });
    console.log(`Articles - total: ${artTotal}, approved: ${artApproved}, pending: ${artPending}`);
    if (artTotal > 0) {
      const one = await Article.findOne().limit(1).lean();
      console.log('Sample article (first):', one);
    }

    const galleryTotal = await Gallery.countDocuments();
    console.log(`Gallery images - total: ${galleryTotal}`);
    if (galleryTotal > 0) {
      const one = await Gallery.findOne().limit(1).lean();
      console.log('Sample gallery (first):', one);
    }

    const noticeTotal = await Notice.countDocuments();
    const pollTotal = await Poll.countDocuments();
    console.log(`Notices - total: ${noticeTotal}, Polls - total: ${pollTotal}`);

    process.exit(0);
  } catch (err) {
    console.error('Error while inspecting documents:', err);
    process.exit(1);
  }
}

run();
