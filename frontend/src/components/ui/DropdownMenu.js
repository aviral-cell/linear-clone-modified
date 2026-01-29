import React, { useRef, useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

/**
 * Returns panel position classes for dropdown (horizontal layout with optional right-align).
 */
export function getDropdownPanelClasses(isVertical, options = {}) {
  const { minWidth = 'min-w-dropdown-md', align = 'left' } = options;
  if (isVertical) {
    return cn('dropdown-panel', minWidth);
  }
  const alignment = align === 'right' ? 'right-0 left-auto' : 'left-0';
  return cn('dropdown-panel', alignment, minWidth, 'max-w-dropdown-viewport');
}

/**
 * Dropdown menu: wrapper with click-outside and panel alignment.
 * Renders container (with ref), trigger, and when open the panel with children.
 * @param {boolean} open
 * @param {(open: boolean) => void} onOpenChange
 * @param {React.ReactNode} trigger - The trigger button (e.g. FieldTrigger)
 * @param {React.ReactNode} children - Panel content (e.g. list of DropdownMenuItem)
 * @param {'vertical'|'horizontal'} [variant='horizontal']
 * @param {string} [minWidth='min-w-dropdown-md']
 * @param {string} [maxHeight] - e.g. 'max-h-64', 'max-h-60'
 */
function DropdownMenu({
  open,
  onOpenChange,
  trigger,
  children,
  variant = 'horizontal',
  minWidth = 'min-w-dropdown-md',
  maxHeight,
  className,
}) {
  const isVertical = variant === 'vertical';
  const containerRef = useRef(null);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);
  const [align, setAlign] = useState('left');

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onOpenChange(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open || isVertical) return;
    const run = () => {
      if (!triggerRef.current || !panelRef.current) return;
      const buttonRect = triggerRef.current.getBoundingClientRect();
      const menuRect = panelRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const padding = 16;
      const spaceOnRight = viewportWidth - buttonRect.right;
      const spaceOnLeft = buttonRect.left;
      const menuWidth = menuRect.width || 180;
      if (spaceOnRight < menuWidth + padding && spaceOnLeft > spaceOnRight) {
        setAlign('right');
      } else {
        setAlign('left');
      }
    };
    requestAnimationFrame(run);
  }, [open, isVertical]);

  useEffect(() => {
    if (!open || isVertical) return;
    const handleResize = () =>
      requestAnimationFrame(() => {
        if (triggerRef.current && panelRef.current) {
          const buttonRect = triggerRef.current.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const spaceOnRight = viewportWidth - buttonRect.right;
          const spaceOnLeft = buttonRect.left;
          setAlign(spaceOnRight < 196 && spaceOnLeft > spaceOnRight ? 'right' : 'left');
        }
      });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open, isVertical]);

  const panelClasses = getDropdownPanelClasses(isVertical, {
    minWidth,
    align: isVertical ? 'left' : align,
  });

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div ref={triggerRef}>{trigger}</div>
      {open && (
        <div ref={panelRef} className={cn(panelClasses, maxHeight && 'overflow-y-auto', maxHeight)}>
          {children}
        </div>
      )}
    </div>
  );
}

export default DropdownMenu;
