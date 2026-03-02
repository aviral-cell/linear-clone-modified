import Issue from '../../models/Issue.js';
import IssueActivity from '../../models/IssueActivity.js';
import { NotFoundError } from '../../utils/appError.js';

export const getIssueActivities = async (identifier) => {
  const issue = await Issue.findOne({ identifier });
  if (!issue) {
    throw new NotFoundError('Issue not found');
  }

  const activities = await IssueActivity.find({ issue: issue._id })
    .populate('user', 'name email avatar')

  return activities;
};
