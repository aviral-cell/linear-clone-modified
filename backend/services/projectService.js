import Project from '../models/Project.js';
import Issue from '../models/Issue.js';
import ProjectUpdate from '../models/ProjectUpdate.js';
import ProjectActivity from '../models/ProjectActivity.js';
import { generateProjectIdentifier } from '../utils/projectUtils.js';
import { getProjectStats } from './projectStatsService.js';
import {
  createProjectActivity,
  getProjectActivities as getActivities,
  groupActivitiesWithUpdates
} from './projectActivityService.js';
import { updateProjectWithTracking } from './projectUpdateService.js';

export const listProjects = async (filters = {}) => {
  const { status, teamId, creatorId } = filters;

  const query = {};
  if (status) query.status = status;
  if (teamId) query.team = teamId;
  if (creatorId) query.creator = creatorId;

  const projects = await Project.find(query)
    .populate({
      path: 'team',
      select: 'name key icon',
      populate: {
        path: 'members',
        select: 'name email avatar',
      },
    })
    .populate('lead', 'name email avatar')
    .populate('members', 'name email avatar')
    .populate('creator', 'name email avatar')
    .sort({ createdAt: -1 });

  const statsMap = await getProjectStats(projects.map((p) => p._id));

  const enriched = projects.map((project) => ({
    ...project.toObject(),
    metrics: {
      totalIssues: statsMap[project._id.toString()]?.totalIssues || 0,
      doneIssues: statsMap[project._id.toString()]?.doneIssues || 0,
    },
  }));

  return enriched;
};

export const getProjectByIdentifier = async (identifier) => {
  const project = await Project.findOne({ identifier });
  if (!project) {
    throw new Error('Project not found');
  }

  await project.populate([
    { path: 'team', select: 'name key icon' },
    { path: 'lead', select: 'name email avatar' },
    { path: 'members', select: 'name email avatar' },
    { path: 'creator', select: 'name email avatar' },
  ]);

  const metrics = await getProjectStats(project._id);

  return { project, metrics };
};

export const createProject = async (projectData, userId) => {
  const { name, description, summary, status, priority, teamId, leadId, startDate, targetDate, memberIds, creatorId } = projectData;

  if (!name || !teamId) {
    throw new Error('Name and team are required');
  }

  const project = new Project({
    name,
    identifier: generateProjectIdentifier(name),
    description,
    summary,
    status,
    priority,
    team: teamId,
    lead: leadId,
    members: memberIds,
    startDate,
    targetDate,
    creator: creatorId || userId,
  });

  await project.save();
  await project.populate([
    { path: 'team', select: 'name key icon' },
    { path: 'lead', select: 'name email avatar' },
    { path: 'members', select: 'name email avatar' },
    { path: 'creator', select: 'name email avatar' },
  ]);

  return project;
};

export const updateProject = async (identifier, updates, userId) => {
  const project = await Project.findOne({ identifier });
  if (!project) {
    throw new Error('Project not found');
  }

  return await updateProjectWithTracking(project, updates, userId);
};

export const getProjectIssues = async (identifier) => {
  const project = await Project.findOne({ identifier });
  if (!project) {
    throw new Error('Project not found');
  }

  const issues = await Issue.find({ project: project._id })
    .populate('assignee', 'name email avatar')
    .populate('creator', 'name email avatar')
    .populate('team', 'name key icon')
    .populate('project', 'name identifier icon')
    .populate('parent', 'identifier title')
    .sort({ createdAt: -1 });

  return issues;
};

export const getProjectUpdates = async (identifier, includeActivities = false) => {
  const project = await Project.findOne({ identifier });
  if (!project) {
    throw new Error('Project not found');
  }

  const updates = await ProjectUpdate.find({ project: project._id })
    .populate('author', 'name email avatar')
    .sort({ createdAt: -1 });

  if (!includeActivities) {
    return { updates };
  }

  const activities = await ProjectActivity.find({ project: project._id })
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1 });

  return groupActivitiesWithUpdates(updates, activities, project);
};

export const createProjectUpdate = async (identifier, updateData, userId) => {
  const { content, status } = updateData;
  const validStatuses = ['on_track', 'at_risk', 'off_track'];

  if (!content || !content.trim()) {
    throw new Error('Content and status are required');
  }

  if (status && !validStatuses.includes(status)) {
    throw new Error('Invalid status value, must be one of: ' + validStatuses.join(', '));
  }

  const project = await Project.findOne({ identifier });
  if (!project) {
    throw new Error('Project not found');
  }

  const update = new ProjectUpdate({
    project: project._id,
    author: userId,
    content: content.trim(),
    status: status,
  });
  await update.save();
  await update.populate('author', 'name email avatar');

  await createProjectActivity(project._id, userId, 'posted_update', null, null);

  return update;
};

export const getProjectActivities = async (identifier, limit = 50) => {
  const project = await Project.findOne({ identifier });
  if (!project) {
    throw new Error('Project not found');
  }

  return await getActivities(project._id, { limit: parseInt(limit) });
};
