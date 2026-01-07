import Comment from '../models/Comment.js';
import Activity from '../models/Activity.js';

export const getCommentsByIssue = async (req, res) => {
  try {
    const { issueId } = req.params;

    const comments = await Comment.find({ issue: issueId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: 1 });

    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createComment = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const comment = new Comment({
      issue: issueId,
      user: req.user._id,
      content: content.trim(),
    });

    await comment.save();
    await comment.populate('user', 'name email avatar');

    const activity = new Activity({
      issue: issueId,
      user: req.user._id,
      action: 'added_comment',
    });
    await activity.save();

    res.status(201).json({ comment });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.content = content.trim();
    comment.isEdited = true;
    await comment.save();

    await comment.populate('user', 'name email avatar');

    res.json({ comment });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const activity = new Activity({
      issue: comment.issue,
      user: req.user._id,
      action: 'deleted_comment',
    });
    await activity.save();

    await comment.deleteOne();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
