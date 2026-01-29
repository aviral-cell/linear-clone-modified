import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { baseURL } from '../utils';
import IssuesBoard from '../components/IssuesBoard';
import CreateIssueModal from '../components/CreateIssueModal';
import Header from '../components/Header';
import { Plus, CircleDashed, CircleDot, List, LayoutList, LayoutPanelLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const IssuesPage = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [filter, setFilter] = useState('active');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [issuesRefreshTrigger, setIssuesRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState('columns');
  const [initialStatus, setInitialStatus] = useState('todo');
  const { token, user } = useAuth();
  const { teamKey, issuesFilter } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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

  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'list' || view === 'columns') {
      setViewMode(view);
    } else {
      setViewMode('columns');
    }
  }, [searchParams]);

  const handleViewChange = (mode) => {
    setViewMode(mode);
    const next = new URLSearchParams(searchParams);
    if (mode === 'columns') {
      next.delete('view');
    } else {
      next.set('view', mode);
    }
    setSearchParams(next);
  };

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
        <div className="bg-background">
          <Header
            fallbackText={null}
            primaryActionLabel="Add Issue"
            PrimaryActionIcon={Plus}
            onPrimaryActionClick={() => {
              if (selectedTeam) {
                setInitialStatus('todo');
                setShowCreateModal(true);
              } else {
                toast.error('Please select a team first');
              }
            }}
          />

          <div className="border-b border-border px-4 md:px-6 py-2 overflow-x-auto scrollbar-hide">
            <div className="flex items-center justify-between gap-2 min-w-max">
              <div className="flex items-center gap-1.5 flex-nowrap">
                <button
                  onClick={() => selectedTeam && navigate(`/team/${selectedTeam.key}/all`)}
                  className={`btn-secondary-header flex-shrink-0 ${
                    filter === 'all'
                      ? 'bg-background-tertiary text-text-primary border-accent'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                  }`}
                >
                  <List className="w-4 h-4" />
                  All issues
                </button>
                <button
                  onClick={() => selectedTeam && navigate(`/team/${selectedTeam.key}/active`)}
                  className={`btn-secondary-header flex-shrink-0 ${
                    filter === 'active'
                      ? 'bg-background-tertiary text-text-primary border-accent'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                  }`}
                >
                  <CircleDot className="w-4 h-4 text-yellow-500" />
                  Active
                </button>
                <button
                  onClick={() => selectedTeam && navigate(`/team/${selectedTeam.key}/backlog`)}
                  className={`btn-secondary-header flex-shrink-0 ${
                    filter === 'backlog'
                      ? 'bg-background-tertiary text-text-primary border-accent'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                  }`}
                >
                  <CircleDashed className="w-4 h-4 text-text-tertiary" />
                  Backlog
                </button>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleViewChange('columns')}
                  className={`btn-secondary-header ${
                    viewMode === 'columns'
                      ? 'border-accent bg-background-tertiary text-text-primary'
                      : 'border-border text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                  }`}
                  title="Board view"
                >
                  <LayoutPanelLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleViewChange('list')}
                  className={`btn-secondary-header ${
                    viewMode === 'list'
                      ? 'border-accent bg-background-tertiary text-text-primary'
                      : 'border-border text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                  }`}
                  title="List view"
                >
                  <LayoutList className="w-4 h-4" />
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
            view={viewMode}
            hideEmptyStatuses={filter !== 'all'}
            onCreateIssueWithStatus={(status) => {
              setInitialStatus(status);
              setShowCreateModal(true);
            }}
          />
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
          teams={teams}
          initialStatus={initialStatus}
          onSuccess={() => {
            setIssuesRefreshTrigger((prev) => prev + 1);
          }}
        />
      )}
    </>
  );
};

export default IssuesPage;
