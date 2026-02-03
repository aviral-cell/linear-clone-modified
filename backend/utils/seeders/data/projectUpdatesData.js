const getTeamSpecificUpdates = (teamKey, projectName) => {
  const updateTemplates = {
    ENG: [
      {
        content: `Completed the initial architecture review for ${projectName}. Identified key bottlenecks and have a clear path forward. Starting implementation next week.`,
        status: 'on_track',
      },
      {
        content: `Made significant progress on ${projectName}. Core modules are 70% complete. Some integration challenges with third-party services, but we have workarounds.`,
        status: 'on_track',
      },
      {
        content: `Encountered performance issues during load testing for ${projectName}. Need to optimize database queries and caching strategy. Timeline may shift by 1-2 weeks.`,
        status: 'at_risk',
      },
      {
        content: `Successfully deployed ${projectName} to staging environment. All critical tests passing. Ready for QA review next week.`,
        status: 'on_track',
      },
      {
        content: `Blocked on ${projectName} due to dependency on external API provider. They've delayed their release by 3 weeks. Exploring alternative solutions.`,
        status: 'off_track',
      },
      {
        content: `Refactored core components of ${projectName} for better maintainability. Code review completed, merging to main branch today.`,
        status: 'on_track',
      },
      {
        content: `Security audit findings for ${projectName} require additional work. Need to address 5 high-priority vulnerabilities before production.`,
        status: 'at_risk',
      },
      {
        content: `Performance improvements for ${projectName} are showing great results. Response times reduced by 45%. Ready for production deployment.`,
        status: 'on_track',
      },
    ],
    DES: [
      {
        content: `Completed user research sessions for ${projectName}. Gathered insights from 12 participants. Key themes emerging around navigation and accessibility.`,
        status: 'on_track',
      },
      {
        content: `Finalized design system components for ${projectName}. All components documented and ready for handoff to engineering team.`,
        status: 'on_track',
      },
      {
        content: `Design review for ${projectName} revealed some usability concerns. Iterating on key flows based on stakeholder feedback. Timeline extended by 1 week.`,
        status: 'at_risk',
      },
      {
        content: `Prototype testing for ${projectName} shows positive user feedback. 85% of testers found the new design intuitive. Moving to final design phase.`,
        status: 'on_track',
      },
      {
        content: `Accessibility audit for ${projectName} identified several WCAG compliance issues. Working with engineering to address these before launch.`,
        status: 'at_risk',
      },
      {
        content: `Design handoff for ${projectName} completed. All assets exported, specifications documented, and design tokens finalized.`,
        status: 'on_track',
      },
      {
        content: `User testing revealed critical usability issues with ${projectName}. Major redesign needed for checkout flow. Project timeline at risk.`,
        status: 'off_track',
      },
      {
        content: `Brand guidelines updated for ${projectName}. New visual identity approved by leadership. Ready to apply across all touchpoints.`,
        status: 'on_track',
      },
    ],
    MKT: [
      {
        content: `Launch campaign for ${projectName} is gaining traction. Social media engagement up 40% week-over-week. Email open rates exceeding targets.`,
        status: 'on_track',
      },
      {
        content: `Content calendar for ${projectName} is fully planned through Q1. First batch of blog posts published, generating good organic traffic.`,
        status: 'on_track',
      },
      {
        content: `Ad campaign for ${projectName} underperforming. CTR below benchmarks. Pausing to optimize creative and targeting strategy.`,
        status: 'at_risk',
      },
      {
        content: `Press release for ${projectName} secured coverage in 3 major publications. Media kit distributed to 50+ outlets.`,
        status: 'on_track',
      },
      {
        content: `Budget constraints affecting ${projectName} campaign reach. Need to prioritize high-performing channels and reduce spend on underperforming ones.`,
        status: 'at_risk',
      },
      {
        content: `Webinar series for ${projectName} exceeded registration goals. 500+ signups for first session. Strong pipeline generation.`,
        status: 'on_track',
      },
      {
        content: `Partnership opportunities for ${projectName} are materializing. Two strategic partnerships in final negotiation phase.`,
        status: 'on_track',
      },
      {
        content: `Analytics setup for ${projectName} delayed due to technical issues. Attribution tracking not fully functional yet.`,
        status: 'at_risk',
      },
    ],
    PRD: [
      {
        content: `Roadmap planning for ${projectName} progressing well. Completed customer interviews with 20 key accounts. Clear priorities emerging.`,
        status: 'on_track',
      },
      {
        content: `Feature prioritization for ${projectName} completed. Using RICE framework, top 5 features identified and approved by stakeholders.`,
        status: 'on_track',
      },
      {
        content: `Competitive analysis for ${projectName} reveals we're behind on key features. Need to accelerate roadmap or risk market share loss.`,
        status: 'at_risk',
      },
      {
        content: `User feedback analysis for ${projectName} shows strong demand for requested features. 80% of users want the top 3 features we've planned.`,
        status: 'on_track',
      },
      {
        content: `Resource allocation for ${projectName} is challenging. Engineering capacity constraints may delay Q1 deliverables.`,
        status: 'at_risk',
      },
      {
        content: `Metrics dashboard for ${projectName} is live. Tracking key KPIs including DAU, retention, and feature adoption. Initial data looks promising.`,
        status: 'on_track',
      },
      {
        content: `Stakeholder alignment for ${projectName} achieved. All departments aligned on priorities and timeline. Clear go-to-market plan.`,
        status: 'on_track',
      },
      {
        content: `Market research for ${projectName} indicates shifting customer needs. May need to pivot strategy based on new insights.`,
        status: 'at_risk',
      },
    ],
  };

  return updateTemplates[teamKey] || [
    {
      content: `Making good progress on ${projectName}. All milestones on track.`,
      status: 'on_track',
    },
  ];
};

