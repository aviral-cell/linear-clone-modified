import React from 'react';
import { cn } from '../../utils/cn';

const inputBase =
  'w-full bg-background rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent transition-all';

/**
 * Input primitive. Use for standard form inputs; supports leading icon via wrapper.
 */
function Input({ className, ...props }) {
  return <input className={cn(inputBase, 'py-3 pl-10 pr-4', className)} {...props} />;
}

/**
 * Wrapper for input with leading icon. Renders children (icon) + input in relative container.
 */
function InputWithIcon({ children, className, ...props }) {
  return (
    <div className="relative">
      {children}
      <Input className={className} {...props} />
    </div>
  );
}

Input.WithIcon = InputWithIcon;
export default Input;
