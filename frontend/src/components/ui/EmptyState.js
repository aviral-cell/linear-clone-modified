import React from 'react';
import { cn } from '../../utils/cn';

const sizeStyles = {
  default: 'rounded-lg p-6 text-sm',
  sm: 'rounded-md p-4 text-xs',
  lg: 'rounded-md p-8 text-sm',
};

const baseStyles = 'border border-dashed border-border text-center text-text-tertiary';

/**
 * Empty state container. Use when a list or section has no content.
 * @param {'default'|'sm'|'lg'} [size='default']
 */
function EmptyState({ size = 'default', className, children, ...props }) {
  return (
    <div className={cn(baseStyles, sizeStyles[size], className)} {...props}>
      {children}
    </div>
  );
}

export default EmptyState;
