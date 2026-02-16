import IssueActivity from '../../models/IssueActivity.js';
import Issue from '../../models/Issue.js';
import { NotFoundError } from '../../utils/appError.js';

export const getIssueActivities = async (identifier) => {
  const issue = await Issue.findOne({ identifier });
  if (!issue) {
    throw new NotFoundError('Issue not found');
  }

  const activities = await IssueActivity.find({ issue: issue._id })
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1, _id: -1 });

  return activities;
};
