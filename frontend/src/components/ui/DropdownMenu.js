import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

const GAP = 4;
const MIN_SPACE_BELOW = 220;
const MIN_SPACE_ABOVE = 180;
const MIN_SPACE_BELOW_TALL = 360;
const MIN_SPACE_ABOVE_TALL = 200;
const PADDING_VIEWPORT = 16;
const PADDING_VIEWPORT_MOBILE = 20;
const MOBILE_BREAKPOINT = 640;

export function getDropdownPanelClasses(isVertical, options = {}) {
  const { minWidth = 'min-w-dropdown-md', align = 'left' } = options;
  if (isVertical) {
    return cn('dropdown-panel', minWidth);
  }
  const alignment = align === 'right' ? 'right-0 left-auto' : 'left-0';
  return cn('dropdown-panel', alignment, minWidth, 'max-w-dropdown-viewport');
}

const ESTIMATED_PANEL_WIDTH = 200;

function getPanelPlacement(triggerRect, align, panelWidth = ESTIMATED_PANEL_WIDTH, options = {}) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const padding = vw < MOBILE_BREAKPOINT ? PADDING_VIEWPORT_MOBILE : PADDING_VIEWPORT;
  const minBelow = options.minSpaceBelow ?? MIN_SPACE_BELOW;
  const minAbove = options.minSpaceAbove ?? MIN_SPACE_ABOVE;
  const spaceBelow = vh - triggerRect.bottom;
  const spaceAbove = triggerRect.top;
  const placeAbove = spaceBelow < minBelow && spaceAbove >= Math.min(minAbove, spaceBelow);

  const top = placeAbove ? undefined : triggerRect.bottom + GAP;
  const bottom = placeAbove ? vh - triggerRect.top + GAP : undefined;

  const pw = panelWidth || 180;
  const spaceOnRight = vw - triggerRect.right;
  const useRight =
    align === 'right' || (spaceOnRight < pw + padding && triggerRect.left > spaceOnRight);

  const left = useRight
    ? undefined
    : Math.max(padding, Math.min(triggerRect.left, vw - pw - padding));
  const right = useRight
    ? Math.max(padding, Math.min(vw - triggerRect.right, vw - pw - padding))
    : undefined;

  return { top, bottom, left, right };
}

function getPanelMaxHeight(triggerRect, placement) {
  const vh = window.innerHeight;
  if (placement.top != null) {
    return vh - placement.top - PADDING_VIEWPORT;
  }
  if (placement.bottom != null) {
    return vh - placement.bottom - PADDING_VIEWPORT;
  }
  return vh - PADDING_VIEWPORT * 2;
}

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
  const [, setPlaceTick] = useState(0);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const spaceOnRight = vw - triggerRect.right;
    const newAlign = isVertical
      ? 'left'
      : spaceOnRight < 196 && triggerRect.left > spaceOnRight
        ? 'right'
        : 'left';
    setAlign(newAlign);
  }, [open, isVertical]);

  useEffect(() => {
    if (!open) return;
    const handle = () => setPlaceTick((t) => t + 1);
    window.addEventListener('resize', handle);
    window.addEventListener('scroll', handle, true);
    return () => {
      window.removeEventListener('resize', handle);
      window.removeEventListener('scroll', handle, true);
    };
  }, [open]);

  const triggerRect =
    open && triggerRef.current ? triggerRef.current.getBoundingClientRect() : null;
  const renderAlign = triggerRect
    ? isVertical
      ? 'left'
      : window.innerWidth - triggerRect.right < 196 &&
          triggerRect.left > window.innerWidth - triggerRect.right
        ? 'right'
        : 'left'
    : align;
  const renderPlacement = triggerRect
    ? getPanelPlacement(triggerRect, renderAlign)
    : { top: 0, left: 0 };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      const inTrigger = containerRef.current && containerRef.current.contains(e.target);
      const inPanel = panelRef.current && panelRef.current.contains(e.target);
      if (!inTrigger && !inPanel) {
        onOpenChange(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  const panelClasses = cn(
    'dropdown-panel-portaled z-dropdown',
    'bg-background-secondary border border-border rounded-md shadow-lg',
    'max-w-dropdown-viewport',
    minWidth,
    maxHeight && 'overflow-y-auto',
    maxHeight
  );
  const panelStyle = {
    position: 'fixed',
    top: renderPlacement.top != null ? renderPlacement.top : undefined,
    bottom: renderPlacement.bottom != null ? renderPlacement.bottom : undefined,
    left: renderPlacement.left != null ? renderPlacement.left : undefined,
    right: renderPlacement.right != null ? renderPlacement.right : undefined,
  };

  const panelContent = open ? (
    <div ref={panelRef} className={panelClasses} style={panelStyle} role="menu">
      {children}
    </div>
  ) : null;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div ref={triggerRef}>{trigger}</div>
      {open && createPortal(panelContent, document.body)}
    </div>
  );
}

function PopoverPortal({
  open,
  onOpenChange,
  trigger,
  children,
  minWidth = 'min-w-[280px]',
  className,
}) {
  const containerRef = useRef(null);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);
  const [, setPlaceTick] = useState(0);

  useEffect(() => {
    if (!open) return;
    const handle = () => setPlaceTick((t) => t + 1);
    window.addEventListener('resize', handle);
    window.addEventListener('scroll', handle, true);
    return () => {
      window.removeEventListener('resize', handle);
      window.removeEventListener('scroll', handle, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      const inTrigger = containerRef.current && containerRef.current.contains(e.target);
      const inPanel = panelRef.current && panelRef.current.contains(e.target);
      if (!inTrigger && !inPanel) onOpenChange(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  const triggerRect =
    open && triggerRef.current ? triggerRef.current.getBoundingClientRect() : null;
  const renderPlacement = triggerRect
    ? getPanelPlacement(triggerRect, 'left', 280, {
        minSpaceBelow: MIN_SPACE_BELOW_TALL,
        minSpaceAbove: MIN_SPACE_ABOVE_TALL,
      })
    : { top: 0, left: 0 };
  const maxHeight = triggerRect ? getPanelMaxHeight(triggerRect, renderPlacement) : undefined;

  const panelClasses = cn(
    'dropdown-panel-portaled z-dropdown w-fit',
    'bg-background-secondary border border-border rounded-md shadow-lg',
    'max-w-dropdown-viewport overflow-y-auto',
    minWidth
  );
  const panelStyle = {
    position: 'fixed',
    top: renderPlacement.top != null ? renderPlacement.top : undefined,
    bottom: renderPlacement.bottom != null ? renderPlacement.bottom : undefined,
    left: renderPlacement.left != null ? renderPlacement.left : undefined,
    right: renderPlacement.right != null ? renderPlacement.right : undefined,
    maxHeight: maxHeight != null ? `${Math.max(200, maxHeight)}px` : undefined,
  };

  const panelContent = open ? (
    <div ref={panelRef} className={panelClasses} style={panelStyle} role="dialog" aria-modal="true">
      {children}
    </div>
  ) : null;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div ref={triggerRef}>{trigger}</div>
      {open && createPortal(panelContent, document.body)}
    </div>
  );
}

export default DropdownMenu;
export { PopoverPortal };
