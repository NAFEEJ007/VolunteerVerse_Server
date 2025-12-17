const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Event = require('./models/Event');
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected');

    const events = await Event.find({}).select('title organizer requests createdAt').lean();
    console.log(`Events: ${events.length}`);
    for (const e of events) {
      const org = await User.findById(e.organizer).select('email displayName').lean();
      console.log(`- ${e.title} | organizer=${org?.email || org?._id} | requests=${e.requests?.length || 0}`);
      if (e.requests && e.requests.length) {
        for (const r of e.requests) {
          const u = await User.findById(r.user).select('email displayName').lean();
          console.log(`   • req ${r._id} status=${r.status} user=${u?.email || r.user}`);
        }
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
