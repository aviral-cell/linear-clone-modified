import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  User,
  Users,
  CalendarClock,
  CalendarCheck2,
  Minus,
  BarChart2,
  BarChart3,
  BarChart4,
  AlertCircle,
  Clock,
  Circle,
  CircleDot,
  CheckCircle2,
  X,
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/ProjectModal.css';
import { getAvatarColor } from '../utils';
import { getTeamIconDisplay } from '../utils/teamIcons';

const projectStatusOptions = [
  {
    value: 'backlog',
    label: 'Backlog',
    Icon: Clock,
    iconColor: 'text-orange-400',
  },
  {
    value: 'planned',
    label: 'Planned',
    Icon: Circle,
    iconColor: 'text-text-tertiary',
  },
  {
    value: 'in_progress',
    label: 'In Progress',
    Icon: CircleDot,
    iconColor: 'text-yellow-400',
  },
  {
    value: 'completed',
    label: 'Completed',
    Icon: CheckCircle2,
    iconColor: 'text-blue-500',
  },
  {
    value: 'cancelled',
    label: 'Canceled',
    Icon: X,
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

const formatDateWithOrdinal = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = d.getDate();
  const daySuffix =
    day === 1 || day === 21 || day === 31
      ? 'st'
      : day === 2 || day === 22
        ? 'nd'
        : day === 3 || day === 23
          ? 'rd'
          : 'th';
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  return `${month} ${day}${daySuffix}`;
};

const ProjectProperties = ({
  project,
  users = [],
  teams = [],
  onUpdate,
  disabled = false,
  variant = 'horizontal',
  showTeam = true,
  showStartDate = true,
  showTargetDate = true,
  showStatus = true,
  showPriority = true,
  showLead = true,
  showMembers = false,
  selectedMembers = [],
  onMembersChange,
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showLeadMenu, setShowLeadMenu] = useState(false);
  const [showTeamMenu, setShowTeamMenu] = useState(false);
  const [showMembersMenu, setShowMembersMenu] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);

  const statusRef = useRef(null);
  const priorityRef = useRef(null);
  const leadRef = useRef(null);
  const teamRef = useRef(null);
  const membersRef = useRef(null);
  const startDateRef = useRef(null);
  const targetDateRef = useRef(null);
  const statusMenuRef = useRef(null);
  const priorityMenuRef = useRef(null);
  const leadMenuRef = useRef(null);
  const teamMenuRef = useRef(null);
  const membersMenuRef = useRef(null);

  const [statusMenuAlign, setStatusMenuAlign] = useState('left');
  const [priorityMenuAlign, setPriorityMenuAlign] = useState('left');
  const [leadMenuAlign, setLeadMenuAlign] = useState('left');
  const [teamMenuAlign, setTeamMenuAlign] = useState('left');
  const [membersMenuAlign, setMembersMenuAlign] = useState('left');

  const startDate = project?.startDate ? new Date(project.startDate) : null;
  const targetDate = project?.targetDate ? new Date(project.targetDate) : null;

  const handleStartDateChange = async (date) => {
    if (!date) {
      setShowStartDatePicker(false);
      if (onUpdate) await onUpdate({ startDate: '' });
      return;
    }
    setShowStartDatePicker(false);
    if (onUpdate) await onUpdate({ startDate: date.toISOString() });
  };

  const handleTargetDateChange = async (date) => {
    if (!date) {
      setShowTargetDatePicker(false);
      if (onUpdate) await onUpdate({ targetDate: '' });
      return;
    }
    setShowTargetDatePicker(false);
    if (onUpdate) await onUpdate({ targetDate: date.toISOString() });
  };

  const toggleMember = (userId) => {
    if (onMembersChange) {
      const newMembers = selectedMembers.includes(userId)
        ? selectedMembers.filter((id) => id !== userId)
        : [...selectedMembers, userId];
      onMembersChange(newMembers);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setShowStatusMenu(false);
      }
      if (priorityRef.current && !priorityRef.current.contains(event.target)) {
        setShowPriorityMenu(false);
      }
      if (leadRef.current && !leadRef.current.contains(event.target)) {
        setShowLeadMenu(false);
      }
      if (teamRef.current && !teamRef.current.contains(event.target)) {
        setShowTeamMenu(false);
      }
      if (membersRef.current && !membersRef.current.contains(event.target)) {
        setShowMembersMenu(false);
      }
      if (startDateRef.current && !startDateRef.current.contains(event.target)) {
        setShowStartDatePicker(false);
      }
      if (targetDateRef.current && !targetDateRef.current.contains(event.target)) {
        setShowTargetDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentStatus =
    projectStatusOptions.find((o) => o.value === (project?.status || 'backlog')) ||
    projectStatusOptions[0];

  const currentPriority =
    priorityOptions.find((o) => o.value === (project?.priority || 'no_priority')) ||
    priorityOptions[0];

  const isVertical = variant === 'vertical';
  const containerClasses = isVertical
    ? 'flex flex-col space-y-6'
    : 'flex items-center gap-2 flex-wrap';

  const verticalButtonClasses = 'field-trigger field-trigger-full';
  const horizontalButtonClasses = 'field-trigger';

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
    if (showLeadMenu && leadRef.current && leadMenuRef.current) {
      calculateMenuAlignment(leadRef, leadMenuRef, setLeadMenuAlign);
    }
  }, [showLeadMenu]);

  useEffect(() => {
    if (showTeamMenu && teamRef.current && teamMenuRef.current) {
      calculateMenuAlignment(teamRef, teamMenuRef, setTeamMenuAlign);
    }
  }, [showTeamMenu]);

  useEffect(() => {
    if (showMembersMenu && membersRef.current && membersMenuRef.current) {
      calculateMenuAlignment(membersRef, membersMenuRef, setMembersMenuAlign);
    }
  }, [showMembersMenu]);

  useEffect(() => {
    const handleResize = () => {
      if (showStatusMenu) calculateMenuAlignment(statusRef, statusMenuRef, setStatusMenuAlign);
      if (showPriorityMenu)
        calculateMenuAlignment(priorityRef, priorityMenuRef, setPriorityMenuAlign);
      if (showLeadMenu) calculateMenuAlignment(leadRef, leadMenuRef, setLeadMenuAlign);
      if (showTeamMenu) calculateMenuAlignment(teamRef, teamMenuRef, setTeamMenuAlign);
      if (showMembersMenu) calculateMenuAlignment(membersRef, membersMenuRef, setMembersMenuAlign);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showStatusMenu, showPriorityMenu, showLeadMenu, showTeamMenu, showMembersMenu]);

  const getMenuClasses = (isVertical, options = {}) => {
    const { minWidth, align = 'left' } = options;
    const finalMinWidth = minWidth !== undefined ? minWidth : 'min-w-[180px]';
    if (isVertical) {
      return `dropdown-panel ${finalMinWidth}`;
    }
    const alignment = align === 'right' ? 'right-0 left-auto' : 'left-0';
    const maxWidth = 'max-w-[calc(100vw-2rem)]';
    return `dropdown-panel ${alignment} ${finalMinWidth || ''} ${maxWidth}`.trim();
  };

  const getMenuItemClasses = (isCurrent = false) =>
    `w-full text-left text-xs text-text-primary hover:bg-background-tertiary flex items-center gap-2 transition-colors px-3 py-2 ${
      isCurrent ? 'bg-background-tertiary' : ''
    }`;

  const labelClasses = `label ${!isVertical && 'hidden'} ${isVertical ? 'w-20 mr-2 flex-shrink-0' : ''}`;

  const chevronClasses = 'w-3.5 h-3.5 text-text-tertiary';

  const getDateButtonClasses = (hasDate) => {
    const baseClasses = isVertical ? verticalButtonClasses : horizontalButtonClasses;
    if (hasDate) {
      return `${baseClasses} border-accent`;
    }
    return `${baseClasses} text-text-tertiary`;
  };

  const renderLeadContent = () => {
    if (project?.lead) {
      return (
        <>
          <div
            className={`w-4 h-4 rounded-full ${getAvatarColor(project.lead._id)} flex items-center justify-center text-xs text-white`}
          >
            {project.lead.name.charAt(0)}
          </div>
          <span>{project.lead.name}</span>
        </>
      );
    }
    return (
      <>
        <User className="w-4 h-4 text-text-tertiary" />
        <span>{isVertical ? 'Unassigned' : 'Lead'}</span>
      </>
    );
  };

  const renderTeamContent = () => {
    if (project?.team) {
      const { IconComponent, colorClass, icon } = getTeamIconDisplay(project.team);
      return (
        <>
          <div
            className={`w-4 h-4 ${colorClass} rounded-md flex items-center justify-center text-white flex-shrink-0`}
          >
            {IconComponent ? (
              <IconComponent className="w-3 h-3" />
            ) : (
              <span className="text-xs">{icon}</span>
            )}
          </div>
          <span>{project.team.name}</span>
        </>
      );
    }
    return (
      <>
        <Users className="w-4 h-4 text-text-tertiary" />
        <span>{isVertical ? 'Unassigned' : 'Team'}</span>
      </>
    );
  };

  const DatePickerHeader = ({ title, description }) => (
    <div className="px-4 py-2 border-b border-border">
      <h3 className="text-sm font-medium text-text-primary">{title}</h3>
      <p className="text-xs text-text-tertiary mt-0.5">{description}</p>
    </div>
  );

  const handleMenuToggle = (setMenuState, menuState, excludeMenu = null) => {
    const newState = !menuState;
    setMenuState(newState);
    if (!isVertical && newState) {
      if (excludeMenu !== 'status') setShowStatusMenu(false);
      if (excludeMenu !== 'priority') setShowPriorityMenu(false);
      if (excludeMenu !== 'lead') setShowLeadMenu(false);
      if (excludeMenu !== 'team') setShowTeamMenu(false);
      if (excludeMenu !== 'members') setShowMembersMenu(false);
      if (excludeMenu !== 'startDate') setShowStartDatePicker(false);
      if (excludeMenu !== 'targetDate') setShowTargetDatePicker(false);
    }
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
                {projectStatusOptions.map((option) => {
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
              {projectStatusOptions.map((option) => {
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

      {showLead && (
        <div className={isVertical ? 'flex items-center relative' : ''} ref={leadRef}>
          <label className={labelClasses}>Lead</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => handleMenuToggle(setShowLeadMenu, showLeadMenu, 'lead')}
              disabled={disabled}
              className={isVertical ? verticalButtonClasses : horizontalButtonClasses}
            >
              <div className="flex items-center gap-2">{renderLeadContent()}</div>
              <ChevronDown className={chevronClasses} />
            </button>
            {showLeadMenu && !isVertical && (
              <div
                ref={leadMenuRef}
                className={`${getMenuClasses(isVertical, { minWidth: 'min-w-[220px]', align: leadMenuAlign })} max-h-60 overflow-y-auto`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdate) onUpdate({ leadId: null });
                    setShowLeadMenu(false);
                  }}
                  className={`${getMenuItemClasses(!project?.lead)} ${isVertical ? 'flex items-center gap-2' : ''}`}
                >
                  {isVertical && <User className="w-4 h-4 text-text-primary" />}
                  <span>Unassigned</span>
                </button>
                {users.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => {
                      if (onUpdate) onUpdate({ leadId: user._id });
                      setShowLeadMenu(false);
                    }}
                    className={getMenuItemClasses(project?.lead?._id === user._id)}
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
          {showLeadMenu && isVertical && (
            <div
              className={`${getMenuClasses(isVertical, { minWidth: 'min-w-[220px]' })} max-h-60 overflow-y-auto`}
            >
              <button
                type="button"
                onClick={() => {
                  if (onUpdate) onUpdate({ leadId: null });
                  setShowLeadMenu(false);
                }}
                className={`${getMenuItemClasses(!project?.lead)} ${isVertical ? 'flex items-center gap-2' : ''}`}
              >
                {isVertical && <User className="w-4 h-4 text-text-primary" />}
                <span>Unassigned</span>
              </button>
              {users.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => {
                    if (onUpdate) onUpdate({ leadId: user._id });
                    setShowLeadMenu(false);
                  }}
                  className={getMenuItemClasses(project?.lead?._id === user._id)}
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

      {showMembers && (
        <div className={isVertical ? 'flex items-center relative' : ''} ref={membersRef}>
          <label className={labelClasses}>Members</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => handleMenuToggle(setShowMembersMenu, showMembersMenu, 'members')}
              disabled={disabled}
              className={isVertical ? verticalButtonClasses : horizontalButtonClasses}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-text-tertiary" />
                <span>
                  {selectedMembers.length > 0
                    ? `${selectedMembers.length} member${selectedMembers.length > 1 ? 's' : ''}`
                    : isVertical
                      ? 'No members'
                      : 'Members'}
                </span>
              </div>
              <ChevronDown className={chevronClasses} />
            </button>
            {showMembersMenu && !isVertical && (
              <div
                ref={membersMenuRef}
                className={`${getMenuClasses(isVertical, { minWidth: 'min-w-[220px]', align: membersMenuAlign })} max-h-60 overflow-y-auto`}
              >
                {users.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => {
                      toggleMember(user._id);
                    }}
                    className={`${getMenuItemClasses()} ${selectedMembers.includes(user._id) ? 'bg-background-tertiary' : ''}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${
                        selectedMembers.includes(user._id)
                          ? 'border-accent bg-accent/20'
                          : 'border-border bg-background-tertiary'
                      }`}
                    >
                      {selectedMembers.includes(user._id) && (
                        <div className="w-2 h-2 rounded-full bg-accent" />
                      )}
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full ${getAvatarColor(user._id)} flex items-center justify-center text-xs text-white`}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <span>{user.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {showMembersMenu && isVertical && (
            <div
              className={`${getMenuClasses(isVertical, { minWidth: 'min-w-[220px]' })} max-h-60 overflow-y-auto`}
            >
              {users.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => {
                    toggleMember(user._id);
                  }}
                  className={`${getMenuItemClasses()} ${selectedMembers.includes(user._id) ? 'bg-background-tertiary' : ''}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${
                      selectedMembers.includes(user._id)
                        ? 'border-accent bg-accent/20'
                        : 'border-border bg-background-tertiary'
                    }`}
                  >
                    {selectedMembers.includes(user._id) && (
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    )}
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full ${getAvatarColor(user._id)} flex items-center justify-center text-xs text-white`}
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

      {showStartDate && (
        <div className={isVertical ? 'flex items-center relative' : ''} ref={startDateRef}>
          <label className={labelClasses}>Start date</label>
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                handleMenuToggle(setShowStartDatePicker, showStartDatePicker, 'startDate')
              }
              disabled={disabled}
              className={getDateButtonClasses(!!startDate)}
              title={isVertical ? undefined : 'Start date'}
            >
              <div className="flex items-center gap-2">
                <CalendarClock className={`w-4 h-4 ${startDate ? '' : 'text-text-tertiary'}`} />
                {startDate ? (
                  <span>{formatDateWithOrdinal(startDate)}</span>
                ) : isVertical ? (
                  <span className="text-text-tertiary">No start date</span>
                ) : null}
              </div>
            </button>
            {showStartDatePicker && !isVertical && (
              <div className={`${getMenuClasses(isVertical, {})}`}>
                <DatePickerHeader
                  title="Select Start Date"
                  description="Choose when the project begins"
                />
                <DatePicker
                  selected={startDate}
                  onChange={handleStartDateChange}
                  dateFormat="yyyy-MM-dd"
                  inline
                  calendarClassName="react-datepicker-custom"
                />
              </div>
            )}
          </div>
          {showStartDatePicker && isVertical && (
            <div className={`${getMenuClasses(isVertical, { minWidth: 'min-w-[280px]' })}`}>
              <DatePickerHeader
                title="Select Start Date"
                description="Choose when the project begins"
              />
              <DatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                dateFormat="yyyy-MM-dd"
                inline
                calendarClassName="react-datepicker-custom"
              />
            </div>
          )}
        </div>
      )}

      {showTargetDate && (
        <div className={isVertical ? 'flex items-center relative' : ''} ref={targetDateRef}>
          <label className={labelClasses}>Target date</label>
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                handleMenuToggle(setShowTargetDatePicker, showTargetDatePicker, 'targetDate')
              }
              disabled={disabled}
              className={getDateButtonClasses(!!targetDate)}
              title={isVertical ? undefined : 'Target date'}
            >
              <div className="flex items-center gap-2">
                <CalendarCheck2 className={`w-4 h-4 ${targetDate ? '' : 'text-text-tertiary'}`} />
                {targetDate ? (
                  <span>{formatDateWithOrdinal(targetDate)}</span>
                ) : isVertical ? (
                  <span className="text-text-tertiary">No target date</span>
                ) : null}
              </div>
            </button>
            {showTargetDatePicker && !isVertical && (
              <div className={`${getMenuClasses(isVertical, {})}`}>
                <DatePickerHeader
                  title="Select Target Date"
                  description="Choose when the project should be completed"
                />
                <DatePicker
                  selected={targetDate}
                  onChange={handleTargetDateChange}
                  dateFormat="yyyy-MM-dd"
                  inline
                  calendarClassName="react-datepicker-custom"
                />
              </div>
            )}
          </div>
          {showTargetDatePicker && isVertical && (
            <div className={`${getMenuClasses(isVertical, { minWidth: 'min-w-[280px]' })}`}>
              <DatePickerHeader
                title="Select Target Date"
                description="Choose when the project should be completed"
              />
              <DatePicker
                selected={targetDate}
                onChange={handleTargetDateChange}
                dateFormat="yyyy-MM-dd"
                inline
                calendarClassName="react-datepicker-custom"
              />
            </div>
          )}
        </div>
      )}

      {showTeam && (
        <div className={isVertical ? 'flex items-center relative' : ''} ref={teamRef}>
          <label className={labelClasses}>Team</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => handleMenuToggle(setShowTeamMenu, showTeamMenu, 'team')}
              disabled={disabled}
              className={isVertical ? verticalButtonClasses : horizontalButtonClasses}
            >
              <div className="flex items-center gap-2">{renderTeamContent()}</div>
              <ChevronDown className={chevronClasses} />
            </button>
            {showTeamMenu && !isVertical && (
              <div
                ref={teamMenuRef}
                className={`${getMenuClasses(isVertical, { minWidth: 'min-w-[220px]', align: teamMenuAlign })} max-h-60 overflow-y-auto`}
              >
                {teams.map((team) => {
                  const { IconComponent, colorClass, icon } = getTeamIconDisplay(team);
                  return (
                    <button
                      key={team._id}
                      type="button"
                      onClick={() => {
                        if (onUpdate) onUpdate({ teamId: team._id });
                        setShowTeamMenu(false);
                      }}
                      className={getMenuItemClasses(project?.team?._id === team._id)}
                    >
                      <div
                        className={`w-5 h-5 ${colorClass} rounded-md flex items-center justify-center text-white flex-shrink-0`}
                      >
                        {IconComponent ? (
                          <IconComponent className="w-3 h-3" />
                        ) : (
                          <span className="text-xs">{icon}</span>
                        )}
                      </div>
                      <span>{team.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {showTeamMenu && isVertical && (
            <div
              className={`${getMenuClasses(isVertical, { minWidth: 'min-w-[220px]' })} max-h-60 overflow-y-auto`}
            >
              {teams.map((team) => {
                const { IconComponent, colorClass, icon } = getTeamIconDisplay(team);
                return (
                  <button
                    key={team._id}
                    type="button"
                    onClick={() => {
                      if (onUpdate) onUpdate({ teamId: team._id });
                      setShowTeamMenu(false);
                    }}
                    className={getMenuItemClasses(project?.team?._id === team._id)}
                  >
                    <div
                      className={`w-5 h-5 ${colorClass} rounded-md flex items-center justify-center text-white flex-shrink-0`}
                    >
                      {IconComponent ? (
                        <IconComponent className="w-3 h-3" />
                      ) : (
                        <span className="text-xs">{icon}</span>
                      )}
                    </div>
                    <span>{team.name}</span>
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

export default ProjectProperties;
