import React from 'react';
import { getAvatarColor, getInitials } from '../utils';

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
                <button
                  onClick={() => {
                    setIsExpanded(true);
                    if (onStatusMenuToggle) {
                      onStatusMenuToggle();
                    }
                  }}
                  className={`px-2 py-1 rounded-md border text-xs font-medium flex items-center gap-1 ${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} hover:opacity-80 transition-opacity`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </button>
                {showStatusMenu && statusOptions && (
                  <div className="dropdown-panel dropdown-panel-narrow">
                    {statusOptions.map((option) => {
                      const OptionIcon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            onStatusChange(option.value);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-background-tertiary transition-colors flex items-center gap-2 ${
                            currentStatus === option.value
                              ? 'bg-background-tertiary'
                              : 'text-text-primary'
                          }`}
                        >
                          <OptionIcon className={`w-3 h-3 ${option.color}`} />
                          <span>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
          <textarea
            value={content || ''}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Write a project update..."
            className="w-full bg-transparent text-text-primary focus:outline-none resize-none placeholder-text-tertiary text-sm min-h-[56px]"
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
            <button
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
              className="btn-secondary-header text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
            <button onClick={onPostUpdate} className="btn-primary">
              Post update
            </button>
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
              <div
                className={`avatar avatar-lg flex-shrink-0 ${getAvatarColor(update?.author?._id || '')} text-[10px]`}
              >
                {getInitials(update?.author?.name || 'Unknown')}
              </div>
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
