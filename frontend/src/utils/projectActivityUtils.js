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
    case 'updated_status':
      if (activityValue && projectStatusIcons[activityValue]) {
        return projectStatusIcons[activityValue];
      }
      return { Icon: CircleDot, color: 'text-yellow-400' };
    case 'updated_priority':
      if (activityValue && priorityIcons[activityValue]) {
        return priorityIcons[activityValue];
      }
      return {
        Icon: priorityIcons.high?.Icon || priorityIcons.no_priority.Icon,
        color: 'text-text-tertiary',
      };
    case 'posted_update':
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
    case 'set_start_date':
    case 'cleared_start_date':
      return { Icon: CalendarClock, color: 'text-text-tertiary' };
    case 'set_target_date':
    case 'cleared_target_date':
      return { Icon: CalendarCheck2, color: 'text-text-tertiary' };
    case 'updated_lead':
    case 'cleared_lead':
      return { Icon: User, color: 'text-text-tertiary' };
    case 'updated_team':
      return { Icon: Building2, color: 'text-text-tertiary' };
    case 'updated_members':
      return { Icon: Users, color: 'text-text-tertiary' };
    case 'updated_name':
    case 'updated_summary':
      return { Icon: Edit, color: 'text-text-tertiary' };
    default:
      return { Icon: CircleDot, color: 'text-yellow-400' };
  }
};

export const formatDescriptionWithBold = (activity) => {
  const { description, actionType } = activity;

  let valueToBold = '';

  if (actionType === 'updated_status' || actionType === 'updated_priority') {
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
  } else if (actionType === 'set_target_date' || actionType === 'set_start_date') {
    const parts = description.split(' to ');
    if (parts.length === 2) {
      valueToBold = parts[1];
    }
  } else if (actionType === 'updated_name') {
    const parts = description.split(' to ');
    if (parts.length === 2) {
      valueToBold = parts[1];
    }
  } else if (actionType === 'updated_lead' || actionType === 'updated_team') {
    const parts = description.split(' to ');
    if (parts.length === 2) {
      valueToBold = parts[1];
    }
  } else if (actionType === 'updated_members') {
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
