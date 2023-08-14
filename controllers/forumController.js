const Post = require('../models/Post');
const Comment = require('../models/Comment');

// Create a new post
exports.createPost = async (req, res) => {
  const { title, content, user_id } = req.body;

  try {
    const newPost = await Post.create({
      title,
      content,
      user_id,
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: Comment,
          as: 'comments',
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new comment
exports.createComment = async (req, res) => {
  const { content, user_id, post_id } = req.body;

  try {
    const newComment = await Comment.create({
      content,
      user_id,
      post_id,
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
