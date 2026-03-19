/**
 * Candidate Contract Surface — frontend
 *
 * This contract keeps the candidate-facing client surface explicit and
 * symbol-level. It avoids barrel re-exports so the quality gates reflect the
 * actual task surface rather than whole aggregated files.
 */

// Services
export { api, ApiError, baseURL } from '../frontend/src/services/api.js';
export { adminApi } from '../frontend/src/services/adminApi.js';

// Hooks used by the task-driven UI
export { useIssue } from '../frontend/src/hooks/useIssue.js';
export { useProjects } from '../frontend/src/hooks/useProjects.js';
export { useUsers } from '../frontend/src/hooks/useUsers.js';
export { useIssueFilters } from '../frontend/src/hooks/useIssueFilters.js';
export { useAdminLogs } from '../frontend/src/hooks/useAdminLogs.js';

// Task-facing constants
export {
  issueStatusIcons,
  issueStatusOptions,
  issueStatusConfig,
} from '../frontend/src/constants/issueStatus.js';
export { projectStatusIcons, projectStatusOptions } from '../frontend/src/constants/projectStatus.js';
export {
  priorityIcons,
  priorityOptions,
  priorityConfig,
  getPriorityColor,
  getPriorityMeta,
} from '../frontend/src/constants/priority.js';
export {
  updateStatusOptions,
  getUpdateStatusConfig,
  updateStatusIndicatorIcons,
} from '../frontend/src/constants/updateStatus.js';
export {
  ACTIVITY_LAYOUT,
  ACTIVITY_DATE_FORMAT,
  ACTIVITY_LIST_VARIANT,
} from '../frontend/src/constants/activity.js';

// Helpers used by the task-driven UI
export { formatDate, formatJSON, formatResponseTime } from '../frontend/src/utils/formatters.js';
export {
  normalizeIssueActivity,
  normalizeProjectActivity,
} from '../frontend/src/utils/activityNormalizers.js';
export {
  projectStatusIcons as projectActivityStatusIcons,
  priorityIcons as projectActivityPriorityIcons,
  getActivityIcon,
  buildProjectActivityMessage,
} from '../frontend/src/utils/projectActivityUtils.js';
export { normalizeUpdateStatus } from '../frontend/src/utils/statusMapping.js';

// Task-relevant component exports
export { default as IssueFilterDropdown } from '../frontend/src/components/issues/IssueFilterDropdown.js';
