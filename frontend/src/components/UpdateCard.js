import React from 'react';
import { getAvatarColor, getInitials } from '../utils';
import { Avatar, Button, DropdownMenu, DropdownMenuItem, FieldTrigger, Textarea } from './ui';

const UpdateCard = ({
  update,
  statusConfig,
  StatusIcon,
  formatDate,
  isEditable = false,
  autoFocus = false,
  onStatusChange,
  onContentChange,
  content,
  statusMenuRef,
  showStatusMenu,
  onStatusMenuToggle,
  statusOptions,
  currentStatus,
  onPostUpdate,
  showPostButton = false,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const textareaRef = React.useRef(null);
  const initialStatusRef = React.useRef(currentStatus);

  React.useEffect(() => {
    if (isEditable && autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditable, autoFocus]);

  React.useEffect(() => {
    if (isEditable && !isExpanded) {
      initialStatusRef.current = currentStatus;
    }
  }, [isEditable, isExpanded, currentStatus]);

  return (
    <div className="bg-background-secondary border border-border rounded-md p-4">
      {isEditable ? (
        <>
          <div className="flex items-start gap-3 mb-3 relative" ref={statusMenuRef}>
            {statusConfig && StatusIcon && (
              <>
                <DropdownMenu
                  open={showStatusMenu}
                  onOpenChange={(open) => {
                    if (open !== showStatusMenu && onStatusMenuToggle) {
                      onStatusMenuToggle();
                    }
                  }}
                  minWidth="min-w-dropdown-sm"
                  trigger={
                    <FieldTrigger
                      className={`px-2 py-1 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor}`}
                      onClick={() => {
                        setIsExpanded(true);
                        if (onStatusMenuToggle) {
                          onStatusMenuToggle();
                        }
                      }}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </FieldTrigger>
                  }
                >
                  {statusOptions?.map((option) => {
                    const OptionIcon = option.icon;
                    return (
                      <DropdownMenuItem
                        key={option.value}
                        selected={currentStatus === option.value}
                        className="flex items-center gap-2 text-xs"
                        onClick={() => {
                          onStatusChange(option.value);
                          if (onStatusMenuToggle) {
                            onStatusMenuToggle();
                          }
                        }}
                      >
                        <OptionIcon className={`w-3 h-3 ${option.color}`} />
                        <span>{option.label}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenu>
              </>
            )}
          </div>
          <Textarea
            size="sm"
            minHeight="card"
            value={content || ''}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Write a project update..."
            ref={textareaRef}
            onFocus={() => setIsExpanded(true)}
            onClick={() => setIsExpanded(true)}
            rows={4}
          />
          <div
            className={`flex justify-end gap-2 mt-3 overflow-hidden transition-all duration-200 ease-out ${
              showPostButton && isExpanded
                ? 'max-h-10 opacity-100 translate-y-0'
                : 'max-h-0 opacity-0 -translate-y-1 pointer-events-none'
            }`}
          >
            <Button
              variant="secondary"
              size="md"
              className="text-text-secondary hover:text-text-primary"
              onClick={() => {
                if (onContentChange) {
                  onContentChange('');
                }
                if (onStatusChange && initialStatusRef.current !== currentStatus) {
                  onStatusChange(initialStatusRef.current);
                }
                if (textareaRef.current) {
                  textareaRef.current.blur();
                }
                setIsExpanded(false);
                if (showStatusMenu && onStatusMenuToggle) {
                  onStatusMenuToggle();
                }
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={onPostUpdate}>
              Post update
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 mb-3">
            {statusConfig && StatusIcon && (
              <div
                className={`px-2 py-1 rounded-md border text-xs font-medium inline-flex items-center gap-1 w-fit ${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor}`}
              >
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </div>
            )}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar
                size="lg"
                className={`flex-shrink-0 ${getAvatarColor(update?.author?._id || '')}`}
              >
                {getInitials(update?.author?.name || 'Unknown')}
              </Avatar>
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <span className="text-xs text-text-primary truncate">
                  {update?.author?.name || 'Unknown'}
                </span>
                <span className="text-xs text-text-tertiary flex-shrink-0">
                  {formatDate
                    ? formatDate(update?.createdAt)
                    : new Date(update?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm text-text-primary whitespace-pre-wrap break-words">
            {update?.content}
          </p>
        </>
      )}
    </div>
  );
};

export default UpdateCard;
