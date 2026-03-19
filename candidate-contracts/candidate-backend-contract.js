/**
 * Candidate Contract Surface — backend
 *
 * This contract is derived from the Task 1-8 backend surface defined by the
 * backend tests, problem statements, and technical specs. It intentionally
 * re-exports concrete candidate-owned symbols rather than broad barrels or
 * whole-module namespace wrappers.
 */

// Shared request guards and task-specific middleware.
export { authenticate } from '../backend/src/middleware/auth.js';
export { adminAuth } from '../backend/src/middleware/adminAuth.js';
export { apiLogger } from '../backend/src/middleware/apiLogger.js';
export {
  SENSITIVE_FIELDS,
  sanitizeObject,
  sanitizeHeaders,
  truncateBody,
  getClientIp,
  SLOW_THRESHOLD,
  MAX_BODY_SIZE,
} from '../backend/src/utils/apiLoggerUtils.js';

// Task 1: Comments Access Control
export {
  getCommentsByIssue,
  createComment,
  updateComment,
  deleteComment,
} from '../backend/src/services/issue/commentService.js';
export {
  getCommentsByIssue as getCommentsByIssueHandler,
  createComment as createCommentHandler,
  updateComment as updateCommentHandler,
  deleteComment as deleteCommentHandler,
} from '../backend/src/controllers/issueController.js';
export { default as Comment } from '../backend/src/models/Comment.js';

// Task 2: Issue Activity Tracker
export { createIssue, updateIssue } from '../backend/src/services/issue/issueService.js';
export { getIssueActivities } from '../backend/src/services/issue/issueActivityService.js';
export {
  createIssue as createIssueHandler,
  updateIssue as updateIssueHandler,
  getIssueActivities as getIssueActivitiesHandler,
} from '../backend/src/controllers/issueController.js';
export { default as IssueActivity } from '../backend/src/models/IssueActivity.js';

// Task 3: Sub Issue Hierarchy
export {
  MAX_DEPTH,
  getDepth,
  getMaxSubtreeDepth,
  getDescendants,
  validateParentChange,
  getValidParentCandidates,
} from '../backend/src/services/issue/issueHierarchy.js';
export { getValidParents } from '../backend/src/services/issue/issueService.js';
export { getValidParents as getValidParentsHandler } from '../backend/src/controllers/issueController.js';
export { default as Issue, ISSUE_STATUSES, ISSUE_PRIORITIES } from '../backend/src/models/Issue.js';

// Task 4: Advanced Issue Filters
export { getIssues } from '../backend/src/services/issue/issueService.js';
export { getIssues as getIssuesHandler } from '../backend/src/controllers/issueController.js';

// Task 5: Issue Subscribe
export { getMyIssues, getIssueByIdentifier } from '../backend/src/services/issue/issueService.js';
export {
  getMyIssues as getMyIssuesHandler,
  getIssueByIdentifier as getIssueByIdentifierHandler,
} from '../backend/src/controllers/issueController.js';

// Task 6: API Logger
export { getLogs, getLogById } from '../backend/src/services/admin/apiLogService.js';
export {
  getAdminLogs,
  getAdminLogById,
} from '../backend/src/controllers/apiLogController.js';
export { default as ApiLog } from '../backend/src/models/ApiLog.js';

// Task 8: Project Lead Auto-Add to Members
export { createProject, updateProject } from '../backend/src/services/project/projectService.js';
export { createProjectActivity } from '../backend/src/services/project/projectActivityService.js';
export { updateProjectWithTracking } from '../backend/src/services/project/projectUpdateService.js';
export {
  createProject as createProjectHandler,
  updateProject as updateProjectHandler,
} from '../backend/src/controllers/projectController.js';
export { default as Project, PROJECT_STATUSES, PROJECT_PRIORITIES } from '../backend/src/models/Project.js';
export { default as ProjectActivity } from '../backend/src/models/ProjectActivity.js';
