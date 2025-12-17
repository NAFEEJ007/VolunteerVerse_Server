const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const {
    getApprovedQuestions,
    getAllQuestions,
    getPendingQuestions,
    createQuestion,
    approveQuestion,
    rejectQuestion,
    deleteQuestion,
    addAnswer,
    addComment,
    deleteAnswer,
    deleteComment
} = require('../controllers/questionController');

// Public routes
router.get('/', getApprovedQuestions);

// Volunteer routes
router.post('/', verifyToken, createQuestion);
router.post('/:id/answers', verifyToken, addAnswer);
router.post('/:id/answers/:answerId/comments', verifyToken, addComment);

// Delete routes (volunteer can delete own, organizer/admin can delete any)
router.delete('/:id/answers/:answerId', verifyToken, deleteAnswer);
router.delete('/:id/answers/:answerId/comments/:commentId', verifyToken, deleteComment);

// Organizer/Admin routes
router.get('/all', verifyToken, checkRole(['organizer', 'admin']), getAllQuestions);
router.get('/pending', verifyToken, checkRole(['organizer', 'admin']), getPendingQuestions);
router.put('/:id/approve', verifyToken, checkRole(['organizer', 'admin']), approveQuestion);
router.put('/:id/reject', verifyToken, checkRole(['organizer', 'admin']), rejectQuestion);
router.delete('/:id', verifyToken, checkRole(['organizer', 'admin']), deleteQuestion);

module.exports = router;
