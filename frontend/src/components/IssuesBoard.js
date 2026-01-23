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

const IssuesBoard = ({ team, project, filter, refreshTrigger }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchIssues = React.useCallback(async () => {
    if (!team && !project) return;

    try {
      setLoading(true);

      let url;
      if (project) {
        url = `${baseURL}/api/projects/${project.identifier}/issues`;
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
  }, [team, project, token]);

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

  const getIssuesByStatus = (status) => {
    return issues.filter((issue) => issue.status === status);
  };

  const handleIssueClick = (issue) => {
    navigate(`/issue/${issue.identifier}`);
  };

  const handleCreateIssue = async (status) => {
    const title = prompt('Enter issue title:');
    if (!title) return;

    try {
      const body = {
        title,
        status,
      };

      if (project) {
        body.projectId = project._id;
        if (project.team) {
          body.teamId = project.team._id;
        }
      } else {
        body.teamId = team._id;
      }

      const response = await fetch(`${baseURL}/api/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success('Issue created successfully');
        fetchIssues();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to create issue');
      }
    } catch (error) {
      console.error('Error creating issue:', error);
      toast.error('Failed to create issue');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-secondary">Loading issues...</div>
      </div>
    );
  }

  const filteredStatuses = getFilteredStatuses();

  return (
    <div className="flex-1 overflow-hidden bg-background">
      <div className="h-full flex gap-3 px-4 md:px-8 py-2 overflow-x-auto">
        {filteredStatuses.map((status) => {
          const statusIssues = getIssuesByStatus(status);
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
                                className={`w-5 h-5 ${getAvatarColor(issue.assignee._id)} rounded-full flex items-center justify-center text-xs text-white font-medium flex-shrink-0`}
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
                                className={`w-5 h-5 ${getAvatarColor(issue.assignee._id)} rounded-full flex items-center justify-center text-xs text-white font-medium flex-shrink-0`}
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

                {statusIssues.length === 0 && (
                  <div className="text-center py-8 text-text-tertiary text-sm">No issues</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IssuesBoard;
