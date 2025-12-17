const express = require('express');
const router = express.Router();
const organizerController = require('../controllers/organizerController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Organizer routes are working!' });
});

// Get volunteer statistics (organizer/admin only)
router.get('/volunteer-stats', verifyToken, checkRole(['organizer', 'admin']), organizerController.getVolunteerStats);

// Get certificate data for a volunteer (organizer/admin only)
router.get('/certificate/:userId', verifyToken, checkRole(['organizer', 'admin']), organizerController.getCertificateData);

// Get all event requests (any authenticated user can list; UI limits to organizers)
router.get('/event-requests', verifyToken, organizerController.getEventRequests);

// Debugging helper: summary counts of event requests by status
router.get('/event-requests/summary', verifyToken, organizerController.getEventRequestsSummary);

// Approve event join request
router.post('/event-requests/:eventId/:requestId/approve', verifyToken, checkRole(['organizer', 'admin']), organizerController.approveEventRequest);

// Reject event join request
router.delete('/event-requests/:eventId/:requestId/reject', verifyToken, checkRole(['organizer', 'admin']), organizerController.rejectEventRequest);

module.exports = router;
