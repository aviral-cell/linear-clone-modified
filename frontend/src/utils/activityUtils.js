import {
  CircleDot,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  TrendingDown,
  CalendarClock,
  CalendarCheck2,
  User,
  Users,
  Building2,
  Edit,
} from '../icons';
import { projectStatusIcons, priorityIcons } from '../constants';

export { projectStatusIcons, priorityIcons };

export const getActivityIcon = (actionType, updateStatus = null, activityValue = null) => {
  switch (actionType) {
    case 'status_changed':
      if (activityValue && projectStatusIcons[activityValue]) {
        return projectStatusIcons[activityValue];
      }
      return { Icon: CircleDot, color: 'text-yellow-400' };
    case 'priority_changed':
      if (activityValue && priorityIcons[activityValue]) {
        return priorityIcons[activityValue];
      }
      return {
        Icon: priorityIcons.high?.Icon || priorityIcons.no_priority.Icon,
        color: 'text-text-tertiary',
      };
    case 'update_posted':
      if (updateStatus === 'on_track') {
        return { Icon: TrendingUp, color: 'text-green-400' };
      }
      if (updateStatus === 'at_risk') {
        return { Icon: AlertCircle, color: 'text-yellow-400' };
      }
      if (updateStatus === 'off_track') {
        return { Icon: TrendingDown, color: 'text-red-400' };
      }
      return { Icon: CheckCircle2, color: 'text-yellow-400' };
    case 'start_date_set':
    case 'start_date_cleared':
      return { Icon: CalendarClock, color: 'text-text-tertiary' };
    case 'target_date_set':
    case 'target_date_cleared':
      return { Icon: CalendarCheck2, color: 'text-text-tertiary' };
    case 'lead_changed':
    case 'lead_cleared':
      return { Icon: User, color: 'text-text-tertiary' };
    case 'team_changed':
      return { Icon: Building2, color: 'text-text-tertiary' };
    case 'members_changed':
      return { Icon: Users, color: 'text-text-tertiary' };
    case 'name_changed':
    case 'summary_changed':
      return { Icon: Edit, color: 'text-text-tertiary' };
    default:
      return { Icon: CircleDot, color: 'text-yellow-400' };
  }
};

export const formatDescriptionWithBold = (activity) => {
  const { description, actionType } = activity;

  let valueToBold = '';

  if (actionType === 'status_changed' || actionType === 'priority_changed') {
    const fromIndex = description.indexOf('from ');
    const toIndex = description.indexOf(' to ');
    if (fromIndex !== -1 && toIndex !== -1) {
      const oldValue = description.substring(fromIndex + 5, toIndex);
      const newValueText = description.substring(toIndex + 4);
      return (
        <>
          {description.substring(0, fromIndex + 5)}
          <span className="font-medium">{oldValue}</span>
          {description.substring(toIndex, toIndex + 4)}
          <span className="font-medium">{newValueText}</span>
        </>
      );
    }
  } else if (actionType === 'target_date_set' || actionType === 'start_date_set') {
    const parts = description.split(' to ');
    if (parts.length === 2) {
      valueToBold = parts[1];
    }
  } else if (actionType === 'name_changed') {
    const parts = description.split(' to ');
    if (parts.length === 2) {
      valueToBold = parts[1];
    }
  } else if (actionType === 'lead_changed' || actionType === 'team_changed') {
    const parts = description.split(' to ');
    if (parts.length === 2) {
      valueToBold = parts[1];
    }
  } else if (actionType === 'members_changed') {
    const match = description.match(/\(([^)]+)\)/);
    if (match) {
      valueToBold = match[0];
    }
  }

  if (valueToBold) {
    const index = description.indexOf(valueToBold);
    if (index !== -1) {
      return (
        <>
          {description.substring(0, index)}
          <span className="font-medium">{valueToBold}</span>
        </>
      );
    }
  }

  return description;
};

export const formatActivityDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
