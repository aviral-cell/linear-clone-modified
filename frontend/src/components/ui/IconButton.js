import React from 'react';
import { cn } from '../../utils/cn';

const sizeStyles = {
  sm: 'p-1.5',
  md: 'p-2',
};

const baseStyles =
  'inline-flex items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-background-secondary transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed';

/**
 * Icon-only button. Use for toolbar actions (close, settings, etc.).
 * @param {'sm'|'md'} [size='md']
 */
function IconButton({ size = 'md', className, children, 'aria-label': ariaLabel, ...props }) {
  return (
    <button
      type="button"
      className={cn(baseStyles, sizeStyles[size], className)}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
}

export default IconButton;
