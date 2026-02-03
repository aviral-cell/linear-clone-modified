import Issue from '../models/Issue.js';

/**
 * Recursively find all descendant issue IDs
 * @param {ObjectId} issueId - The issue to get descendants for
 * @param {Set} visited - Set of visited issue IDs to prevent infinite loops
 * @returns {Promise<Array>} Array of descendant issue IDs
 */
export const getDescendants = async (issueId, visited = new Set()) => {
  // Prevent infinite loops in case of corrupted data
  if (visited.has(issueId.toString())) {
    return [];
  }
  visited.add(issueId.toString());

  try {
    // Find all direct children
    const children = await Issue.find({ parent: issueId }).select('_id');

    if (children.length === 0) {
      return [];
    }

    const descendants = [];

    // Add direct children
    for (const child of children) {
      descendants.push(child._id);

      // Recursively get descendants of each child
      const childDescendants = await getDescendants(child._id, visited);
      descendants.push(...childDescendants);
    }

    return descendants;
  } catch (error) {
    console.error('Error getting descendants:', error);
    return [];
  }
};

/**
 * Walk up the parent chain to get all ancestor issue IDs
 * @param {ObjectId} issueId - The issue to get ancestors for
 * @returns {Promise<Array>} Array of ancestor issue IDs (nearest first)
 */
export const getAncestors = async (issueId) => {
  const ancestors = [];
  let currentId = issueId;

  try {
    while (currentId) {
      const issue = await Issue.findById(currentId).select('parent');

      if (!issue || !issue.parent) {
        break;
      }

      // Prevent infinite loops
      if (ancestors.some(ancestorId => ancestorId.toString() === issue.parent.toString())) {
        console.error('Circular reference detected in ancestors');
        break;
      }

      ancestors.push(issue.parent);
      currentId = issue.parent;
    }

    return ancestors;
  } catch (error) {
    console.error('Error getting ancestors:', error);
    return [];
  }
};

/**
 * Validate if setting a new parent would create a circular reference
 * @param {ObjectId} issueId - The issue being updated
 * @param {ObjectId} newParentId - The proposed new parent
 * @returns {Promise<Object>} {valid: boolean, reason?: string}
 */
export const validateParentChange = async (issueId, newParentId) => {
  // Check for self-parenting
  if (issueId.toString() === newParentId.toString()) {
    return {
      valid: false,
      reason: 'Issue cannot be its own parent'
    };
  }

  try {
    // Get all descendants of the current issue
    const descendants = await getDescendants(issueId);

    // Check if the new parent is a descendant (would create circular reference)
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

/**
 * Get all valid parent candidates for an issue
 * Excludes self and all descendants
 * @param {ObjectId} issueId - The issue to get valid parents for
 * @returns {Promise<Array>} Array of valid parent issues (populated)
 */
export const getValidParentCandidates = async (issueId) => {
  try {
    const issue = await Issue.findById(issueId).select('team');

    if (!issue) {
      return [];
    }

    // Get all descendants to exclude them
    const descendants = await getDescendants(issueId);

    // Build exclusion list: self + descendants
    const excludeIds = [issueId, ...descendants];

    // Find all issues in the same team, excluding self and descendants
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

/**
 * Calculate the depth of an issue in the hierarchy
 * @param {ObjectId} issueId - The issue to get depth for
 * @returns {Promise<number>} Number of ancestors (0 for root issues)
 */
export const getIssueDepth = async (issueId) => {
  try {
    const ancestors = await getAncestors(issueId);
    return ancestors.length;
  } catch (error) {
    console.error('Error getting issue depth:', error);
    return 0;
  }
};

/**
 * Get the full hierarchy path from root to current issue
 * @param {ObjectId} issueId - The issue to get path for
 * @returns {Promise<Array>} Array of Issue objects from root to current
 */
export const getHierarchyPath = async (issueId) => {
  try {
    const ancestors = await getAncestors(issueId);

    if (ancestors.length === 0) {
      // Root issue - return just itself
      const issue = await Issue.findById(issueId);
      return issue ? [issue] : [];
    }

    // Get all issues in the path (ancestors + current)
    const pathIds = [...ancestors.reverse(), issueId];
    const issues = await Issue.find({ _id: { $in: pathIds } })
      .populate('assignee', 'name email avatar');

    // Sort to maintain correct order from root to current
    const orderedIssues = pathIds.map(id =>
      issues.find(issue => issue._id.toString() === id.toString())
    ).filter(Boolean);

    return orderedIssues;
  } catch (error) {
    console.error('Error getting hierarchy path:', error);
    return [];
  }
};

/**
 * FUTURE OPTIMIZATION: Get descendants using MongoDB's $graphLookup
 * This is more efficient for deep hierarchies but requires MongoDB 3.4+
 *
 * export const getDescendantsOptimized = async (issueId) => {
 *   try {
 *     const result = await Issue.aggregate([
 *       { $match: { _id: issueId } },
 *       {
 *         $graphLookup: {
 *           from: 'issues',
 *           startWith: '$_id',
 *           connectFromField: '_id',
 *           connectToField: 'parent',
 *           as: 'descendants',
 *           maxDepth: 100
 *         }
 *       }
 *     ]);
 *
 *     if (result.length === 0) {
 *       return [];
 *     }
 *
 *     return result[0].descendants.map(d => d._id);
 *   } catch (error) {
 *     console.error('Error getting descendants (optimized):', error);
 *     return [];
 *   }
 * };
 */
