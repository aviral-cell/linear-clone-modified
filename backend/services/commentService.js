import Comment from '../models/Comment.js';
import IssueActivity from '../models/IssueActivity.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/appError.js';

export const getCommentsByIssue = async (issueId, userId) => {
  const comments = await Comment.find({ issue: issueId })
    .populate('user', 'name email avatar')
    .sort({ createdAt: 1 });

  const currentUserId = userId?.toString();
  const commentsWithOwner = comments.map((comment) => {
    const commentObj = comment.toObject();
    commentObj.isOwner = currentUserId && comment.user._id.toString() === currentUserId;
    return commentObj;
  });

  return commentsWithOwner;
};

export const createComment = async (issueId, content, userId) => {
  if (!content || !content.trim()) {
    throw new BadRequestError('Content is required');
  }

  const comment = new Comment({
    issue: issueId,
    user: userId,
    content: content.trim(),
  });

  await comment.save();
  await comment.populate('user', 'name email avatar');

  const activity = new IssueActivity({
    issue: issueId,
    user: userId,
    action: 'added_comment',
  });
  await activity.save();

  return comment;
};

export const updateComment = async (commentId, content, userId) => {
  if (!content || !content.trim()) {
    throw new BadRequestError('Content is required');
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  if (comment.user.toString() !== userId.toString()) {
    throw new ForbiddenError('Not authorized');
  }

  comment.content = content.trim();
  comment.isEdited = true;

  await comment.save();
  await comment.populate('user', 'name email avatar');

  return comment;
};

export const deleteComment = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  if (comment.user.toString() !== userId.toString()) {
    throw new ForbiddenError('Not authorized');
  }

  await comment.deleteOne();

  const activity = new IssueActivity({
    issue: comment.issue,
    user: userId,
    action: 'deleted_comment',
  });
  await activity.save();
};
