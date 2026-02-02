import React, { memo } from 'react';
import { FolderKanban } from '../icons';
import { Avatar } from './ui';
import { getAvatarColor } from '../utils';

const IssueCard = memo(
  function IssueCard({
    issue,
    onClick,
    variant = 'list',
    statusIcon: StatusIcon,
    statusColor,
    priorityIcon: PriorityIcon,
    priorityColor,
    priorityLabel,
    showProject = false,
  }) {
    const identifier = issue.parent
      ? issue.parent.identifier || issue.identifier
      : issue.identifier;
    const isSubIssue = Boolean(issue.parent);

    if (variant === 'compact') {
      return (
        <div
          onClick={() => onClick(issue)}
          className="p-3 bg-background hover:bg-background-hover cursor-pointer flex items-center justify-between rounded-md transition-colors"
        >
          <div className="flex items-center gap-2 flex-1">
            {StatusIcon && <StatusIcon className={`w-4 h-4 ${statusColor}`} />}
            <span className="text-sm text-text-primary">{issue.title}</span>
          </div>
          {issue.assignee && (
            <Avatar size="md" className={getAvatarColor(issue.assignee._id)}>
              {issue.assignee.name.charAt(0)}
            </Avatar>
          )}
        </div>
      );
    }

    if (variant === 'card') {
      return (
        <div
          onClick={() => onClick(issue)}
          className="group cursor-pointer rounded-md bg-background-card p-3 transition-colors hover:bg-background-hover"
        >
          {isSubIssue ? (
            <>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="min-w-0 flex-1 truncate text-xs font-mono text-text-tertiary">
                  {issue.parent?.identifier || 'N/A'} ›{' '}
                  {issue.parent?.title || 'Parent Issue'}
                </span>
                {issue.assignee && (
                  <Avatar size="md" className={getAvatarColor(issue.assignee._id)}>
                    {issue.assignee.name.charAt(0)}
                  </Avatar>
                )}
              </div>

              <div className="flex items-start gap-2 mb-2">
                {StatusIcon && (
                  <StatusIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${statusColor}`} />
                )}
                <p className="text-sm text-text-primary line-clamp-2 flex-1">{issue.title}</p>
              </div>

              <div className="flex items-center gap-1.5">
                {PriorityIcon && <PriorityIcon className={`w-3.5 h-3.5 ${priorityColor}`} />}
                <span className="text-xs text-text-tertiary">{priorityLabel}</span>
              </div>
            </>
          ) : (
            <>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="min-w-0 flex-1 truncate text-xs font-mono text-text-tertiary">
                  {identifier}
                </span>
                {issue.assignee && (
                  <Avatar size="md" className={getAvatarColor(issue.assignee._id)}>
                    {issue.assignee.name.charAt(0)}
                  </Avatar>
                )}
              </div>

              <div className="mb-2 flex items-start gap-2">
                {StatusIcon && (
                  <StatusIcon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${statusColor}`} />
                )}
                <p className="text-sm text-text-primary line-clamp-2 flex-1">{issue.title}</p>
              </div>

              <div className="flex items-center gap-1.5">
                {PriorityIcon && <PriorityIcon className={`w-3.5 h-3.5 ${priorityColor}`} />}
                <span className="text-xs text-text-tertiary">{priorityLabel}</span>
              </div>
            </>
          )}
        </div>
      );
    }

    return (
      <div
        onClick={() => onClick(issue)}
        className="px-4 py-2 flex items-center gap-2 text-sm hover:bg-background-secondary cursor-pointer transition-colors"
      >
        {PriorityIcon && <PriorityIcon className={`w-3.5 h-3.5 flex-shrink-0 ${priorityColor}`} />}
        <span className="w-14 md:w-20 text-xs font-mono text-text-tertiary flex-shrink-0 truncate">
          {identifier}
        </span>
        <span className="flex-1 text-text-primary truncate ml-1">{issue.title}</span>
        {showProject && issue.project && (
          <span className="hidden sm:flex ml-4 px-2 py-0.5 rounded-full bg-background-tertiary text-xs text-text-secondary flex-shrink-0 items-center gap-1">
            <FolderKanban className="w-3 h-3" />
            {issue.project.name}
          </span>
        )}
        {issue.assignee && (
          <Avatar size="md" className={`ml-2 ${getAvatarColor(issue.assignee._id)}`}>
            {issue.assignee.name.charAt(0)}
          </Avatar>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for better performance
    return (
      prevProps.issue._id === nextProps.issue._id &&
      prevProps.issue.title === nextProps.issue.title &&
      prevProps.issue.status === nextProps.issue.status &&
      prevProps.issue.priority === nextProps.issue.priority &&
      prevProps.issue.assignee?._id === nextProps.issue.assignee?._id &&
      prevProps.variant === nextProps.variant &&
      prevProps.showProject === nextProps.showProject
    );
  }
);

IssueCard.displayName = 'IssueCard';

export default IssueCard;
