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
  projectName,
  onTeamClick,
  panelOpenerIcon: PanelOpenerIcon,
  onPanelOpenerClick,
  isPanelOpen,
  hidePanelIconOnLarge = false,
}) => {
  const { isCollapsed, isMobile, isDrawerOpen, toggleSidebar } = useSidebar();

  const isOpen = isMobile ? isDrawerOpen : !isCollapsed;

  return (
    <div className="h-14 border-b border-border px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {(isMobile || isCollapsed) && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
            aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isOpen ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelRightClose className="w-5 h-5" />
            )}
          </button>
        )}
        <Breadcrumb
          fallbackText={fallbackText}
          team={team}
          issueKey={issueKey}
          projectName={projectName}
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
            key="panel-toggle-button"
            onClick={onPanelOpenerClick}
            className={`${hidePanelIconOnLarge ? 'lg:hidden' : ''} p-2 text-text-secondary hover:text-text-primary hover:bg-background-secondary rounded-md transition-colors`}
            title={isPanelOpen ? 'Close panel' : 'Open panel'}
            aria-label={isPanelOpen ? 'Close panel' : 'Open panel'}
          >
            {isPanelOpen ? (
              <PanelRightClose className="w-5 h-5 text-text-primary" />
            ) : (
              <PanelOpenerIcon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
