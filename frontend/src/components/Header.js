import React, { memo } from 'react';
import { PanelLeftClose, PanelRightClose } from '../icons';
import { useSidebar } from '../context/SidebarContext';
import Breadcrumb from './Breadcrumb';
import { Button } from './ui';

const Header = memo(function Header({
  fallbackText,
  team,
  issueKey,
  projectName,
  onTeamClick,
  menu,
  actions,
}) {
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
            menu={menu}
          />
        </div>
      </div>

      {actions && (
        <div className="flex flex-shrink-0 items-center gap-1.5">{actions}</div>
      )}
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
