import * as issueService from '../services/issue/issueService.js';
import * as issueActivityService from '../services/issue/issueActivityService.js';
import * as commentService from '../services/issue/commentService.js';

export const getMyIssues = async (req, res) => {
  const userId = req.user._id;
  const { filter } = req.query;
  const issues = await issueService.getMyIssues(userId, filter);
  res.json({ issues });
};

export const getIssues = async (req, res) => {
  const { teamId, status, priority, assignee, creator, parent } = req.query;
  const filters = { teamId, status, priority, assignee, creator, parent };
  const issues = await issueService.getIssues(filters);
  res.json({ issues });
};

export const createIssue = async (req, res) => {
  const fields = req.body;
  const userId = req.user._id;
  const issue = await issueService.createIssue(fields, userId);
  res.status(201).json({ issue });
};

export const getIssueByIdentifier = async (req, res) => {
  const { identifier } = req.params;
  const userId = req.user._id;
  const result = await issueService.getIssueByIdentifier(identifier, userId);
  res.json(result);
};

export const updateIssue = async (req, res) => {
  const { identifier } = req.params;
  const updates = req.body;
  const userId = req.user._id;
  const issue = await issueService.updateIssue(identifier, updates, userId);
  res.json({ issue });
};

export const deleteIssue = async (req, res) => {
  const { identifier } = req.params;
  const result = await issueService.deleteIssue(identifier);
  res.json(result);
};

export const getValidParents = async (req, res) => {
  const { identifier } = req.params;
  const validParents = await issueService.getValidParents(identifier);
  res.json({ validParents });
};

export const toggleSubscribe = async (req, res) => {
  const { identifier } = req.params;
  const userId = req.user._id;
  const result = await issueService.toggleSubscribe(identifier, userId);
  res.json(result);
};

export const getIssueActivities = async (req, res) => {
  const { identifier } = req.params;
  const activities = await issueActivityService.getIssueActivities(identifier);
  res.json({ activities });
};

export const getCommentsByIssue = async (req, res) => {
  const { identifier } = req.params;
  const userId = req.user?._id;
  const comments = await commentService.getCommentsByIssue(identifier, userId);
  res.json({ comments });
};

export const createComment = async (req, res) => {
  const { identifier } = req.params;
  const { content } = req.body;
  const userId = req.user._id;
  const comment = await commentService.createComment(identifier, content, userId);
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
