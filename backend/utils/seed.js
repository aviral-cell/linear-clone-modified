import bcrypt from 'bcrypt';
import connectDatabase from '../config/database.js';
import User from '../models/User.js';
import Team from '../models/Team.js';
import Issue from '../models/Issue.js';
import Comment from '../models/Comment.js';
import Activity from '../models/Activity.js';

const teams = [
  {
    name: 'Engineering',
    key: 'ENG',
    icon: '⚙️',
    description: 'Core engineering team building the product',
  },
  {
    name: 'Design',
    key: 'DES',
    icon: '🎨',
    description: 'Product design and UX team',
  },
  {
    name: 'Marketing',
    key: 'MKT',
    icon: '📢',
    description: 'Marketing and growth team',
  },
  {
    name: 'Product',
    key: 'PRD',
    icon: '🚀',
    description: 'Product strategy and roadmap',
  },
];

const issuesData = [

  {
    team: 'ENG',
    title: 'Implement user authentication with JWT',
    description: 'Add JWT-based authentication to secure API endpoints',
    status: 'done',
    priority: 'high',
    assigneeIndex: 0,
  },
  {
    team: 'ENG',
    title: 'Create RESTful API endpoints for issues',
    description: 'Build CRUD operations for issues management',
    status: 'done',
    priority: 'high',
    assigneeIndex: 1,
  },
  {
    team: 'ENG',
    title: 'Setup MongoDB database schema',
    description: 'Design and implement database models for the application',
    status: 'done',
    priority: 'urgent',
    assigneeIndex: 0,
  },
  {
    team: 'ENG',
    title: 'Build real-time notifications system',
    description: 'Implement WebSocket-based notifications for issue updates',
    status: 'in_progress',
    priority: 'medium',
    assigneeIndex: 2,
  },
  {
    team: 'ENG',
    title: 'Add search functionality for issues',
    description: 'Implement full-text search across issues and comments',
    status: 'in_review',
    priority: 'medium',
    assigneeIndex: 1,
  },
  {
    team: 'ENG',
    title: 'Optimize database queries for performance',
    description: 'Add indexes and optimize slow queries',
    status: 'todo',
    priority: 'low',
    assigneeIndex: 0,
  },
  {
    team: 'ENG',
    title: 'Setup CI/CD pipeline',
    description: 'Configure automated testing and deployment',
    status: 'todo',
    priority: 'high',
    assigneeIndex: 2,
  },
  {
    team: 'ENG',
    title: 'Implement API rate limiting',
    description: 'Add rate limiting to prevent abuse of API endpoints',
    status: 'todo',
    priority: 'medium',
    assigneeIndex: 1,
  },
  {
    team: 'ENG',
    title: 'Add Redis caching layer',
    description: 'Implement Redis for caching frequently accessed data',
    status: 'todo',
    priority: 'medium',
    assigneeIndex: 0,
  },
  {
    team: 'ENG',
    title: 'Create admin dashboard',
    description: 'Build admin panel for system monitoring and management',
    status: 'todo',
    priority: 'low',
    assigneeIndex: null,
  },
  {
    team: 'ENG',
    title: 'Implement GraphQL API',
    description: 'Add GraphQL support alongside REST endpoints',
    status: 'in_progress',
    priority: 'medium',
    assigneeIndex: 2,
  },
  {
    team: 'ENG',
    title: 'Add OAuth integration',
    description: 'Support login with Google, GitHub, and other providers',
    status: 'in_progress',
    priority: 'high',
    assigneeIndex: 1,
  },
  {
    team: 'ENG',
    title: 'Implement data export feature',
    description: 'Allow users to export their data in various formats',
    status: 'in_progress',
    priority: 'low',
    assigneeIndex: 0,
  },
  {
    team: 'ENG',
    title: 'Add two-factor authentication',
    description: 'Implement 2FA for enhanced security',
    status: 'in_review',
    priority: 'high',
    assigneeIndex: 2,
  },
  {
    team: 'ENG',
    title: 'Create API documentation',
    description: 'Generate comprehensive API documentation using Swagger',
    status: 'in_review',
    priority: 'medium',
    assigneeIndex: 1,
  },
  {
    team: 'ENG',
    title: 'Implement webhook system',
    description: 'Allow external systems to subscribe to events',
    status: 'in_review',
    priority: 'medium',
    assigneeIndex: 0,
  },
  {
    team: 'ENG',
    title: 'Implement file upload functionality',
    description: 'Allow users to attach files to issues and comments',
    status: 'backlog',
    priority: 'medium',
    assigneeIndex: null,
  },
  {
    team: 'ENG',
    title: 'Add email notifications',
    description: 'Send email notifications for important issue updates',
    status: 'backlog',
    priority: 'low',
    assigneeIndex: null,
  },
  {
    team: 'ENG',
    title: 'Fix memory leak in issue fetching',
    description: 'Investigate and fix memory leak reported in production',
    status: 'cancelled',
    priority: 'urgent',
    assigneeIndex: 1,
  },

  {
    team: 'DES',
    title: 'Design dashboard layout',
    description: 'Create wireframes and mockups for the main dashboard',
    status: 'done',
    priority: 'high',
    assigneeIndex: 3,
  },
  {
    team: 'DES',
    title: 'Create design system components',
    description: 'Build a comprehensive design system with reusable components',
    status: 'in_progress',
    priority: 'urgent',
    assigneeIndex: 3,
  },
  {
    team: 'DES',
    title: 'Design mobile responsive views',
    description: 'Ensure all pages work seamlessly on mobile devices',
    status: 'in_review',
    priority: 'high',
    assigneeIndex: 4,
  },
  {
    team: 'DES',
    title: 'Create onboarding flow designs',
    description: 'Design user onboarding experience for new users',
    status: 'todo',
    priority: 'medium',
    assigneeIndex: 3,
  },
  {
    team: 'DES',
    title: 'Design dark mode theme',
    description: 'Create dark mode color palette and components',
    status: 'done',
    priority: 'medium',
    assigneeIndex: 4,
  },
  {
    team: 'DES',
    title: 'Update typography system',
    description: 'Refine font choices and type scale',
    status: 'backlog',
    priority: 'low',
    assigneeIndex: null,
  },

  {
    team: 'MKT',
    title: 'Launch product announcement campaign',
    description: 'Coordinate launch across all channels',
    status: 'in_progress',
    priority: 'urgent',
    assigneeIndex: 5,
  },
  {
    team: 'MKT',
    title: 'Create demo videos',
    description: 'Produce product walkthrough and feature highlight videos',
    status: 'todo',
    priority: 'high',
    assigneeIndex: 6,
  },
  {
    team: 'MKT',
    title: 'Update website copy',
    description: 'Refresh messaging on landing pages',
    status: 'in_review',
    priority: 'medium',
    assigneeIndex: 5,
  },
  {
    team: 'MKT',
    title: 'Plan social media content calendar',
    description: 'Schedule posts for Q1 2025',
    status: 'backlog',
    priority: 'medium',
    assigneeIndex: null,
  },

  {
    team: 'PRD',
    title: 'Define Q1 2025 roadmap',
    description: 'Prioritize features for next quarter',
    status: 'done',
    priority: 'urgent',
    assigneeIndex: 7,
  },
  {
    team: 'PRD',
    title: 'Conduct user research interviews',
    description: 'Interview 10 users about their workflow needs',
    status: 'in_progress',
    priority: 'high',
    assigneeIndex: 8,
  },
  {
    team: 'PRD',
    title: 'Write PRD for notifications feature',
    description: 'Document requirements for real-time notifications',
    status: 'todo',
    priority: 'medium',
    assigneeIndex: 7,
  },
  {
    team: 'PRD',
    title: 'Analyze user analytics data',
    description: 'Review usage patterns and identify improvement areas',
    status: 'backlog',
    priority: 'low',
    assigneeIndex: null,
  },
];

