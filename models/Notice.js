const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['announcement', 'alert', 'info'],
        default: 'announcement',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    isAdminNotice: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model('Notice', noticeSchema);
