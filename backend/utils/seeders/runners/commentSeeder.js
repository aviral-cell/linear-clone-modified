import Comment from '../../../models/Comment.js';
import { getCommentsData } from '../data/commentsData.js';

/**
 * Seeds comments into the database
 * @param {Array} issues - Array of issue documents
 * @param {Array} users - Array of user documents
 * @param {string} targetIssueIdentifier - Identifier of the issue to add comments to
 * @returns {Promise<Array>} Array of inserted comment documents
 */
export async function seedComments(issues, users, targetIssueIdentifier = 'ENG-4') {
  console.log('Seeding comments...');
  const issueWithComments = issues.find((i) => i.identifier === targetIssueIdentifier);

  if (!issueWithComments) {
    console.log(`Issue ${targetIssueIdentifier} not found, skipping comments`);
    return [];
  }

  const commentsData = getCommentsData(issueWithComments._id, users);
  const insertedComments = await Comment.insertMany(commentsData);

  console.log(`✓ Comments seeded successfully (${insertedComments.length} comments)`);
  return insertedComments;
}
