import Issue from '../../../models/Issue.js';
import IssueActivity from '../../../models/IssueActivity.js';
import { issuesData } from '../data/issuesData.js';
import { getSubIssuesData } from '../data/subIssuesData.js';

const isHighEffort = (issue) => {
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
};

export async function seedIssues(teams, users, projects, creator) {
  console.log('Seeding issues...');
  const insertedIssues = [];
  const teamCounters = {};
  let subIssueCount = 0;
  let parentCount = 0;
  const MAX_PARENTS = 8;

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

    const teamId = team._id.toString();
    if (!teamCounters[teamId]) teamCounters[teamId] = 0;
    teamCounters[teamId]++;
    const identifier = `${team.key}-${teamCounters[teamId]}`;

    const teamProjects = teamProjectMap[teamId] || [];

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

    const activity = new IssueActivity({
      issue: issue._id,
      user: creator._id,
      action: 'created',
    });
    await activity.save();

    if (parentCount < MAX_PARENTS && isHighEffort(issue)) {
      parentCount++;
      const subIssues = getSubIssuesData(issue, team, users);

      for (const subIssueData of subIssues) {
        teamCounters[teamId]++;
        subIssueData.identifier = `${team.key}-${teamCounters[teamId]}`;
        subIssueData.project = issue.project || null;

        const subIssue = new Issue(subIssueData);
        await subIssue.save();
        insertedIssues.push(subIssue);
        subIssueCount++;

        const subActivity = new IssueActivity({
          issue: subIssue._id,
          user: creator._id,
          action: 'created',
        });
        await subActivity.save();
      }
    }
  }

  if (subIssueCount > 0) {
    console.log(`  → Created ${subIssueCount} sub-issues across ${parentCount} parent issues`);
  }

  console.log(`✓ Issues seeded successfully (${insertedIssues.length} issues)`);
  return insertedIssues;
}
