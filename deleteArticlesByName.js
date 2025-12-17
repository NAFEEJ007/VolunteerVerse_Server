const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Article = require('./models/Article');

dotenv.config();

const articleNames = [
  'How Beach Cleanups Help Our Environment'
];

async function deleteArticles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const result = await Article.deleteMany({ title: { $in: articleNames } });
    console.log(`Deleted ${result.deletedCount} articles.`);
  } catch (err) {
    console.error('Error deleting articles:', err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

deleteArticles();
