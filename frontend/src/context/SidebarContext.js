import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

const SIDEBAR_TOGGLE_BREAKPOINT = 768;

export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showSidebarToggle, setShowSidebarToggle] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 640;
      setIsMobile(mobile);
      setShowSidebarToggle(width <= SIDEBAR_TOGGLE_BREAKPOINT);
      if (!mobile) {
        setIsDrawerOpen(false);
        if (width <= SIDEBAR_TOGGLE_BREAKPOINT) {
          setIsCollapsed(true);
        } else {
          setIsCollapsed(false);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsDrawerOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };

  const openSidebar = () => {
    if (isMobile) {
      setIsDrawerOpen(true);
    } else {
      setIsCollapsed(false);
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsDrawerOpen(false);
    } else {
      setIsCollapsed(true);
    }
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        isMobile,
        isDrawerOpen,
        showSidebarToggle,
        toggleSidebar,
        openSidebar,
        closeSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
