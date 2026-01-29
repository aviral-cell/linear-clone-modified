import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { baseURL } from '../utils';
import IssuesBoard from '../components/IssuesBoard';
import CreateIssueModal from '../components/CreateIssueModal';
import Header from '../components/Header';
import { Button, LoadingScreen } from '../components/ui';
import { cn } from '../utils/cn';
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
    return <LoadingScreen message="Loading..." />;
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

          <section aria-label="Issues filters" className="filter-bar">
            <div className="filter-bar-inner">
              <div className="filter-bar-tabs">
                <Button
                  variant="secondary"
                  size="sm"
                  className={cn(
                    'flex-shrink-0',
                    filter === 'all' && 'border-accent bg-background-tertiary text-text-primary'
                  )}
                  onClick={() => selectedTeam && navigate(`/team/${selectedTeam.key}/all`)}
                >
                  <List className="h-4 w-4" />
                  All issues
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className={cn(
                    'flex-shrink-0',
                    filter === 'active' && 'border-accent bg-background-tertiary text-text-primary'
                  )}
                  onClick={() => selectedTeam && navigate(`/team/${selectedTeam.key}/active`)}
                >
                  <CircleDot className="h-4 w-4 text-yellow-500" />
                  Active
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className={cn(
                    'flex-shrink-0',
                    filter === 'backlog' && 'border-accent bg-background-tertiary text-text-primary'
                  )}
                  onClick={() => selectedTeam && navigate(`/team/${selectedTeam.key}/backlog`)}
                >
                  <CircleDashed className="h-4 w-4 text-text-tertiary" />
                  Backlog
                </Button>
              </div>

              <div className="flex flex-shrink-0 items-center gap-1.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className={cn(
                    'p-1.5',
                    viewMode === 'columns' &&
                      'border-accent bg-background-tertiary text-text-primary'
                  )}
                  onClick={() => handleViewChange('columns')}
                  title="Board view"
                >
                  <LayoutPanelLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className={cn(
                    'p-1.5',
                    viewMode === 'list' && 'border-accent bg-background-tertiary text-text-primary'
                  )}
                  onClick={() => handleViewChange('list')}
                  title="List view"
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </section>
        </div>

        <div className="page-content">
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
            <div className="flex h-full items-center justify-center">
              <div className="text-text-secondary">Select a team to view issues</div>
            </div>
          )}
        </div>
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
