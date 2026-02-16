export function getTeamSpecificProjects(teamKey, teamName) {
  const projectTemplates = {
    ENG: [
      {
        name: 'API Gateway Refactoring',
        status: 'in_progress',
        priority: 'urgent',
        summary:
          'Modernize our API gateway infrastructure to improve performance and scalability. Migrating from legacy system to microservices architecture.',
        description:
          "This project involves refactoring our entire API gateway to support better routing, rate limiting, and authentication. We're migrating from a monolithic approach to a distributed microservices architecture.",
      },
      {
        name: 'Database Optimization Initiative',
        status: 'in_progress',
        priority: 'high',
        summary:
          'Optimize database queries and implement proper indexing to reduce response times by 40%.',
        description:
          'Comprehensive database optimization project focusing on query performance, index strategy, and connection pooling. Includes migration to read replicas for better scalability.',
      },
      {
        name: 'CI/CD Pipeline Enhancement',
        status: 'planned',
        priority: 'high',
        summary:
          'Upgrade our continuous integration and deployment pipeline with automated testing and deployment strategies.',
        description:
          'Implementing advanced CI/CD practices including automated testing, code quality checks, and blue-green deployment strategies to reduce deployment risk.',
      },
      {
        name: 'Security Audit & Hardening',
        status: 'planned',
        priority: 'urgent',
        summary:
          'Comprehensive security audit and implementation of security best practices across all services.',
        description:
          'Conducting thorough security audit and implementing OWASP Top 10 mitigations, dependency scanning, and penetration testing.',
      },
    ],
    DES: [
      {
        name: 'Design System 2.0',
        status: 'in_progress',
        priority: 'high',
        summary:
          'Build a comprehensive design system with reusable components, tokens, and documentation.',
        description:
          'Creating a unified design system that includes component library, design tokens, accessibility guidelines, and comprehensive documentation for all design patterns.',
      },
      {
        name: 'Mobile App Redesign',
        status: 'in_progress',
        priority: 'urgent',
        summary:
          'Complete redesign of mobile application with focus on user experience and modern UI patterns.',
        description:
          'Redesigning the mobile app from ground up with improved navigation, better performance, and modern design patterns that align with iOS and Android guidelines.',
      },
      {
        name: 'Accessibility Compliance',
        status: 'planned',
        priority: 'high',
        summary: 'Ensure all products meet WCAG 2.1 AA standards for accessibility compliance.',
        description:
          'Comprehensive accessibility audit and remediation project to ensure all interfaces are accessible to users with disabilities, including screen reader optimization.',
      },
      {
        name: 'User Research Program',
        status: 'planned',
        priority: 'medium',
        summary:
          'Establish ongoing user research program with regular interviews and usability testing.',
        description:
          'Building a structured user research program including regular user interviews, usability testing sessions, and feedback collection mechanisms.',
      },
    ],
    MKT: [
      {
        name: 'Q1 Product Launch Campaign',
        status: 'in_progress',
        priority: 'urgent',
        summary:
          'Coordinate multi-channel launch campaign for our new product features including social media, email, and content marketing.',
        description:
          'Comprehensive launch campaign spanning social media platforms, email marketing, content creation, and PR outreach to maximize product visibility and adoption.',
      },
      {
        name: 'Brand Identity Refresh',
        status: 'in_progress',
        priority: 'high',
        summary:
          'Update brand guidelines, logo, and visual identity to reflect company evolution and market positioning.',
        description:
          'Refreshing our brand identity including logo updates, color palette refinement, typography choices, and brand voice guidelines to better align with our market position.',
      },
      {
        name: 'Content Marketing Strategy',
        status: 'planned',
        priority: 'medium',
        summary:
          'Develop and execute content marketing strategy with blog posts, case studies, and thought leadership pieces.',
        description:
          'Creating a comprehensive content marketing strategy including editorial calendar, content templates, SEO optimization, and distribution channels.',
      },
      {
        name: 'Analytics & Attribution Setup',
        status: 'planned',
        priority: 'high',
        summary:
          'Implement comprehensive analytics tracking and attribution modeling for all marketing channels.',
        description:
          'Setting up advanced analytics tracking, conversion attribution, and marketing ROI measurement across all channels and campaigns.',
      },
    ],
    PRD: [
      {
        name: '2025 Product Roadmap',
        status: 'in_progress',
        priority: 'urgent',
        summary:
          'Define and prioritize product roadmap for 2025 with focus on customer value and business impact.',
        description:
          'Comprehensive product roadmap planning including feature prioritization, customer research synthesis, competitive analysis, and resource allocation.',
      },
      {
        name: 'User Feedback Integration',
        status: 'in_progress',
        priority: 'high',
        summary:
          'Establish systematic process for collecting, analyzing, and integrating user feedback into product decisions.',
        description:
          'Building a structured feedback loop including user interviews, surveys, in-app feedback collection, and data-driven decision making processes.',
      },
      {
        name: 'Competitive Analysis Framework',
        status: 'planned',
        priority: 'medium',
        summary: 'Create systematic approach to competitive analysis and market positioning.',
        description:
          'Developing a comprehensive competitive analysis framework including feature comparisons, pricing analysis, and market positioning strategies.',
      },
      {
        name: 'Product Metrics Dashboard',
        status: 'planned',
        priority: 'high',
        summary: 'Build comprehensive product metrics dashboard to track KPIs and product health.',
        description:
          'Creating a centralized dashboard for tracking key product metrics including user engagement, feature adoption, retention, and business impact metrics.',
      },
    ],
  };

  return (
    projectTemplates[teamKey] || [
      {
        name: `${teamName} Core Improvements`,
        status: 'in_progress',
        priority: 'high',
        summary: `Focused improvements to enhance ${teamName.toLowerCase()} team productivity.`,
        description: `Strategic initiatives for ${teamName} team.`,
      },
    ]
  );
}

export function getProjectsData(teams, users, creator) {
  const projectsData = [];
  const now = Date.now();

  for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
    const team = teams[teamIndex];
    const projectDefinitions = getTeamSpecificProjects(team.key, team.name);

    for (let defIndex = 0; defIndex < projectDefinitions.length; defIndex++) {
      const def = projectDefinitions[defIndex];
      const leadIndex = (teamIndex * 4 + defIndex) % users.length;
      const memberCount = Math.floor(Math.random() * 4) + 2;
      const availableUsers = users.filter((_, idx) => idx !== leadIndex);
      const members = availableUsers
        .slice(0, Math.min(memberCount, availableUsers.length))
        .map((u) => u._id);

      const daysAgo = Math.floor(Math.random() * 45) + 5;
      const startDate =
        def.status === 'in_progress' || def.status === 'completed'
          ? new Date(now - daysAgo * 24 * 60 * 60 * 1000)
          : null;

      const daysAhead = 30 + Math.floor(Math.random() * 90);
      const targetDate = new Date(now + daysAhead * 24 * 60 * 60 * 1000);

      projectsData.push({
        name: def.name,
        description: def.description || `${def.name} initiative for ${team.name}.`,
        summary: def.summary,
        status: def.status,
        priority: def.priority,
        team: team._id,
        lead: users[leadIndex]._id,
        members: members,
        creator: creator._id,
        startDate: startDate,
        targetDate: targetDate,
      });
    }
  }

  return projectsData;
}
