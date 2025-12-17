const User = require('../models/User');

// Toggle bookmark
const toggleBookmark = async (req, res) => {
    try {
        const { eventId } = req.params;
        console.log(`Toggle bookmark request for event: ${eventId}, User UID: ${req.user.uid}`);

        // Validate eventId
        if (!eventId || !eventId.match(/^[0-9a-fA-F]{24}$/)) {
             console.log('Invalid Event ID format');
             return res.status(400).json({ message: 'Invalid Event ID' });
        }

        let user;
        if (req.user.dbId) {
            user = await User.findById(req.user.dbId);
        } else {
            console.log('No dbId in req.user, falling back to uid lookup');
            user = await User.findOne({ uid: req.user.uid });
        }

        if (!user) {
            console.log('User not found in database');
            return res.status(404).json({ message: 'User not found in database. Please try logging out and back in.' });
        }

        // Initialize array if it doesn't exist
        if (!user.bookmarkedEvents) {
            user.bookmarkedEvents = [];
        }

        // Check if already bookmarked
        // We convert both to strings to ensure accurate comparison
        const bookmarkIndex = user.bookmarkedEvents.findIndex(id => id && id.toString() === eventId);

        if (bookmarkIndex > -1) {
            // Remove bookmark
            await User.findByIdAndUpdate(user._id, { $pull: { bookmarkedEvents: eventId } });
            console.log('Bookmark removed');
            return res.json({ bookmarked: false, message: 'Bookmark removed' });
        } else {
            // Add bookmark
            await User.findByIdAndUpdate(user._id, { $addToSet: { bookmarkedEvents: eventId } });
            console.log('Event bookmarked');
            return res.json({ bookmarked: true, message: 'Event bookmarked' });
        }
    } catch (error) {
        console.error('Toggle bookmark error:', error);
        // Return the actual error message to the client for debugging
        res.status(500).json({ message: `Server error: ${error.message}`, error: error.message });
    }
};

// Get user's bookmarked events
const getBookmarkedEvents = async (req, res) => {
    try {
        let user;
        if (req.user.dbId) {
            user = await User.findById(req.user.dbId).populate('bookmarkedEvents');
        } else {
            user = await User.findOne({ uid: req.user.uid }).populate('bookmarkedEvents');
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.bookmarkedEvents || []);
    } catch (error) {
        console.error('Get bookmarks error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    toggleBookmark,
    getBookmarkedEvents
};
