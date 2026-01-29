import React from 'react';
import { cn } from '../../utils/cn';

const baseStyles =
  'w-full bg-transparent text-text-primary placeholder:text-text-tertiary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent resize-none transition-colors';

const sizeStyles = {
  sm: 'text-sm',
  base: 'text-base',
};

// Semantic min-heights for different contexts (use Tailwind scale where possible)
const minHeightStyles = {
  summary: 'min-h-[24px]',
  card: 'min-h-[56px]',
  comment: 'min-h-[60px] md:min-h-[80px]',
  description: 'min-h-[100px]',
  none: '',
};

/**
 * Textarea primitive. Transparent background; use for inline editing and comments.
 * @param {'sm'|'base'} [size='sm']
 * @param {'summary'|'card'|'comment'|'description'|'none'} [minHeight='none'] - semantic min-height
 */
function Textarea({ size = 'sm', minHeight = 'none', className, ...props }) {
  return (
    <textarea
      className={cn(baseStyles, sizeStyles[size], minHeightStyles[minHeight], className)}
      {...props}
    />
  );
}

export default Textarea;
