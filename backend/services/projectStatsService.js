import Issue from '../models/Issue.js';

export const getProjectStats = async (projectIdOrIds) => {
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
