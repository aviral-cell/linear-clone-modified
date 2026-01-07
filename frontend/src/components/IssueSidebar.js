import React, { useState } from 'react';
import { ChevronDown, Circle } from 'lucide-react';
import { getAvatarColor, formatDate } from '../utils';
import {
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

const priorityOptions = [
  {
    value: 'no_priority',
    label: 'Set priority',
    icon: Minus,
    color: 'text-text-tertiary',
  },
  {
    value: 'urgent',
    label: 'Urgent',
    icon: AlertCircle,
    color: 'text-red-500',
  },
  { value: 'high', label: 'High', icon: BarChart4, color: 'text-orange-500' },
  {
    value: 'medium',
    label: 'Medium',
    icon: BarChart3,
    color: 'text-yellow-500',
  },
  { value: 'low', label: 'Low', icon: BarChart2, color: 'text-text-tertiary' },
];

const statusOptions = [
  {
    value: 'backlog',
    label: 'Backlog',
    icon: CircleDashed,
    color: 'text-text-tertiary',
  },
  { value: 'todo', label: 'Todo', icon: Circle, color: 'text-text-secondary' },
  {
    value: 'in_progress',
    label: 'In Progress',
    icon: CircleDot,
    color: 'text-yellow-500',
  },
  {
    value: 'in_review',
    label: 'In Review',
    icon: CircleDot,
    color: 'text-green-500',
  },
  { value: 'done', label: 'Done', icon: CheckCircle2, color: 'text-accent' },
  {
    value: 'cancelled',
    label: 'Cancelled',
    icon: XCircle,
    color: 'text-text-tertiary',
  },
  {
    value: 'duplicate',
    label: 'Duplicate',
    icon: XCircle,
    color: 'text-text-tertiary',
  },
];

const IssueSidebar = ({ issue, users, onUpdate }) => {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  const currentPriority = priorityOptions.find(
    (p) => p.value === issue.priority
  );
  const currentStatus = statusOptions.find((s) => s.value === issue.status);
  const CurrentPriorityIcon = currentPriority?.icon;
  const CurrentStatusIcon = currentStatus?.icon;

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;

      const isOutsideStatus = !target.closest('[data-dropdown="status"]');
      const isOutsidePriority = !target.closest('[data-dropdown="priority"]');
      const isOutsideAssignee = !target.closest('[data-dropdown="assignee"]');

      if (isOutsideStatus && isOutsidePriority && isOutsideAssignee) {
        setShowStatusDropdown(false);
        setShowPriorityDropdown(false);
        setShowAssigneeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full h-full p-6">
      <div className="space-y-6">
        <div className="relative" data-dropdown="status">
          <label className="block text-xs font-medium text-text-tertiary mb-2 uppercase tracking-wide">
            Status
          </label>
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="w-full px-3 py-2.5 bg-background-secondary border border-border rounded-lg text-text-primary text-sm flex items-center justify-between hover:border-border-hover transition-colors"
          >
            <div className="flex items-center gap-2">
              {CurrentStatusIcon && (
                <CurrentStatusIcon
                  className={`w-4 h-4 ${currentStatus?.color}`}
                />
              )}
              <span>{currentStatus?.label}</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showStatusDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-background-secondary border border-border rounded-lg shadow-xl max-h-64 overflow-y-auto">
              {statusOptions.map((status) => {
                const StatusIcon = status.icon;
                return (
                  <button
                    key={status.value}
                    onClick={() => {
                      onUpdate({ status: status.value });
                      setShowStatusDropdown(false);
                    }}
                    className="w-full px-3 py-2.5 text-left text-sm text-text-primary hover:bg-background-tertiary flex items-center gap-2 transition-colors"
                  >
                    <StatusIcon className={`w-4 h-4 ${status.color}`} />
                    <span>{status.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="relative" data-dropdown="priority">
          <label className="block text-xs font-medium text-text-tertiary mb-2 uppercase tracking-wide">
            Priority
          </label>
          <button
            onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
            className="w-full px-3 py-2.5 bg-background-secondary border border-border rounded-lg text-text-primary text-sm flex items-center justify-between hover:border-border-hover transition-colors"
          >
            <div className="flex items-center gap-2">
              {CurrentPriorityIcon && (
                <CurrentPriorityIcon
                  className={`w-4 h-4 ${currentPriority.color}`}
                />
              )}
              <span>{currentPriority?.label}</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showPriorityDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-background-secondary border border-border rounded-lg shadow-xl">
              {priorityOptions.map((priority) => {
                const PriorityIcon = priority.icon;
                return (
                  <button
                    key={priority.value}
                    onClick={() => {
                      onUpdate({ priority: priority.value });
                      setShowPriorityDropdown(false);
                    }}
                    className="w-full px-3 py-2.5 text-left text-sm text-text-primary hover:bg-background-tertiary flex items-center gap-2 transition-colors"
                  >
                    <PriorityIcon className={`w-4 h-4 ${priority.color}`} />
                    <span>{priority.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="relative" data-dropdown="assignee">
          <label className="block text-xs font-medium text-text-tertiary mb-2 uppercase tracking-wide">
            Assignee
          </label>
          <button
            onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
            className="w-full px-3 py-2.5 bg-background-secondary border border-border rounded-lg text-text-primary text-sm flex items-center justify-between hover:border-border-hover transition-colors"
          >
            <div className="flex items-center gap-2">
              {issue.assignee ? (
                <>
                  <div
                    className={`w-5 h-5 ${getAvatarColor(issue.assignee._id)} rounded-full flex items-center justify-center text-xs text-white font-medium`}
                  >
                    {issue.assignee.name.charAt(0)}
                  </div>
                  <span>{issue.assignee.name}</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 text-text-primary" />
                  <span className="text-text-primary">Unassigned</span>
                </>
              )}
            </div>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showAssigneeDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-background-secondary border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto">
              <button
                onClick={() => {
                  onUpdate({ assignee: null });
                  setShowAssigneeDropdown(false);
                }}
                className="w-full px-3 py-2.5 text-left text-sm text-text-primary hover:bg-background-tertiary flex items-center gap-2 transition-colors"
              >
                <Circle className="w-4 h-4 text-text-primary" />
                <span>Unassigned</span>
              </button>
              {users.map((user) => (
                <button
                  key={user._id}
                  onClick={() => {
                    onUpdate({ assignee: user._id });
                    setShowAssigneeDropdown(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-text-primary hover:bg-background-tertiary flex items-center gap-2 transition-colors"
                >
                  <div
                    className={`w-5 h-5 ${getAvatarColor(user._id)} rounded-full flex items-center justify-center text-xs text-white font-medium`}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <span>{user.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-px bg-border my-4" />

        <div>
          <label className="block text-xs font-medium text-text-tertiary mb-2 uppercase tracking-wide">
            Created by
          </label>
          <div className="flex items-center gap-2 text-sm text-text-primary">
            <div
              className={`w-5 h-5 ${getAvatarColor(issue.creator._id)} rounded-full flex items-center justify-center text-xs text-white font-medium`}
            >
              {issue.creator.name.charAt(0)}
            </div>
            <span>{issue.creator.name}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-tertiary mb-2 uppercase tracking-wide">
            Created
          </label>
          <div className="text-sm text-text-secondary">
            {formatDate(issue.createdAt, { relative: true })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueSidebar;