async function seed() {
  try {
    await connectDatabase();
    console.log('Connected to the database');

    await Promise.all([
      User.deleteMany({}),
      Team.deleteMany({}),
      Issue.deleteMany({}),
      Comment.deleteMany({}),
      Activity.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    const salt = await bcrypt.genSalt(12);

    const usersData = [
      {
        email: 'alex@flow.dev',
        name: 'Alex Rivers',
        password: await bcrypt.hash('Password@123', salt),
        role: 'admin',
      },
      {
        email: 'jordan@flow.dev',
        name: 'Jordan Chen',
        password: await bcrypt.hash('Password@123', salt),
      },
      {
        email: 'taylor@flow.dev',
        name: 'Taylor Morgan',
        password: await bcrypt.hash('Password@123', salt),
      },
      {
        email: 'casey@flow.dev',
        name: 'Casey Martinez',
        password: await bcrypt.hash('Password@123', salt),
      },
      {
        email: 'riley@flow.dev',
        name: 'Riley Parker',
        password: await bcrypt.hash('Password@123', salt),
      },
      {
        email: 'avery@flow.dev',
        name: 'Avery Brooks',
        password: await bcrypt.hash('Password@123', salt),
      },
      {
        email: 'quinn@flow.dev',
        name: 'Quinn Hayes',
        password: await bcrypt.hash('Password@123', salt),
      },
      {
        email: 'morgan@flow.dev',
        name: 'Morgan Lee',
        password: await bcrypt.hash('Password@123', salt),
      },
      {
        email: 'dakota@flow.dev',
        name: 'Dakota Wells',
        password: await bcrypt.hash('Password@123', salt),
      },
    ];

    const insertedUsers = await User.insertMany(usersData);
    console.log('Users seeded successfully');

    const insertedTeams = [];
    for (const teamData of teams) {
      const team = new Team({
        ...teamData,
        members: insertedUsers.map((u) => u._id),
      });
      await team.save();
      insertedTeams.push(team);
    }
    console.log('Teams seeded successfully');

    const insertedIssues = [];
    for (const issueData of issuesData) {
      const team = insertedTeams.find((t) => t.key === issueData.team);
      const count = insertedIssues.filter((i) => i.team.toString() === team._id.toString()).length;
      const identifier = `${team.key}-${count + 1}`;

      const issue = new Issue({
        identifier,
        title: issueData.title,
        description: issueData.description,
        status: issueData.status,
        priority: issueData.priority,
        team: team._id,
        assignee: issueData.assigneeIndex !== null ? insertedUsers[issueData.assigneeIndex]._id : null,
        creator: insertedUsers[0]._id,
      });

      await issue.save();
      insertedIssues.push(issue);

      const activity = new Activity({
        issue: issue._id,
        user: insertedUsers[0]._id,
        action: 'created',
      });
      await activity.save();
    }
    console.log('Issues seeded successfully');

    const parentIssue = insertedIssues.find((i) => i.identifier === 'ENG-1');
    if (parentIssue) {
      const subIssue1 = new Issue({
        identifier: `ENG-${insertedIssues.filter((i) => i.team.toString() === parentIssue.team.toString()).length + 1}`,
        title: 'Add JWT token generation',
        description: 'Implement JWT token generation logic',
        status: 'done',
        priority: 'high',
        team: parentIssue.team,
        assignee: insertedUsers[0]._id,
        creator: insertedUsers[0]._id,
        parentIssue: parentIssue._id,
      });
      await subIssue1.save();

      const subIssue2 = new Issue({
        identifier: `ENG-${insertedIssues.filter((i) => i.team.toString() === parentIssue.team.toString()).length + 2}`,
        title: 'Add token validation middleware',
        description: 'Create middleware to validate JWT tokens',
        status: 'done',
        priority: 'high',
        team: parentIssue.team,
        assignee: insertedUsers[1]._id,
        creator: insertedUsers[0]._id,
        parentIssue: parentIssue._id,
      });
      await subIssue2.save();
    }

    const issueWithComments = insertedIssues.find((i) => i.identifier === 'ENG-4');
    if (issueWithComments) {
      const comments = [
        {
          issue: issueWithComments._id,
          user: insertedUsers[0]._id,
          content: 'We should use Socket.io for this. It has great browser support.',
        },
        {
          issue: issueWithComments._id,
          user: insertedUsers[2]._id,
          content: 'Agreed! I\'ll start with the basic connection setup.',
        },
        {
          issue: issueWithComments._id,
          user: insertedUsers[1]._id,
          content: 'Make sure to handle reconnection logic properly.',
        },
      ];

      await Comment.insertMany(comments);
      console.log('Comments seeded successfully');
    }

    console.log('\n=================================');
    console.log('Data seeding completed successfully!');
    console.log('=================================');
    console.log('\nLogin credentials:');
    console.log('Email: alex@flow.dev');
    console.log('Password: Password@123');
    console.log('=================================\n');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seed().catch((error) => {
  console.error('Error in seed script:', error);
  process.exit(1);
});
