import React from 'react';
import { cn } from '../../utils/cn';

const activityDotStyles =
  'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 z-sticky absolute left-3 -translate-x-1/2 bg-background';

function ActivityDot({ className, children, ...props }) {
  return (
    <div className={cn(activityDotStyles, className)} {...props}>
      {children}
    </div>
  );
}

export default ActivityDot;
