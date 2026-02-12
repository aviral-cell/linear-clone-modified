import IssueActivity from '../models/IssueActivity.js';

export const getIssueActivities = async (issueId) => {
  const activities = await IssueActivity.find({ issue: issueId })
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1, _id: -1 });

  return activities;
};
