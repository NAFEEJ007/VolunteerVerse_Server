// Delete a notice by ID (admin only)
exports.deleteNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Notice.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Notice not found' });
        }
        res.status(200).json({ message: 'Notice deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const Notice = require('../models/Notice');
const Poll = require('../models/Poll');

// Get all notices and polls combined
exports.getNotices = async (req, res) => {
    try {
        const userId = req.query.userId; // Optional: to check read status

        const notices = await Notice.find().populate('author', 'displayName role').lean();
        const polls = await Poll.find().populate('organizer', 'displayName role').lean();

        // Add type field and read status
        const formattedNotices = notices.map(n => ({
            ...n,
            itemType: 'notice',
            isRead: userId ? n.readBy.some(id => id.toString() === userId) : false
        }));

        const formattedPolls = polls.map(p => ({
            ...p,
            itemType: 'poll',
            isRead: userId ? p.readBy.some(id => id.toString() === userId) : false
        }));

        // Combine and sort by createdAt descending
        const allItems = [...formattedNotices, ...formattedPolls].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        res.status(200).json(allItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark notices/polls as read
exports.markNoticesAsRead = async (req, res) => {
    try {
        const { itemIds } = req.body; // Array of {id, type} objects
        const userId = req.user.dbId; // From auth middleware

        if (!itemIds || !Array.isArray(itemIds)) {
            return res.status(400).json({ message: 'itemIds must be an array' });
        }

        // Update notices
        const noticeIds = itemIds.filter(item => item.type === 'notice').map(item => item.id);
        if (noticeIds.length > 0) {
            await Notice.updateMany(
                { _id: { $in: noticeIds }, readBy: { $ne: userId } },
                { $addToSet: { readBy: userId } }
            );
        }

        // Update polls
        const pollIds = itemIds.filter(item => item.type === 'poll').map(item => item.id);
        if (pollIds.length > 0) {
            await Poll.updateMany(
                { _id: { $in: pollIds }, readBy: { $ne: userId } },
                { $addToSet: { readBy: userId } }
            );
        }

        res.status(200).json({ message: 'Notices marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a notice (for testing/admin use)
exports.createNotice = async (req, res) => {
    try {
        const { title, content, type } = req.body;
        const newNotice = new Notice({
            title,
            content,
            type,
            author: req.user.dbId,
            readBy: [], // Initialize as empty
            isAdminNotice: req.user.role === 'admin' // Mark as admin notice if created by admin
        });
        const savedNotice = await newNotice.save();
        res.status(201).json(savedNotice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Vote on a poll
exports.votePoll = async (req, res) => {
    try {
        const { pollId } = req.params;
        const { optionIndex } = req.body;
        const userId = req.user.dbId;

        const poll = await Poll.findById(pollId);
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        if (poll.voters.includes(userId)) {
            return res.status(400).json({ message: 'You have already voted on this poll' });
        }

        poll.options[optionIndex].votes += 1;
        poll.voters.push(userId);
        await poll.save();

        res.status(200).json(poll);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a poll (for organizers)
exports.createPoll = async (req, res) => {
    try {
        const { question, options } = req.body;

        if (!question || !options || options.length < 2) {
            return res.status(400).json({ message: 'Question and at least 2 options are required' });
        }

        const formattedOptions = options.map(text => ({
            text,
            votes: 0
        }));

        const newPoll = new Poll({
            question,
            options: formattedOptions,
            organizer: req.user.dbId,
            voters: [],
            readBy: []
        });

        const savedPoll = await newPoll.save();
        res.status(201).json(savedPoll);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
