const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 50,
        match: /^[a-zA-Z\s]+$/,
    },
    role: {
        type: String,
        enum: ['volunteer', 'organizer', 'admin'],
        default: 'volunteer',
    },
    displayName: String,
    photoURL: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    // Volunteer specific
    score: {
        type: Number,
        default: 0,
    },
    joinedEvents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
    }],
    bookmarkedEvents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
    }],
    isBanned: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model('User', userSchema);
