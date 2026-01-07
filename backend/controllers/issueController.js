import Issue from '../models/Issue.js';
import Activity from '../models/Activity.js';
import Team from '../models/Team.js';

export const getIssuesByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { status, parentIssue } = req.query;

    const query = { team: teamId };
    if (status) query.status = status;
    if (parentIssue !== undefined) {
      query.parentIssue = parentIssue === 'null' ? null : parentIssue;
    }

    const issues = await Issue.find(query)
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar')
      .populate('team', 'name key icon')
      .populate('parentIssue', 'identifier title')
      .sort({ createdAt: -1 });

    res.json({ issues });
  } catch (error) {
    console.error('Get issues error:', error);
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
      .populate('parentIssue', 'identifier title status');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const subIssues = await Issue.find({ parentIssue: issue._id })
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
      assignee,
      parentIssue,
      labels,
    } = req.body;

    if (!title || !teamId) {
      return res.status(400).json({ message: 'Title and team are required' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
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
      assignee: assignee || null,
      creator: req.user._id,
      parentIssue: parentIssue || null,
      labels: labels || [],
    });

    await issue.save();
    await issue.populate([
      { path: 'assignee', select: 'name email avatar' },
      { path: 'creator', select: 'name email avatar' },
      { path: 'team', select: 'name key icon' },
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

    const changes = [];
    const fieldsToTrack = [
      'status',
      'priority',
      'assignee',
      'title',
      'description',
    ];

    fieldsToTrack.forEach((field) => {
      if (
        updates[field] !== undefined &&
        String(issue[field]) !== String(updates[field])
      ) {
        changes.push({
          field,
          oldValue: issue[field],
          newValue: updates[field],
        });
      }
    });

    Object.assign(issue, updates);
    await issue.save();

    await issue.populate([
      { path: 'assignee', select: 'name email avatar' },
      { path: 'creator', select: 'name email avatar' },
      { path: 'team', select: 'name key icon' },
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