export function getProjectUpdatesData(projects, users, teams) {
  const updates = [];
  const updateActivities = [];
  const now = Date.now();

  projects.forEach((project, index) => {
    const team = teams.find(t => t._id.toString() === project.team.toString());
    const teamKey = team?.key || 'ENG';
    const teamUpdates = getTeamSpecificUpdates(teamKey, project.name);
    
    const projectAge = project.createdAt ? (now - new Date(project.createdAt).getTime()) : 30 * 24 * 60 * 60 * 1000;
    const numUpdates = Math.min(Math.floor(projectAge / (7 * 24 * 60 * 60 * 1000)), 8);
    const actualUpdates = Math.max(numUpdates, 3);
    
    const authorIndex = index % users.length;
    const authors = [users[authorIndex], users[(authorIndex + 1) % users.length], users[(authorIndex + 2) % users.length]];
    
    for (let i = 0; i < actualUpdates; i++) {
      const template = teamUpdates[i % teamUpdates.length];
      const daysAgo = (actualUpdates - i) * 7 + Math.floor(Math.random() * 3);
      const hoursAgo = Math.floor(Math.random() * 24);
      const createdAt = new Date(now - (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000);
      
      const updateData = {
        project: project._id,
        author: authors[i % authors.length]._id,
        content: template.content,
        status: template.status,
        createdAt: createdAt,
      };
      
      updates.push(updateData);
      
      updateActivities.push({
        project: project._id,
        user: authors[i % authors.length]._id,
        action: 'posted_update',
        changes: {
          field: 'update',
          oldValue: null,
          newValue: null,
        },
        createdAt: createdAt,
      });
    }
  });

  const sortedUpdates = updates.sort((a, b) => b.createdAt - a.createdAt);
  const sortedActivities = updateActivities.sort((a, b) => b.createdAt - a.createdAt);

  return {
    updates: sortedUpdates,
    updateActivities: sortedActivities,
  };
}
