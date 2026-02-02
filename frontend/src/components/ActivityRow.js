import React from 'react';
import { formatDateTime, formatDateShort } from '../utils';
import { ACTIVITY_LAYOUT, ACTIVITY_DATE_FORMAT } from '../constants';
import { ActivityDot } from './ui';

/**
 * Shared activity row component for rendering a single activity
 * Works with both timeline and list layouts
 *
 * @param {Object} props
 * @param {Object} props.item - Normalized activity item
 * @param {'timeline'|'list'} props.layout - Layout variant (timeline or list)
 * @param {'small'|'medium'} [props.size='medium'] - Size variant for list layout
 */
const ActivityRow = ({ item, layout = ACTIVITY_LAYOUT.TIMELINE, size = 'medium' }) => {
  const { user, message, icon, createdAt, dateFormat } = item;

  // Format date based on dateFormat preference
  const formattedDate =
    dateFormat === ACTIVITY_DATE_FORMAT.RELATIVE
      ? formatDateTime(createdAt, { relative: true })
      : formatDateShort(createdAt);

  // Render icon or avatar
  const renderIcon = () => {
    if (icon.type === 'avatar') {
      // Avatar for timeline (assignee changes)
      return (
        <ActivityDot className={icon.avatarColor}>
          <span className="text-xs font-medium text-white">{icon.initial}</span>
        </ActivityDot>
      );
    }

    // Icon component
    const IconComponent = icon.Icon;

    if (layout === ACTIVITY_LAYOUT.TIMELINE) {
      // Timeline: icon inside ActivityDot
      return (
        <ActivityDot>
          <IconComponent className={`w-4 h-4 ${icon.color}`} />
        </ActivityDot>
      );
    }

    // List: icon inline (no ActivityDot)
    const iconSize = size === 'small' ? 'w-3 h-3' : 'w-4 h-4';
    const containerSize = size === 'small' ? 'w-3 h-3' : 'w-4 h-4';

    return (
      <div className={`${containerSize} ${icon.color} flex-shrink-0 mt-0.5`}>
        <IconComponent className={iconSize} />
      </div>
    );
  };

  // Timeline layout: two lines (message + date), with spine
  if (layout === ACTIVITY_LAYOUT.TIMELINE) {
    return (
      <div className="flex items-start gap-3 relative pl-0">
        {renderIcon()}
        <div className="flex-1 pt-0.5 ml-8">
          <p className="text-sm text-text-secondary">
            <span className="text-text-primary font-medium">{user.name}</span> {message}
          </p>
          <p className="text-xs text-text-tertiary mt-0.5">{formattedDate}</p>
        </div>
      </div>
    );
  }

  // List layout: single line (icon + user + message + date)
  const usernameClasses =
    size === 'small' ? 'text-text-primary' : 'text-text-primary font-medium';

  return (
    <div className="flex items-start gap-2">
      {renderIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-secondary">
          <span className={usernameClasses}>{user?.name || 'Unknown'}</span> {message}
          <span className="text-text-tertiary"> · {formattedDate}</span>
        </p>
      </div>
    </div>
  );
};

export default ActivityRow;
