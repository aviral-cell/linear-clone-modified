import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from '../../icons';
import { cn } from '../../utils/cn';
import Button from './Button';

/**
 * Collapsible section with optional actions.
 * @param {React.ReactNode} title
 * @param {boolean} [expanded]
 * @param {boolean} [defaultExpanded=true]
 * @param {(next: boolean) => void} [onToggle]
 * @param {React.ReactNode} [actions]
 * @param {boolean} [showChevron=true]
 * @param {string} [className]
 * @param {string} [headerClassName]
 * @param {string} [contentClassName]
 */
function CollapsibleSection({
  title,
  expanded,
  defaultExpanded = true,
  onToggle,
  actions,
  className,
  showChevron = true,
  headerClassName,
  contentClassName,
  children,
}) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = typeof expanded === 'boolean';
  const isExpanded = useMemo(
    () => (isControlled ? expanded : internalExpanded),
    [expanded, internalExpanded, isControlled]
  );

  const handleToggle = () => {
    const nextValue = !isExpanded;
    if (!isControlled) {
      setInternalExpanded(nextValue);
    }
    if (onToggle) {
      onToggle(nextValue);
    }
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className={cn('gap-2 text-text-primary font-medium', headerClassName)}
        >
          {showChevron &&
            (isExpanded ? (
              <ChevronDown className="w-4 h-4 text-text-tertiary" />
            ) : (
              <ChevronRight className="w-4 h-4 text-text-tertiary" />
            ))}
          {title}
        </Button>
        {actions}
      </div>
      {isExpanded && <div className={contentClassName}>{children}</div>}
    </div>
  );
}

export default CollapsibleSection;
