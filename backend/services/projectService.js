import Project from '../models/Project.js';
import Issue from '../models/Issue.js';
import ProjectUpdate from '../models/ProjectUpdate.js';
import ProjectActivity from '../models/ProjectActivity.js';
import { generateProjectIdentifier } from '../utils/projectUtils.js';
import { createProjectActivity } from '../utils/projectActivityTracker.js';

const getIssueStats = async (projectIdOrIds) => {
  const isArray = Array.isArray(projectIdOrIds);
  const projectIds = isArray ? projectIdOrIds : [projectIdOrIds];

  const issueStats = await Issue.aggregate([
    { $match: { project: { $in: projectIds } } },
    {
      $group: {
        _id: { project: '$project', status: '$status' },
        count: { $sum: 1 },
      },
    },
  ]);

  const statsByProject = {};

  issueStats.forEach((item) => {
    const projectId = item._id.project.toString();
    const status = item._id.status;

    if (!statsByProject[projectId]) {
      statsByProject[projectId] = { statusCounts: {}, totalIssues: 0, doneIssues: 0 };
    }

    statsByProject[projectId].statusCounts[status] = item.count;
    statsByProject[projectId].totalIssues += item.count;
    if (status === 'done') {
      statsByProject[projectId].doneIssues += item.count;
    }
  });

  if (isArray) {
    return Object.fromEntries(
      projectIds.map((id) => [
        id.toString(),
        statsByProject[id.toString()] || { statusCounts: {}, totalIssues: 0, doneIssues: 0 },
      ])
    );
  }

  return statsByProject[projectIdOrIds.toString()] || { statusCounts: {}, totalIssues: 0, doneIssues: 0 };
};

const handleMemberUpdate = async (project, updates, userId) => {
  if (updates.memberIds === undefined) return;

  const oldMemberIds = (project.members || []).map((m) => m.toString()).sort();
  const newMemberIds = (updates.memberIds || []).map((id) => id.toString()).sort();

  if (JSON.stringify(oldMemberIds) !== JSON.stringify(newMemberIds)) {
    project.members = updates.memberIds;
    await createProjectActivity(
      project._id,
      userId,
      'updated_members',
      oldMemberIds,
      newMemberIds
    );
  }
};

const handleLeadUpdate = async (project, updates, userId) => {
  if (updates.leadId === undefined) return;

  const oldLeadId = project.lead ? project.lead.toString() : null;
  const newLeadId = updates.leadId || null;

  if (oldLeadId !== newLeadId) {
    project.lead = updates.leadId;
    await project.populate('lead', 'name email avatar');
    if (newLeadId) {
      await createProjectActivity(project._id, userId, 'updated_lead', null, project.lead);
    } else {
      await createProjectActivity(project._id, userId, 'cleared_lead', oldLeadId, null);
    }
  }
};

const handleTeamUpdate = async (project, updates, userId) => {
  if (updates.teamId === undefined) return;

  const oldTeamId = project.team ? project.team.toString() : null;
  const newTeamId = updates.teamId || null;

  if (oldTeamId !== newTeamId) {
    project.team = updates.teamId;
    await project.populate('team', 'name key icon');
    await createProjectActivity(project._id, userId, 'updated_team', null, project.team);
  }
};

const handleFieldUpdate = async (project, field, newValue, userId, actionTypes) => {
  const fieldValue = project[field];
  let oldValue;

  if (field === 'targetDate' || field === 'startDate') {
    oldValue = fieldValue ? fieldValue.toISOString() : null;
  } else if (field === 'summary') {
    oldValue = fieldValue || '';
  } else {
    oldValue = fieldValue;
  }

  if (newValue === undefined || newValue === oldValue) return null;

  if (field === 'targetDate' || field === 'startDate') {
    const newDateValue = newValue || null;
    if (oldValue !== newDateValue) {
      if (newDateValue) {
        await createProjectActivity(project._id, userId, actionTypes.set, null, newDateValue);
      } else {
        await createProjectActivity(project._id, userId, actionTypes.clear, oldValue, null);
      }
      return { [field]: newValue };
    }
  } else {
    await createProjectActivity(project._id, userId, actionTypes.update, oldValue, newValue);
    return { [field]: newValue };
  }

  return null;
};

