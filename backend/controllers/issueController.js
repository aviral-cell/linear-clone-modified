import Issue from '../models/Issue.js';
import Comment from '../models/Comment.js';
import IssueActivity from '../models/IssueActivity.js';
import Team from '../models/Team.js';
import {
  validateParentChange,
  getValidParentCandidates,
  getDescendants,
  getDepth,
  getMaxSubtreeDepth,
  MAX_DEPTH,
} from '../services/issueHierarchy.js';
import { ISSUE_POPULATE, ISSUE_POPULATE_DETAIL } from '../utils/issuePopulates.js';
import { BadRequestError, NotFoundError } from '../utils/appError.js';

export const getIssuesByTeam = async (req, res) => {
  const { teamId } = req.params;
  const { status, priority, assignee, creator, parent } = req.query;

  const query = { team: teamId };

  if (status) {
    const statuses = status.split(',');
    query.status = statuses.length > 1 ? { $in: statuses } : status;
  }

  if (priority) {
    const priorities = priority.split(',');
    query.priority = priorities.length > 1 ? { $in: priorities } : priority;
  }

  if (assignee) {
    const assignees = assignee.split(',');
    query.assignee = assignees.length > 1 ? { $in: assignees } : assignee;
  }

  if (creator) {
    const creators = creator.split(',');
    query.creator = creators.length > 1 ? { $in: creators } : creator;
  }

  if (parent !== undefined) {
    query.parent = parent === 'null' ? null : parent;
  }

  const issues = await Issue.find(query)
    .populate(ISSUE_POPULATE)
    .sort({ createdAt: -1 });

  res.json({ issues });
};

export const getMyIssues = async (req, res) => {
  const userId = req.user._id;
  const { filter } = req.query;

  let query;
  if (filter === 'created') {
    query = { creator: userId };
  } else if (filter === 'assigned') {
    query = { assignee: userId };
  } else if (filter === 'subscribed') {
    query = { subscribers: userId };
  } else {
    query = {
      $or: [{ creator: userId }, { assignee: userId }],
    };
  }

  const issues = await Issue.find(query)
    .populate(ISSUE_POPULATE)
    .sort({ createdAt: -1 });

  res.json({ issues });
};

export const getIssueByIdentifier = async (req, res) => {
  const { identifier } = req.params;

  const issue = await Issue.findOne({ identifier })
    .populate(ISSUE_POPULATE_DETAIL);

  if (!issue) {
    throw new NotFoundError('Issue not found');
  }

  const subIssues = await Issue.find({ parent: issue._id })
    .populate('assignee', 'name email avatar')
    .populate('creator', 'name email avatar')
    .sort({ createdAt: -1 });

  const isSubscribed = issue.subscribers.some(
    (sub) => sub.toString() === req.user._id.toString()
  );

  res.json({ issue, subIssues, isSubscribed });
};

export const createIssue = async (req, res) => {
  const {
    title,
    description,
    status,
    priority,
    teamId,
    projectId,
    assignee,
    parent,
    labels,
  } = req.body;

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
    creator: req.user._id,
    parent: parent || null,
    labels: labels || [],
  });

  await issue.save();
  await issue.populate(ISSUE_POPULATE);

  const activity = new IssueActivity({
    issue: issue._id,
    user: req.user._id,
    action: 'created',
  });
  await activity.save();

  res.status(201).json({ issue });
};

export const updateIssue = async (req, res) => {
  const { identifier } = req.params;
  const updates = req.body;

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
      const parent = await Issue.findById(parentId);
      if (!parent) {
        throw new NotFoundError('Parent issue not found');
      }

      const validation = await validateParentChange(issue._id, parentId);
      if (!validation.valid) {
        throw new BadRequestError(validation.reason);
      }

      if (parent.team.toString() !== issue.team.toString()) {
        throw new BadRequestError('Parent must be in the same team');
      }

      const parentDepth = await getDepth(parentId);
      const subtreeDepth = await getMaxSubtreeDepth(issue._id);
      if (parentDepth + 1 + subtreeDepth > MAX_DEPTH) {
        throw new BadRequestError(`Sub-issues cannot be nested more than ${MAX_DEPTH} levels deep`);
      }
    }
  }

  const changes = [];
  const fieldsToTrack = [
    'status',
    'priority',
    'assignee',
    'title',
    'description',
    'project',
    'parent',
  ];

  fieldsToTrack.forEach((field) => {
    if (updates[field] === undefined) {
      return;
    }
    if (String(issue[field]) === String(updates[field])) {
      return;
    }
    changes.push({
      field,
      oldValue: issue[field],
      newValue: updates[field],
    });
  });

  Object.assign(issue, updates);
  await issue.save();

  await issue.populate(ISSUE_POPULATE_DETAIL);

  for (const change of changes) {
    const activity = new IssueActivity({
      issue: issue._id,
      user: req.user._id,
      action: `updated_${change.field}`,
      changes: change,
    });
    await activity.save();
  }

  res.json({ issue });
};

export const toggleSubscribe = async (req, res) => {
  const { identifier } = req.params;
  const userId = req.user._id;

  const issue = await Issue.findOne({ identifier });
  if (!issue) {
    throw new NotFoundError('Issue not found');
  }

  const isSubscribed = issue.subscribers.some(
    (sub) => sub.toString() === userId.toString()
  );

  if (isSubscribed) {
    issue.subscribers.pull(userId);
  } else {
    issue.subscribers.push(userId);
  }

  await issue.save();

  res.json({
    subscribed: !isSubscribed,
  });
};

export const deleteIssue = async (req, res) => {
  const { identifier } = req.params;

  const issue = await Issue.findOne({ identifier });
  if (!issue) {
    throw new NotFoundError('Issue not found');
  }

  const descendantIds = await getDescendants(issue._id);
  const allIds = [issue._id, ...descendantIds];

  await Comment.deleteMany({ issue: { $in: allIds } });
  await IssueActivity.deleteMany({ issue: { $in: allIds } });
  await Issue.deleteMany({ _id: { $in: allIds } });

  res.json({
    message: 'Issue deleted successfully',
    deletedCount: allIds.length,
  });
};

export const getValidParents = async (req, res) => {
  const { identifier } = req.params;

  const issue = await Issue.findOne({ identifier });
  if (!issue) {
    throw new NotFoundError('Issue not found');
  }

  const validParents = await getValidParentCandidates(issue._id);

  res.json({ validParents });
};
