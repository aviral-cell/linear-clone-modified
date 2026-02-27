import { NotFoundError, BadRequestError } from '../../utils/appError.js';
import Project from '../../models/Project.js';
import Issue from '../../models/Issue.js';
import ProjectUpdate, { PROJECT_UPDATE_STATUSES } from '../../models/ProjectUpdate.js';
import { ISSUE_POPULATE } from '../../utils/issuePopulates.js';
import ProjectActivity from '../../models/ProjectActivity.js';
import { generateProjectIdentifier } from '../../utils/projectUtils.js';
import { getProjectStats } from './projectStatsService.js';
import {
  createProjectActivity,
  getProjectActivities as getActivities,
  groupActivitiesWithUpdates,
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
      select: 'name key icon color',
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

export const createProject = async (fields, userId) => {
  const {
    name,
    description,
    summary,
    status,
    priority,
    teamId,
    leadId,
    startDate,
    targetDate,
    memberIds,
    creatorId,
  } = fields;

  if (!name || !teamId) {
    throw new BadRequestError('Name and team are required');
  }

  const members = [...(memberIds || [])];

  const project = new Project({
    name,
    identifier: generateProjectIdentifier(name),
    description,
    summary,
    status,
    priority,
    team: teamId,
    lead: leadId,
    members,
    startDate,
    targetDate,
    creator: creatorId || userId,
  });

  await project.save();
  await project.populate([
    { path: 'team', select: 'name key icon color' },
    { path: 'lead', select: 'name email avatar' },
    { path: 'members', select: 'name email avatar' },
    { path: 'creator', select: 'name email avatar' },
  ]);

  return project;
};

export const getProjectByIdentifier = async (identifier) => {
  const project = await Project.findOne({ identifier });
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  await project.populate([
    { path: 'team', select: 'name key icon color' },
    { path: 'lead', select: 'name email avatar' },
    { path: 'members', select: 'name email avatar' },
    { path: 'creator', select: 'name email avatar' },
  ]);

  const metrics = await getProjectStats(project._id);

  return { project, metrics };
};

export const updateProject = async (identifier, updates, userId) => {
  const project = await Project.findOne({ identifier });
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  return await updateProjectWithTracking(project, updates, userId);
};

export const getProjectIssues = async (identifier) => {
  const project = await Project.findOne({ identifier });
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  const issues = await Issue.find({ project: project._id })
    .populate(ISSUE_POPULATE)
    .sort({ createdAt: -1 });

  return issues;
};

export const getProjectUpdates = async (identifier, includeActivities = false) => {
  const project = await Project.findOne({ identifier });
  if (!project) {
    throw new NotFoundError('Project not found');
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

export const createProjectUpdate = async (identifier, fields, userId) => {
  const { content, status } = fields;
  const validStatuses = PROJECT_UPDATE_STATUSES;

  if (!content || !content.trim()) {
    throw new BadRequestError('Content and status are required');
  }

  if (status && !validStatuses.includes(status)) {
    throw new BadRequestError('Invalid status value, must be one of: ' + validStatuses.join(', '));
  }

  const project = await Project.findOne({ identifier });
  if (!project) {
    throw new NotFoundError('Project not found');
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
    throw new NotFoundError('Project not found');
  }

  return await getActivities(project._id, { limit: parseInt(limit) });
};
