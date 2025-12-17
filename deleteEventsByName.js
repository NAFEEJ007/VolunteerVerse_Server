const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');

dotenv.config();

const eventNames = [
  'Persistent Test Event 1764862717460',
  'Beach Cleanup Campaign',
  'Stats Test Event 3',
  'Stats Test Event'
];

async function deleteEvents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const result = await Event.deleteMany({ title: { $in: eventNames } });
    console.log(`Deleted ${result.deletedCount} events.`);
  } catch (err) {
    console.error('Error deleting events:', err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

deleteEvents();
