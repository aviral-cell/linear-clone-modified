import IssueActivity from '../models/IssueActivity.js';

export const getIssueActivities = async (req, res) => {
  const { issueId } = req.params;

  const activities = await IssueActivity.find({ issue: issueId })
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1, _id: -1 });

  res.json({ activities });
};
