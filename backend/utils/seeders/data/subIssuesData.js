export function getSubIssuesData(parentIssue, team, users) {
  const title = parentIssue.title.toLowerCase();
  const subIssues = [];

  if (title.includes('authentication') || title.includes('jwt') || title.includes('auth')) {
    subIssues.push(
      {
        title: 'Add JWT token generation',
        description: 'Implement JWT token generation logic',
        status: 'done',
        priority: 'high',
        team: team._id,
        assignee: users[0]?._id || users[0],
        creator: users[0]?._id || users[0],
        parentIssue: parentIssue._id,
      },
      {
        title: 'Add token validation middleware',
        description: 'Create middleware to validate JWT tokens',
        status: 'done',
        priority: 'high',
        team: team._id,
        assignee: users[1]?._id || users[1],
        creator: users[0]?._id || users[0],
        parentIssue: parentIssue._id,
      }
    );
  } else if (title.includes('database') || title.includes('schema') || title.includes('query')) {
    subIssues.push(
      {
        title: 'Design database schema',
        description: 'Create ER diagrams and schema design',
        status: 'done',
        priority: 'high',
        team: team._id,
        assignee: users[0]?._id || users[0],
        creator: users[0]?._id || users[0],
        parentIssue: parentIssue._id,
      },
      {
        title: 'Create database migrations',
        description: 'Write migration scripts for schema changes',
        status: 'in_progress',
        priority: 'high',
        team: team._id,
        assignee: users[1]?._id || users[1],
        creator: users[0]?._id || users[0],
        parentIssue: parentIssue._id,
      },
      {
        title: 'Add database indexes',
        description: 'Create indexes for frequently queried fields',
        status: 'todo',
        priority: 'medium',
        team: team._id,
        assignee: users[0]?._id || users[0],
        creator: users[0]?._id || users[0],
        parentIssue: parentIssue._id,
      }
    );
  } else if (title.includes('ci/cd') || title.includes('pipeline') || title.includes('deployment')) {
    subIssues.push(
      {
        title: 'Setup GitHub Actions workflow',
        description: 'Configure CI/CD pipeline with GitHub Actions',
        status: 'in_progress',
        priority: 'high',
        team: team._id,
        assignee: users[0]?._id || users[0],
        creator: users[0]?._id || users[0],
        parentIssue: parentIssue._id,
      },
      {
        title: 'Add automated testing',
        description: 'Integrate unit and integration tests in pipeline',
        status: 'todo',
        priority: 'high',
        team: team._id,
        assignee: users[1]?._id || users[1],
        creator: users[0]?._id || users[0],
        parentIssue: parentIssue._id,
      },
      {
        title: 'Configure deployment stages',
        description: 'Setup staging and production deployment environments',
        status: 'todo',
        priority: 'medium',
        team: team._id,
        assignee: users[0]?._id || users[0],
        creator: users[0]?._id || users[0],
        parentIssue: parentIssue._id,
      }
    );
  } else if (title.includes('security') || title.includes('audit') || title.includes('vulnerability')) {
    subIssues.push(
      {
        title: 'Run security vulnerability scan',
        description: 'Execute automated security scanning tools',
        status: 'in_progress',
        priority: 'urgent',
        team: team._id,
        assignee: users[0]?._id || users[0],
        creator: users[0]?._id || users[0],
        parentIssue: parentIssue._id,
      },
      {
        title: 'Review and fix security issues',
        description: 'Address identified security vulnerabilities',
        status: 'todo',
        priority: 'high',
        team: team._id,
        assignee: users[1]?._id || users[1],
        creator: users[0]?._id || users[0],
        parentIssue: parentIssue._id,
      },
      {
        title: 'Implement security best practices',
        description: 'Apply OWASP recommendations and security guidelines',
        status: 'todo',
        priority: 'high',
        team: team._id,
        assignee: users[0]?._id || users[0],
        creator: users[0]?._id || users[0],
        parentIssue: parentIssue._id,
      }
    );
  } else if (title.includes('design system') || title.includes('components')) {
    subIssues.push(
      {
        title: 'Create component library',
        description: 'Build reusable UI component library',
        status: 'in_progress',
        priority: 'high',
        team: team._id,
        assignee: users[0]?._id || users[0],
        creator: users[0]?._id || users[0],
        parentIssue: parentIssue._id,
      },
      {
        title: 'Document design tokens',
        description: 'Create comprehensive documentation for design tokens',
        status: 'todo',
        priority: 'medium',
        team: team._id,
        assignee: users[1]?._id || users[1],
        creator: users[0]?._id || users[0],
        parentIssue: parentIssue._id,
      }
    );
  } else if (title.includes('mobile') || title.includes('responsive')) {
    subIssues.push(
      {
        title: 'Design mobile navigation',
        description: 'Create mobile-first navigation patterns',
        status: 'in_progress',
        priority: 'high',
        team: team._id,
        assignee: users[0]?._id || users[0],
        creator: users[0]?._id || users[0],
        parentIssue: parentIssue._id,
      },
      {
        title: 'Optimize mobile performance',
        description: 'Improve loading times and responsiveness on mobile',
        status: 'todo',
        priority: 'medium',
        team: team._id,
        assignee: users[1]?._id || users[1],
        creator: users[0]?._id || users[0],
        parentIssue: parentIssue._id,
      }
    );
  } else if (title.includes('campaign') || title.includes('launch')) {
    subIssues.push(
      {
        title: 'Create launch content',
        description: 'Develop marketing content for product launch',
        status: 'in_progress',
        priority: 'high',
        team: team._id,
        assignee: users[0]?._id || users[0],
        creator: users[0]?._id || users[0],
        parentIssue: parentIssue._id,
      },
      {
        title: 'Schedule social media posts',
        description: 'Plan and schedule social media campaign',
        status: 'todo',
        priority: 'medium',
        team: team._id,
        assignee: users[1]?._id || users[1],
        creator: users[0]?._id || users[0],
        parentIssue: parentIssue._id,
      }
    );
  } else if (title.includes('roadmap')) {
    subIssues.push(
      {
        title: 'Prioritize features',
        description: 'Use RICE framework to prioritize roadmap items',
        status: 'in_progress',
        priority: 'high',
        team: team._id,
        assignee: users[0]?._id || users[0],
        creator: users[0]?._id || users[0],
        parentIssue: parentIssue._id,
      },
      {
        title: 'Gather stakeholder feedback',
        description: 'Collect and analyze feedback from stakeholders',
        status: 'todo',
        priority: 'medium',
        team: team._id,
        assignee: users[1]?._id || users[1],
        creator: users[0]?._id || users[0],
        parentIssue: parentIssue._id,
      }
    );
  } else {
    subIssues.push(
      {
        title: 'Research and planning',
        description: 'Conduct research and create implementation plan',
        status: 'in_progress',
        priority: 'medium',
        team: team._id,
        assignee: users[0]?._id || users[0],
        creator: users[0]?._id || users[0],
        parentIssue: parentIssue._id,
      },
      {
        title: 'Implementation',
        description: 'Implement core functionality',
        status: 'todo',
        priority: 'high',
        team: team._id,
        assignee: users[1]?._id || users[1],
        creator: users[0]?._id || users[0],
        parentIssue: parentIssue._id,
      }
    );
  }

  return subIssues;
}
