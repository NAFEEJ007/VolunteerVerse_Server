const User = require('../models/User');
const Event = require('../models/Event');

// Get volunteer statistics
exports.getVolunteerStats = async (req, res) => {
    try {
        // Get all volunteers with their scores
        const volunteers = await User.find({ role: 'volunteer' })
            .select('displayName email score joinedEvents')
            .populate('joinedEvents', 'title')
            .lean();

        // Sort by score descending
        volunteers.sort((a, b) => (b.score || 0) - (a.score || 0));

        res.status(200).json(volunteers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get certificate data for a volunteer
exports.getCertificateData = async (req, res) => {
    try {
        const { userId } = req.params;

        const volunteer = await User.findById(userId)
            .select('displayName username email score joinedEvents')
            .populate('joinedEvents', 'title')
            .lean();

        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }

        // Get organizer info
        const organizer = await User.findById(req.user.dbId)
            .select('displayName')
            .lean();

        // Resolve volunteer name: prioritize displayName, then username
        let volunteerName = volunteer.displayName;

        // Handle case where displayName is the string "undefined" or empty
        if (!volunteerName || volunteerName === 'undefined') {
            volunteerName = volunteer.username;
        }

        // If username is also "undefined" or empty, fallback to email part
        if (!volunteerName || volunteerName === 'undefined') {
            volunteerName = volunteer.email.split('@')[0];
        }

        const certificateData = {
            volunteerName: volunteerName,
            score: volunteer.score || 0,
            eventsCompleted: volunteer.joinedEvents?.length || 0,
            organizerName: organizer.displayName || 'VolunteerVerse',
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            achievement: 'Outstanding Volunteer'
        };

        res.status(200).json(certificateData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get event requests (default: only pending). Any authenticated user can view; UI limits to organizers.
exports.getEventRequests = async (req, res) => {
    try {
        console.log('=== GET EVENT REQUESTS (AGGREGATED) ===');

        // Use aggregation to flatten requests for reliable results
        const pipeline = [
            { $match: { 'requests.0': { $exists: true } } },
            { $unwind: '$requests' },
            // Filter to only show pending requests
            { $match: { 'requests.status': 'pending' } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'requests.user',
                    foreignField: '_id',
                    as: 'volunteer'
                }
            },
            { $unwind: { path: '$volunteer', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'organizer',
                    foreignField: '_id',
                    as: 'eventOrganizer'
                }
            },
            { $unwind: { path: '$eventOrganizer', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: '$requests._id',
                    eventId: '$_id',
                    eventTitle: '$title',
                    eventDate: '$date',
                    eventLocation: '$location',
                    status: '$requests.status',
                    createdAt: { $ifNull: ['$requests.createdAt', '$createdAt'] },
                    volunteer: {
                        _id: '$volunteer._id',
                        displayName: '$volunteer.displayName',
                        email: '$volunteer.email',
                        photoURL: '$volunteer.photoURL',
                        score: '$volunteer.score'
                    },
                    eventOrganizer: {
                        _id: '$eventOrganizer._id',
                        displayName: '$eventOrganizer.displayName',
                        email: '$eventOrganizer.email'
                    }
                }
            },
            { $sort: { createdAt: -1 } }
        ];

        const requests = await Event.aggregate(pipeline);
        console.log('Requests found via aggregation:', requests.length);
        console.log('=========================');

        res.status(200).json(requests);
    } catch (error) {
        console.error('Error in getEventRequests:', error);
        res.status(500).json({ message: error.message });
    }
};

// Summary endpoint: counts of requests by status to help debugging visibility issues
exports.getEventRequestsSummary = async (req, res) => {
    try {
        const pipeline = [
            { $unwind: '$requests' },
            { $group: { _id: '$requests.status', count: { $sum: 1 } } },
            { $project: { status: '$_id', count: 1, _id: 0 } }
        ];
        const summary = await Event.aggregate(pipeline);
        const totals = summary.reduce((acc, cur) => { acc[cur.status] = cur.count; return acc; }, {});
        res.status(200).json({ totals });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Approve event join request
exports.approveEventRequest = async (req, res) => {
    try {
        const { eventId, requestId } = req.params;

        // Any organizer can approve requests
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Find the request
        const request = event.requests.id(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Request has already been processed' });
        }

        // Update request status
        request.status = 'approved';

        // Add volunteer to event
        if (!event.volunteers.includes(request.user)) {
            event.volunteers.push(request.user);
        }

        await event.save();

        // Update volunteer's joined events and score using findByIdAndUpdate to avoid validation errors on other fields
        const volunteer = await User.findByIdAndUpdate(
            request.user,
            {
                $addToSet: { joinedEvents: eventId },
                $inc: { score: 10 }
            },
            { new: true }
        );

        res.status(200).json({
            message: 'Request approved successfully',
            event,
            newScore: volunteer ? volunteer.score : 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reject event join request
exports.rejectEventRequest = async (req, res) => {
    try {
        const { eventId, requestId } = req.params;

        // Any organizer can reject requests
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Find and remove the request
        const request = event.requests.id(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Remove the request from the array
        event.requests.pull(requestId);
        await event.save();

        res.status(200).json({
            message: 'Request rejected successfully',
            event
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
