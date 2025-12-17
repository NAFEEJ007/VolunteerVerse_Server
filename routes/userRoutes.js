const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { createUser, getCurrentUser, getUserById } = require('../controllers/userController');

// Public route - create user (called after Firebase signup)
router.post('/', createUser);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);
router.get('/:id', verifyToken, getUserById);

module.exports = router;
