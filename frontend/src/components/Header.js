import React from 'react';
import { PanelLeftClose, PanelRightClose } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import { cn } from '../utils/cn';
import Breadcrumb from './Breadcrumb';
import { Button } from './ui';

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
  const { isCollapsed, isMobile, isDrawerOpen, showSidebarToggle, toggleSidebar } = useSidebar();

  const isOpen = isMobile ? isDrawerOpen : !isCollapsed;

  return (
    <header className="h-14 border-b border-border px-4 md:px-6 flex items-center justify-between gap-2 overflow-visible">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {showSidebarToggle && (
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={toggleSidebar}
            aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelRightClose className="h-5 w-5" />
            )}
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <Breadcrumb
            fallbackText={fallbackText}
            team={team}
            issueKey={issueKey}
            projectName={projectName}
            onTeamClick={onTeamClick}
          />
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-1.5">
        {PrimaryActionIcon && onPrimaryActionClick && (
          <Button variant="secondary" size="sm" onClick={onPrimaryActionClick}>
            <PrimaryActionIcon className="h-3.5 w-3.5" />
            {primaryActionLabel && <span className="hidden sm:inline">{primaryActionLabel}</span>}
          </Button>
        )}
        {PanelOpenerIcon && onPanelOpenerClick && (
          <Button
            key="panel-toggle-button"
            variant="ghost"
            size="sm"
            className={cn('p-2', hidePanelIconOnLarge && 'lg:hidden')}
            onClick={onPanelOpenerClick}
            title={isPanelOpen ? 'Close panel' : 'Open panel'}
            aria-label={isPanelOpen ? 'Close panel' : 'Open panel'}
          >
            {isPanelOpen ? (
              <PanelRightClose className="h-5 w-5 text-text-primary" />
            ) : (
              <PanelOpenerIcon className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
