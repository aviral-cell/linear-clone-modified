import React from 'react';
import { PanelLeftClose, PanelRightClose } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import Breadcrumb from './Breadcrumb';

const Header = ({ fallbackText, primaryActionLabel, PrimaryActionIcon, onPrimaryActionClick }) => {
  const { isCollapsed, isMobile, isDrawerOpen, toggleSidebar } = useSidebar();

  const isOpen = isMobile ? isDrawerOpen : !isCollapsed;

  return (
    <div className="border-b border-border px-4 md:px-6 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
          aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isOpen ? (
            <PanelLeftClose className="w-5 h-5" />
          ) : (
            <PanelRightClose className="w-5 h-5" />
          )}
        </button>
        <Breadcrumb fallbackText={fallbackText} />
      </div>

      {PrimaryActionIcon && onPrimaryActionClick && (
        <div className="flex items-center gap-1.5">
          <button
            onClick={onPrimaryActionClick}
            className="px-2 py-1 rounded-md border border-border text-xs text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors flex items-center gap-1.5"
          >
            <PrimaryActionIcon className="w-3.5 h-3.5" />
            {primaryActionLabel && (
              <span className="hidden sm:inline">{primaryActionLabel}</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;


