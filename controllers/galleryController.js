const Gallery = require('../models/Gallery');

// Get all gallery images
const getAllImages = async (req, res) => {
    try {
        const images = await Gallery.find()
            .populate('event', 'title')
            .populate('uploader', 'displayName email')
            .sort({ createdAt: -1 });
        res.json(images);
    } catch (error) {
        console.error('Get images error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Upload image (Organizer/Admin only)
const uploadImage = async (req, res) => {
    try {
        const { imageUrl, url, caption, event } = req.body;

        // Accept both 'url' and 'imageUrl' for backward compatibility
        const finalImageUrl = imageUrl || url;

        if (!finalImageUrl) {
            return res.status(400).json({ message: 'Image URL is required' });
        }

        const image = new Gallery({
            imageUrl: finalImageUrl,
            caption,
            event,
            uploader: req.user.dbId
        });

        await image.save();
        res.status(201).json({ message: 'Image uploaded', image });
    } catch (error) {
        console.error('Upload image error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllImages,
    uploadImage
};
