/**
 * Priority constants – labels, icons, and colors for issue/update priority.
 */

import { Minus, AlertCircle, BarChart2, BarChart3, BarChart4 } from '../../icons';

/** Map of priority key → { Icon, color } for rendering */
export const priorityIcons = {
  no_priority: { Icon: Minus, color: 'text-text-tertiary' },
  urgent: { Icon: AlertCircle, color: 'text-red-500' },
  high: { Icon: BarChart4, color: 'text-orange-500' },
  medium: { Icon: BarChart3, color: 'text-yellow-500' },
  low: { Icon: BarChart2, color: 'text-text-tertiary' },
};

/** Options array for dropdowns: { value, label, Icon, color } */
export const priorityOptions = [
  { value: 'no_priority', label: 'No priority', Icon: Minus, color: 'text-text-tertiary' },
  { value: 'urgent', label: 'Urgent', Icon: AlertCircle, color: 'text-red-500' },
  { value: 'high', label: 'High', Icon: BarChart4, color: 'text-orange-500' },
  { value: 'medium', label: 'Medium', Icon: BarChart3, color: 'text-yellow-500' },
  { value: 'low', label: 'Low', Icon: BarChart2, color: 'text-text-tertiary' },
];

/** Config map for board/UI: priority key → { label, icon, color } */
export const priorityConfig = {
  no_priority: { label: 'Set priority', icon: Minus, color: 'text-text-tertiary' },
  urgent: { label: 'Urgent', icon: AlertCircle, color: 'text-red-500' },
  high: { label: 'High', icon: BarChart4, color: 'text-orange-500' },
  medium: { label: 'Medium', icon: BarChart3, color: 'text-yellow-500' },
  low: { label: 'Low', icon: BarChart2, color: 'text-text-tertiary' },
};

export function getPriorityColor(priority) {
  switch (priority) {
    case 'urgent':
      return 'text-red-500';
    case 'high':
      return 'text-orange-500';
    case 'medium':
      return 'text-yellow-500';
    case 'low':
      return 'text-blue-500';
    default:
      return 'text-text-tertiary';
  }
}

export function getPriorityMeta(priority) {
  const entry = priorityIcons[priority] || priorityIcons.no_priority;
  const labelMap = {
    no_priority: 'No priority',
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };
  return { Icon: entry.Icon, label: labelMap[priority] || 'No priority' };
}
