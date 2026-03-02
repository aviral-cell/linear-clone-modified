import React from 'react';
import { cn } from '../../utils/cn';

const getStatusColor = (statusCode) => {
  if (statusCode >= 200 && statusCode < 300) return 'success';
  if (statusCode >= 300 && statusCode < 400) return 'info';
  if (statusCode >= 400 && statusCode < 500) return 'warning';
  if (statusCode >= 500) return 'error';
  return 'default';
};

const colorClasses = {
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  warning: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  default: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const StatusBadge = ({ statusCode, className }) => {
  const colorType = getStatusColor(statusCode);

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        colorClasses[colorType],
        className
      )}
    >
      {statusCode}
    </span>
  );
};

const methodColors = {
  GET: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  POST: 'bg-green-500/20 text-green-400 border-green-500/30',
  PUT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PATCH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
  OPTIONS: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  HEAD: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export const MethodBadge = ({ method, className }) => {
  const colorClass = methodColors[method] || methodColors.GET;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        colorClass,
        className
      )}
    >
      {method}
    </span>
  );
};

export default StatusBadge;
