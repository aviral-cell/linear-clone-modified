const deriveFieldFromAction = (action) => {
  const actionFieldMap = {
    updated_status: 'status',
    updated_priority: 'priority',
    set_target_date: 'targetDate',
    cleared_target_date: 'targetDate',
    set_start_date: 'startDate',
    cleared_start_date: 'startDate',
    updated_lead: 'lead',
    cleared_lead: 'lead',
    updated_team: 'team',
    updated_members: 'members',
    updated_name: 'name',
    updated_summary: 'summary',
    posted_update: 'update',
  };
  return actionFieldMap[action] || null;
};

const calculateActivityTimestamp = (projectCreatedAt, projectUpdates, now, updateIndex = null) => {
  if (projectUpdates.length === 0) {
    const timeSinceCreation = now - projectCreatedAt.getTime();
    if (timeSinceCreation > 0) {
      const randomOffset = Math.random() * timeSinceCreation;
      return new Date(projectCreatedAt.getTime() + randomOffset);
    }
    return new Date(projectCreatedAt.getTime() + 2 * 60 * 60 * 1000);
  }
  
  if (updateIndex === null || updateIndex === -1) {
    const firstUpdateTime = new Date(projectUpdates[0].createdAt).getTime();
    const timeBetween = firstUpdateTime - projectCreatedAt.getTime();
    if (timeBetween > 0) {
      const randomOffset = Math.random() * timeBetween;
      return new Date(projectCreatedAt.getTime() + randomOffset);
    }
    return new Date(firstUpdateTime - 1000);
  }
  
  if (updateIndex >= projectUpdates.length - 1) {
    const lastUpdateTime = new Date(projectUpdates[projectUpdates.length - 1].createdAt).getTime();
    const timeSinceLastUpdate = now - lastUpdateTime;
    if (timeSinceLastUpdate > 0) {
      const randomOffset = Math.random() * timeSinceLastUpdate;
      return new Date(lastUpdateTime + randomOffset);
    }
    return new Date(lastUpdateTime + 1000);
  }
  
  const currentUpdateTime = new Date(projectUpdates[updateIndex].createdAt).getTime();
  const nextUpdateTime = new Date(projectUpdates[updateIndex + 1].createdAt).getTime();
  const timeBetween = nextUpdateTime - currentUpdateTime;
  if (timeBetween > 0) {
    const randomOffset = Math.random() * timeBetween;
    return new Date(currentUpdateTime + randomOffset);
  }
  return new Date(currentUpdateTime + 1000);
};

