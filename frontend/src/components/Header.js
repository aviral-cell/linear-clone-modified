import React from 'react';
import { PanelLeftClose, PanelRightClose, PanelRight } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import Breadcrumb from './Breadcrumb';

const Header = ({
  fallbackText,
  primaryActionLabel,
  PrimaryActionIcon,
  onPrimaryActionClick,
  team,
  issueKey,
  onTeamClick,
  panelOpenerIcon: PanelOpenerIcon,
  onPanelOpenerClick,
  isPanelOpen,
}) => {
  const { isCollapsed, isMobile, isDrawerOpen, toggleSidebar } = useSidebar();

  const isOpen = isMobile ? isDrawerOpen : !isCollapsed;

  return (
    <div className="h-14 border-b border-border px-4 md:px-6 flex items-center justify-between">
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
        <Breadcrumb
          fallbackText={fallbackText}
          team={team}
          issueKey={issueKey}
          onTeamClick={onTeamClick}
        />
      </div>

      <div className="flex items-center gap-1.5">
        {PrimaryActionIcon && onPrimaryActionClick && (
          <button
            onClick={onPrimaryActionClick}
            className="px-2 py-1 rounded-md border border-border text-xs text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors flex items-center gap-1.5"
          >
            <PrimaryActionIcon className="w-3.5 h-3.5" />
            {primaryActionLabel && <span className="hidden sm:inline">{primaryActionLabel}</span>}
          </button>
        )}
        {PanelOpenerIcon && onPanelOpenerClick && (
          <button
            onClick={onPanelOpenerClick}
            className="lg:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-background-secondary rounded-md"
            title={isPanelOpen ? 'Close panel' : 'Open panel'}
          >
            <PanelOpenerIcon className={`w-5 h-5 ${isPanelOpen ? 'text-text-primary' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
