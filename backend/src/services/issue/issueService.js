import Issue from '../../models/Issue.js';
import IssueActivity from '../../models/IssueActivity.js';
import Team from '../../models/Team.js';
import {
  validateParentChange,
  getValidParentCandidates,
  getDepth,
  getMaxSubtreeDepth,
  MAX_DEPTH,
} from './issueHierarchy.js';
import { ISSUE_POPULATE, ISSUE_POPULATE_DETAIL } from '../../utils/issuePopulates.js';
import { BadRequestError, NotFoundError } from '../../utils/appError.js';

export const getMyIssues = async (userId, filter) => {
  let query;
  if (filter === 'created') {
    query = { creator: userId };
  } else if (filter === 'assigned') {
    query = { assignee: userId };
  } else {
    throw new BadRequestError('Filter is required');
  }

  const issues = await Issue.find(query).populate(ISSUE_POPULATE).sort({ createdAt: -1 });

  return issues;
};

export const getIssues = async (filters = {}) => {
  const { teamId } = filters;

  const query = {};
  if (teamId) query.team = teamId;

  const issues = await Issue.find(query).populate(ISSUE_POPULATE).sort({ createdAt: -1 });

  return issues;
};

export const createIssue = async (fields, userId) => {
  const { title, description, status, priority, teamId, projectId, assignee, parent, labels } =
    fields;

  if (!title || !teamId) {
    throw new BadRequestError('Title and team are required');
  }

  const team = await Team.findById(teamId);
  if (!team) {
    throw new NotFoundError('Team not found');
  }

  if (parent) {
    const parentIssue = await Issue.findById(parent);
    if (!parentIssue) {
      throw new NotFoundError('Parent issue not found');
    }

    if (parentIssue.team.toString() !== teamId.toString()) {
      throw new BadRequestError('Parent must be in the same team');
    }

    const parentDepth = await getDepth(parent);
    if (parentDepth >= MAX_DEPTH) {
      throw new BadRequestError(`Sub-issues cannot be nested more than ${MAX_DEPTH} levels deep`);
    }
  }

  const count = await Issue.countDocuments({ team: teamId });
  const identifier = `${team.key}-${count + 1}`;

  const issue = new Issue({
    identifier,
    title,
    description,
    status: status || 'todo',
    priority: priority || 'no_priority',
    team: teamId,
    project: projectId || null,
    assignee: assignee || null,
    creator: userId,
    parent: parent || null,
    labels: labels || [],
  });

  await issue.save();
  await issue.populate(ISSUE_POPULATE);

  const activity = new IssueActivity({
    issue: issue._id,
    user: userId,
    action: 'created',
  });
  await activity.save();

  return issue;
};

export const getIssueByIdentifier = async (identifier) => {
  const issue = await Issue.findOne({ identifier }).populate(ISSUE_POPULATE_DETAIL);

  if (!issue) {
    throw new NotFoundError('Issue not found');
  }

  const subIssues = await Issue.find({ parent: issue._id })
    .populate('assignee', 'name email avatar')
    .populate('creator', 'name email avatar')
    .sort({ createdAt: -1 });

  return { issue, subIssues };
};

export const updateIssue = async (identifier, updates, userId) => {
  const issue = await Issue.findOne({ identifier });
  if (!issue) {
    throw new NotFoundError('Issue not found');
  }

  if (updates.projectId !== undefined) {
    updates.project = updates.projectId;
    delete updates.projectId;
  }

  if (updates.parent !== undefined) {
    const parentId = updates.parent === null ? null : updates.parent;
    if (parentId) {
      const validation = await validateParentChange(issue._id, parentId);
      if (!validation.valid) {
        throw new BadRequestError(validation.reason);
      }

      const parentDepth = await getDepth(parentId);
      const subtreeDepth = await getMaxSubtreeDepth(issue._id);
      if (parentDepth + 1 + subtreeDepth > MAX_DEPTH) {
        throw new BadRequestError(`Sub-issues cannot be nested more than ${MAX_DEPTH} levels deep`);
      }
    }
  }

  Object.assign(issue, updates);
  await issue.save();
  await issue.populate(ISSUE_POPULATE_DETAIL);

  const changes = [];
  const fieldsToTrack = [
    'status',
    'priority',
    'assignee',
    'project',
    'parent',
  ];

  fieldsToTrack.forEach((field) => {
    if (updates[field] === undefined || updates[field] === null) {
      return;
    }
    changes.push({
      field,
      oldValue: updates[field],
      newValue: issue[field],
    });
  });

  for (const change of changes) {
    const activity = new IssueActivity({
      issue: issue._id,
      user: userId,
      action: `updated_${change.field}`,
      changes: change,
    });
    await activity.save();
  }

  return issue;
};

export const getValidParents = async (identifier) => {
  const issue = await Issue.findOne({ identifier });

  const validParents = await getValidParentCandidates(issue?._id);

  return validParents;
};