export function getProjectActivitiesData(projects, users, updates = []) {
  const activities = [];
  const now = Date.now();
  
  const updatesByProject = {};
  updates.forEach(update => {
    const projectId = update.project.toString();
    if (!updatesByProject[projectId]) {
      updatesByProject[projectId] = [];
    }
    updatesByProject[projectId].push(update);
  });
  
  projects.forEach((project, index) => {
    const createdAt = new Date(project.createdAt || now);
    const projectAge = now - createdAt.getTime();
    const daysSinceCreation = Math.floor(projectAge / (24 * 60 * 60 * 1000));
    
    const projectUpdates = updatesByProject[project._id.toString()] || [];
    projectUpdates.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    const getActivityTimestamp = (updateIndex) => calculateActivityTimestamp(createdAt, projectUpdates, now, updateIndex);
    
    let initialActivityIndex = -1;
    
    if (project.priority && project.priority !== 'no_priority') {
      const action = 'updated_priority';
      activities.push({
        project: project._id,
        user: project.creator._id || project.creator,
        action,
        changes: {
          field: deriveFieldFromAction(action),
          oldValue: 'no_priority',
          newValue: project.priority,
        },
        createdAt: getActivityTimestamp(initialActivityIndex),
      });
      initialActivityIndex++;
    }
    
    if (project.status && project.status !== 'backlog') {
      const action = 'updated_status';
      activities.push({
        project: project._id,
        user: project.creator._id || project.creator,
        action,
        changes: {
          field: deriveFieldFromAction(action),
          oldValue: 'backlog',
          newValue: project.status,
        },
        createdAt: getActivityTimestamp(initialActivityIndex),
      });
      initialActivityIndex++;
    }
    
    if (project.lead) {
      const action = 'updated_lead';
      activities.push({
        project: project._id,
        user: project.creator._id || project.creator,
        action,
        changes: {
          field: deriveFieldFromAction(action),
          oldValue: null,
          newValue: project.lead._id || project.lead,
        },
        createdAt: getActivityTimestamp(initialActivityIndex),
      });
      initialActivityIndex++;
    }
    
    if (project.targetDate) {
      const action = 'set_target_date';
      activities.push({
        project: project._id,
        user: project.creator._id || project.creator,
        action,
        changes: {
          field: deriveFieldFromAction(action),
          oldValue: null,
          newValue: project.targetDate,
        },
        createdAt: getActivityTimestamp(initialActivityIndex),
      });
      initialActivityIndex++;
    }
    
    if (project.startDate) {
      const action = 'set_start_date';
      activities.push({
        project: project._id,
        user: project.creator._id || project.creator,
        action,
        changes: {
          field: deriveFieldFromAction(action),
          oldValue: null,
          newValue: project.startDate,
        },
        createdAt: getActivityTimestamp(initialActivityIndex),
      });
      initialActivityIndex++;
    }
    
    if (project.members && project.members.length > 0) {
      const memberIds = project.members.map(m => m._id || m);
      const action = 'updated_members';
      activities.push({
        project: project._id,
        user: project.creator._id || project.creator,
        action,
        changes: {
          field: deriveFieldFromAction(action),
          oldValue: [],
          newValue: memberIds,
        },
        createdAt: getActivityTimestamp(initialActivityIndex),
      });
      initialActivityIndex++;
    }
    
    if (project.summary) {
      const action = 'updated_summary';
      activities.push({
        project: project._id,
        user: project.creator._id || project.creator,
        action,
        changes: {
          field: deriveFieldFromAction(action),
          oldValue: null,
          newValue: project.summary,
        },
        createdAt: getActivityTimestamp(initialActivityIndex),
      });
      initialActivityIndex++;
    }
    
    const additionalActivities = Math.min(Math.floor(daysSinceCreation / 7), 5);
    const actions = ['updated_status', 'updated_priority', 'updated_members', 'set_target_date'];
    const additionalUsers = users.filter(u => u._id.toString() !== project.creator.toString());
    
    for (let i = 0; i < additionalActivities; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      const user = additionalUsers[Math.floor(Math.random() * additionalUsers.length)] || project.creator;
      
      let activityData = {
        project: project._id,
        user: user._id || user,
        action: action,
        changes: {
          field: deriveFieldFromAction(action),
          oldValue: null,
          newValue: null,
        },
        createdAt: null,
      };
      
      if (projectUpdates.length > 1) {
        const updateIndex = Math.min(i, projectUpdates.length - 2);
        activityData.createdAt = getActivityTimestamp(updateIndex);
      } else if (projectUpdates.length === 1) {
        activityData.createdAt = getActivityTimestamp(0);
      } else {
        activityData.createdAt = getActivityTimestamp(-1);
      }
      
      switch (action) {
        case 'updated_status':
          const statuses = ['backlog', 'planned', 'in_progress', 'completed'];
          const currentStatus = project.status || 'backlog';
          const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
          if (newStatus !== currentStatus) {
            activityData.changes.oldValue = currentStatus;
            activityData.changes.newValue = newStatus;
            activities.push(activityData);
          }
          break;
        case 'updated_priority':
          const priorities = ['no_priority', 'low', 'medium', 'high', 'urgent'];
          const currentPriority = project.priority || 'no_priority';
          const newPriority = priorities[Math.floor(Math.random() * priorities.length)];
          if (newPriority !== currentPriority) {
            activityData.changes.oldValue = currentPriority;
            activityData.changes.newValue = newPriority;
            activities.push(activityData);
          }
          break;
        case 'updated_members':
          if (project.members && project.members.length > 0) {
            const memberIds = project.members.map(m => m._id || m);
            activityData.changes.oldValue = [];
            activityData.changes.newValue = memberIds;
            activities.push(activityData);
          }
          break;
        case 'set_target_date':
          if (project.targetDate) {
            activityData.changes.oldValue = null;
            activityData.changes.newValue = project.targetDate;
            activities.push(activityData);
          }
          break;
      }
    }
  });
  
  return activities.sort((a, b) => b.createdAt - a.createdAt);
}
