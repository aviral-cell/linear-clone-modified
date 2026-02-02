/**
 * Constants – centralized exports for issue, project, priority, and update status.
 */

export { issueStatusIcons, issueStatusOptions, issueStatusConfig } from './issueStatus';

export { projectStatusIcons, projectStatusOptions } from './projectStatus';

export {
  priorityIcons,
  priorityOptions,
  priorityConfig,
  getPriorityColor,
  getPriorityMeta,
} from './priority';

export {
  updateStatusOptions,
  getUpdateStatusConfig,
  updateStatusIndicatorIcons,
} from './updateStatus';

// Activity rendering constants
export const ACTIVITY_LAYOUT = {
  TIMELINE: 'timeline',
  LIST: 'list',
};

export const ACTIVITY_DATE_FORMAT = {
  RELATIVE: 'relative',
  ABSOLUTE: 'absolute',
};

export const ACTIVITY_LIST_VARIANT = {
  SIDEBAR: 'sidebar',
  UPDATES: 'updates',
};
