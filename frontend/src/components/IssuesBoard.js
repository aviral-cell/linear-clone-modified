import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Circle,
  CircleDashed,
  CheckCircle2,
  CircleDot,
  XCircle,
  AlertCircle,
  Minus,
  BarChart2,
  BarChart3,
  BarChart4,
  Plus,
  FolderKanban,
} from 'lucide-react';
import { baseURL, getAvatarColor } from '../utils';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const statusConfig = {
  backlog: {
    label: 'Backlog',
    icon: CircleDashed,
    color: 'text-text-tertiary',
  },
  todo: {
    label: 'Todo',
    icon: Circle,
    color: 'text-text-secondary',
  },
  in_progress: {
    label: 'In Progress',
    icon: CircleDot,
    color: 'text-yellow-500',
  },
  in_review: {
    label: 'In Review',
    icon: CircleDot,
    color: 'text-green-500',
  },
  done: {
    label: 'Done',
    icon: CheckCircle2,
    color: 'text-accent',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'text-text-tertiary',
  },
  duplicate: {
    label: 'Duplicate',
    icon: XCircle,
    color: 'text-text-tertiary',
  },
};

const priorityConfig = {
  urgent: {
    label: 'Urgent',
    icon: AlertCircle,
    color: 'text-red-500',
  },
  high: {
    label: 'High',
    icon: BarChart4,
    color: 'text-orange-500',
  },
  medium: {
    label: 'Medium',
    icon: BarChart3,
    color: 'text-yellow-500',
  },
  low: {
    label: 'Low',
    icon: BarChart2,
    color: 'text-text-tertiary',
  },
  no_priority: {
    label: 'Set priority',
    icon: Minus,
    color: 'text-text-tertiary',
  },
};

