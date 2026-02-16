import React from 'react';
import { cn } from '../../utils/cn';

const sizeClasses = {
  sm: 'text-xs font-medium text-text-tertiary',
  md: 'text-sm font-medium text-text-secondary',
  lg: 'text-base font-semibold text-text-primary',
};

function SectionTitle({ size = 'sm', as = 'h2', className, children }) {
  const Component = as;
  return <Component className={cn(sizeClasses[size], className)}>{children}</Component>;
}

export default SectionTitle;
