import Issue from '../models/Issue.js';

export const getDescendants = async (issueId, visited = new Set()) => {
  if (visited.has(issueId.toString())) {
    return [];
  }
  visited.add(issueId.toString());

  const children = await Issue.find({ parent: issueId }).select('_id');

  if (children.length === 0) {
    return [];
  }

  const descendants = [];

  for (const child of children) {
    descendants.push(child._id);
    const childDescendants = await getDescendants(child._id, visited);
    descendants.push(...childDescendants);
  }

  return descendants;
};

export const validateParentChange = async (issueId, newParentId) => {
  if (issueId.toString() === newParentId.toString()) {
    return {
      valid: false,
      reason: 'Issue cannot be its own parent'
    };
  }

  const descendants = await getDescendants(issueId);

  const isDescendant = descendants.some(
    descendantId => descendantId.toString() === newParentId.toString()
  );

  if (isDescendant) {
    return {
      valid: false,
      reason: 'Cannot set parent to a descendant issue (would create circular reference)'
    };
  }

  return { valid: true };
};

export const getValidParentCandidates = async (issueId) => {
  const issue = await Issue.findById(issueId).select('team');

  if (!issue) {
    return [];
  }

  const descendants = await getDescendants(issueId);
  const excludeIds = [issueId, ...descendants];

  const validParents = await Issue.find({
    _id: { $nin: excludeIds },
    team: issue.team,
  })
    .populate('parent', 'identifier title')
    .populate('assignee', 'name email avatar')
    .sort({ createdAt: -1 });

  return validParents;
};
