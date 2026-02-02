import React, { useState } from 'react';
import { ChevronDown, User, FolderKanban, Link2, Search } from '../icons';
import { getAvatarColor } from '../utils';
import { cn } from '../utils/cn';
import { issueStatusOptions, priorityOptions } from '../constants';
import {
  Avatar,
  DropdownMenu,
  DropdownMenuItem,
  FieldTrigger,
  IconBadge,
  Input,
  PropertyField,
} from './ui';

const IssueProperties = ({
  issue,
  users = [],
  projects = [],
  parentIssues = [],
  onUpdate,
  disabled = false,
  variant = 'horizontal',
  showStatus = true,
  showPriority = true,
  showAssignee = true,
  showProject = true,
  showParent = false,
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showParentMenu, setShowParentMenu] = useState(false);
  const [parentSearchQuery, setParentSearchQuery] = useState('');

  const isVertical = variant === 'vertical';
  const containerClasses = isVertical
    ? 'flex flex-col space-y-6'
    : 'flex items-center gap-2 flex-wrap';

  const currentStatus =
    issueStatusOptions.find((o) => o.value === (issue?.status || 'todo')) || issueStatusOptions[1];

  const currentPriority =
    priorityOptions.find((o) => o.value === (issue?.priority || 'no_priority')) ||
    priorityOptions[0];

  const renderAssigneeContent = () => {
    if (issue?.assignee) {
      return (
        <>
          <Avatar size="sm" className={getAvatarColor(issue.assignee._id)}>
            {issue.assignee.name.charAt(0)}
          </Avatar>
          <span>{issue.assignee.name}</span>
        </>
      );
    }
    return (
      <>
        <User className="h-4 w-4 text-text-tertiary" />
        <span>Unassigned</span>
      </>
    );
  };

  const renderProjectContent = () => {
    if (issue?.project) {
      return (
        <>
          <IconBadge
            size="sm"
            className="bg-background-secondary border border-border text-text-secondary"
          >
            {issue.project.icon ? (
              <span className="text-xs">{issue.project.icon}</span>
            ) : (
              <FolderKanban className="w-3 h-3" />
            )}
          </IconBadge>
          <span>{issue.project.name}</span>
        </>
      );
    }
    return (
      <>
        <FolderKanban className="w-4 h-4 text-text-tertiary" />
        <span>No project</span>
      </>
    );
  };

  const renderParentContent = () => {
    if (issue?.parent) {
      return (
        <>
          <Link2 className="h-4 w-4 text-text-secondary flex-shrink-0" />
          <span className="font-mono text-text-tertiary">{issue.parent.identifier}</span>
          <span className="truncate">{issue.parent.title}</span>
        </>
      );
    }
    return (
      <>
        <Link2 className="h-4 w-4 text-text-tertiary" />
        <span>No parent</span>
      </>
    );
  };

  return (
    <div className={containerClasses}>
      {showStatus && (
        <PropertyField label="Status" variant={variant}>
          <DropdownMenu
            open={showStatusMenu}
            onOpenChange={setShowStatusMenu}
            variant={variant}
            minWidth="min-w-dropdown-md"
            maxHeight="max-h-64"
            trigger={
              <FieldTrigger
                disabled={disabled}
                fullWidth={isVertical}
                className={cn(showStatusMenu && 'border-accent')}
                onClick={() => setShowStatusMenu((v) => !v)}
              >
                <div className="flex items-center gap-2">
                  {currentStatus.Icon && (
                    <currentStatus.Icon className={`h-4 w-4 ${currentStatus.iconColor}`} />
                  )}
                  <span>{currentStatus.label}</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
              </FieldTrigger>
            }
          >
            {issueStatusOptions.map((option) => {
              const OptionIcon = option.Icon;
              const isCurrent = option.value === currentStatus.value;
              return (
                <DropdownMenuItem
                  key={option.value}
                  selected={isCurrent}
                  onClick={() => {
                    if (onUpdate) onUpdate({ status: option.value });
                    setShowStatusMenu(false);
                  }}
                >
                  <OptionIcon className={`h-4 w-4 ${option.color}`} />
                  <span>{option.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenu>
        </PropertyField>
      )}

      {showPriority && (
        <PropertyField label="Priority" variant={variant}>
          <DropdownMenu
            open={showPriorityMenu}
            onOpenChange={setShowPriorityMenu}
            variant={variant}
            minWidth="min-w-dropdown-md"
            trigger={
              <FieldTrigger
                disabled={disabled}
                fullWidth={isVertical}
                className={cn(showPriorityMenu && 'border-accent')}
                onClick={() => setShowPriorityMenu((v) => !v)}
              >
                <div className="flex items-center gap-2">
                  {currentPriority.Icon && (
                    <currentPriority.Icon className={`h-4 w-4 ${currentPriority.color}`} />
                  )}
                  <span>{currentPriority.label}</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
              </FieldTrigger>
            }
          >
            {priorityOptions.map((option) => {
              const OptionIcon = option.Icon;
              const isCurrent = option.value === currentPriority.value;
              return (
                <DropdownMenuItem
                  key={option.value}
                  selected={isCurrent}
                  onClick={() => {
                    if (onUpdate) onUpdate({ priority: option.value });
                    setShowPriorityMenu(false);
                  }}
                >
                  <OptionIcon className={`h-4 w-4 ${option.color}`} />
                  <span>{option.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenu>
        </PropertyField>
      )}

      {showAssignee && (
        <PropertyField label="Assignee" variant={variant}>
          <DropdownMenu
            open={showAssigneeMenu}
            onOpenChange={setShowAssigneeMenu}
            variant={variant}
            minWidth="min-w-dropdown-lg"
            maxHeight="max-h-60"
            trigger={
              <FieldTrigger
                disabled={disabled}
                fullWidth={isVertical}
                className={cn(showAssigneeMenu && 'border-accent')}
                onClick={() => setShowAssigneeMenu((v) => !v)}
              >
                <div className="flex items-center gap-2">{renderAssigneeContent()}</div>
                <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
              </FieldTrigger>
            }
          >
            <DropdownMenuItem
              selected={!issue?.assignee}
              onClick={() => {
                if (onUpdate) onUpdate({ assignee: null });
                setShowAssigneeMenu(false);
              }}
            >
              <User className="h-4 w-4 text-text-primary" />
              <span>Unassigned</span>
            </DropdownMenuItem>
            {users.map((user) => (
              <DropdownMenuItem
                key={user._id}
                selected={issue?.assignee?._id === user._id}
                onClick={() => {
                  if (onUpdate) onUpdate({ assignee: user._id });
                  setShowAssigneeMenu(false);
                }}
              >
                <Avatar size="md" className={getAvatarColor(user._id)}>
                  {user.name.charAt(0)}
                </Avatar>
                <span>{user.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenu>
        </PropertyField>
      )}

      {showProject && (
        <PropertyField label="Project" variant={variant}>
          <DropdownMenu
            open={showProjectMenu}
            onOpenChange={setShowProjectMenu}
            variant={variant}
            minWidth="min-w-dropdown-lg"
            maxHeight="max-h-60"
            trigger={
              <FieldTrigger
                disabled={disabled}
                fullWidth={isVertical}
                className={cn(showProjectMenu && 'border-accent')}
                onClick={() => setShowProjectMenu((v) => !v)}
              >
                <div className="flex items-center gap-2">{renderProjectContent()}</div>
                <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
              </FieldTrigger>
            }
          >
            <DropdownMenuItem
              selected={!issue?.project}
              onClick={() => {
                if (onUpdate) onUpdate({ projectId: null });
                setShowProjectMenu(false);
              }}
            >
              <FolderKanban className="h-4 w-4 text-text-primary" />
              <span>No project</span>
            </DropdownMenuItem>
            {projects.map((project) => (
              <DropdownMenuItem
                key={project._id}
                selected={issue?.project?._id === project._id}
                onClick={() => {
                  if (onUpdate) onUpdate({ projectId: project._id });
                  setShowProjectMenu(false);
                }}
              >
                <IconBadge
                  size="md"
                  className="flex-shrink-0 border border-border bg-background-secondary text-text-secondary"
                >
                  {project.icon ? (
                    <span className="text-xs">{project.icon}</span>
                  ) : (
                    <FolderKanban className="h-3 w-3" />
                  )}
                </IconBadge>
                <span>{project.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenu>
        </PropertyField>
      )}

      {showParent && (
        <PropertyField label="Parent" variant={variant}>
          <DropdownMenu
            open={showParentMenu}
            onOpenChange={(open) => {
              setShowParentMenu(open);
              if (!open) setParentSearchQuery('');
            }}
            variant={variant}
            minWidth="min-w-dropdown-lg"
            maxHeight="max-h-60"
            trigger={
              <FieldTrigger
                disabled={disabled}
                fullWidth={isVertical}
                onClick={() => setShowParentMenu((v) => !v)}
              >
                <div className="flex items-center gap-2 min-w-0">{renderParentContent()}</div>
                <ChevronDown className="h-3.5 w-3.5 text-text-tertiary flex-shrink-0" />
              </FieldTrigger>
            }
          >
            <div
              className="p-2 border-b border-border sticky top-0 bg-background-secondary z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <Input.WithIcon
                type="text"
                value={parentSearchQuery}
                onChange={(e) => setParentSearchQuery(e.target.value)}
                placeholder="Search issues..."
                variant="default"
                className="text-sm h-8 py-2 pl-9 pr-3"
                autoFocus
              >
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              </Input.WithIcon>
            </div>
            <DropdownMenuItem
              selected={!issue?.parent}
              onClick={() => {
                if (onUpdate) onUpdate({ parent: null });
                setShowParentMenu(false);
              }}
            >
              <Link2 className="h-4 w-4 text-text-primary" />
              <span>No parent</span>
            </DropdownMenuItem>
            {parentIssues
              .filter((p) => {
                const q = parentSearchQuery.trim().toLowerCase();
                if (!q) return true;
                const id = (p.identifier || '').toLowerCase();
                const title = (p.title || '').toLowerCase();
                return id.includes(q) || title.includes(q);
              })
              .map((p) => (
                <DropdownMenuItem
                  key={p._id}
                  selected={issue?.parent?._id === p._id}
                  onClick={() => {
                    if (onUpdate) onUpdate({ parent: p._id });
                    setShowParentMenu(false);
                  }}
                >
                  <span className="font-mono text-text-tertiary text-sm">{p.identifier}</span>
                  <span className="truncate">{p.title}</span>
                </DropdownMenuItem>
              ))}
          </DropdownMenu>
        </PropertyField>
      )}
    </div>
  );
};

export default IssueProperties;
