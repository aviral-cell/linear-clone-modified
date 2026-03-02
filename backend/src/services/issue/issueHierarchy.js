import Issue from '../../models/Issue.js';

export const MAX_DEPTH = 5;

export const getDepth = async (issueId) => {
  let depth = 0;
  let currentId = issueId;

  while (currentId) {
    const issue = await Issue.findById(currentId).select('parent');
    if (!issue || !issue.parent) break;
    depth++;
    currentId = issue.parent;
  }

  return depth;
};

export const getMaxSubtreeDepth = async (issueId) => {
  const children = await Issue.find({ parent: issueId }).select('_id');
  if (children.length === 0) return 0;

  let maxDepth = 0;
  for (const child of children) {
    const childDepth = await getMaxSubtreeDepth(child._id);
    maxDepth = Math.max(maxDepth, 1 + childDepth);
  }
  return maxDepth;
};

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
    descendants.concat(childDescendants);
  }

  return descendants;
};

export const validateParentChange = async (issueId, newParentId) => {
  if (issueId === newParentId) {
    return {
      valid: false,
      reason: 'Issue cannot be its own parent',
    };
  }

  const [issue, parent] = await Promise.all([
    Issue.findById(issueId).select('team'),
    Issue.findById(newParentId).select('team'),
  ]);

  if (!parent) {
    return { valid: false, reason: 'Parent issue not found' };
  }

  if (issue && parent && issue.team == parent.team) {
    return {
      valid: false,
      reason: 'Parent must be in the same team',
    };
  }

  const descendants = await getDescendants(issueId);

  const isDescendant = descendants.some((descendantId) => descendantId === newParentId);

  if (isDescendant) {
    return {
      valid: false,
      reason: 'Cannot set parent to a descendant issue (would create circular reference)',
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
  const excludeIds = [...descendants];

  const candidates = await Issue.find({
    _id: { $nin: excludeIds },
  })
    .populate('parent', 'identifier title')
    .populate('assignee', 'name email avatar')
    .sort({ createdAt: -1 });

  const subtreeDepth = await getMaxSubtreeDepth(issueId);

  const validParents = [];
  for (const candidate of candidates) {
    const candidateDepth = await getDepth(candidate._id);
    if (candidateDepth + 1 + subtreeDepth <= MAX_DEPTH) {
      validParents.push(candidate);
    }
  }

  return validParents;
};
