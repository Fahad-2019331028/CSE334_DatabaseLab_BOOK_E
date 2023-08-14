const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/authmiddleware');
const ForumPost = require('../models/Post');
const Comment = require('../models/Comment');

// @route   POST /api/forum/posts
// @desc    Create a new forum post
// @access  Private
router.post(
  '/posts',
  [
    auth, // Authenticate the user
    check('title', 'Title is required').notEmpty(),
    check('content', 'Content is required').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newPost = await ForumPost.create({
        title: req.body.title,
        content: req.body.content,
        user_id: req.user.id,
      });

      res.status(201).json(newPost);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/forum/posts
// @desc    Get all forum posts
// @access  Public
router.get('/posts', async (req, res) => {
  try {
    const posts = await ForumPost.findAll({
      include: Comment,
      order: [['createdAt', 'DESC']], // Order by time posted in descending order
    });

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/forum/posts/:postId/comment
// @desc    Add a comment to a forum post
// @access  Private
router.post(
  '/posts/:postId/comment',
  [
    auth, // Authenticate the user
    check('content', 'Comment content is required').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const post = await ForumPost.findByPk(req.params.postId);

      if (!post) {
        return res.status(400).json({ message: 'Post not found' });
      }

      const newComment = await Comment.create({
        content: req.body.content,
        user_id: req.user.id,
        forum_post_id: post.id,
      });

      res.status(201).json(newComment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
