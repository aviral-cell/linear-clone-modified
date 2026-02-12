import * as commentService from '../services/commentService.js';

export const getCommentsByIssue = async (req, res) => {
  const { issueId } = req.params;
  const userId = req.user?._id;
  const comments = await commentService.getCommentsByIssue(issueId, userId);
  res.json({ comments });
};

export const createComment = async (req, res) => {
  const { issueId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;
  const comment = await commentService.createComment(issueId, content, userId);
  res.status(201).json({ comment });
};

export const updateComment = async (req, res) => {
  const commentId = req.params.id;
  const { content } = req.body;
  const userId = req.user._id;
  const comment = await commentService.updateComment(commentId, content, userId);
  res.json({ comment });
};

export const deleteComment = async (req, res) => {
  const commentId = req.params.id;
  const userId = req.user._id;
  await commentService.deleteComment(commentId, userId);
  res.json({ message: 'Comment deleted successfully' });
};