const IssuesBoard = ({
  team,
  project,
  filter,
  refreshTrigger,
  view = 'columns',
  hideEmptyStatuses = false,
  onCreateIssueWithStatus,
  userFilter,
}) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchIssues = React.useCallback(async () => {
    if (!team && !project && !userFilter) return;

    try {
      setLoading(true);

      let url;
      if (project) {
        url = `${baseURL}/api/projects/${project.identifier}/issues`;
      } else if (userFilter) {
        url = `${baseURL}/api/issues/my-issues${userFilter ? `?filter=${userFilter}` : ''}`;
      } else {
        url = `${baseURL}/api/issues/team/${team._id}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        setIssues(data.issues);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  }, [team, project, token, userFilter]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues, filter, refreshTrigger]);

  const getFilteredStatuses = () => {
    if (filter === 'active') {
      return ['todo', 'in_progress', 'in_review'];
    } else if (filter === 'backlog') {
      return ['backlog'];
    }
    return ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled', 'duplicate'];
  };

  const getIssuesByStatus = (status) => issues.filter((issue) => issue.status === status);

  const handleIssueClick = (issue) => {
    navigate(`/issue/${issue.identifier}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-secondary">Loading issues...</div>
      </div>
    );
  }

  const filteredStatuses = getFilteredStatuses();
  const hasFilteredIssues = filteredStatuses.some((status) => getIssuesByStatus(status).length > 0);

  if (issues.length === 0 || !hasFilteredIssues) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-sm text-text-secondary">
          {project
            ? 'No issues in this project yet.'
            : userFilter
              ? 'No issues found.'
              : 'No issues for this team yet.'}
        </div>
      </div>
    );
  }

  if (view === 'list') {
    return (
      <div className="flex-1 overflow-auto bg-background">
        <div className="max-w-5xl mx-auto py-3">
          {filteredStatuses.map((status) => {
            const statusIssues = getIssuesByStatus(status);
            if (hideEmptyStatuses && statusIssues.length === 0) {
              return null;
            }

            const config = statusConfig[status];
            const StatusIcon = config.icon;

            return (
              <div key={status} className="border-b border-border last:border-b-0">
                <div className="px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${config.color}`} />
                    <span className="text-sm font-medium text-text-primary">{config.label}</span>
                    <span className="text-xs text-text-tertiary">{statusIssues.length}</span>
                  </div>
                  {onCreateIssueWithStatus && (
                    <button
                      type="button"
                      onClick={() => onCreateIssueWithStatus(status)}
                      className="btn-secondary-header p-1.5"
                      title="Add issue"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  {statusIssues.map((issue) => {
                    const priorityInfo = priorityConfig[issue.priority];
                    const PriorityIcon = priorityInfo.icon;
                    const identifier = issue.parentIssue
                      ? issue.parentIssue.identifier || issue.identifier
                      : issue.identifier;

                    return (
                      <div
                        key={issue._id}
                        onClick={() => handleIssueClick(issue)}
                        className="px-4 py-2 flex items-center gap-2 text-sm hover:bg-background-secondary cursor-pointer transition-colors"
                      >
                        <PriorityIcon
                          className={`w-3.5 h-3.5 flex-shrink-0 ${priorityInfo.color}`}
                        />
                        <span className="w-14 md:w-20 text-xs font-mono text-text-tertiary flex-shrink-0 truncate">
                          {identifier}
                        </span>
                        <span className="flex-1 text-text-primary truncate ml-1">
                          {issue.title}
                        </span>
                        {issue.project && (
                          <span className="hidden sm:flex ml-4 px-2 py-0.5 rounded-full bg-background-tertiary text-xs text-text-secondary flex-shrink-0 items-center gap-1">
                            <FolderKanban className="w-3 h-3" />
                            {issue.project.name}
                          </span>
                        )}
                        {issue.assignee && (
                          <div
                            className={`ml-2 avatar avatar-md ${getAvatarColor(issue.assignee._id)}`}
                          >
                            {issue.assignee.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden bg-background">
      <div className="h-full flex gap-3 px-4 md:px-8 py-2 overflow-x-auto">
        {filteredStatuses.map((status) => {
          const statusIssues = getIssuesByStatus(status);
          if (hideEmptyStatuses && statusIssues.length === 0) {
            return null;
          }

          const config = statusConfig[status];
          const StatusIcon = config.icon;

          return (
            <div key={status} className="flex-shrink-0 w-80 flex flex-col h-full">
              <div className="px-3 py-2 flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <StatusIcon className={`w-4 h-4 ${config.color}`} />
                  <h3 className="text-sm font-medium text-text-primary">{config.label}</h3>
                  <span className="text-xs text-text-tertiary">{statusIssues.length}</span>
                </div>
                {onCreateIssueWithStatus && (
                  <button
                    type="button"
                    onClick={() => onCreateIssueWithStatus(status)}
                    className="btn-secondary-header p-1.5"
                    title="Add issue"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 py-2">
                {statusIssues.map((issue) => {
                  const priorityInfo = priorityConfig[issue.priority];
                  const PriorityIcon = priorityInfo.icon;
                  const isSubIssue = issue.parentIssue;

                  return (
                    <div
                      key={issue._id}
                      onClick={() => handleIssueClick(issue)}
                      className="bg-background-card border border-border rounded-md p-3 hover:border-border-hover cursor-pointer group transition-all"
                    >
                      {isSubIssue ? (
                        <>
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <span className="text-xs text-text-tertiary font-mono truncate min-w-0 flex-1">
                              {issue.parentIssue?.identifier || 'N/A'} ›{' '}
                              {issue.parentIssue?.title || 'Parent Issue'}
                            </span>
                            {issue.assignee && (
                              <div
                                className={`avatar avatar-md ${getAvatarColor(issue.assignee._id)}`}
                              >
                                {issue.assignee.name.charAt(0)}
                              </div>
                            )}
                          </div>

                          <div className="flex items-start gap-2 mb-2">
                            <StatusIcon
                              className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.color}`}
                            />
                            <p className="text-sm text-text-primary line-clamp-2 flex-1">
                              {issue.title}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <PriorityIcon className={`w-3.5 h-3.5 ${priorityInfo.color}`} />
                            <span className="text-xs text-text-tertiary">{priorityInfo.label}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <span className="text-xs text-text-tertiary font-mono truncate min-w-0 flex-1">
                              {issue.identifier}
                            </span>
                            {issue.assignee && (
                              <div
                                className={`avatar avatar-md ${getAvatarColor(issue.assignee._id)}`}
                              >
                                {issue.assignee.name.charAt(0)}
                              </div>
                            )}
                          </div>

                          <div className="flex items-start gap-2 mb-2">
                            <StatusIcon
                              className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.color}`}
                            />
                            <p className="text-sm text-text-primary line-clamp-2 flex-1">
                              {issue.title}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <PriorityIcon className={`w-3.5 h-3.5 ${priorityInfo.color}`} />
                            <span className="text-xs text-text-tertiary">{priorityInfo.label}</span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IssuesBoard;
