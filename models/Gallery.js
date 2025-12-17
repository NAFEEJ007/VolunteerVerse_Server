const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true,
    },
    caption: String,
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Gallery', gallerySchema);
