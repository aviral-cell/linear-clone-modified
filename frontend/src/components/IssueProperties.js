import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  User,
  Circle,
  CircleDashed,
  CircleDot,
  CheckCircle2,
  XCircle,
  Minus,
  BarChart2,
  BarChart3,
  BarChart4,
  AlertCircle,
  FolderKanban,
} from 'lucide-react';
import { getAvatarColor } from '../utils';

const statusOptions = [
  {
    value: 'backlog',
    label: 'Backlog',
    Icon: CircleDashed,
    iconColor: 'text-text-tertiary',
  },
  {
    value: 'todo',
    label: 'Todo',
    Icon: Circle,
    iconColor: 'text-text-secondary',
  },
  {
    value: 'in_progress',
    label: 'In Progress',
    Icon: CircleDot,
    iconColor: 'text-yellow-500',
  },
  {
    value: 'in_review',
    label: 'In Review',
    Icon: CircleDot,
    iconColor: 'text-green-500',
  },
  {
    value: 'done',
    label: 'Done',
    Icon: CheckCircle2,
    iconColor: 'text-accent',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    Icon: XCircle,
    iconColor: 'text-text-tertiary',
  },
  {
    value: 'duplicate',
    label: 'Duplicate',
    Icon: XCircle,
    iconColor: 'text-text-tertiary',
  },
];

const priorityOptions = [
  { value: 'no_priority', label: 'No priority', Icon: Minus, color: 'text-text-tertiary' },
  { value: 'urgent', label: 'Urgent', Icon: AlertCircle, color: 'text-red-500' },
  { value: 'high', label: 'High', Icon: BarChart4, color: 'text-orange-500' },
  { value: 'medium', label: 'Medium', Icon: BarChart3, color: 'text-yellow-500' },
  { value: 'low', label: 'Low', Icon: BarChart2, color: 'text-text-tertiary' },
];

