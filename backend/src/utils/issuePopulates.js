export const ISSUE_POPULATE = [
  { path: 'assignee', select: 'name email avatar' },
  { path: 'creator', select: 'name email avatar' },
  { path: 'team', select: 'name key icon color' },
  { path: 'project', select: 'name identifier icon' },
  { path: 'parent', select: 'identifier title' },
];

export const ISSUE_POPULATE_DETAIL = [
  { path: 'assignee', select: 'name email avatar' },
  { path: 'creator', select: 'name email avatar' },
  { path: 'team', select: 'name key icon color' },
  { path: 'project', select: 'name identifier icon' },
  { path: 'parent', select: 'identifier title status' },
];
