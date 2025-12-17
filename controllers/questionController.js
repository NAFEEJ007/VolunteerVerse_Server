const Question = require('../models/Question');

// Get all approved questions
const getApprovedQuestions = async (req, res) => {
    try {
        const questions = await Question.find({ status: 'approved' })
            .populate('author', 'displayName email')
            .populate('answers.author', 'displayName email')
            .populate('answers.comments.author', 'displayName email')
            .sort({ createdAt: -1 });
        res.json(questions);
    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all questions (organizer/admin only)
const getAllQuestions = async (req, res) => {
    try {
        const questions = await Question.find()
            .populate('author', 'displayName email role')
            .populate('answers.author', 'displayName email')
            .populate('answers.comments.author', 'displayName email')
            .sort({ createdAt: -1 });
        res.json(questions);
    } catch (error) {
        console.error('Get all questions error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get pending questions (organizer/admin only)
const getPendingQuestions = async (req, res) => {
    try {
        const questions = await Question.find({ status: 'pending' })
            .populate('author', 'displayName email')
            .populate('answers.author', 'displayName email')
            .populate('answers.comments.author', 'displayName email')
            .sort({ createdAt: -1 });
        res.json(questions);
    } catch (error) {
        console.error('Get pending questions error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create question
const createQuestion = async (req, res) => {
    try {
        const { question } = req.body;

        const newQuestion = new Question({
            question,
            author: req.user.dbId,
            status: 'pending'
        });

        await newQuestion.save();
        res.status(201).json({ message: 'Question submitted for approval', question: newQuestion });
    } catch (error) {
        console.error('Create question error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Approve question (organizer/admin only)
const approveQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        ).populate('author', 'displayName email');

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json({ message: 'Question approved', question });
    } catch (error) {
        console.error('Approve question error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Reject question (organizer/admin only)
const rejectQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        ).populate('author', 'displayName email');

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json({ message: 'Question rejected', question });
    } catch (error) {
        console.error('Reject question error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete question (organizer/admin only)
const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json({ message: 'Question deleted' });
    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add answer to question
const addAnswer = async (req, res) => {
    try {
        const { text } = req.body;
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        if (question.status !== 'approved') {
            return res.status(403).json({ message: 'Cannot answer unapproved question' });
        }

        question.answers.push({
            text,
            author: req.user.dbId
        });

        await question.save();
        await question.populate('answers.author', 'displayName email');

        res.json({ message: 'Answer added', question });
    } catch (error) {
        console.error('Add answer error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add comment to answer
const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const { id, answerId } = req.params;

        const question = await Question.findById(id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const answer = question.answers.id(answerId);

        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        answer.comments.push({
            text,
            author: req.user.dbId
        });

        await question.save();
        await question.populate('answers.comments.author', 'displayName email');

        res.json({ message: 'Comment added', question });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete answer (organizer/admin can delete any, volunteers can delete own)
const deleteAnswer = async (req, res) => {
    try {
        const { id, answerId } = req.params;
        const question = await Question.findById(id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const answer = question.answers.id(answerId);
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        // Check if user is organizer/admin or owner
        const isOrganizerOrAdmin = ['organizer', 'admin'].includes(req.user.role);
        const isOwner = answer.author.toString() === req.user.dbId.toString();

        if (!isOrganizerOrAdmin && !isOwner) {
            return res.status(403).json({ message: 'Not authorized to delete this answer' });
        }

        question.answers.pull(answerId);
        await question.save();

        res.json({ message: 'Answer deleted', question });
    } catch (error) {
        console.error('Delete answer error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete comment (organizer/admin can delete any, volunteers can delete own)
const deleteComment = async (req, res) => {
    try {
        const { id, answerId, commentId } = req.params;
        const question = await Question.findById(id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const answer = question.answers.id(answerId);
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        const comment = answer.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if user is organizer/admin or owner
        const isOrganizerOrAdmin = ['organizer', 'admin'].includes(req.user.role);
        const isOwner = comment.author.toString() === req.user.dbId.toString();

        if (!isOrganizerOrAdmin && !isOwner) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        answer.comments.pull(commentId);
        await question.save();

        res.json({ message: 'Comment deleted', question });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getApprovedQuestions,
    getAllQuestions,
    getPendingQuestions,
    createQuestion,
    approveQuestion,
    rejectQuestion,
    deleteQuestion,
    addAnswer,
    addComment,
    deleteAnswer,
    deleteComment
};
