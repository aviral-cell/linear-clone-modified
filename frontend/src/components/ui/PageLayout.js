import React from 'react';
import { cn } from '../../utils/cn';
import PageHeader from './PageHeader';

const PageLayout = ({ children, className }) => (
  <div className={cn('flex-1 flex flex-col overflow-hidden', className)}>{children}</div>
);

PageLayout.Header = PageHeader;

PageLayout.Content = ({ children, container = 'default', className }) => {
  const containerClass = {
    narrow: 'page-container-narrow',
    default: 'page-container-default',
    wide: 'page-container-wide',
    full: 'page-container-full',
    none: '',
  }[container];

  return (
    <div className="page-content">
      <div className={cn(containerClass, className)}>{children}</div>
    </div>
  );
};

PageLayout.Loading = ({ message = 'Loading...' }) => (
  <div className="page-content flex items-center justify-center">
    <div className="text-text-secondary">{message}</div>
  </div>
);

PageLayout.Empty = ({ message, action }) => (
  <div className="page-content flex items-center justify-center">
    <div className="text-center">
      <p className="text-text-secondary mb-4">{message}</p>
      {action}
    </div>
  </div>
);

PageLayout.Error = ({ message, onRetry }) => (
  <div className="page-content flex items-center justify-center">
    <div className="text-center">
      <p className="text-red-500 mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-accent hover:underline">
          Try again
        </button>
      )}
    </div>
  </div>
);

export default PageLayout;
