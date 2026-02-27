import Comment from '../../models/Comment.js';
import Issue from '../../models/Issue.js';
import IssueActivity from '../../models/IssueActivity.js';
import { BadRequestError, NotFoundError } from '../../utils/appError.js';

const findIssueByIdentifier = async (identifier) => {
  const issue = await Issue.findOne({ identifier });
  if (!issue) {
    throw new NotFoundError('Issue not found');
  }
  return issue;
};

export const getCommentsByIssue = async (identifier) => {
  const issue = await findIssueByIdentifier(identifier);

  const comments = await Comment.find({ issue: issue._id })
    .populate('user', 'name email avatar')
    .sort({ createdAt: 1 });

  const commentsWithOwner = comments.map((comment) => {
    const commentObj = comment.toObject();
    commentObj.isOwner = comment.user._id;
    return commentObj;
  });

  return commentsWithOwner;
};

export const createComment = async (identifier, content, userId) => {
  if (!content || !content.trim()) {
    throw new BadRequestError('Content is required');
  }

  const issue = await findIssueByIdentifier(identifier);

  const comment = new Comment({
    issue: issue._id,
    user: userId,
    content: content.trim(),
  });

  await comment.save();
  await comment.populate('user', 'name email avatar');

  const activity = new IssueActivity({
    issue: issue._id,
    user: userId,
    action: 'added_comment',
  });
  await activity.save();

  return comment;
};

export const updateComment = async (commentId, content) => {
  if (!content || !content.trim()) {
    throw new BadRequestError('Content is required');
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  comment.content = content.trim();

  await comment.save();
  await comment.populate('user', 'name email avatar');

  return comment;
};

export const deleteComment = async (commentId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  await comment.deleteOne();
};
