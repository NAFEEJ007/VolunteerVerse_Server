const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { toggleBookmark, getBookmarkedEvents } = require('../controllers/bookmarkController');

router.post('/:eventId', verifyToken, toggleBookmark);
router.get('/', verifyToken, getBookmarkedEvents);

module.exports = router;
