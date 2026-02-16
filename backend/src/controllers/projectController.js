import * as projectService from '../services/project/projectService.js';

export const listProjects = async (req, res) => {
  const { status, teamId, creatorId } = req.query;
  const filters = { status, teamId, creatorId };
  const projects = await projectService.listProjects(filters);
  res.json({ projects });
};

export const createProject = async (req, res) => {
  const fields = req.body;
  const userId = req.user._id;
  const project = await projectService.createProject(fields, userId);
  res.status(201).json({ project });
};

export const getProjectByIdentifier = async (req, res) => {
  const { identifier } = req.params;
  const result = await projectService.getProjectByIdentifier(identifier);
  res.json(result);
};

export const updateProject = async (req, res) => {
  const { identifier } = req.params;
  const updates = req.body;
  const userId = req.user._id;
  const project = await projectService.updateProject(identifier, updates, userId);
  res.json({ project });
};

export const getProjectIssues = async (req, res) => {
  const { identifier } = req.params;
  const issues = await projectService.getProjectIssues(identifier);
  res.json({ issues });
};

export const getProjectUpdates = async (req, res) => {
  const { identifier } = req.params;
  const { includeActivities } = req.query;
  const result = await projectService.getProjectUpdates(identifier, includeActivities);
  res.json(result);
};

export const createProjectUpdate = async (req, res) => {
  const { identifier } = req.params;
  const { content, status } = req.body;
  const userId = req.user._id;
  const fields = { content, status };
  const update = await projectService.createProjectUpdate(identifier, fields, userId);
  res.status(201).json({ update });
};

export const getProjectActivities = async (req, res) => {
  const { identifier } = req.params;
  const { limit } = req.query;
  const activities = await projectService.getProjectActivities(identifier, limit);
  res.json({ activities });
};
