import React, { useState } from 'react';
import { ChevronDown, User, Users, CalendarClock, CalendarCheck2 } from '../icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getAvatarColor } from '../utils';
import { getTeamIconDisplay } from '../utils/teamIcons';
import { projectStatusOptions, priorityOptions } from '../constants';
import {
  Avatar,
  Button,
  DropdownMenu,
  DropdownMenuItem,
  FieldTrigger,
  PopoverPortal,
  PropertyField,
} from './ui';
import { cn } from '../utils/cn';

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

  const renderLeadContent = () => {
    if (project?.lead) {
      return (
        <>
          <Avatar size="sm" className={getAvatarColor(project.lead._id)}>
            {project.lead.name.charAt(0)}
          </Avatar>
          <span>{project.lead.name}</span>
        </>
      );
    }
    return (
      <>
        <User className="h-4 w-4 text-text-tertiary" />
        <span>Unassigned</span>
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
        <span>Team</span>
      </>
    );
  };

  const DatePickerHeader = ({ title, description }) => (
    <div className="px-4 py-2 border-b border-border max-w-[280px] min-w-0">
      <h3 className="text-sm font-medium text-text-primary">{title}</h3>
      <p className="text-xs text-text-tertiary mt-0.5">{description}</p>
    </div>
  );

  return (
    <div className={containerClasses}>
      {showStatus && (
        <PropertyField label="Status" variant={variant}>
          <DropdownMenu
            open={showStatusMenu}
            onOpenChange={setShowStatusMenu}
            variant={variant}
            minWidth="min-w-dropdown-md"
            maxHeight="max-h-64"
            trigger={
              <FieldTrigger
                disabled={disabled}
                fullWidth={isVertical}
                className={cn(showStatusMenu && 'border-accent')}
                onClick={() => setShowStatusMenu((v) => !v)}
              >
                <div className="flex items-center gap-2">
                  {currentStatus.Icon && (
                    <currentStatus.Icon className={`h-4 w-4 ${currentStatus.iconColor}`} />
                  )}
                  <span>{currentStatus.label}</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
              </FieldTrigger>
            }
          >
            {projectStatusOptions.map((option) => {
              const OptionIcon = option.Icon;
              const isCurrent = option.value === currentStatus.value;
              return (
                <DropdownMenuItem
                  key={option.value}
                  selected={isCurrent}
                  onClick={() => {
                    if (onUpdate) onUpdate({ status: option.value });
                    setShowStatusMenu(false);
                  }}
                >
                  <OptionIcon className={`h-4 w-4 ${option.color}`} />
                  <span>{option.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenu>
        </PropertyField>
      )}

      {showPriority && (
        <PropertyField label="Priority" variant={variant}>
          <DropdownMenu
            open={showPriorityMenu}
            onOpenChange={setShowPriorityMenu}
            variant={variant}
            minWidth="min-w-dropdown-md"
            trigger={
              <FieldTrigger
                disabled={disabled}
                fullWidth={isVertical}
                className={cn(showPriorityMenu && 'border-accent')}
                onClick={() => setShowPriorityMenu((v) => !v)}
              >
                <div className="flex items-center gap-2">
                  {currentPriority.Icon && (
                    <currentPriority.Icon className={`h-4 w-4 ${currentPriority.color}`} />
                  )}
                  <span>{currentPriority.label}</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
              </FieldTrigger>
            }
          >
            {priorityOptions.map((option) => {
              const OptionIcon = option.Icon;
              const isCurrent = option.value === currentPriority.value;
              return (
                <DropdownMenuItem
                  key={option.value}
                  selected={isCurrent}
                  onClick={() => {
                    if (onUpdate) onUpdate({ priority: option.value });
                    setShowPriorityMenu(false);
                  }}
                >
                  <OptionIcon className={`h-4 w-4 ${option.color}`} />
                  <span>{option.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenu>
        </PropertyField>
      )}

      {showLead && (
        <PropertyField label="Lead" variant={variant}>
          <DropdownMenu
            open={showLeadMenu}
            onOpenChange={setShowLeadMenu}
            variant={variant}
            minWidth="min-w-dropdown-lg"
            maxHeight="max-h-60"
            trigger={
              <FieldTrigger
                disabled={disabled}
                fullWidth={isVertical}
                className={cn(showLeadMenu && 'border-accent')}
                onClick={() => setShowLeadMenu((v) => !v)}
              >
                <div className="flex items-center gap-2">{renderLeadContent()}</div>
                <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
              </FieldTrigger>
            }
          >
            <DropdownMenuItem
              selected={!project?.lead}
              onClick={() => {
                if (onUpdate) onUpdate({ leadId: null });
                setShowLeadMenu(false);
              }}
            >
              <User className="h-4 w-4 text-text-primary" />
              <span>Unassigned</span>
            </DropdownMenuItem>
            {users.map((user) => (
              <DropdownMenuItem
                key={user._id}
                selected={project?.lead?._id === user._id}
                onClick={() => {
                  if (onUpdate) onUpdate({ leadId: user._id });
                  setShowLeadMenu(false);
                }}
              >
                <Avatar size="md" className={getAvatarColor(user._id)}>
                  {user.name.charAt(0)}
                </Avatar>
                <span>{user.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenu>
        </PropertyField>
      )}

      {showMembers && (
        <PropertyField label="Members" variant={variant}>
          <DropdownMenu
            open={showMembersMenu}
            onOpenChange={setShowMembersMenu}
            variant={variant}
            minWidth="min-w-dropdown-lg"
            maxHeight="max-h-60"
            trigger={
              <FieldTrigger
                disabled={disabled}
                fullWidth={isVertical}
                className={cn(showMembersMenu && 'border-accent')}
                onClick={() => setShowMembersMenu((v) => !v)}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-text-tertiary" />
                  <span>
                    {selectedMembers.length > 0
                      ? `${selectedMembers.length} member${selectedMembers.length > 1 ? 's' : ''}`
                      : 'No members'}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
              </FieldTrigger>
            }
          >
            {users.map((user) => (
              <DropdownMenuItem
                key={user._id}
                selected={selectedMembers.includes(user._id)}
                onClick={() => toggleMember(user._id)}
              >
                <div
                  className={cn(
                    'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs',
                    selectedMembers.includes(user._id)
                      ? 'border-accent bg-accent/20'
                      : 'border-border bg-background-tertiary'
                  )}
                >
                  {selectedMembers.includes(user._id) && (
                    <div className="h-2 w-2 rounded-full bg-accent" />
                  )}
                </div>
                <Avatar size="md" className={getAvatarColor(user._id)}>
                  {user.name.charAt(0)}
                </Avatar>
                <span>{user.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenu>
        </PropertyField>
      )}

      {showStartDate && (
        <PropertyField label="Start date" variant={variant}>
          <PopoverPortal
            open={showStartDatePicker}
            onOpenChange={setShowStartDatePicker}
            minWidth="min-w-0"
            trigger={
              <FieldTrigger
                disabled={disabled}
                fullWidth={isVertical}
                className={cn(
                  showStartDatePicker && 'border-accent',
                  !startDate && 'text-text-tertiary'
                )}
                onClick={() => setShowStartDatePicker((v) => !v)}
              >
                <div className="flex items-center gap-2">
                  <CalendarClock className={`h-4 w-4 ${startDate ? '' : 'text-text-tertiary'}`} />
                  <span className={startDate ? '' : 'text-text-tertiary'}>
                    {startDate ? formatDateWithOrdinal(startDate) : 'No start date'}
                  </span>
                </div>
              </FieldTrigger>
            }
          >
            <div className="w-fit">
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
              {startDate && (
                <div className="px-3 pb-2">
                  <Button variant="secondary" size="xs" onClick={() => handleStartDateChange(null)}>
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </PopoverPortal>
        </PropertyField>
      )}

      {showTargetDate && (
        <PropertyField label="Target date" variant={variant}>
          <PopoverPortal
            open={showTargetDatePicker}
            onOpenChange={setShowTargetDatePicker}
            minWidth="min-w-0"
            trigger={
              <FieldTrigger
                disabled={disabled}
                fullWidth={isVertical}
                className={cn(
                  showTargetDatePicker && 'border-accent',
                  !targetDate && 'text-text-tertiary'
                )}
                onClick={() => setShowTargetDatePicker((v) => !v)}
              >
                <div className="flex items-center gap-2">
                  <CalendarCheck2 className={`h-4 w-4 ${targetDate ? '' : 'text-text-tertiary'}`} />
                  <span className={targetDate ? '' : 'text-text-tertiary'}>
                    {targetDate ? formatDateWithOrdinal(targetDate) : 'No target date'}
                  </span>
                </div>
              </FieldTrigger>
            }
          >
            <div className="w-fit">
              <DatePickerHeader
                title="Select Target Date"
                description="Choose when the project ends"
              />
              <DatePicker
                selected={targetDate}
                onChange={handleTargetDateChange}
                dateFormat="yyyy-MM-dd"
                inline
                calendarClassName="react-datepicker-custom"
              />
              {targetDate && (
                <div className="px-3 pb-2">
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => handleTargetDateChange(null)}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </PopoverPortal>
        </PropertyField>
      )}

      {showTeam && (
        <PropertyField label="Team" variant={variant}>
          <DropdownMenu
            open={showTeamMenu}
            onOpenChange={setShowTeamMenu}
            variant={variant}
            minWidth="min-w-dropdown-lg"
            maxHeight="max-h-60"
            trigger={
              <FieldTrigger
                disabled={disabled}
                fullWidth={isVertical}
                className={cn(showTeamMenu && 'border-accent')}
                onClick={() => setShowTeamMenu((v) => !v)}
              >
                <div className="flex items-center gap-2">{renderTeamContent()}</div>
                <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
              </FieldTrigger>
            }
          >
            {teams.map((team) => {
              const { IconComponent, colorClass, icon } = getTeamIconDisplay(team);
              const isCurrent = project?.team?._id === team._id;
              return (
                <DropdownMenuItem
                  key={team._id}
                  selected={isCurrent}
                  onClick={() => {
                    if (onUpdate) onUpdate({ teamId: team._id });
                    setShowTeamMenu(false);
                  }}
                >
                  <div
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md text-white ${colorClass}`}
                  >
                    {IconComponent ? (
                      <IconComponent className="h-3 w-3" />
                    ) : (
                      <span className="text-xs">{icon}</span>
                    )}
                  </div>
                  <span>{team.name}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenu>
        </PropertyField>
      )}
    </div>
  );
};

export default ProjectProperties;
