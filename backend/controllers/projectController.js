import * as projectService from '../services/projectService.js';

export const listProjects = async (req, res) => {
  const { status, teamId, creatorId } = req.query;
  const projects = await projectService.listProjects({ status, teamId, creatorId });
  res.json({ projects });
};

export const createProject = async (req, res) => {
  const project = await projectService.createProject(req.body, req.user._id);
  res.status(201).json({ project });
};

export const getProjectByIdentifier = async (req, res) => {
  const { identifier } = req.params;
  const result = await projectService.getProjectByIdentifier(identifier);
  res.json(result);
};

export const updateProject = async (req, res) => {
  const { identifier } = req.params;
  const project = await projectService.updateProject(identifier, req.body, req.user._id);
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
  const update = await projectService.createProjectUpdate(identifier, req.body, req.user._id);
  res.status(201).json({ update });
};

export const getProjectActivities = async (req, res) => {
  const { identifier } = req.params;
  const { limit = 50 } = req.query;
  const activities = await projectService.getProjectActivities(identifier, limit);
  res.json({ activities });
};
