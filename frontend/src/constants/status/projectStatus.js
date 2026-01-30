/**
 * Project status constants – labels, icons, and colors for project lifecycle states.
 */

import {
  Clock,
  Circle,
  CircleDot,
  CheckCircle2,
  X,
} from '../../icons';

/** Map of project status key → { Icon, color } for rendering (e.g. activity timeline) */
export const projectStatusIcons = {
  backlog: { Icon: Clock, color: 'text-orange-400' },
  planned: { Icon: Circle, color: 'text-text-tertiary' },
  in_progress: { Icon: CircleDot, color: 'text-yellow-400' },
  completed: { Icon: CheckCircle2, color: 'text-blue-500' },
  cancelled: { Icon: X, color: 'text-text-tertiary' },
};

/** Options array for dropdowns: { value, label, Icon, color } */
export const projectStatusOptions = [
  { value: 'backlog', label: 'Backlog', Icon: Clock, color: 'text-orange-400' },
  { value: 'planned', label: 'Planned', Icon: Circle, color: 'text-text-tertiary' },
  { value: 'in_progress', label: 'In Progress', Icon: CircleDot, color: 'text-yellow-400' },
  { value: 'completed', label: 'Completed', Icon: CheckCircle2, color: 'text-blue-500' },
  { value: 'cancelled', label: 'Canceled', Icon: X, color: 'text-text-tertiary' },
];
