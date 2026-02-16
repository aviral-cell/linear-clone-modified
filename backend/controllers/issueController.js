import * as issueService from '../services/issueService.js';

export const getIssues = async (req, res) => {
  const filters = req.query;
  const issues = await issueService.getIssues(filters);
  res.json({ issues });
};

export const getMyIssues = async (req, res) => {
  const userId = req.user._id;
  const { filter } = req.query;
  const issues = await issueService.getMyIssues(userId, filter);
  res.json({ issues });
};

export const getIssueByIdentifier = async (req, res) => {
  const { identifier } = req.params;
  const userId = req.user._id;
  const result = await issueService.getIssueByIdentifier(identifier, userId);
  res.json(result);
};

export const createIssue = async (req, res) => {
  const fields = req.body;
  const userId = req.user._id;
  const issue = await issueService.createIssue(fields, userId);
  res.status(201).json({ issue });
};

export const updateIssue = async (req, res) => {
  const { identifier } = req.params;
  const updates = req.body;
  const userId = req.user._id;
  const issue = await issueService.updateIssue(identifier, updates, userId);
  res.json({ issue });
};

export const toggleSubscribe = async (req, res) => {
  const { identifier } = req.params;
  const userId = req.user._id;
  const result = await issueService.toggleSubscribe(identifier, userId);
  res.json(result);
};

export const getValidParents = async (req, res) => {
  const { identifier } = req.params;
  const validParents = await issueService.getValidParents(identifier);
  res.json({ validParents });
};
