const User = require('../models/User');
const Event = require('../models/Event');
const Donation = require('../models/Donation');

// Get joined events
const getJoinedEvents = async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.user.uid }).populate('joinedEvents');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.joinedEvents || []);
    } catch (error) {
        console.error('Get joined events error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get requested events (pending join requests)
const getRequestedEvents = async (req, res) => {
    try {
        const events = await Event.find({
            'requests.user': req.user.dbId,
            'requests.status': 'pending'
        }).populate('organizer', 'displayName email');

        res.json(events);
    } catch (error) {
        console.error('Get requested events error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get donations
const getDonations = async (req, res) => {
    try {
        const donations = await Donation.find({ donor: req.user.dbId })
            .populate('event', 'title')
            .sort({ date: -1 });

        const total = donations.reduce((sum, donation) => sum + donation.amount, 0);

        res.json({
            donations,
            total
        });
    } catch (error) {
        console.error('Get donations error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getJoinedEvents,
    getRequestedEvents,
    getDonations
};
