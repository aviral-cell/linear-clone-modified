import React, { useState } from 'react';
import {
  ChevronDown,
  User,
  Circle,
  CircleDashed,
  CircleDot,
  CheckCircle2,
  XCircle,
  Minus,
  BarChart2,
  BarChart3,
  BarChart4,
  AlertCircle,
  FolderKanban,
} from 'lucide-react';
import { getAvatarColor } from '../utils';
import {
  Avatar,
  DropdownMenu,
  DropdownMenuItem,
  FieldTrigger,
  IconBadge,
  PropertyField,
} from './ui';

const statusOptions = [
  {
    value: 'backlog',
    label: 'Backlog',
    Icon: CircleDashed,
    iconColor: 'text-text-tertiary',
  },
  {
    value: 'todo',
    label: 'Todo',
    Icon: Circle,
    iconColor: 'text-text-secondary',
  },
  {
    value: 'in_progress',
    label: 'In Progress',
    Icon: CircleDot,
    iconColor: 'text-yellow-500',
  },
  {
    value: 'in_review',
    label: 'In Review',
    Icon: CircleDot,
    iconColor: 'text-green-500',
  },
  {
    value: 'done',
    label: 'Done',
    Icon: CheckCircle2,
    iconColor: 'text-accent',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    Icon: XCircle,
    iconColor: 'text-text-tertiary',
  },
  {
    value: 'duplicate',
    label: 'Duplicate',
    Icon: XCircle,
    iconColor: 'text-text-tertiary',
  },
];

const priorityOptions = [
  { value: 'no_priority', label: 'No priority', Icon: Minus, color: 'text-text-tertiary' },
  { value: 'urgent', label: 'Urgent', Icon: AlertCircle, color: 'text-red-500' },
  { value: 'high', label: 'High', Icon: BarChart4, color: 'text-orange-500' },
  { value: 'medium', label: 'Medium', Icon: BarChart3, color: 'text-yellow-500' },
  { value: 'low', label: 'Low', Icon: BarChart2, color: 'text-text-tertiary' },
];

const IssueProperties = ({
  issue,
  users = [],
  projects = [],
  onUpdate,
  disabled = false,
  variant = 'horizontal',
  showStatus = true,
  showPriority = true,
  showAssignee = true,
  showProject = true,
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  const isVertical = variant === 'vertical';
  const containerClasses = isVertical
    ? 'flex flex-col space-y-6'
    : 'flex items-center gap-2 flex-wrap';

  const currentStatus =
    statusOptions.find((o) => o.value === (issue?.status || 'todo')) || statusOptions[1];

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
        <span>{isVertical ? 'Unassigned' : 'Assignee'}</span>
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
        <span>{isVertical ? 'No project' : 'Project'}</span>
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
            {statusOptions.map((option) => {
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
                  <OptionIcon className={`h-4 w-4 ${option.iconColor}`} />
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
    </div>
  );
};

export default IssueProperties;
