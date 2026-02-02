import Project from '../models/Project.js';
import Issue from '../models/Issue.js';
import ProjectUpdate from '../models/ProjectUpdate.js';
import ProjectActivity from '../models/ProjectActivity.js';
import { generateProjectIdentifier } from '../utils/projectUtils.js';
import { createProjectActivity } from '../utils/activityTracker.js';

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

export const listProjects = async (req, res) => {
  try {
    const { status, teamId, creatorId } = req.query;

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

    res.json({ projects: enriched });
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description, summary, status, priority, teamId, leadId, startDate, targetDate, memberIds, creatorId } = req.body;

    if (!name || !teamId) {
      return res.status(400).json({ message: 'Name and team are required' });
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
      creator: creatorId || req.user._id,
    });

    await project.save();
    await project.populate([
      { path: 'team', select: 'name key icon' },
      { path: 'lead', select: 'name email avatar' },
      { path: 'members', select: 'name email avatar' },
      { path: 'creator', select: 'name email avatar' },
    ]);

    res.status(201).json({ project });
  } catch (error) {
    console.error('Create project error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Project key already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProjectByIdentifier = async (req, res) => {
  try {
    const { identifier } = req.params;

    const project = await Project.findOne({ identifier });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.populate([
      { path: 'team', select: 'name key icon' },
      { path: 'lead', select: 'name email avatar' },
      { path: 'members', select: 'name email avatar' },
      { path: 'creator', select: 'name email avatar' },
    ]);

    const metrics = await getIssueStats(project._id);

    res.json({
      project,
      metrics,
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { identifier } = req.params;
    const updates = req.body;

    const project = await Project.findOne({ identifier });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const oldProject = { ...project.toObject() };

    if (updates.memberIds !== undefined) {
      const oldMemberIds = (project.members || []).map((m) => m.toString()).sort();
      const newMemberIds = (updates.memberIds || []).map((id) => id.toString()).sort();
      if (JSON.stringify(oldMemberIds) !== JSON.stringify(newMemberIds)) {
        project.members = updates.memberIds;
        await createProjectActivity(
          project._id,
          req.user._id,
          'members_changed',
          oldMemberIds,
          newMemberIds
        );
      }
    }
    if (updates.leadId !== undefined) {
      const oldLeadId = project.lead ? project.lead.toString() : null;
      const newLeadId = updates.leadId || null;
      if (oldLeadId !== newLeadId) {
        project.lead = updates.leadId;
        await project.populate('lead', 'name email avatar');
        if (newLeadId) {
          await createProjectActivity(project._id, req.user._id, 'lead_changed', null, project.lead);
        } else {
          await createProjectActivity(project._id, req.user._id, 'lead_cleared', oldLeadId, null);
        }
      }
    }
    if (updates.teamId !== undefined) {
      const oldTeamId = project.team ? project.team.toString() : null;
      const newTeamId = updates.teamId || null;
      if (oldTeamId !== newTeamId) {
        project.team = updates.teamId;
        await project.populate('team', 'name key icon');
        await createProjectActivity(project._id, req.user._id, 'team_changed', null, project.team);
      }
    }

    const { memberIds, leadId, teamId, ...otherUpdates } = updates;

    if (otherUpdates.status !== undefined && otherUpdates.status !== project.status) {
      await createProjectActivity(
        project._id,
        req.user._id,
        'status_changed',
        project.status,
        otherUpdates.status
      );
    }

    if (otherUpdates.priority !== undefined && otherUpdates.priority !== project.priority) {
      await createProjectActivity(
        project._id,
        req.user._id,
        'priority_changed',
        project.priority,
        otherUpdates.priority
      );
    }

    if (otherUpdates.targetDate !== undefined) {
      const oldTargetDate = project.targetDate ? project.targetDate.toISOString() : null;
      const newTargetDate = otherUpdates.targetDate || null;
      if (oldTargetDate !== newTargetDate) {
        if (newTargetDate) {
          await createProjectActivity(
            project._id,
            req.user._id,
            'target_date_set',
            null,
            newTargetDate
          );
        } else {
          await createProjectActivity(project._id, req.user._id, 'target_date_cleared', oldTargetDate, null);
        }
      }
    }

    if (otherUpdates.startDate !== undefined) {
      const oldStartDate = project.startDate ? project.startDate.toISOString() : null;
      const newStartDate = otherUpdates.startDate || null;
      if (oldStartDate !== newStartDate) {
        if (newStartDate) {
          await createProjectActivity(
            project._id,
            req.user._id,
            'start_date_set',
            null,
            newStartDate
          );
        } else {
          await createProjectActivity(project._id, req.user._id, 'start_date_cleared', oldStartDate, null);
        }
      }
    }

    if (otherUpdates.name !== undefined && otherUpdates.name !== project.name) {
      await createProjectActivity(project._id, req.user._id, 'name_changed', project.name, otherUpdates.name);
      otherUpdates.identifier = generateProjectIdentifier(otherUpdates.name);
    }

    if (otherUpdates.summary !== undefined && otherUpdates.summary !== (project.summary || '')) {
      await createProjectActivity(project._id, req.user._id, 'summary_changed', project.summary, otherUpdates.summary);
    }

    Object.assign(project, otherUpdates);
    await project.save();

    await project.populate([
      { path: 'team', select: 'name key icon' },
      { path: 'lead', select: 'name email avatar' },
      { path: 'members', select: 'name email avatar' },
      { path: 'creator', select: 'name email avatar' },
    ]);

    res.json({ project });
  } catch (error) {
    console.error('Update project error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Project key already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProjectIssues = async (req, res) => {
  try {
    const { identifier } = req.params;

    const project = await Project.findOne({ identifier });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const issues = await Issue.find({ project: project._id })
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar')
      .populate('team', 'name key icon')
      .populate('project', 'name identifier icon')
      .populate('parent', 'identifier title')
      .sort({ createdAt: -1 });

    res.json({ issues });
  } catch (error) {
    console.error('Get project issues error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProjectUpdates = async (req, res) => {
  try {
    const { identifier } = req.params;
    const { includeActivities } = req.query;

    const project = await Project.findOne({ identifier });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updates = await ProjectUpdate.find({ project: project._id })
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 });

    if (!includeActivities) {
      return res.json({ updates });
    }

    const activities = await ProjectActivity.find({ project: project._id })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 });

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
          if (activity.actionType === 'update_posted') return false;
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
        if (activity.actionType === 'update_posted') return false;
        const activityTime = new Date(activity.createdAt);
        return activityTime > latestUpdateTimeWithBuffer;
      });

      pendingActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (activities.length > 0) {
      pendingActivities = activities;
      pendingActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({
      updates: groupedUpdates.map((item) => ({
        ...item.update.toObject(),
        activities: item.activities,
      })),
      pendingActivities,
    });
  } catch (error) {
    console.error('Get project updates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createProjectUpdate = async (req, res) => {
  try {
    const { identifier } = req.params;
    const { content, status } = req.body;
    const validStatuses = ['on_track', 'at_risk', 'off_track'];

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content and status are required' });
    }

    if ( status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value, must be one of: ' + validStatuses.join(', ') });
    }

    const project = await Project.findOne({ identifier });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const update = new ProjectUpdate({
      project: project._id,
      author: req.user._id,
      content: content.trim(),
      status: status,
    });
    await update.save();
    await update.populate('author', 'name email avatar');

    await createProjectActivity(project._id, req.user._id, 'update_posted', null, null);

    res.status(201).json({ update });
  } catch (error) {
    console.error('Create project update error:', error);
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

    const project = await Project.findOne({ identifier });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const activities = await ProjectActivity.find({ project: project._id })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ activities });
  } catch (error) {
    console.error('Get project activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


