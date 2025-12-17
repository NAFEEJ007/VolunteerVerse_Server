const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getJoinedEvents, getRequestedEvents, getDonations } = require('../controllers/myEventsController');
const { getBookmarkedEvents } = require('../controllers/bookmarkController');

router.get('/joined', verifyToken, getJoinedEvents);
router.get('/bookmarked', verifyToken, getBookmarkedEvents);
router.get('/requested', verifyToken, getRequestedEvents);
router.get('/donations', verifyToken, getDonations);

module.exports = router;
