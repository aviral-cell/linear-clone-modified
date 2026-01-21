import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { baseURL } from '../utils';
import { getTeamIconDisplay } from '../utils/teamIcons';
import IssuesBoard from '../components/IssuesBoard';
import CreateIssueModal from '../components/CreateIssueModal';
import { Search, Plus, CircleDashed, CircleDot, List } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [filter, setFilter] = useState('active');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [issuesRefreshTrigger, setIssuesRefreshTrigger] = useState(0);
  const { token, user } = useAuth();
  const { teamKey, issuesFilter } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (teams.length > 0 && !teamKey) {
      navigate(`/team/${teams[0].key}/all`, { replace: true });
    }
  }, [teams, teamKey, navigate]);

  useEffect(() => {
    if (teamKey && teams.length > 0) {
      const team = teams.find((t) => t.key === teamKey);
      setSelectedTeam(team);
    }
  }, [teamKey, teams]);

  useEffect(() => {
    if (issuesFilter) {
      setFilter(issuesFilter);
    } else {
      setFilter('all');
    }
  }, [issuesFilter]);

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
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border bg-background">
          <div className="px-4 md:px-8 py-4">
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-3">
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
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => selectedTeam && navigate(`/team/${selectedTeam.key}/all`)}
                    className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      filter === 'all'
                        ? 'bg-background-tertiary text-text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    All issues
                  </button>
                  <button
                    onClick={() => selectedTeam && navigate(`/team/${selectedTeam.key}/active`)}
                    className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      filter === 'active'
                        ? 'bg-background-tertiary text-text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                    }`}
                  >
                    <CircleDot className="w-3.5 h-3.5 text-yellow-500" />
                    Active
                  </button>
                  <button
                    onClick={() => selectedTeam && navigate(`/team/${selectedTeam.key}/backlog`)}
                    className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      filter === 'backlog'
                        ? 'bg-background-tertiary text-text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                    }`}
                  >
                    <CircleDashed className="w-3.5 h-3.5 text-text-tertiary" />
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
                      const { IconComponent, colorClass, icon } = getTeamIconDisplay(selectedTeam);
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
                    <h1 className="text-xl font-semibold text-text-primary">{selectedTeam.name}</h1>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => selectedTeam && navigate(`/team/${selectedTeam.key}/all`)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    filter === 'all'
                      ? 'bg-background-tertiary text-text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                  }`}
                >
                  <List className="w-4 h-4" />
                  All issues
                </button>
                <button
                  onClick={() => selectedTeam && navigate(`/team/${selectedTeam.key}/active`)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    filter === 'active'
                      ? 'bg-background-tertiary text-text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                  }`}
                >
                  <CircleDot className="w-4 h-4 text-yellow-500" />
                  Active
                </button>
                <button
                  onClick={() => selectedTeam && navigate(`/team/${selectedTeam.key}/backlog`)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    filter === 'backlog'
                      ? 'bg-background-tertiary text-text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                  }`}
                >
                  <CircleDashed className="w-4 h-4 text-text-tertiary" />
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
          <IssuesBoard team={selectedTeam} filter={filter} refreshTrigger={issuesRefreshTrigger} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-text-secondary">Select a team to view issues</div>
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
    </>
  );
};

export default Dashboard;
