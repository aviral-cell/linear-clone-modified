import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAvatarColor } from '../utils';
import { getTeamIconDisplay } from '../utils/teamIcons';
import {
  Inbox,
  Zap,
  Target,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Users,
  Box,
  Layers,
  User,
  LogOut,
} from 'lucide-react';

const Sidebar = ({ teams, isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { user, logout } = useAuth();
  const [expandedSections, setExpandedSections] = useState({
    workspace: true,
    teams: true,
  });
  const [expandedTeams, setExpandedTeams] = useState(() => {
    const eng = teams.find((t) => t.key === 'ENG');
    return eng ? { [eng._id]: true } : {};
  });

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
    navigate(`/team/${team._id}`);
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
          className="w-full px-6 py-2 hover:bg-background-hover flex items-center gap-3 text-text-primary text-sm transition-colors"
          title="Inbox"
        >
          <Inbox className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Inbox</span>}
        </button>

        <button
          className="w-full px-6 py-2 hover:bg-background-hover flex items-center gap-3 text-text-primary text-sm transition-colors"
          title="My Issues"
        >
          <User className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>My Issues</span>}
        </button>

        {!isCollapsed && (
          <div className="mt-4">
            <button
              onClick={() => toggleSection('workspace')}
              className="w-full px-6 py-2 hover:bg-background-hover flex items-center justify-between text-text-primary text-sm group transition-colors"
            >
              <span className="font-medium">Workspace</span>
              {expandedSections.workspace ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {expandedSections.workspace && (
              <div className="ml-3">
                <button
                  className="w-full px-6 py-2 hover:bg-background-hover flex items-center gap-3 text-text-secondary text-sm transition-colors"
                  title="Initiatives"
                >
                  <Target className="w-4 h-4 flex-shrink-0" />
                  <span>Initiatives</span>
                </button>
                <button
                  className="w-full px-6 py-2 hover:bg-background-hover flex items-center gap-3 text-text-secondary text-sm transition-colors"
                  title="Projects"
                >
                  <Box className="w-4 h-4 flex-shrink-0" />
                  <span>Projects</span>
                </button>
                <button
                  className="w-full px-6 py-2 hover:bg-background-hover flex items-center gap-3 text-text-secondary text-sm transition-colors"
                  title="Views"
                >
                  <Layers className="w-4 h-4 flex-shrink-0" />
                  <span>Views</span>
                </button>
                <button
                  className="w-full px-6 py-2 hover:bg-background-hover flex items-center gap-3 text-text-secondary text-sm transition-colors"
                  title="More"
                >
                  <MoreHorizontal className="w-4 h-4 flex-shrink-0" />
                  <span>More</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={() => !isCollapsed && toggleSection('teams')}
            className="w-full px-6 py-2 hover:bg-background-hover flex items-center justify-between text-text-primary text-sm group transition-colors"
            title="Your teams"
          >
            <span className={`font-medium ${isCollapsed ? 'hidden' : ''}`}>
              Your teams
            </span>
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
                const { IconComponent, colorClass, icon } =
                  getTeamIconDisplay(team);

                return (
                  <div key={team._id}>
                    <button
                      onClick={() => {
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
                      <div className="ml-6 mr-2 mt-1">
                        <button
                          onClick={() => handleTeamIssuesClick(team)}
                          className={`w-full px-6 py-2 hover:bg-background-hover flex items-center gap-3 text-sm transition-colors ${
                            teamId === team._id
                              ? 'text-text-primary bg-background-tertiary rounded-md'
                              : 'text-text-secondary'
                          }`}
                        >
                          <Users className="w-4 h-4 flex-shrink-0" />
                          <span>Issues</span>
                        </button>
                        <button
                          className="w-full px-6 py-2 hover:bg-background-hover hover:rounded-md flex items-center gap-3 text-text-secondary text-sm transition-colors"
                          title="Projects"
                        >
                          <Box className="w-4 h-4 flex-shrink-0" />
                          <span>Projects</span>
                        </button>
                        <button
                          className="w-full px-6 py-2 hover:bg-background-hover hover:rounded-md flex items-center gap-3 text-text-secondary text-sm transition-colors"
                          title="Views"
                        >
                          <Layers className="w-4 h-4 flex-shrink-0" />
                          <span>Views</span>
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
            {!isCollapsed && (
              <span className="text-sm">{user ? user.name : 'User'}</span>
            )}
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
