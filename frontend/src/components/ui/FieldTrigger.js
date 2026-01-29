import React from 'react';
import { cn } from '../../utils/cn';

const baseStyles =
  'inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-1 text-xs font-medium text-text-primary transition-colors hover:bg-background-secondary disabled:cursor-not-allowed disabled:opacity-50';

/**
 * Dropdown/field trigger button. Use for property selectors (status, priority, assignee, etc.).
 */
function FieldTrigger({ className, children, fullWidth, ...props }) {
  return (
    <button type="button" className={cn(baseStyles, fullWidth && 'w-full', className)} {...props}>
      {children}
    </button>
  );
}

export default FieldTrigger;
