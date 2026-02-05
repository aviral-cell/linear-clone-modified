import React from 'react';
import { cn } from '../../utils/cn';

const PageHeader = ({ children, className }) => (
  <div className={cn('bg-background border-b border-border sticky top-0 z-sticky', className)}>
    {children}
  </div>
);

PageHeader.TitleRow = ({ icon, title, breadcrumb, actions, className }) => (
  <div className={cn('h-14 px-4 md:px-6 flex items-center justify-between', className)}>
    <div className="flex items-center gap-3 min-w-0">
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {breadcrumb || <h1 className="text-lg font-semibold truncate">{title}</h1>}
    </div>
    {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
  </div>
);

PageHeader.TabRow = ({ children, actions, className }) => (
  <div
    className={cn(
      'px-4 md:px-6 py-2 flex items-center justify-between border-t border-border',
      className
    )}
  >
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">{children}</div>
    {actions && <div className="flex items-center gap-2 flex-shrink-0 ml-4">{actions}</div>}
  </div>
);

PageHeader.FilterRow = ({ children, className }) => (
  <div
    className={cn(
      'px-4 md:px-6 py-2 flex items-center justify-between border-t border-border',
      className
    )}
  >
    {children}
  </div>
);

export default PageHeader;
