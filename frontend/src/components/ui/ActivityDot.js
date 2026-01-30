import React from 'react';
import { cn } from '../../utils/cn';

function ActivityDot({ className, children, ...props }) {
  return (
    <div className={cn('activity-dot activity-dot-default', className)} {...props}>
      {children}
    </div>
  );
}

export default ActivityDot;
