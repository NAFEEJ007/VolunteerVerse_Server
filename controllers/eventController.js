const Event = require('../models/Event');
const User = require('../models/User');
const Donation = require('../models/Donation');

// Get all approved events
const getAllEvents = async (req, res) => {
    try {
        // Only show approved events to volunteers and public
        const events = await Event.find({ status: 'approved' })
            .populate('organizer', 'displayName email')
            .sort({ date: 1 });
        res.json(events);
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get event by ID
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'displayName email')
            .populate('volunteers', 'displayName email')
            // populate the user reference inside requests so organizers can see who requested
            .populate('requests.user', 'displayName email username');

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create event (Organizer/Admin)
const createEvent = async (req, res) => {
    try {
        const { title, description, category, date, location, image, capacity, fundraiserLink } = req.body;

        // Organizer events are always pending, admin events can be approved directly
        let eventStatus = 'pending';
        if (req.user.role === 'admin') {
            eventStatus = 'approved';
        }
        const event = new Event({
            title,
            description,
            category,
            date,
            location,
            image,
            capacity,
            fundraiserLink,
            organizer: req.user.dbId,
            status: eventStatus
        });

        await event.save();
        res.status(201).json(event);
    } catch (error) {
        console.error('Create event error:', error);
        // If validation error, return 400 to the client with validation details
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', error: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Request to join event (Volunteer)
const joinEvent = async (req, res) => {
    try {
        console.log('Join event request received for event:', req.params.id);
        console.log('User:', req.user.dbId);
        
        const event = await Event.findById(req.params.id);

        if (!event) {
            console.log('Event not found');
            return res.status(404).json({ message: 'Event not found' });
        }

        console.log('Event found:', event.title);
        console.log('Current requests:', event.requests.length);

        // Check if already joined or requested
        const alreadyJoined = event.volunteers.includes(req.user.dbId);
        const alreadyRequested = event.requests.some(r => r.user.toString() === req.user.dbId.toString());

        console.log('Already joined?', alreadyJoined);
        console.log('Already requested?', alreadyRequested);

        if (alreadyJoined) {
            return res.status(400).json({ message: 'Already joined this event' });
        }

        if (alreadyRequested) {
            return res.status(400).json({ message: 'Request already pending' });
        }

        // Add join request
        event.requests.push({ user: req.user.dbId, status: 'pending' });
        await event.save();

        console.log('Request added successfully. Total requests now:', event.requests.length);

        res.json({ message: 'Join request sent successfully' });
    } catch (error) {
        console.error('Join event error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Donate to event
const donateToEvent = async (req, res) => {
    try {
        const { amount } = req.body;
        const eventId = req.params.id;

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: 'Invalid donation amount' });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const donation = new Donation({
            donor: req.user.dbId,
            event: eventId,
            amount: Number(amount)
        });

        await donation.save();

        res.json({ message: 'Donation successful', donation });
    } catch (error) {
        console.error('Donation error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    joinEvent,
    donateToEvent
};
