import React from 'react';
import { cn } from '../../utils/cn';
import Button from './Button';

function TabNavigation({ tabs = [], activeTab, onTabChange, actions, className, tabsClassName }) {
  return (
    <section aria-label="Tabs" className={cn('filter-bar', className)}>
      <div className="filter-bar-inner">
        <div className={cn('filter-bar-tabs overflow-x-auto scrollbar-hide', tabsClassName)}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <Button
                key={tab.id}
                variant="secondary"
                size="sm"
                className={cn(
                  'flex-shrink-0',
                  isActive && 'border-accent bg-background-tertiary text-text-primary'
                )}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className="text-xs text-text-tertiary">{tab.count}</span>
                )}
              </Button>
            );
          })}
        </div>
        {actions}
      </div>
    </section>
  );
}

export default TabNavigation;