const IssueProperties = ({
  issue,
  users = [],
  projects = [],
  onUpdate,
  disabled = false,
  variant = 'horizontal',
  showStatus = true,
  showPriority = true,
  showAssignee = true,
  showProject = true,
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  const statusRef = useRef(null);
  const priorityRef = useRef(null);
  const assigneeRef = useRef(null);
  const projectRef = useRef(null);
  const statusMenuRef = useRef(null);
  const priorityMenuRef = useRef(null);
  const assigneeMenuRef = useRef(null);
  const projectMenuRef = useRef(null);

  const [statusMenuAlign, setStatusMenuAlign] = useState('left');
  const [priorityMenuAlign, setPriorityMenuAlign] = useState('left');
  const [assigneeMenuAlign, setAssigneeMenuAlign] = useState('left');
  const [projectMenuAlign, setProjectMenuAlign] = useState('left');

  const isVertical = variant === 'vertical';
  const containerClasses = isVertical
    ? 'flex flex-col space-y-6'
    : 'flex items-center gap-2 flex-wrap';

  const verticalButtonClasses =
    'w-full px-3 py-1 bg-background border border-border rounded-md text-xs text-text-primary hover:bg-background-secondary transition-colors flex items-center gap-2 disabled:opacity-50';
  const horizontalButtonClasses =
    'px-3 py-1 bg-background border border-border rounded-md text-xs text-text-primary hover:bg-background-secondary transition-colors flex items-center gap-2 disabled:opacity-50';

  const calculateMenuAlignment = (buttonRef, menuRef, setAlign) => {
    if (!buttonRef.current || !menuRef.current || isVertical) {
      return;
    }

    requestAnimationFrame(() => {
      if (!buttonRef.current || !menuRef.current) return;

      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const padding = 16;

      const spaceOnRight = viewportWidth - buttonRect.right;
      const spaceOnLeft = buttonRect.left;
      const menuWidth = menuRect.width || 180;

      if (spaceOnRight < menuWidth + padding && spaceOnLeft > spaceOnRight) {
        setAlign('right');
      } else {
        setAlign('left');
      }
    });
  };

  useEffect(() => {
    if (showStatusMenu && statusRef.current && statusMenuRef.current) {
      calculateMenuAlignment(statusRef, statusMenuRef, setStatusMenuAlign);
    }
  }, [showStatusMenu]);

  useEffect(() => {
    if (showPriorityMenu && priorityRef.current && priorityMenuRef.current) {
      calculateMenuAlignment(priorityRef, priorityMenuRef, setPriorityMenuAlign);
    }
  }, [showPriorityMenu]);

  useEffect(() => {
    if (showAssigneeMenu && assigneeRef.current && assigneeMenuRef.current) {
      calculateMenuAlignment(assigneeRef, assigneeMenuRef, setAssigneeMenuAlign);
    }
  }, [showAssigneeMenu]);

  useEffect(() => {
    if (showProjectMenu && projectRef.current && projectMenuRef.current) {
      calculateMenuAlignment(projectRef, projectMenuRef, setProjectMenuAlign);
    }
  }, [showProjectMenu]);

  useEffect(() => {
    const handleResize = () => {
      if (showStatusMenu) calculateMenuAlignment(statusRef, statusMenuRef, setStatusMenuAlign);
      if (showPriorityMenu)
        calculateMenuAlignment(priorityRef, priorityMenuRef, setPriorityMenuAlign);
      if (showAssigneeMenu)
        calculateMenuAlignment(assigneeRef, assigneeMenuRef, setAssigneeMenuAlign);
      if (showProjectMenu) calculateMenuAlignment(projectRef, projectMenuRef, setProjectMenuAlign);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showStatusMenu, showPriorityMenu, showAssigneeMenu, showProjectMenu]);

  const getMenuClasses = (isVertical, options = {}) => {
    const { minWidth, align = 'left' } = options;
    const baseClasses =
      'absolute z-[9999] mt-1 bg-background-secondary border border-border shadow-xl';
    if (isVertical) {
      const finalMinWidth = minWidth !== undefined ? minWidth : 'min-w-[180px]';
      return `${baseClasses} top-full left-0 rounded-md shadow-lg ${finalMinWidth}`;
    }
    const alignment = align === 'right' ? 'right-0' : 'left-0';
    const finalMinWidth = minWidth !== undefined ? minWidth : 'min-w-[180px]';
    const maxWidth = 'max-w-[calc(100vw-2rem)]';
    return `${baseClasses} top-full ${alignment} rounded-md shadow-lg ${finalMinWidth || ''} ${maxWidth}`.trim();
  };

  const getMenuItemClasses = (isCurrent = false) =>
    `w-full text-left text-xs text-text-primary hover:bg-background-tertiary flex items-center gap-2 transition-colors px-3 py-2 ${
      isCurrent ? 'bg-background-tertiary' : ''
    }`;

  const labelClasses = `text-xs font-medium text-text-tertiary tracking-wide ${!isVertical && 'hidden'} ${isVertical ? 'w-20 mr-2 flex-shrink-0' : 'block mb-2'}`;

  const chevronClasses = 'w-3.5 h-3.5 text-text-tertiary';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setShowStatusMenu(false);
      }
      if (priorityRef.current && !priorityRef.current.contains(event.target)) {
        setShowPriorityMenu(false);
      }
      if (assigneeRef.current && !assigneeRef.current.contains(event.target)) {
        setShowAssigneeMenu(false);
      }
      if (projectRef.current && !projectRef.current.contains(event.target)) {
        setShowProjectMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentStatus =
    statusOptions.find((o) => o.value === (issue?.status || 'todo')) || statusOptions[1];

  const currentPriority =
    priorityOptions.find((o) => o.value === (issue?.priority || 'no_priority')) ||
    priorityOptions[0];

  const handleMenuToggle = (setMenuState, menuState, excludeMenu = null) => {
    const newState = !menuState;
    setMenuState(newState);
    if (!isVertical && newState) {
      if (excludeMenu !== 'status') setShowStatusMenu(false);
      if (excludeMenu !== 'priority') setShowPriorityMenu(false);
      if (excludeMenu !== 'assignee') setShowAssigneeMenu(false);
      if (excludeMenu !== 'project') setShowProjectMenu(false);
    }
  };

  const renderAssigneeContent = () => {
    if (issue?.assignee) {
      return (
        <>
          <div
            className={`w-4 h-4 rounded-full ${getAvatarColor(issue.assignee._id)} flex items-center justify-center text-xs text-white`}
          >
            {issue.assignee.name.charAt(0)}
          </div>
          <span>{issue.assignee.name}</span>
        </>
      );
    }
    return (
      <>
        <User className="w-4 h-4 text-text-tertiary" />
        <span>{isVertical ? 'Unassigned' : 'Assignee'}</span>
      </>
    );
  };

  const renderProjectContent = () => {
    if (issue?.project) {
      return (
        <>
          <div className="w-4 h-4 rounded-md bg-background-secondary border border-border flex items-center justify-center text-text-secondary flex-shrink-0">
            {issue.project.icon ? (
              <span className="text-xs">{issue.project.icon}</span>
            ) : (
              <FolderKanban className="w-3 h-3" />
            )}
          </div>
          <span>{issue.project.name}</span>
        </>
      );
    }
    return (
      <>
        <FolderKanban className="w-4 h-4 text-text-tertiary" />
        <span>{isVertical ? 'No project' : 'Project'}</span>
      </>
    );
  };

  return (
    <div className={containerClasses}>
      {showStatus && (
        <div className={isVertical ? 'flex items-center relative' : ''} ref={statusRef}>
          <label className={labelClasses}>Status</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => handleMenuToggle(setShowStatusMenu, showStatusMenu, 'status')}
              disabled={disabled}
              className={isVertical ? verticalButtonClasses : horizontalButtonClasses}
            >
              <div className="flex items-center gap-2">
                {currentStatus.Icon && (
                  <currentStatus.Icon className={`w-4 h-4 ${currentStatus.iconColor}`} />
                )}
                <span>{currentStatus.label}</span>
              </div>
              <ChevronDown className={chevronClasses} />
            </button>
            {showStatusMenu && !isVertical && (
              <div
                ref={statusMenuRef}
                className={`${getMenuClasses(isVertical, { minWidth: 'min-w-[180px]', align: statusMenuAlign })} max-h-64 overflow-y-auto`}
              >
                {statusOptions.map((option) => {
                  const OptionIcon = option.Icon;
                  const isCurrent = option.value === currentStatus.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        if (onUpdate) onUpdate({ status: option.value });
                        setShowStatusMenu(false);
                      }}
                      className={getMenuItemClasses(isCurrent)}
                    >
                      <OptionIcon className={`w-4 h-4 ${option.iconColor}`} />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {showStatusMenu && isVertical && (
            <div
              className={`${getMenuClasses(isVertical, { minWidth: 'min-w-[180px]' })} max-h-64 overflow-y-auto`}
            >
              {statusOptions.map((option) => {
                const OptionIcon = option.Icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      if (onUpdate) onUpdate({ status: option.value });
                      setShowStatusMenu(false);
                    }}
                    className={getMenuItemClasses()}
                  >
                    <OptionIcon className={`w-4 h-4 ${option.iconColor}`} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showPriority && (
        <div className={isVertical ? 'flex items-center relative' : ''} ref={priorityRef}>
          <label className={labelClasses}>Priority</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => handleMenuToggle(setShowPriorityMenu, showPriorityMenu, 'priority')}
              disabled={disabled}
              className={isVertical ? verticalButtonClasses : horizontalButtonClasses}
            >
              <div className="flex items-center gap-2">
                {currentPriority.Icon && (
                  <currentPriority.Icon className={`w-4 h-4 ${currentPriority.color}`} />
                )}
                <span>{currentPriority.label}</span>
              </div>
              <ChevronDown className={chevronClasses} />
            </button>
            {showPriorityMenu && !isVertical && (
              <div
                ref={priorityMenuRef}
                className={`${getMenuClasses(isVertical, { minWidth: 'min-w-[180px]', align: priorityMenuAlign })}`}
              >
                {priorityOptions.map((option) => {
                  const OptionIcon = option.Icon;
                  const isCurrent = option.value === currentPriority.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        if (onUpdate) onUpdate({ priority: option.value });
                        setShowPriorityMenu(false);
                      }}
                      className={getMenuItemClasses(isCurrent)}
                    >
                      <OptionIcon className={`w-4 h-4 ${option.color}`} />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {showPriorityMenu && isVertical && (
            <div className={`${getMenuClasses(isVertical, { minWidth: 'min-w-[180px]' })}`}>
              {priorityOptions.map((option) => {
                const OptionIcon = option.Icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      if (onUpdate) onUpdate({ priority: option.value });
                      setShowPriorityMenu(false);
                    }}
                    className={getMenuItemClasses()}
                  >
                    <OptionIcon className={`w-4 h-4 ${option.color}`} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showAssignee && (
        <div className={isVertical ? 'flex items-center relative' : ''} ref={assigneeRef}>
          <label className={labelClasses}>Assignee</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => handleMenuToggle(setShowAssigneeMenu, showAssigneeMenu, 'assignee')}
              disabled={disabled}
              className={isVertical ? verticalButtonClasses : horizontalButtonClasses}
            >
              <div className="flex items-center gap-2">{renderAssigneeContent()}</div>
              <ChevronDown className={chevronClasses} />
            </button>
            {showAssigneeMenu && !isVertical && (
              <div
                ref={assigneeMenuRef}
                className={`${getMenuClasses(isVertical, { minWidth: 'min-w-[220px]', align: assigneeMenuAlign })} max-h-60 overflow-y-auto`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdate) onUpdate({ assignee: null });
                    setShowAssigneeMenu(false);
                  }}
                  className={`${getMenuItemClasses(!issue?.assignee)} ${isVertical ? 'flex items-center gap-2' : ''}`}
                >
                  {isVertical && <User className="w-4 h-4 text-text-primary" />}
                  <span>Unassigned</span>
                </button>
                {users.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => {
                      if (onUpdate) onUpdate({ assignee: user._id });
                      setShowAssigneeMenu(false);
                    }}
                    className={getMenuItemClasses(issue?.assignee?._id === user._id)}
                  >
                    <div
                      className={`w-5 h-5 ${isVertical ? 'font-medium' : ''} rounded-full ${getAvatarColor(user._id)} flex items-center justify-center text-xs text-white`}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <span>{user.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {showAssigneeMenu && isVertical && (
            <div
              className={`${getMenuClasses(isVertical, { minWidth: 'min-w-[220px]' })} max-h-60 overflow-y-auto`}
            >
              <button
                type="button"
                onClick={() => {
                  if (onUpdate) onUpdate({ assignee: null });
                  setShowAssigneeMenu(false);
                }}
                className={`${getMenuItemClasses(!issue?.assignee)} ${isVertical ? 'flex items-center gap-2' : ''}`}
              >
                {isVertical && <User className="w-4 h-4 text-text-primary" />}
                <span>Unassigned</span>
              </button>
              {users.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => {
                    if (onUpdate) onUpdate({ assignee: user._id });
                    setShowAssigneeMenu(false);
                  }}
                  className={getMenuItemClasses(issue?.assignee?._id === user._id)}
                >
                  <div
                    className={`w-5 h-5 ${isVertical ? 'font-medium' : ''} rounded-full ${getAvatarColor(user._id)} flex items-center justify-center text-xs text-white`}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <span>{user.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {showProject && (
        <div className={isVertical ? 'flex items-center relative' : ''} ref={projectRef}>
          <label className={labelClasses}>Project</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => handleMenuToggle(setShowProjectMenu, showProjectMenu, 'project')}
              disabled={disabled}
              className={isVertical ? verticalButtonClasses : horizontalButtonClasses}
            >
              <div className="flex items-center gap-2">{renderProjectContent()}</div>
              <ChevronDown className={chevronClasses} />
            </button>
            {showProjectMenu && !isVertical && (
              <div
                ref={projectMenuRef}
                className={`${getMenuClasses(isVertical, { minWidth: 'min-w-[220px]', align: projectMenuAlign })} max-h-60 overflow-y-auto`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdate) onUpdate({ projectId: null });
                    setShowProjectMenu(false);
                  }}
                  className={`${getMenuItemClasses(!issue?.project)} ${isVertical ? 'flex items-center gap-2' : ''}`}
                >
                  {isVertical && <FolderKanban className="w-4 h-4 text-text-primary" />}
                  <span>No project</span>
                </button>
                {projects.map((project) => {
                  return (
                    <button
                      key={project._id}
                      type="button"
                      onClick={() => {
                        if (onUpdate) onUpdate({ projectId: project._id });
                        setShowProjectMenu(false);
                      }}
                      className={getMenuItemClasses(issue?.project?._id === project._id)}
                    >
                      <div className="w-5 h-5 rounded-md bg-background-secondary border border-border flex items-center justify-center text-text-secondary flex-shrink-0">
                        {project.icon ? (
                          <span className="text-xs">{project.icon}</span>
                        ) : (
                          <FolderKanban className="w-3 h-3" />
                        )}
                      </div>
                      <span>{project.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {showProjectMenu && isVertical && (
            <div
              className={`${getMenuClasses(isVertical, { minWidth: 'min-w-[220px]' })} max-h-60 overflow-y-auto`}
            >
              <button
                type="button"
                onClick={() => {
                  if (onUpdate) onUpdate({ projectId: null });
                  setShowProjectMenu(false);
                }}
                className={`${getMenuItemClasses(!issue?.project)} ${isVertical ? 'flex items-center gap-2' : ''}`}
              >
                {isVertical && <FolderKanban className="w-4 h-4 text-text-primary" />}
                <span>No project</span>
              </button>
              {projects.map((project) => {
                return (
                  <button
                    key={project._id}
                    type="button"
                    onClick={() => {
                      if (onUpdate) onUpdate({ projectId: project._id });
                      setShowProjectMenu(false);
                    }}
                    className={getMenuItemClasses(issue?.project?._id === project._id)}
                  >
                    <div className="w-5 h-5 rounded-md bg-background-secondary border border-border flex items-center justify-center text-text-secondary flex-shrink-0">
                      {project.icon ? (
                        <span className="text-xs">{project.icon}</span>
                      ) : (
                        <FolderKanban className="w-3 h-3" />
                      )}
                    </div>
                    <span>{project.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IssueProperties;
