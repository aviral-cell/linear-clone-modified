import React, { useState, useEffect } from 'react';
import { Filter, ChevronRight, Check, User, FolderKanban } from '../../icons';
import { Button, Avatar } from '../ui';
import DropdownMenu from '../ui/DropdownMenu';
import { issueStatusOptions } from '../../constants/issueStatus';
import { priorityOptions } from '../../constants/priority';
import { cn } from '../../utils/cn';
import { getAvatarColor } from '../../utils';

const FilterDropdown = ({
  filters,
  onToggleFilter,
  users = [],
  projects = [],
  activeFilterCount = 0,
}) => {
  const [open, setOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  useEffect(() => {
    if (!open) {
      setActiveSubmenu(null);
    }
  }, [open]);

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      icon: issueStatusOptions[0].Icon,
      options: issueStatusOptions.map((opt) => ({
        value: opt.value,
        label: opt.label,
        Icon: opt.Icon,
        color: opt.color,
      })),
    },
    {
      key: 'priority',
      label: 'Priority',
      icon: priorityOptions[0].Icon,
      options: priorityOptions.map((opt) => ({
        value: opt.value,
        label: opt.label,
        Icon: opt.Icon,
        color: opt.color,
      })),
    },
    {
      key: 'assignee',
      label: 'Assignee',
      icon: User,
      options: users.map((user) => ({
        value: user._id,
        label: user.name,
        userId: user._id,
      })),
    },
    {
      key: 'project',
      label: 'Project',
      icon: FolderKanban,
      options: projects.map((project) => ({
        value: project._id,
        label: project.name,
      })),
    },
    {
      key: 'creator',
      label: 'Creator',
      icon: User,
      options: users.map((user) => ({
        value: user._id,
        label: user.name,
        userId: user._id,
      })),
    },
  ];

  const handleToggle = (filterKey, value) => {
    onToggleFilter(filterKey, value);
  };

  const isSelected = (filterKey, value) => {
    return filters[filterKey]?.includes(value);
  };

  return (
    <DropdownMenu
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="secondary" size="sm" className="gap-2" onClick={() => setOpen(!open)}>
          <Filter className="h-4 w-4" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-accent text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>
      }
      minWidth="min-w-[200px]"
    >
      <div className="py-1">
        {filterOptions.map((filter) => (
          <div key={filter.key} className="relative">
            <button
              type="button"
              className={cn(
                'w-full px-3 py-2 flex items-center justify-between text-sm text-text-primary',
                activeSubmenu === filter.key
                  ? 'bg-background-tertiary'
                  : 'hover:bg-background-tertiary'
              )}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setActiveSubmenu(activeSubmenu === filter.key ? null : filter.key)}
            >
              <div className="flex items-center gap-2">
                {filter.icon && <filter.icon className="h-4 w-4 text-text-tertiary" />}
                <span>{filter.label}</span>
                {filters[filter.key]?.length > 0 && (
                  <span className="text-xs text-accent">({filters[filter.key].length})</span>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-text-tertiary" />
            </button>

            {activeSubmenu === filter.key && filter.options.length > 0 && (
              <div className="absolute left-full top-0 min-w-[200px] bg-background-secondary border border-border rounded-md shadow-lg py-1 ml-1 z-dropdown max-h-60 overflow-y-auto">
                {filter.options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-background-tertiary text-text-primary"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => handleToggle(filter.key, option.value)}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 border rounded flex items-center justify-center flex-shrink-0',
                        isSelected(filter.key, option.value)
                          ? 'bg-accent border-accent'
                          : 'border-border'
                      )}
                    >
                      {isSelected(filter.key, option.value) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    {option.Icon && <option.Icon className={cn('h-4 w-4', option.color)} />}
                    {option.userId && (
                      <Avatar size="sm" className={getAvatarColor(option.userId)}>
                        {option.label.charAt(0).toUpperCase()}
                      </Avatar>
                    )}
                    <span className="truncate">{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </DropdownMenu>
  );
};

export default FilterDropdown;
