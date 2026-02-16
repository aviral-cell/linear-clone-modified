import React, { memo } from 'react';
import { cn } from '../../utils/cn';

const toneStyles = {
  default: 'bg-background-tertiary text-text-primary border-border',
  accent: 'bg-accent/20 text-accent border-accent/30',
  success: 'bg-status-done/20 text-status-done border-status-done/30',
  warning: 'bg-priority-medium/20 text-priority-medium border-priority-medium/30',
  danger: 'bg-priority-urgent/20 text-priority-urgent border-priority-urgent/30',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium border';

const Badge = memo(function Badge({
  tone = 'default',
  size = 'md',
  className,
  children,
  ...props
}) {
  return (
    <span className={cn(baseStyles, toneStyles[tone], sizeStyles[size], className)} {...props}>
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;
