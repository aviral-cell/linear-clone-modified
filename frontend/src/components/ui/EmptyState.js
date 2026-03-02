import React from 'react';
import { cn } from '../../utils/cn';

const sizeStyles = {
  default: 'rounded-lg p-6 text-sm',
  sm: 'rounded-md p-4 text-xs',
  lg: 'rounded-md p-8 text-sm',
};

const baseStyles = 'border border-dashed border-border text-center text-text-tertiary';

function EmptyState({ size = 'default', className, children, ...props }) {
  return (
    <div className={cn(baseStyles, sizeStyles[size], className)} {...props}>
      {children}
    </div>
  );
}

export default EmptyState;
