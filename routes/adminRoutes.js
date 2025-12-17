const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All routes require admin role
const adminOnly = [verifyToken, checkRole(['admin'])];

// Dashboard stats
router.get('/stats', adminOnly, adminController.getDashboardStats);

// Event moderation
router.get('/events/pending', adminOnly, adminController.getPendingEvents);
router.post('/events/:id/approve', adminOnly, adminController.approveEvent);
router.delete('/events/:id', adminOnly, adminController.deleteEvent);
// Event creation
router.post('/events/create', adminOnly, adminController.createEvent);

// User management
router.get('/users', adminOnly, adminController.getAllUsers);
router.put('/users/:id/ban', adminOnly, adminController.banUser);
router.put('/users/:id/unban', adminOnly, adminController.unbanUser);

module.exports = router;
