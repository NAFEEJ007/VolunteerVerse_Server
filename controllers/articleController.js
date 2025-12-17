const Article = require('../models/Article');

// Get all approved articles
const getApprovedArticles = async (req, res) => {
    try {
        const articles = await Article.find({ status: 'approved' })
            .populate('author', 'displayName email')
            .sort({ createdAt: -1 });
        res.json(articles);
    } catch (error) {
        console.error('Get articles error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all articles (organizer/admin only)
const getAllArticles = async (req, res) => {
    try {
        const articles = await Article.find()
            .populate('author', 'displayName email role')
            .sort({ createdAt: -1 });
        res.json(articles);
    } catch (error) {
        console.error('Get all articles error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get pending articles (organizer/admin only)
const getPendingArticles = async (req, res) => {
    try {
        const articles = await Article.find({ status: 'pending' })
            .populate('author', 'displayName email')
            .sort({ createdAt: -1 });
        res.json(articles);
    } catch (error) {
        console.error('Get pending articles error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create article (Volunteer)
const createArticle = async (req, res) => {
    try {
        const { title, content, image } = req.body;

        const article = new Article({
            title,
            content,
            image,
            author: req.user.dbId,
            status: 'pending'
        });

        await article.save();
        res.status(201).json({ message: 'Article submitted for approval', article });
    } catch (error) {
        console.error('Create article error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Approve article (organizer/admin only)
const approveArticle = async (req, res) => {
    try {
        const article = await Article.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        ).populate('author', 'displayName email');

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        res.json({ message: 'Article approved', article });
    } catch (error) {
        console.error('Approve article error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Reject article (organizer/admin only)
const rejectArticle = async (req, res) => {
    try {
        const article = await Article.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        ).populate('author', 'displayName email');

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        res.json({ message: 'Article rejected', article });
    } catch (error) {
        console.error('Reject article error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete article (organizer/admin only)
const deleteArticle = async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id);

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        res.json({ message: 'Article deleted' });
    } catch (error) {
        console.error('Delete article error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getApprovedArticles,
    getAllArticles,
    getPendingArticles,
    createArticle,
    approveArticle,
    rejectArticle,
    deleteArticle
};
