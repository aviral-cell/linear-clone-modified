import Project from '../models/Project.js';
import Issue from '../models/Issue.js';
import ProjectUpdate from '../models/ProjectUpdate.js';
import { generateProjectIdentifier } from '../utils/projectUtils.js';

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

    if (updates.memberIds) {
      project.members = updates.memberIds;
    }
    if (updates.leadId) {
      project.lead = updates.leadId;
    }
    if (updates.teamId) {
      project.team = updates.teamId;
    }

    const { memberIds, leadId, teamId, ...otherUpdates } = updates;

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

    const project = await Project.findOne({ identifier });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updates = await ProjectUpdate.find({ project: project._id })
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ updates });
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

    res.status(201).json({ update });
  } catch (error) {
    console.error('Create project update error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};


