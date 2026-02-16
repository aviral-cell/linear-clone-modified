import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import Label from './Label';

const PropertyField = forwardRef(function PropertyField(
  { label, variant = 'horizontal', className, children, ...props },
  ref
) {
  const isVertical = variant === 'vertical';
  return (
    <div
      ref={ref}
      className={cn(isVertical && 'flex items-center gap-0', !isVertical && 'inline', className)}
      {...props}
    >
      {label != null && (
        <Label className={cn(!isVertical && 'hidden', isVertical && 'mr-2 w-20 flex-shrink-0')}>
          {label}
        </Label>
      )}
      {children}
    </div>
  );
});

export default PropertyField;
