const formatDateLabel = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = d.getDate();
  const daySuffix =
    day === 1 || day === 21 || day === 31
      ? 'st'
      : day === 2 || day === 22
        ? 'nd'
        : day === 3 || day === 23
          ? 'rd'
          : 'th';
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  return `${month} ${day}${daySuffix}`;
};

const formatStatusLabel = (status) => {
  const statusMap = {
    backlog: 'Backlog',
    planned: 'Planned',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Canceled',
  };
  return statusMap[status] || status;
};

const formatPriorityLabel = (priority) => {
  const priorityMap = {
    no_priority: 'No priority',
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };
  return priorityMap[priority] || priority;
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
      activities.push({
        project: project._id,
        user: project.creator._id || project.creator,
        actionType: 'priority_changed',
        oldValue: 'no_priority',
        newValue: project.priority,
        description: `changed priority from ${formatPriorityLabel('no_priority')} to ${formatPriorityLabel(project.priority)}`,
        createdAt: getActivityTimestamp(initialActivityIndex),
      });
      initialActivityIndex++;
    }
    
    if (project.status && project.status !== 'backlog') {
      activities.push({
        project: project._id,
        user: project.creator._id || project.creator,
        actionType: 'status_changed',
        oldValue: 'backlog',
        newValue: project.status,
        description: `changed status from ${formatStatusLabel('backlog')} to ${formatStatusLabel(project.status)}`,
        createdAt: getActivityTimestamp(initialActivityIndex),
      });
      initialActivityIndex++;
    }
    
    if (project.lead) {
      const leadName = typeof project.lead === 'object' && project.lead?.name 
        ? project.lead.name 
        : 'User';
      activities.push({
        project: project._id,
        user: project.creator._id || project.creator,
        actionType: 'lead_changed',
        oldValue: null,
        newValue: project.lead._id || project.lead,
        description: `changed lead to ${leadName}`,
        createdAt: getActivityTimestamp(initialActivityIndex),
      });
      initialActivityIndex++;
    }
    
    if (project.targetDate) {
      activities.push({
        project: project._id,
        user: project.creator._id || project.creator,
        actionType: 'target_date_set',
        oldValue: null,
        newValue: project.targetDate,
        description: `set target date to ${formatDateLabel(project.targetDate)}`,
        createdAt: getActivityTimestamp(initialActivityIndex),
      });
      initialActivityIndex++;
    }
    
    if (project.startDate) {
      activities.push({
        project: project._id,
        user: project.creator._id || project.creator,
        actionType: 'start_date_set',
        oldValue: null,
        newValue: project.startDate,
        description: `set start date to ${formatDateLabel(project.startDate)}`,
        createdAt: getActivityTimestamp(initialActivityIndex),
      });
      initialActivityIndex++;
    }
    
    if (project.members && project.members.length > 0) {
      const memberIds = project.members.map(m => m._id || m);
      activities.push({
        project: project._id,
        user: project.creator._id || project.creator,
        actionType: 'members_changed',
        oldValue: [],
        newValue: memberIds,
        description: `changed members (${project.members.length} member${project.members.length !== 1 ? 's' : ''})`,
        createdAt: getActivityTimestamp(initialActivityIndex),
      });
      initialActivityIndex++;
    }
    
    if (project.summary) {
      activities.push({
        project: project._id,
        user: project.creator._id || project.creator,
        actionType: 'summary_changed',
        oldValue: null,
        newValue: project.summary,
        description: 'updated summary',
        createdAt: getActivityTimestamp(initialActivityIndex),
      });
      initialActivityIndex++;
    }
    
    const additionalActivities = Math.min(Math.floor(daysSinceCreation / 7), 5);
    const actionTypes = ['status_changed', 'priority_changed', 'members_changed', 'target_date_set'];
    const additionalUsers = users.filter(u => u._id.toString() !== project.creator.toString());
    
    for (let i = 0; i < additionalActivities; i++) {
      const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
      const user = additionalUsers[Math.floor(Math.random() * additionalUsers.length)] || project.creator;
      
      let activityData = {
        project: project._id,
        user: user._id || user,
        actionType: actionType,
        oldValue: null,
        newValue: null,
        description: '',
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
      
      switch (actionType) {
        case 'status_changed':
          const statuses = ['backlog', 'planned', 'in_progress', 'completed'];
          const currentStatus = project.status || 'backlog';
          const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
          if (newStatus !== currentStatus) {
            activityData.oldValue = currentStatus;
            activityData.newValue = newStatus;
            activityData.description = `changed status from ${formatStatusLabel(currentStatus)} to ${formatStatusLabel(newStatus)}`;
            activities.push(activityData);
          }
          break;
        case 'priority_changed':
          const priorities = ['no_priority', 'low', 'medium', 'high', 'urgent'];
          const currentPriority = project.priority || 'no_priority';
          const newPriority = priorities[Math.floor(Math.random() * priorities.length)];
          if (newPriority !== currentPriority) {
            activityData.oldValue = currentPriority;
            activityData.newValue = newPriority;
            activityData.description = `changed priority from ${formatPriorityLabel(currentPriority)} to ${formatPriorityLabel(newPriority)}`;
            activities.push(activityData);
          }
          break;
        case 'members_changed':
          if (project.members && project.members.length > 0) {
            const memberIds = project.members.map(m => m._id || m);
            activityData.oldValue = [];
            activityData.newValue = memberIds;
            activityData.description = `changed members (${memberIds.length} member${memberIds.length !== 1 ? 's' : ''})`;
            activities.push(activityData);
          }
          break;
        case 'target_date_set':
          if (project.targetDate) {
            activityData.oldValue = null;
            activityData.newValue = project.targetDate;
            activityData.description = `set target date to ${formatDateLabel(project.targetDate)}`;
            activities.push(activityData);
          }
          break;
      }
    }
  });
  
  return activities.sort((a, b) => b.createdAt - a.createdAt);
}
