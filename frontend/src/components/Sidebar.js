import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAvatarColor } from '../utils';
import { getTeamIconDisplay } from '../utils/teamIcons';
import { Inbox, Zap, ChevronDown, ChevronRight, List, LogOut, FolderKanban } from 'lucide-react';

const Sidebar = ({ teams, isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const { teamKey, issuesFilter } = useParams();
  const location = useLocation();
  const { user, logout } = useAuth();

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
  const [expandedSections, setExpandedSections] = useState({
    teams: !!teamKey,
  });
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

  // Auto-expand the current team when route changes
  useEffect(() => {
    if (teamKey && teams.length > 0) {
      const currentTeam = teams.find((t) => t.key === teamKey);
      if (currentTeam) {
        setExpandedTeams((prev) => {
          // Only update if not already expanded to avoid unnecessary re-renders
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

  // Ensure teams section is open when navigating directly to a team URL
  useEffect(() => {
    if (teamKey) {
      setExpandedSections((prev) => ({
        ...prev,
        teams: true,
      }));
    }
  }, [teamKey]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleTeam = (teamIdToToggle) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamIdToToggle]: !prev[teamIdToToggle],
    }));
  };

  const handleTeamIssuesClick = (team) => {
    navigate(`/team/${team.key}/all`);
  };

  const handleTeamProjectsClick = (team) => {
    navigate(`/team/${team.key}/projects/all`);
  };

  const handleProjectsClick = () => {
    navigate('/projects/all');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className={`
      bg-background-secondary border-r border-border flex flex-col h-screen
      transition-all duration-300
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}
    >
      <div className="px-4 md:px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-semibold text-text-primary whitespace-nowrap">
              Workflow
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <button
          onClick={(e) => e.preventDefault()}
          className="w-full px-6 py-2 hover:bg-background-hover flex items-center gap-3 text-text-secondary text-sm transition-colors cursor-not-allowed opacity-60"
          title="Inbox (Coming soon)"
          disabled
        >
          <Inbox className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Inbox</span>}
        </button>

        <button
          onClick={(e) => e.preventDefault()}
          className="w-full px-6 py-2 hover:bg-background-hover flex items-center gap-3 text-text-secondary text-sm transition-colors cursor-not-allowed opacity-60"
          title="My Issues (Coming soon)"
          disabled
        >
          <List className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>My Issues</span>}
        </button>

        <button
          onClick={handleProjectsClick}
          className={`w-full px-6 py-2 hover:bg-background-hover flex items-center gap-3 text-sm transition-colors ${
            isGlobalProjectsPage
              ? 'text-text-primary bg-background-tertiary rounded-md'
              : 'text-text-secondary'
          }`}
          title="Projects"
        >
          <FolderKanban className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Projects</span>}
        </button>

        <div className="mt-4">
          <button
            onClick={() => !isCollapsed && toggleSection('teams')}
            className="w-full px-6 py-2 hover:bg-background-hover flex items-center justify-between text-text-primary text-sm group transition-colors"
            title="Your teams"
          >
            <span className={`font-medium ${isCollapsed ? 'hidden' : ''}`}>Your Teams</span>
            {!isCollapsed &&
              (expandedSections.teams ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              ))}
          </button>
          {expandedSections.teams && (
            <div className={isCollapsed ? 'ml-0' : 'ml-2'}>
              {teams.map((team) => {
                const { IconComponent, colorClass, icon } = getTeamIconDisplay(team);

                return (
                  <div key={team._id}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCollapsed) {
                          handleTeamIssuesClick(team);
                        } else {
                          toggleTeam(team._id);
                        }
                      }}
                      className="w-full px-6 py-2 hover:bg-background-hover flex items-center justify-between text-text-primary text-sm group transition-colors"
                      title={team.name}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 ${colorClass} rounded-md flex items-center justify-center text-white flex-shrink-0`}
                        >
                          {IconComponent ? (
                            <IconComponent className="w-4 h-4" />
                          ) : (
                            <span className="text-sm">{icon}</span>
                          )}
                        </div>
                        {!isCollapsed && <span>{team.name}</span>}
                      </div>
                      {!isCollapsed &&
                        (expandedTeams[team._id] ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        ))}
                    </button>
                    {expandedTeams[team._id] && !isCollapsed && (
                      <div className="ml-6 mr-2 mt-1 space-y-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTeamIssuesClick(team);
                          }}
                          className={`w-full px-6 py-2 hover:bg-background-hover flex items-center gap-3 text-sm transition-colors ${
                            isTeamIssuesPage && teamKey === team.key
                              ? 'text-text-primary bg-background-tertiary rounded-md'
                              : 'text-text-secondary'
                          }`}
                        >
                          <List className="w-4 h-4 flex-shrink-0" />
                          <span>Issues</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTeamProjectsClick(team);
                          }}
                          className={`w-full px-6 py-2 hover:bg-background-hover flex items-center gap-3 text-sm transition-colors ${
                            isTeamProjectsPage && teamKey === team.key
                              ? 'text-text-primary bg-background-tertiary rounded-md'
                              : 'text-text-secondary'
                          }`}
                        >
                          <FolderKanban className="w-4 h-4 flex-shrink-0" />
                          <span>Projects</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="px-2 md:px-4 py-3 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-primary text-sm">
            <div
              className={`w-6 h-6 ${user ? getAvatarColor(user._id) : 'bg-purple-600'} rounded-full flex items-center justify-center text-xs text-white font-medium flex-shrink-0`}
            >
              {user ? user.name.charAt(0) : 'A'}
            </div>
            {!isCollapsed && <span className="text-sm">{user ? user.name : 'User'}</span>}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-background-tertiary rounded text-text-tertiary hover:text-text-primary transition-colors flex-shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
