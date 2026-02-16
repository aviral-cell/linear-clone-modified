import * as issueActivityService from '../services/issueActivityService.js';

export const getIssueActivities = async (req, res) => {
  const { identifier } = req.params;
  const activities = await issueActivityService.getIssueActivities(identifier);
  res.json({ activities });
};
