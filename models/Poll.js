const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    options: [{
        text: String,
        votes: {
            type: Number,
            default: 0,
        },
    }],
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    voters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
});

module.exports = mongoose.model('Poll', pollSchema);
