import React, { useState } from 'react';
import { SlidersHorizontal, LayoutPanelLeft, LayoutList, Check } from '../../icons';
import { Button } from '../ui';
import DropdownMenu from '../ui/DropdownMenu';
import { cn } from '../../utils/cn';

const viewOptions = [
  {
    value: 'columns',
    label: 'Board view',
    icon: LayoutPanelLeft,
  },
  {
    value: 'list',
    label: 'List view',
    icon: LayoutList,
  },
];

const DisplayDropdown = ({ viewMode, onViewChange }) => {
  const [open, setOpen] = useState(false);

  const handleViewSelect = (value) => {
    onViewChange(value);
    setOpen(false);
  };

  return (
    <DropdownMenu
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="secondary" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <span>Display</span>
        </Button>
      }
      minWidth="min-w-[180px]"
    >
      <div className="py-1">
        {viewOptions.map((option) => {
          const Icon = option.icon;
          const isActive = viewMode === option.value;

          return (
            <button
              key={option.value}
              type="button"
              className={cn(
                'w-full px-3 py-2 flex items-center justify-between text-sm',
                'hover:bg-background-tertiary',
                isActive ? 'text-accent' : 'text-text-primary'
              )}
              onClick={() => handleViewSelect(option.value)}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{option.label}</span>
              </div>
              {isActive && <Check className="h-4 w-4" />}
            </button>
          );
        })}
      </div>
    </DropdownMenu>
  );
};

export default DisplayDropdown;
