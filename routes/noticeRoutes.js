const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const auth = require('../middleware/authMiddleware');

// Public route to get notices (or protected if only for logged in users)
// Assuming volunteers need to be logged in to see notices
router.get('/', noticeController.getNotices);


// Protected routes
router.post('/', auth.verifyToken, noticeController.createNotice); // Only for organizers/admins ideally
router.post('/poll', auth.verifyToken, noticeController.createPoll); // Create poll (organizers)
router.post('/mark-read', auth.verifyToken, noticeController.markNoticesAsRead);
router.post('/poll/:pollId/vote', auth.verifyToken, noticeController.votePoll);

// Admin-only: delete notice
router.delete('/:id', auth.verifyToken, auth.checkRole(['admin']), noticeController.deleteNotice);

module.exports = router;
