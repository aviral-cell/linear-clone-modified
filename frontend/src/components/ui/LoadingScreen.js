import React from 'react';
import { cn } from '../../utils/cn';

const baseStyles = 'h-screen w-screen flex items-center justify-center bg-background';
const textStyles = 'text-text-secondary';

function LoadingScreen({ className, message = 'Loading...', ...props }) {
  return (
    <div className={cn(baseStyles, className)} {...props}>
      <div className={cn(textStyles)}>{message}</div>
    </div>
  );
}

export default LoadingScreen;
