import Comment from '../../../models/Comment.js';
import { getCommentsData } from '../data/commentsData.js';

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
