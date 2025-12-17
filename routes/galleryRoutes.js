const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { getAllImages, uploadImage } = require('../controllers/galleryController');

router.get('/', getAllImages);
router.post('/', verifyToken, checkRole(['organizer', 'admin']), uploadImage);

module.exports = router;
