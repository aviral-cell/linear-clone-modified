import React from 'react';
import { cn } from '../../utils/cn';

const baseStyles = 'h-px bg-border my-4';

/**
 * Horizontal divider. Use between sections or form groups.
 */
function Divider({ className, ...props }) {
  return <div className={cn(baseStyles, className)} role="separator" {...props} />;
}

export default Divider;
