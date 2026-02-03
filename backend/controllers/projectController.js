import * as projectService from '../services/projectService.js';

export const listProjects = async (req, res) => {
  try {
    const { status, teamId, creatorId } = req.query;
    const projects = await projectService.listProjects({ status, teamId, creatorId });
    res.json({ projects });
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createProject = async (req, res) => {
  try {
    const project = await projectService.createProject(req.body, req.user._id);
    res.status(201).json({ project });
  } catch (error) {
    console.error('Create project error:', error);
    if (error.message === 'Name and team are required') {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Project key already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProjectByIdentifier = async (req, res) => {
  try {
    const { identifier } = req.params;
    const result = await projectService.getProjectByIdentifier(identifier);
    res.json(result);
  } catch (error) {
    console.error('Get project error:', error);
    if (error.message === 'Project not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { identifier } = req.params;
    const project = await projectService.updateProject(identifier, req.body, req.user._id);
    res.json({ project });
  } catch (error) {
    console.error('Update project error:', error);
    if (error.message === 'Project not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Project key already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProjectIssues = async (req, res) => {
  try {
    const { identifier } = req.params;
    const issues = await projectService.getProjectIssues(identifier);
    res.json({ issues });
  } catch (error) {
    console.error('Get project issues error:', error);
    if (error.message === 'Project not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProjectUpdates = async (req, res) => {
  try {
    const { identifier } = req.params;
    const { includeActivities } = req.query;
    const result = await projectService.getProjectUpdates(identifier, includeActivities);
    res.json(result);
  } catch (error) {
    console.error('Get project updates error:', error);
    if (error.message === 'Project not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const createProjectUpdate = async (req, res) => {
  try {
    const { identifier } = req.params;
    const update = await projectService.createProjectUpdate(identifier, req.body, req.user._id);
    res.status(201).json({ update });
  } catch (error) {
    console.error('Create project update error:', error);
    if (error.message === 'Project not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('Content and status are required') || error.message.includes('Invalid status value')) {
      return res.status(400).json({ message: error.message });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProjectActivities = async (req, res) => {
  try {
    const { identifier } = req.params;
    const { limit = 50 } = req.query;
    const activities = await projectService.getProjectActivities(identifier, limit);
    res.json({ activities });
  } catch (error) {
    console.error('Get project activities error:', error);
    if (error.message === 'Project not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