const groupActivitiesWithUpdates = (updates, activities, project) => {
  const groupedUpdates = updates.map((update) => ({
    update,
    activities: [],
  }));

  let pendingActivities = [];

  if (groupedUpdates.length > 0 && activities.length > 0) {
    for (let i = 0; i < groupedUpdates.length; i += 1) {
      const currentUpdate = groupedUpdates[i].update;
      const previousUpdate = i < groupedUpdates.length - 1 ? groupedUpdates[i + 1].update : null;

      const startTime = previousUpdate ? previousUpdate.createdAt : project.createdAt;
      const endTime = new Date(currentUpdate.createdAt);
      const endTimeWithBuffer = new Date(endTime.getTime() + 10000);

      const windowActivities = activities.filter((activity) => {
        if (!activity.createdAt) return false;
        if (activity.action === 'posted_update') return false;
        const activityTime = new Date(activity.createdAt);
        return activityTime > startTime && activityTime <= endTimeWithBuffer;
      });

      windowActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      groupedUpdates[i].activities = windowActivities;
    }

    const latestUpdate = groupedUpdates[0].update;
    const latestUpdateTime = new Date(latestUpdate.createdAt);
    const latestUpdateTimeWithBuffer = new Date(latestUpdateTime.getTime() + 10000);

    pendingActivities = activities.filter((activity) => {
      if (!activity.createdAt) return false;
      if (activity.action === 'posted_update') return false;
      const activityTime = new Date(activity.createdAt);
      return activityTime > latestUpdateTimeWithBuffer;
    });

    pendingActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (activities.length > 0) {
    pendingActivities = activities;
    pendingActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return {
    updates: groupedUpdates.map((item) => ({
      ...item.update.toObject(),
      activities: item.activities,
    })),
    pendingActivities,
  };
};

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

  const statsMap = await getIssueStats(projects.map((p) => p._id));

  const enriched = projects.map((project) => ({
    ...project.toObject(),
    metrics: {
      totalIssues: statsMap[project._id.toString()]?.totalIssues || 0,
      doneIssues: statsMap[project._id.toString()]?.doneIssues || 0,
    },
  }));

  return enriched;
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

  const metrics = await getIssueStats(project._id);

  return { project, metrics };
};

export const updateProject = async (identifier, updates, userId) => {
  const project = await Project.findOne({ identifier });
  if (!project) {
    throw new Error('Project not found');
  }

  await handleMemberUpdate(project, updates, userId);
  await handleLeadUpdate(project, updates, userId);
  await handleTeamUpdate(project, updates, userId);

  const { memberIds, leadId, teamId, ...otherUpdates } = updates;

  const fieldUpdates = {};

  const statusUpdate = await handleFieldUpdate(
    project,
    'status',
    otherUpdates.status,
    userId,
    { update: 'updated_status' }
  );
  if (statusUpdate) Object.assign(fieldUpdates, statusUpdate);

  const priorityUpdate = await handleFieldUpdate(
    project,
    'priority',
    otherUpdates.priority,
    userId,
    { update: 'updated_priority' }
  );
  if (priorityUpdate) Object.assign(fieldUpdates, priorityUpdate);

  const targetDateUpdate = await handleFieldUpdate(
    project,
    'targetDate',
    otherUpdates.targetDate,
    userId,
    { set: 'set_target_date', clear: 'cleared_target_date' }
  );
  if (targetDateUpdate) Object.assign(fieldUpdates, targetDateUpdate);

  const startDateUpdate = await handleFieldUpdate(
    project,
    'startDate',
    otherUpdates.startDate,
    userId,
    { set: 'set_start_date', clear: 'cleared_start_date' }
  );
  if (startDateUpdate) Object.assign(fieldUpdates, startDateUpdate);

  if (otherUpdates.name !== undefined && otherUpdates.name !== project.name) {
    await createProjectActivity(project._id, userId, 'updated_name', project.name, otherUpdates.name);
    fieldUpdates.name = otherUpdates.name;
    fieldUpdates.identifier = generateProjectIdentifier(otherUpdates.name);
  }

  const summaryUpdate = await handleFieldUpdate(
    project,
    'summary',
    otherUpdates.summary,
    userId,
    { update: 'updated_summary' }
  );
  if (summaryUpdate) Object.assign(fieldUpdates, summaryUpdate);

  Object.assign(project, fieldUpdates);
  await project.save();

  await project.populate([
    { path: 'team', select: 'name key icon' },
    { path: 'lead', select: 'name email avatar' },
    { path: 'members', select: 'name email avatar' },
    { path: 'creator', select: 'name email avatar' },
  ]);

  return project;
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

  const activities = await ProjectActivity.find({ project: project._id })
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  return activities;
};
