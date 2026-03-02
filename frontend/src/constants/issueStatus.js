import { CircleDashed, Circle, CircleDot, CheckCircle2, XCircle } from '../icons';

export const issueStatusIcons = {
  backlog: { Icon: CircleDashed, color: 'text-text-tertiary' },
  todo: { Icon: Circle, color: 'text-text-secondary' },
  in_progress: { Icon: CircleDot, color: 'text-yellow-500' },
  in_review: { Icon: CircleDot, color: 'text-green-500' },
  done: { Icon: CheckCircle2, color: 'text-accent' },
  cancelled: { Icon: XCircle, color: 'text-text-tertiary' },
  duplicate: { Icon: XCircle, color: 'text-text-tertiary' },
};

export const issueStatusOptions = [
  { value: 'backlog', label: 'Backlog', Icon: CircleDashed, color: 'text-text-tertiary' },
  { value: 'todo', label: 'Todo', Icon: Circle, color: 'text-text-secondary' },
  { value: 'in_progress', label: 'In Progress', Icon: CircleDot, color: 'text-yellow-500' },
  { value: 'in_review', label: 'In Review', Icon: CircleDot, color: 'text-green-500' },
  { value: 'done', label: 'Done', Icon: CheckCircle2, color: 'text-accent' },
  { value: 'cancelled', label: 'Cancelled', Icon: XCircle, color: 'text-text-tertiary' },
  { value: 'duplicate', label: 'Duplicate', Icon: XCircle, color: 'text-text-tertiary' },
];

export const issueStatusConfig = {
  backlog: { label: 'Backlog', icon: CircleDashed, color: 'text-text-tertiary' },
  todo: { label: 'Todo', icon: Circle, color: 'text-text-secondary' },
  in_progress: { label: 'In Progress', icon: CircleDot, color: 'text-yellow-500' },
  in_review: { label: 'In Review', icon: CircleDot, color: 'text-green-500' },
  done: { label: 'Done', icon: CheckCircle2, color: 'text-accent' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-text-tertiary' },
  duplicate: { label: 'Duplicate', icon: XCircle, color: 'text-text-tertiary' },
};
