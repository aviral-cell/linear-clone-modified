import Issue from '../../../models/Issue.js';
import IssueActivity from '../../../models/IssueActivity.js';
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

  const teamProjectMap = {};
  projects.forEach((project) => {
    const teamId = project.team.toString();
    if (!teamProjectMap[teamId]) {
      teamProjectMap[teamId] = [];
    }
    teamProjectMap[teamId].push(project);
  });

  for (const issueData of issuesData) {
    const team = teams.find((t) => t.key === issueData.team);
    if (!team) {
      console.warn(`Team ${issueData.team} not found, skipping issue: ${issueData.title}`);
      continue;
    }

    const count = insertedIssues.filter((i) => i.team.toString() === team._id.toString()).length;
    const identifier = `${team.key}-${count + 1}`;

    const teamProjects = teamProjectMap[team._id.toString()] || [];
    
    let assignedProject = null;
    
    if (teamProjects.length > 0) {
      const shouldAssignToProject = Math.random() < 0.65;
      
      if (shouldAssignToProject) {
        if (issueData.projectIndex !== undefined && issueData.projectIndex !== null) {
          const projectIndex = Math.min(issueData.projectIndex, teamProjects.length - 1);
          assignedProject = teamProjects[projectIndex];
        } else {
          const randomIndex = Math.floor(Math.random() * teamProjects.length);
          assignedProject = teamProjects[randomIndex];
        }
      }
    }

    const issue = new Issue({
      identifier,
      title: issueData.title,
      description: issueData.description,
      status: issueData.status,
      priority: issueData.priority,
      team: team._id,
      project: assignedProject ? assignedProject._id : null,
      assignee: issueData.assigneeIndex !== null ? users[issueData.assigneeIndex]._id : null,
      creator: creator._id,
    });

    await issue.save();
    insertedIssues.push(issue);

    // Create activity for issue creation
    const activity = new IssueActivity({
      issue: issue._id,
      user: creator._id,
      action: 'created',
    });
    await activity.save();
  }

  // Seed sub-issues for high-effort issues
  const highEffortIssues = insertedIssues.filter((issue) => {
    const isHighPriority = issue.priority === 'urgent' || issue.priority === 'high';
    const isInProgress = issue.status === 'in_progress' || issue.status === 'in_review';
    const title = issue.title.toLowerCase();
    const isComplexIssue = 
      title.includes('authentication') ||
      title.includes('database') ||
      title.includes('schema') ||
      title.includes('ci/cd') ||
      title.includes('pipeline') ||
      title.includes('security') ||
      title.includes('audit') ||
      title.includes('design system') ||
      title.includes('mobile') ||
      title.includes('campaign') ||
      title.includes('launch') ||
      title.includes('roadmap');
    
    return (isHighPriority || isInProgress) && isComplexIssue;
  });

  let subIssueCount = 0;
  for (const parentIssue of highEffortIssues.slice(0, 8)) {
    const team = teams.find((t) => t._id.toString() === parentIssue.team.toString());
    
    if (!team) continue;
    
    const subIssuesData = getSubIssuesData(parentIssue, team, users);
    
    for (const subIssueData of subIssuesData) {
      const currentCount = insertedIssues.filter(
        (i) => i.team.toString() === parentIssue.team.toString()
      ).length;
      subIssueData.identifier = `${team.key}-${currentCount + 1}`;
      
      subIssueData.project = parentIssue.project || null;
      
      const subIssue = new Issue(subIssueData);
      await subIssue.save();
      insertedIssues.push(subIssue);
      subIssueCount++;

      const activity = new IssueActivity({
        issue: subIssue._id,
        user: creator._id,
        action: 'created',
      });
      await activity.save();
    }
  }

  if (subIssueCount > 0) {
    console.log(`  → Created ${subIssueCount} sub-issues across ${highEffortIssues.slice(0, 8).length} parent issues`);
  }

  console.log(`✓ Issues seeded successfully (${insertedIssues.length} issues)`);
  return insertedIssues;
}
