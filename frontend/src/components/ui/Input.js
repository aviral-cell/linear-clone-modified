import React from 'react';
import { cn } from '../../utils/cn';

const variantStyles = {
  default:
    'w-full bg-background rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent transition-all py-3 pl-10 pr-4',
  transparent:
    'w-full bg-transparent text-text-primary focus:outline-none placeholder:text-text-tertiary',
};

/**
 * Input primitive. Use for standard form inputs; supports leading icon via wrapper.
 * @param {'default'|'transparent'} [variant='default'] - transparent for inline editing
 */
function Input({ variant = 'default', className, ...props }) {
  return <input className={cn(variantStyles[variant], className)} {...props} />;
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
