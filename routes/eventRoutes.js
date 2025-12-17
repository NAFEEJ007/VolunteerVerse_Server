const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { getAllEvents, getEventById, createEvent, joinEvent, donateToEvent } = require('../controllers/eventController');

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes
router.post('/', verifyToken, checkRole(['organizer', 'admin']), createEvent);
router.post('/:id/join', verifyToken, checkRole(['volunteer']), joinEvent);
router.post('/:id/donate', verifyToken, checkRole(['volunteer']), donateToEvent);

module.exports = router;
