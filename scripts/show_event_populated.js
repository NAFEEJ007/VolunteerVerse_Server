const mongoose = require('mongoose');
require('dotenv').config();

const Event = require('../models/Event');
const User = require('../models/User');

async function run() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI not set in environment. Please set it in server/.env');
    process.exit(1);
  }

  const id = process.argv[2] || '69426acf7f3b030c0e7103c9';

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const ev = await Event.findById(id)
      .populate('organizer', 'displayName email')
      .populate('volunteers', 'displayName email')
      .populate('requests.user', 'displayName email username')
      .lean();

    if (!ev) {
      console.log('Event not found for id', id);
      process.exit(0);
    }

    console.log('Event populated:', JSON.stringify(ev, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error fetching event:', err);
    process.exit(1);
  }
}

run();
