import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAvatarColor } from '../utils';
import { getTeamIconDisplay } from '../utils/teamIcons';
import { Avatar, Button, IconBadge, IconButton } from './ui';
import { Zap, ChevronDown, ChevronRight, List, LogOut, FolderKanban } from '../icons';
import { useSidebar } from '../context/SidebarContext';

const Sidebar = ({ teams, isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const { teamKey, issuesFilter } = useParams();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isMobile, closeSidebar } = useSidebar();

  const isGlobalProjectsPage = location.pathname === '/projects/all';
  const isTeamProjectsPage =
    location.pathname.startsWith('/team/') &&
    location.pathname.endsWith('/projects/all') &&
    !isGlobalProjectsPage;
  const isTeamIssuesPage =
    location.pathname.startsWith('/team/') &&
    !location.pathname.includes('/projects/') &&
    teamKey &&
    issuesFilter;
  const isMyIssuesPage = location.pathname.startsWith('/my-issues');
  const [isTeamsSectionExpanded, setIsTeamsSectionExpanded] = useState(true);
  const [expandedTeams, setExpandedTeams] = useState(() => {
    const initial = {};
    if (teamKey && teams.length > 0) {
      const currentTeam = teams.find((t) => t.key === teamKey);
      if (currentTeam) {
        initial[currentTeam._id] = true;
      }
    }
    return initial;
  });

  useEffect(() => {
    if (teamKey && teams.length > 0) {
      const currentTeam = teams.find((t) => t.key === teamKey);
      if (currentTeam) {
        setExpandedTeams((prev) => {
          if (prev[currentTeam._id]) {
            return prev;
          }
          return {
            ...prev,
            [currentTeam._id]: true,
          };
        });
      }
    }
  }, [teamKey, teams]);

  const toggleTeamsSection = () => {
    if (isCollapsed) {
      return;
    }
    setIsTeamsSectionExpanded((prev) => !prev);
  };

  const toggleTeam = (teamIdToToggle) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamIdToToggle]: !prev[teamIdToToggle],
    }));
  };

  const handleTeamIssuesClick = (team) => {
    navigate(`/team/${team.key}/all`);
    if (isMobile) {
      closeSidebar();
    }
  };

  const handleTeamProjectsClick = (team) => {
    navigate(`/team/${team.key}/projects/all`);
    if (isMobile) {
      closeSidebar();
    }
  };

  const handleProjectsClick = () => {
    navigate('/projects/all');
    if (isMobile) {
      closeSidebar();
    }
  };

  const handleMyIssuesClick = () => {
    navigate('/my-issues/assigned');
    if (isMobile) {
      closeSidebar();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (isMobile) {
      closeSidebar();
    }
  };

  return (
    <nav
      aria-label="Main"
      className={`
      bg-background-secondary border-r border-border flex flex-col h-screen overflow-hidden
      transition-all duration-300
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}
    >
      <div
        className={`h-14 px-4 md:px-6 border-b border-border flex items-center ${isCollapsed ? 'px-4 justify-center' : 'justify-start'}`}
      >
        <div
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5 justify-start'}`}
        >
          <IconBadge size="xl" className="bg-gradient-to-br from-accent to-purple-600">
            <Zap className="w-4 h-4 text-white" />
          </IconBadge>
          {!isCollapsed && (
            <span className="text-lg font-semibold text-text-primary whitespace-nowrap">
              Workflow
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <div className="space-y-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMyIssuesClick}
            className={`w-full py-2 hover:bg-background-hover flex items-center gap-3 text-sm transition-colors ${
              isCollapsed ? 'justify-center px-2' : 'justify-start px-6'
            } ${
              isMyIssuesPage
                ? 'text-text-primary bg-background-tertiary rounded-md'
                : 'text-text-secondary'
            }`}
            title="My Issues"
          >
            <List className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>My Issues</span>}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleProjectsClick}
            className={`w-full py-2 hover:bg-background-hover flex items-center gap-3 text-sm transition-colors ${
              isCollapsed ? 'justify-center px-2' : 'justify-start px-6'
            } ${
              isGlobalProjectsPage
                ? 'text-text-primary bg-background-tertiary rounded-md'
                : 'text-text-secondary'
            }`}
            title="Projects"
          >
            <FolderKanban className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>Projects</span>}
          </Button>
        </div>

        <div className="mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTeamsSection}
            className={`w-full py-2 hover:bg-background-hover flex items-center gap-3 text-text-primary text-sm transition-colors ${
              isCollapsed ? 'justify-center px-2' : 'justify-between px-6'
            }`}
            title="Your teams"
          >
            <span className={`font-medium ${isCollapsed ? 'hidden' : ''}`}>Your Teams</span>
            {!isCollapsed &&
              (isTeamsSectionExpanded ? (
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              ))}
          </Button>
          {isTeamsSectionExpanded && (
            <div className={isCollapsed ? 'ml-0 mt-0.5' : 'ml-2 mt-0.5 space-y-0.5'}>
              {teams.map((team) => {
                const { IconComponent, colorClass, icon } = getTeamIconDisplay(team);

                return (
                  <div key={team._id}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCollapsed) {
                          handleTeamIssuesClick(team);
                        } else {
                          toggleTeam(team._id);
                        }
                      }}
                      className={`w-full py-2 hover:bg-background-hover flex items-center gap-3 text-text-primary text-sm transition-colors ${
                        isCollapsed ? 'justify-center px-2' : 'justify-between px-6'
                      }`}
                      title={team.name}
                    >
                      <div className="flex items-center gap-2.5">
                        <IconBadge size="lg" className={colorClass}>
                          {IconComponent ? (
                            <IconComponent className="w-4 h-4" />
                          ) : (
                            <span className="text-sm">{icon}</span>
                          )}
                        </IconBadge>
                        {!isCollapsed && <span>{team.name}</span>}
                      </div>
                      {!isCollapsed &&
                        (expandedTeams[team._id] ? (
                          <ChevronDown className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        ))}
                    </Button>
                    {expandedTeams[team._id] && !isCollapsed && (
                      <div className="ml-6 mr-2 mt-0.5 space-y-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTeamIssuesClick(team);
                          }}
                          className={`w-full justify-start px-6 py-2 hover:bg-background-hover flex items-center gap-3 text-sm transition-colors ${
                            isTeamIssuesPage && teamKey === team.key
                              ? 'text-text-primary bg-background-tertiary rounded-md'
                              : 'text-text-secondary'
                          }`}
                        >
                          <List className="w-4 h-4 flex-shrink-0" />
                          <span>Issues</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTeamProjectsClick(team);
                          }}
                          className={`w-full justify-start px-6 py-2 hover:bg-background-hover flex items-center gap-3 text-sm transition-colors ${
                            isTeamProjectsPage && teamKey === team.key
                              ? 'text-text-primary bg-background-tertiary rounded-md'
                              : 'text-text-secondary'
                          }`}
                        >
                          <FolderKanban className="w-4 h-4 flex-shrink-0" />
                          <span>Projects</span>
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className={`border-t border-border py-3 ${isCollapsed ? 'px-2' : 'px-4 md:px-6'}`}>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Avatar size="lg" className={user ? getAvatarColor(user._id) : 'bg-purple-600'}>
              {user ? user.name.charAt(0) : 'A'}
            </Avatar>
            <IconButton size="sm" aria-label="Logout" onClick={handleLogout} title="Logout">
              <LogOut className="h-4 w-4" />
            </IconButton>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5 text-sm text-text-primary">
              <Avatar size="lg" className={user ? getAvatarColor(user._id) : 'bg-purple-600'}>
                {user ? user.name.charAt(0) : 'A'}
              </Avatar>
              <span className="truncate text-sm">{user ? user.name : 'User'}</span>
            </div>
            <IconButton size="sm" aria-label="Logout" onClick={handleLogout} title="Logout">
              <LogOut className="h-4 w-4" />
            </IconButton>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;
