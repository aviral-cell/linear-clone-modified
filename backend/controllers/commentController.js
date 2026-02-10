import Comment from '../models/Comment.js';
import IssueActivity from '../models/IssueActivity.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/appError.js';

export const getCommentsByIssue = async (req, res) => {
  const { issueId } = req.params;

  const comments = await Comment.find({ issue: issueId })
    .populate('user', 'name email avatar')
    .sort({ createdAt: 1 });

  const currentUserId = req.user?._id?.toString();
  const commentsWithOwner = comments.map((comment) => {
    const commentObj = comment.toObject();
    commentObj.isOwner = currentUserId && comment.user._id.toString() === currentUserId;
    return commentObj;
  });

  res.json({ comments: commentsWithOwner });
};

export const createComment = async (req, res) => {
  const { issueId } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    throw new BadRequestError('Content is required');
  }

  const comment = new Comment({
    issue: issueId,
    user: req.user._id,
    content: content.trim(),
  });

  await comment.save();
  await comment.populate('user', 'name email avatar');

  const activity = new IssueActivity({
    issue: issueId,
    user: req.user._id,
    action: 'added_comment',
  });
  await activity.save();

  res.status(201).json({ comment });
};

export const updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    throw new BadRequestError('Content is required');
  }

  const comment = await Comment.findById(id);
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  if (comment.user.toString() !== req.user._id.toString()) {
    throw new ForbiddenError('Not authorized');
  }

  comment.content = content.trim();
  comment.isEdited = true;

  await comment.save();
  await comment.populate('user', 'name email avatar');

  res.json({ comment });
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  if (comment.user.toString() !== req.user._id.toString()) {
    throw new ForbiddenError('Not authorized');
  }

  await comment.deleteOne();

  const activity = new IssueActivity({
    issue: comment.issue,
    user: req.user._id,
    action: 'deleted_comment',
  });
  await activity.save();

  res.json({ message: 'Comment deleted successfully' });
};
