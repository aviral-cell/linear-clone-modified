import React, { memo } from 'react';
import { cn } from '../../utils/cn';

const sizeStyles = {
  sm: 'w-4 h-4 text-[10px]',
  md: 'w-5 h-5 text-xs',
  lg: 'w-6 h-6 text-sm',
  xl: 'w-7 h-7 text-sm',
};

const baseStyles =
  'rounded-full flex items-center justify-center text-white font-medium flex-shrink-0';

/**
 * Avatar primitive. Use for user/team avatars; pass bg color via className or getAvatarColor().
 * @param {'sm'|'md'|'lg'|'xl'} [size='md']
 */
const Avatar = memo(function Avatar({ size = 'md', className, children, ...props }) {
  return (
    <div className={cn(baseStyles, sizeStyles[size], className)} role="img" {...props}>
      {children}
    </div>
  );
});

Avatar.displayName = 'Avatar';

export default Avatar;
