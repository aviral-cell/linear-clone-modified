import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { baseURL } from '../utils';
import { getTeamIconDisplay } from '../utils/teamIcons';
import Sidebar from '../components/Sidebar';
import IssuesBoard from '../components/IssuesBoard';
import CreateIssueModal from '../components/CreateIssueModal';
import { Search, Plus, Menu } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [filter, setFilter] = useState('active');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [issuesRefreshTrigger, setIssuesRefreshTrigger] = useState(0);
  const { token, user } = useAuth();
  const { teamId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (teams.length > 0 && !teamId) {
      navigate(`/team/${teams[0]._id}`);
    }
  }, [teams, teamId, navigate]);

  useEffect(() => {
    if (teamId && teams.length > 0) {
      const team = teams.find((t) => t._id === teamId);
      setSelectedTeam(team);
    }
  }, [teamId, teams]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseURL}/api/teams`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams);
      } else {
        toast.error('Failed to fetch teams');
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      <Sidebar
        teams={teams}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border bg-background">
          <div className="px-4 md:px-8 py-4">
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="p-2 text-text-secondary hover:text-text-primary hover:bg-background-secondary rounded-md"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  {selectedTeam && (
                    <>
                      {(() => {
                        const { IconComponent, colorClass, icon } =
                          getTeamIconDisplay(selectedTeam);
                        return (
                          <div
                            className={`w-8 h-8 ${colorClass} rounded-md flex items-center justify-center text-white`}
                          >
                            {IconComponent ? (
                              <IconComponent className="w-5 h-5" />
                            ) : (
                              <span className="text-lg">{icon}</span>
                            )}
                          </div>
                        );
                      })()}
                      <h1 className="text-xl font-semibold text-text-primary">
                        {selectedTeam.name}
                      </h1>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      filter === 'all'
                        ? 'bg-background-tertiary text-text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                    }`}
                  >
                    All issues
                  </button>
                  <button
                    onClick={() => setFilter('active')}
                    className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      filter === 'active'
                        ? 'bg-background-tertiary text-text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setFilter('backlog')}
                    className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      filter === 'backlog'
                        ? 'bg-background-tertiary text-text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                    }`}
                  >
                    Backlog
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-background-secondary rounded-md">
                    <Search className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (selectedTeam) {
                        setShowCreateModal(true);
                      } else {
                        toast.error('Please select a team first');
                      }
                    }}
                    className="p-2 text-text-secondary hover:text-text-primary hover:bg-background-secondary rounded-md"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedTeam && (
                  <>
                    {(() => {
                      const { IconComponent, colorClass, icon } =
                        getTeamIconDisplay(selectedTeam);
                      return (
                        <div
                          className={`w-8 h-8 ${colorClass} rounded-md flex items-center justify-center text-white`}
                        >
                          {IconComponent ? (
                            <IconComponent className="w-5 h-5" />
                          ) : (
                            <span className="text-lg">{icon}</span>
                          )}
                        </div>
                      );
                    })()}
                    <h1 className="text-xl font-semibold text-text-primary">
                      {selectedTeam.name}
                    </h1>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-background-tertiary text-text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                  }`}
                >
                  All issues
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    filter === 'active'
                      ? 'bg-background-tertiary text-text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilter('backlog')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    filter === 'backlog'
                      ? 'bg-background-tertiary text-text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                  }`}
                >
                  Backlog
                </button>

                <div className="h-6 w-px bg-border" />

                <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-background-secondary rounded-md">
                  <Search className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (selectedTeam) {
                      setShowCreateModal(true);
                    } else {
                      toast.error('Please select a team first');
                    }
                  }}
                  className="p-2 text-text-secondary hover:text-text-primary hover:bg-background-secondary rounded-md"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {selectedTeam ? (
          <IssuesBoard
            team={selectedTeam}
            filter={filter}
            refreshTrigger={issuesRefreshTrigger}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-text-secondary">
              Select a team to view issues
            </div>
          </div>
        )}
      </div>

      {selectedTeam && (
        <CreateIssueModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          team={selectedTeam}
          onSuccess={() => {
            setIssuesRefreshTrigger((prev) => prev + 1);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
