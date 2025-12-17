const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
console.log('DEBUG: MONGODB_URI is', process.env.MONGODB_URI);

const systemController = require('./controllers/systemController');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('MongoDB Connected');

        // Initialize system (create admin user, etc.)
        await systemController.initializeSystem();
    })
    .catch(err => console.log(err));

// Routes
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const articleRoutes = require('./routes/articleRoutes');
const questionRoutes = require('./routes/questionRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const myEventsRoutes = require('./routes/myEventsRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const organizerRoutes = require('./routes/organizerRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/my-events', myEventsRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/organizer', organizerRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', systemController.healthCheck);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
