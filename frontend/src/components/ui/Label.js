import React from 'react';
import { cn } from '../../utils/cn';

const sizeStyles = {
  sm: 'text-xs font-medium text-text-tertiary mb-2 tracking-wide',
  md: 'text-sm text-text-secondary mb-2',
};

const baseStyles = 'block';

/**
 * Form label primitive. Use for form field labels.
 * @param {'sm'|'md'} [size='sm'] - sm: compact labels; md: larger secondary text
 */
function Label({ size = 'sm', className, children, htmlFor, ...props }) {
  return (
    <label htmlFor={htmlFor} className={cn(baseStyles, sizeStyles[size], className)} {...props}>
      {children}
    </label>
  );
}

export default Label;
