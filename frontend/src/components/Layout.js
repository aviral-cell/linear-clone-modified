import React from 'react';
import { useTeams } from '../context/TeamsContext';
import { useSidebar } from '../context/SidebarContext';
import { LoadingScreen } from './ui';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const { teams, loading } = useTeams();
  const { isCollapsed, isMobile, isDrawerOpen, toggleSidebar, closeSidebar } = useSidebar();

  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <div className="h-screen flex bg-background relative">
      {!isMobile && <Sidebar teams={teams} isCollapsed={isCollapsed} onToggle={toggleSidebar} />}

      {isMobile && (
        <>
          <div
            className={`overlay-backdrop ${
              isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={closeSidebar}
          />
          <div
            className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out ${
              isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <Sidebar teams={teams} isCollapsed={false} onToggle={closeSidebar} />
          </div>
        </>
      )}

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">{children}</main>
    </div>
  );
};

export default Layout;
