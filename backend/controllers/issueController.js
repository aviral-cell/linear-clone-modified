import Issue from '../models/Issue.js';
import Activity from '../models/Activity.js';
import Team from '../models/Team.js';

export const getIssuesByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { status, parent } = req.query;

    const query = { team: teamId };
    if (status) query.status = status;
    if (parent !== undefined) {
      query.parent = parent === 'null' ? null : parent;
    }

    const issues = await Issue.find(query)
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar')
      .populate('team', 'name key icon')
      .populate('project', 'name identifier icon')
      .populate('parent', 'identifier title')
      .sort({ createdAt: -1 });

    res.json({ issues });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyIssues = async (req, res) => {
  try {
    const userId = req.user._id;
    const { filter } = req.query;

    let query;
    if (filter === 'created') {
      query = { creator: userId };
    } else if (filter === 'assigned') {
      query = { assignee: userId };
    } else {
      query = {
        $or: [{ creator: userId }, { assignee: userId }],
      };
    }

    const issues = await Issue.find(query)
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar')
      .populate('team', 'name key icon')
      .populate('project', 'name identifier icon')
      .populate('parent', 'identifier title')
      .sort({ createdAt: -1 });

    res.json({ issues });
  } catch (error) {
    console.error('Get my issues error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getIssueByIdentifier = async (req, res) => {
  try {
    const { identifier } = req.params;

    const issue = await Issue.findOne({ identifier })
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar')
      .populate('team', 'name key icon')
      .populate('project', 'name identifier icon')
      .populate('parent', 'identifier title status');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const subIssues = await Issue.find({ parent: issue._id })
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ issue, subIssues });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createIssue = async (req, res) => {
  try {
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
      return res.status(400).json({ message: 'Title and team are required' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (parent) {
      const parentIssue = await Issue.findById(parent);
      if (!parentIssue) {
        return res.status(404).json({ message: 'Parent issue not found' });
      }

      if (parentIssue.parent) {
        return res.status(400).json({
          message: 'Sub-issues cannot have another sub-issue',
        });
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
    await issue.populate([
      { path: 'assignee', select: 'name email avatar' },
      { path: 'creator', select: 'name email avatar' },
      { path: 'team', select: 'name key icon' },
      { path: 'project', select: 'name identifier icon' },
    ]);

    const activity = new Activity({
      issue: issue._id,
      user: req.user._id,
      action: 'created',
    });
    await activity.save();

    res.status(201).json({ issue });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateIssue = async (req, res) => {
  try {
    const { identifier } = req.params;
    const updates = req.body;

    const issue = await Issue.findOne({ identifier });
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
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
          return res.status(404).json({ message: 'Parent issue not found' });
        }
        if (parent.parent) {
          return res.status(400).json({
            message: 'Sub-issues cannot have another sub-issue',
          });
        }
        if (parent._id.toString() === issue._id.toString()) {
          return res.status(400).json({ message: 'Issue cannot be its own parent' });
        }
        if (parent.team.toString() !== issue.team.toString()) {
          return res.status(400).json({ message: 'Parent must be in the same team' });
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
      if (String(issue[field]) == String(updates[field])) {
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

    await issue.populate([
      { path: 'assignee', select: 'name email avatar' },
      { path: 'creator', select: 'name email avatar' },
      { path: 'team', select: 'name key icon' },
      { path: 'project', select: 'name identifier icon' },
      { path: 'parent', select: 'identifier title status' },
    ]);

    for (const change of changes) {
      const activity = new Activity({
        issue: issue._id,
        user: req.user._id,
        action: `updated_${change.field}`,
        changes: change,
      });
      await activity.save();
    }

    res.json({ issue });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
