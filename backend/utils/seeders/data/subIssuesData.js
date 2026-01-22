export function getSubIssuesData(parentIssue, team, users) {
  // Note: identifier will be set dynamically in the seeder to ensure sequential numbering
  return [
    {
      title: 'Add JWT token generation',
      description: 'Implement JWT token generation logic',
      status: 'done',
      priority: 'high',
      team: team._id,
      assignee: users[0]._id,
      creator: users[0]._id,
      parentIssue: parentIssue._id,
    },
    {
      title: 'Add token validation middleware',
      description: 'Create middleware to validate JWT tokens',
      status: 'done',
      priority: 'high',
      team: team._id,
      assignee: users[1]._id,
      creator: users[0]._id,
      parentIssue: parentIssue._id,
    },
  ];
}
