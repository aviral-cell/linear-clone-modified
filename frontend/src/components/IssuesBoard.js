import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from '../icons';
import { api } from '../services/api';
import { issueStatusConfig, priorityConfig } from '../constants';
import IssueCard from './IssueCard';
import { Button } from './ui';
import toast from 'react-hot-toast';

const statusConfig = issueStatusConfig;
const EMPTY_FILTERS = {};

const IssuesBoard = ({
  team,
  project,
  filter,
  advancedFilters = EMPTY_FILTERS,
  refreshTrigger,
  view = 'columns',
  hideEmptyStatuses = false,
  onCreateIssueWithStatus,
  userFilter,
}) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const filtersKey = useMemo(() => JSON.stringify(advancedFilters), [advancedFilters]);

  const fetchIssues = React.useCallback(async () => {
    if (!team && !project && !userFilter) return;

    try {
      setLoading(true);

      let data;
      if (project) {
        data = await api.projects.getIssues(project.identifier);
      } else if (userFilter) {
        data = await api.get(`/api/issues/my-issues${userFilter ? `?filter=${userFilter}` : ''}`);
      } else {
        const params = new URLSearchParams();
        if (advancedFilters.status?.length > 0) {
          params.set('status', advancedFilters.status.join(','));
        }
        if (advancedFilters.priority?.length > 0) {
          params.set('priority', advancedFilters.priority.join(','));
        }
        if (advancedFilters.assignee?.length > 0) {
          params.set('assignee', advancedFilters.assignee.join(','));
        }
        if (advancedFilters.creator?.length > 0) {
          params.set('creator', advancedFilters.creator.join(','));
        }
        const queryString = params.toString();
        const url = `/api/issues/team/${team._id}${queryString ? `?${queryString}` : ''}`;
        data = await api.get(url);
      }

      setIssues(data.issues);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  }, [team, project, userFilter, filtersKey]);

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
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="p-1.5"
                      title="Add issue"
                      onClick={() => onCreateIssueWithStatus(status)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div>
                  {statusIssues.map((issue) => {
                    const priorityInfo = priorityConfig[issue.priority];
                    const PriorityIcon = priorityInfo.icon;
                    return (
                      <IssueCard
                        key={issue._id}
                        issue={issue}
                        variant="list"
                        onClick={handleIssueClick}
                        priorityIcon={PriorityIcon}
                        priorityColor={priorityInfo.color}
                        priorityLabel={priorityInfo.label}
                        showProject={Boolean(issue.project)}
                      />
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
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="p-1.5"
                    title="Add issue"
                    onClick={() => onCreateIssueWithStatus(status)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto py-2">
                {statusIssues.map((issue) => {
                  const priorityInfo = priorityConfig[issue.priority];
                  const PriorityIcon = priorityInfo.icon;
                  return (
                    <IssueCard
                      key={issue._id}
                      issue={issue}
                      variant="card"
                      onClick={handleIssueClick}
                      statusIcon={StatusIcon}
                      statusColor={config.color}
                      priorityIcon={PriorityIcon}
                      priorityColor={priorityInfo.color}
                      priorityLabel={priorityInfo.label}
                    />
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
