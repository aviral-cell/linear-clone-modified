import React from 'react';
import { cn } from '../../utils/cn';

const cardBase = 'rounded-lg border border-border bg-background shadow-card overflow-hidden';

const variants = {
  default: 'bg-background',
  secondary: 'bg-background-secondary',
  tertiary: 'bg-background-tertiary',
};

/**
 * Card primitive. Use for containers, modals inner, comment boxes.
 * @param {'default'|'secondary'|'tertiary'} [variant='default']
 */
function Card({ variant = 'default', className, children, ...props }) {
  return (
    <div className={cn(cardBase, variants[variant], className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Inner card: padded content area (e.g. comment/input container).
 */
function CardInner({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'p-3 md:p-4 border border-border rounded-md',
        'bg-background-secondary',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Inner = CardInner;
export default Card;
