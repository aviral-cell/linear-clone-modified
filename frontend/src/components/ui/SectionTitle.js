import React from 'react';
import { cn } from '../../utils/cn';

const sizeClasses = {
  sm: 'text-xs font-medium text-text-tertiary',
  md: 'text-sm font-medium text-text-secondary',
  lg: 'text-base font-semibold text-text-primary',
};

/**
 * Section title text.
 * @param {'sm'|'md'|'lg'} [size='sm']
 * @param {'h2'|'h3'|'div'|'span'} [as='h2']
 */
function SectionTitle({ size = 'sm', as = 'h2', className, children }) {
  const Component = as;
  return <Component className={cn(sizeClasses[size], className)}>{children}</Component>;
}

export default SectionTitle;
