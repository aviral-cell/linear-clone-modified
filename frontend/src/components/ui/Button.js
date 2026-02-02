import React from 'react';
import { cn } from '../../utils/cn';

const variantStyles = {
  primary:
    'bg-accent text-white border-transparent hover:bg-accent-hover focus-visible:ring-accent',
  secondary:
    'bg-background border border-border text-text-primary hover:bg-background-secondary focus-visible:ring-border-hover',
  tertiary:
    'bg-background-tertiary border border-border text-text-primary hover:bg-background-hover focus-visible:ring-border-hover',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-background-secondary focus-visible:ring-border-hover',
  hero: 'bg-gradient-to-r from-accent to-purple-600 text-white hover:from-accent-hover hover:to-purple-700 shadow-lg hover:shadow-xl focus-visible:ring-accent',
};

const sizeStyles = {
  xs: 'px-1.5 py-0.5 text-xs gap-1',
  sm: 'px-2 py-1 text-xs gap-1.5',
  md: 'px-3 py-1.5 text-xs gap-1.5',
  lg: 'px-4 py-2 text-sm gap-2',
  xl: 'w-full py-3 px-4 text-base gap-2',
};

const baseStyles =
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0';

/**
 * Button primitive. Use variant and size for consistency.
 * @param {'primary'|'secondary'|'tertiary'|'ghost'|'hero'} [variant='primary']
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [size='md']
 */
function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
