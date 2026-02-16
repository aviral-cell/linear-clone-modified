import { TrendingUp, AlertCircle, TrendingDown, Check } from '../icons';

export const updateStatusOptions = [
  {
    value: 'on_track',
    label: 'On track',
    icon: TrendingUp,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
  },
  {
    value: 'at_risk',
    label: 'At risk',
    icon: AlertCircle,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
  },
  {
    value: 'off_track',
    label: 'Off track',
    icon: TrendingDown,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
  },
];

export function getUpdateStatusConfig(displayStatus) {
  const config = updateStatusOptions.find((opt) => opt.value === displayStatus);
  if (config) {
    return {
      label: config.label,
      icon: config.icon,
      color: config.color,
      bgColor: config.bgColor,
      borderColor: config.borderColor,
    };
  }
  return {
    label: displayStatus,
    icon: Check,
    color: 'text-text-tertiary',
    bgColor: 'bg-text-tertiary/20',
    borderColor: 'border-border',
  };
}

export const updateStatusIndicatorIcons = {
  on_track: { icon: TrendingUp, color: 'text-green-400' },
  at_risk: { icon: AlertCircle, color: 'text-yellow-400' },
  off_track: { icon: TrendingDown, color: 'text-red-400' },
};
