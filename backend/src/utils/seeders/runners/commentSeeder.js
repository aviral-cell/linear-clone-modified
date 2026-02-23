import Comment from '../../../models/Comment.js';
import { getCommentsData } from '../data/commentsData.js';

const TARGET_IDENTIFIERS = ['DES-1', 'DES-5', 'DES-14'];

export async function seedComments(issues, users) {
  console.log('Seeding comments...');

  const issueMap = {};
  for (const identifier of TARGET_IDENTIFIERS) {
    const issue = issues.find((i) => i.identifier === identifier);
    if (issue) {
      issueMap[identifier] = issue._id;
    }
  }

  if (Object.keys(issueMap).length === 0) {
    console.log('No target issues found, skipping comments');
    return [];
  }

  const commentsData = getCommentsData(issueMap, users);
  const insertedComments = await Comment.insertMany(commentsData);

  console.log(`✓ Comments seeded successfully (${insertedComments.length} comments)`);
  return insertedComments;
}
