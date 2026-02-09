import Issue from '../models/Issue.js';

export const getDescendants = async (issueId, visited = new Set()) => {
  if (visited.has(issueId.toString())) {
    return [];
  }
  visited.add(issueId.toString());

  try {
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
  } catch (error) {
    console.error('Error getting descendants:', error);
    return [];
  }
};

export const validateParentChange = async (issueId, newParentId) => {
  if (issueId.toString() === newParentId.toString()) {
    return {
      valid: false,
      reason: 'Issue cannot be its own parent'
    };
  }

  try {
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
  } catch (error) {
    console.error('Error validating parent change:', error);
    return {
      valid: false,
      reason: 'Error validating parent change'
    };
  }
};

export const getValidParentCandidates = async (issueId) => {
  try {
    const issue = await Issue.findById(issueId).select('team');

    if (!issue) {
      return [];
    }

    const descendants = await getDescendants(issueId);
    const excludeIds = [issueId, ...descendants];

    const validParents = await Issue.find({
      team: issue.team,
      _id: { $nin: excludeIds }
    })
      .populate('parent', 'identifier title')
      .populate('assignee', 'name email avatar')
      .sort({ createdAt: -1 });

    return validParents;
  } catch (error) {
    console.error('Error getting valid parent candidates:', error);
    return [];
  }
};

