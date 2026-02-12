import * as issueActivityService from '../services/issueActivityService.js';

export const getIssueActivities = async (req, res) => {
  const { issueId } = req.params;
  const activities = await issueActivityService.getIssueActivities(issueId);
  res.json({ activities });
};
