import { createProjectActivity } from './projectActivityTracker.js';
import { generateProjectIdentifier } from '../utils/projectUtils.js';

const handleMemberUpdate = async (project, updates, userId) => {
  if (updates.memberIds === undefined) return;

  const oldMemberIds = (project.members || []).map((m) => m.toString()).sort();
  const newMemberIds = (updates.memberIds || []).map((id) => id.toString()).sort();

  if (JSON.stringify(oldMemberIds) !== JSON.stringify(newMemberIds)) {
    project.members = updates.memberIds;
    await createProjectActivity(project._id, userId, 'updated_members', oldMemberIds, newMemberIds);
  }
};

const handleLeadUpdate = async (project, updates, userId) => {
  if (updates.leadId === undefined) return;

  const oldLeadId = project.lead ? project.lead.toString() : null;
  const newLeadId = updates.leadId || null;

  if (oldLeadId !== newLeadId) {
    project.lead = updates.leadId;
    await project.populate('lead', 'name email avatar');
    if (newLeadId) {
      await createProjectActivity(project._id, userId, 'updated_lead', null, project.lead);
    } else {
      await createProjectActivity(project._id, userId, 'cleared_lead', oldLeadId, null);
    }
  }
};

const handleTeamUpdate = async (project, updates, userId) => {
  if (updates.teamId === undefined) return;

  const oldTeamId = project.team ? project.team.toString() : null;
  const newTeamId = updates.teamId || null;

  if (oldTeamId !== newTeamId) {
    project.team = updates.teamId;
    await project.populate('team', 'name key icon');
    await createProjectActivity(project._id, userId, 'updated_team', null, project.team);
  }
};

const handleFieldUpdate = async (project, field, newValue, userId, actionTypes) => {
  const fieldValue = project[field];
  let oldValue;

  if (field === 'targetDate' || field === 'startDate') {
    oldValue = fieldValue ? fieldValue.toISOString() : null;
  } else if (field === 'summary') {
    oldValue = fieldValue || '';
  } else {
    oldValue = fieldValue;
  }

  if (newValue === undefined || newValue === oldValue) return null;

  if (field === 'targetDate' || field === 'startDate') {
    const newDateValue = newValue || null;
    if (oldValue !== newDateValue) {
      if (newDateValue) {
        await createProjectActivity(project._id, userId, actionTypes.set, null, newDateValue);
      } else {
        await createProjectActivity(project._id, userId, actionTypes.clear, oldValue, null);
      }
      return { [field]: newValue };
    }
  } else {
    await createProjectActivity(project._id, userId, actionTypes.update, oldValue, newValue);
    return { [field]: newValue };
  }

  return null;
};

export const updateProjectWithTracking = async (project, updates, userId) => {
  await handleMemberUpdate(project, updates, userId);
  await handleLeadUpdate(project, updates, userId);
  await handleTeamUpdate(project, updates, userId);

  const { memberIds, leadId, teamId, ...otherUpdates } = updates;

  const fieldUpdates = {};

  const statusUpdate = await handleFieldUpdate(project, 'status', otherUpdates.status, userId, {
    update: 'updated_status',
  });
  if (statusUpdate) Object.assign(fieldUpdates, statusUpdate);

  const priorityUpdate = await handleFieldUpdate(
    project,
    'priority',
    otherUpdates.priority,
    userId,
    { update: 'updated_priority' }
  );
  if (priorityUpdate) Object.assign(fieldUpdates, priorityUpdate);

  const targetDateUpdate = await handleFieldUpdate(
    project,
    'targetDate',
    otherUpdates.targetDate,
    userId,
    { set: 'set_target_date', clear: 'cleared_target_date' }
  );
  if (targetDateUpdate) Object.assign(fieldUpdates, targetDateUpdate);

  const startDateUpdate = await handleFieldUpdate(
    project,
    'startDate',
    otherUpdates.startDate,
    userId,
    { set: 'set_start_date', clear: 'cleared_start_date' }
  );
  if (startDateUpdate) Object.assign(fieldUpdates, startDateUpdate);

  if (otherUpdates.name !== undefined && otherUpdates.name !== project.name) {
    await createProjectActivity(
      project._id,
      userId,
      'updated_name',
      project.name,
      otherUpdates.name
    );
    fieldUpdates.name = otherUpdates.name;
    fieldUpdates.identifier = generateProjectIdentifier(otherUpdates.name);
  }

  const summaryUpdate = await handleFieldUpdate(project, 'summary', otherUpdates.summary, userId, {
    update: 'updated_summary',
  });
  if (summaryUpdate) Object.assign(fieldUpdates, summaryUpdate);

  Object.assign(project, fieldUpdates);
  await project.save();

  await project.populate([
    { path: 'team', select: 'name key icon' },
    { path: 'lead', select: 'name email avatar' },
    { path: 'members', select: 'name email avatar' },
    { path: 'creator', select: 'name email avatar' },
  ]);

  return project;
};
