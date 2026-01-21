import React from 'react';
import { useTeams } from '../context/TeamsContext';
import { useSidebar } from '../context/SidebarContext';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const { teams, loading } = useTeams();
  const { isCollapsed, isMobile, isDrawerOpen, toggleSidebar, closeSidebar } = useSidebar();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background relative">
      {!isMobile && (
        <Sidebar teams={teams} isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      )}

      {isMobile && (
        <>
          <div
            className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
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

      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  );
};

export default Layout;
