const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const {
    getApprovedArticles,
    getAllArticles,
    getPendingArticles,
    createArticle,
    approveArticle,
    rejectArticle,
    deleteArticle
} = require('../controllers/articleController');

// Public routes
router.get('/', getApprovedArticles);

// Volunteer routes
router.post('/', verifyToken, createArticle);

// Organizer/Admin routes
router.get('/all', verifyToken, checkRole(['organizer', 'admin']), getAllArticles);
router.get('/pending', verifyToken, checkRole(['organizer', 'admin']), getPendingArticles);
router.put('/:id/approve', verifyToken, checkRole(['organizer', 'admin']), approveArticle);
router.put('/:id/reject', verifyToken, checkRole(['organizer', 'admin']), rejectArticle);
router.delete('/:id', verifyToken, checkRole(['organizer', 'admin']), deleteArticle);

module.exports = router;
