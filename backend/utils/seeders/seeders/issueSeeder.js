import Issue from '../../../models/Issue.js';
import Activity from '../../../models/Activity.js';
import { issuesData } from '../data/issuesData.js';
import { getSubIssuesData } from '../data/subIssuesData.js';

/**
 * Seeds issues into the database
 * @param {Array} teams - Array of team documents
 * @param {Array} users - Array of user documents
 * @param {Array} projects - Array of project documents
 * @param {Object} creator - User document to set as creator
 * @returns {Promise<Array>} Array of inserted issue documents
 */
export async function seedIssues(teams, users, projects, creator) {
  console.log('Seeding issues...');
  const insertedIssues = [];

  for (const issueData of issuesData) {
    const team = teams.find((t) => t.key === issueData.team);
    if (!team) {
      console.warn(`Team ${issueData.team} not found, skipping issue: ${issueData.title}`);
      continue;
    }

    const count = insertedIssues.filter((i) => i.team.toString() === team._id.toString()).length;
    const identifier = `${team.key}-${count + 1}`;

    // Attach roughly half the issues for a team to its first project
    const teamProjects = projects.filter(
      (p) => p.team.toString() === team._id.toString()
    );
    const primaryProject = teamProjects.length > 0 ? teamProjects[0] : null;

    const issue = new Issue({
      identifier,
      title: issueData.title,
      description: issueData.description,
      status: issueData.status,
      priority: issueData.priority,
      team: team._id,
      project: primaryProject && count % 2 === 0 ? primaryProject._id : null,
      assignee: issueData.assigneeIndex !== null ? users[issueData.assigneeIndex]._id : null,
      creator: creator._id,
    });

    await issue.save();
    insertedIssues.push(issue);

    // Create activity for issue creation
    const activity = new Activity({
      issue: issue._id,
      user: creator._id,
      action: 'created',
    });
    await activity.save();
  }

  // Seed sub-issues
  const parentIssue = insertedIssues.find((i) => i.identifier === 'ENG-1');
  if (parentIssue) {
    const team = teams.find((t) => t._id.toString() === parentIssue.team.toString());
    
    // Calculate identifiers dynamically to ensure sequential numbering
    const subIssuesData = getSubIssuesData(parentIssue, team, users);
    for (const subIssueData of subIssuesData) {
      // Calculate identifier based on current count (will be updated after each save)
      const currentCount = insertedIssues.filter(
        (i) => i.team.toString() === parentIssue.team.toString()
      ).length;
      subIssueData.identifier = `${team.key}-${currentCount + 1}`;
      
      const subIssue = new Issue(subIssueData);
      await subIssue.save();
      insertedIssues.push(subIssue);

      // Create activity for sub-issue creation
      const activity = new Activity({
        issue: subIssue._id,
        user: creator._id,
        action: 'created',
      });
      await activity.save();
    }
  }

  console.log(`✓ Issues seeded successfully (${insertedIssues.length} issues)`);
  return insertedIssues;
}
