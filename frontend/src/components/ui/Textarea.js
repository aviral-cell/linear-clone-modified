import React from 'react';
import { cn } from '../../utils/cn';

const baseStyles =
  'w-full bg-transparent text-text-primary placeholder:text-text-tertiary focus:outline-none resize-none transition-colors';

const sizeStyles = {
  sm: 'text-sm',
  base: 'text-base',
};

const minHeightStyles = {
  summary: 'min-h-[24px]',
  card: 'min-h-[56px]',
  comment: 'min-h-[60px] md:min-h-[80px]',
  description: 'min-h-[100px]',
  none: '',
};

function Textarea({ size = 'sm', minHeight = 'none', className, ...props }) {
  return (
    <textarea
      className={cn(baseStyles, sizeStyles[size], minHeightStyles[minHeight], className)}
      {...props}
    />
  );
}

export default Textarea;
