import React from 'react';
import { cn } from '../../utils/cn';

const baseStyles =
  'flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs text-text-primary transition-colors hover:bg-background-tertiary';

/**
 * Single selectable item in a dropdown menu. Use inside DropdownMenu panel.
 */
function DropdownMenuItem({ selected, className, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(baseStyles, selected && 'bg-background-tertiary', className)}
      {...props}
    >
      {children}
    </button>
  );
}

export default DropdownMenuItem;
