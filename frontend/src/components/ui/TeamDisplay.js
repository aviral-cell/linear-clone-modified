import React from 'react';
import IconBadge from './IconBadge';

const emojiSizes = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
  xl: 'text-base',
};

function TeamDisplay({ team, size = 'md', className, label, suffix, labelClassName, onClick }) {
  const icon = team?.icon || '📦';
  const colorClass = team?.color || 'bg-gray-600';

  const badge = (
    <IconBadge size={size} className={className || colorClass}>
      <span className={emojiSizes[size]}>{icon}</span>
    </IconBadge>
  );

  if (!label) return badge;

  const labelContent = suffix ? (
    <>
      {label} <span className="text-text-tertiary font-normal">{suffix}</span>
    </>
  ) : (
    label
  );

  const labelElement = onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={labelClassName || 'truncate hover:opacity-70 transition-opacity cursor-pointer'}
      title={suffix ? `${label} ${suffix}` : label}
    >
      {labelContent}
    </button>
  ) : (
    <span className={labelClassName || 'truncate'}>{labelContent}</span>
  );

  return (
    <span className="flex items-center gap-2 min-w-0">
      {badge}
      {labelElement}
    </span>
  );
}

export default TeamDisplay;
