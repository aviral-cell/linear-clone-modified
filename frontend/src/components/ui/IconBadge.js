import React from 'react';
import { cn } from '../../utils/cn';

const sizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7',
};

const baseStyles = 'rounded-md flex items-center justify-center flex-shrink-0 text-white';

function IconBadge({ size = 'md', className, children, ...props }) {
  return (
    <div className={cn(baseStyles, sizeStyles[size], className)} {...props}>
      {children}
    </div>
  );
}

export default IconBadge;
