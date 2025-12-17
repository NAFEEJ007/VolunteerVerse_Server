const User = require('../models/User');
const Event = require('../models/Event');
const Notice = require('../models/Notice');

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        const pendingEventsCount = await Event.countDocuments({ status: 'pending' });
        const totalUsersCount = await User.countDocuments();
        const activeNoticesCount = await Notice.countDocuments({ isAdminNotice: true });
        const totalEventsCount = await Event.countDocuments();

        res.status(200).json({
            pendingEventsCount,
            totalUsersCount,
            activeNoticesCount,
            totalEventsCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all pending events
exports.getPendingEvents = async (req, res) => {
    try {
        const events = await Event.find({ status: 'pending' })
            .populate('organizer', 'displayName email')
            .sort({ createdAt: -1 });

        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Approve event
exports.approveEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findByIdAndUpdate(
            id,
            { status: 'approved' },
            { new: true }
        ).populate('organizer', 'displayName email');

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ message: 'Event approved successfully', event });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete event
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findByIdAndDelete(id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('displayName email role isBanned createdAt score')
            .sort({ createdAt: -1 });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ban user
exports.banUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndUpdate(
            id,
            { isBanned: true },
            { new: true }
        ).select('displayName email role isBanned');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User banned successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Unban user
exports.unbanUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndUpdate(
            id,
            { isBanned: false },
            { new: true }
        ).select('displayName email role isBanned');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User unbanned successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create and publish event directly
exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, location, image, status } = req.body;
        if (!req.user || !req.user._id) {
            console.error('Create event error: req.user is missing or invalid');
            return res.status(401).json({ message: 'Unauthorized: user not found in request' });
        }
        const organizer = req.user._id; // admin user creating the event
        const event = new Event({
            title,
            description,
            date,
            location,
            image,
            status: status || 'approved',
            organizer
        });
        await event.save();
        res.status(201).json({ message: 'Event created and published', event });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
