import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import IssuesBoard from '../components/IssuesBoard';
import CreateIssueModal from '../components/CreateIssueModal';
import Header from '../components/Header';
import { LoadingScreen, TabNavigation, Button } from '../components/ui';
import { IssueFilterDropdown } from '../components/issues';
import { Plus, CircleDashed, CircleDot, List, LayoutPanelLeft, LayoutList } from '../icons';
import { useTeams, useUsers, useIssueFilters } from '../hooks';
import toast from 'react-hot-toast';

const IssuesPage = () => {
  const { teams, loading } = useTeams();
  const { users } = useUsers();
  const {
    filters: advancedFilters,
    toggleFilterValue,
    activeFilterCount,
  } = useIssueFilters();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [filter, setFilter] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [issuesRefreshTrigger, setIssuesRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState('columns');
  const [initialStatus, setInitialStatus] = useState('todo');
  const { teamKey, issuesFilter } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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

          <TabNavigation
            tabs={[
              { id: 'all', label: 'All issues', icon: <List className="h-4 w-4" /> },
              {
                id: 'active',
                label: 'Active',
                icon: <CircleDot className="h-4 w-4 text-yellow-500" />,
              },
              {
                id: 'backlog',
                label: 'Backlog',
                icon: <CircleDashed className="h-4 w-4 text-text-tertiary" />,
              },
            ]}
            activeTab={filter}
            onTabChange={(tabId) => selectedTeam && navigate(`/team/${selectedTeam.key}/${tabId}`)}
          />

          <div className="flex items-center justify-between px-4 md:px-6 py-2 border-b border-border">
            <IssueFilterDropdown
              filters={advancedFilters}
              onToggleFilter={toggleFilterValue}
              users={users}
              activeFilterCount={activeFilterCount}
            />
            <div className="flex items-center border border-border rounded-md">
              <Button
                variant="secondary"
                size="sm"
                className={`rounded-r-none border-0 ${viewMode === 'columns' ? 'bg-background-tertiary' : ''}`}
                onClick={() => handleViewChange('columns')}
                title="Board view"
              >
                <LayoutPanelLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className={`rounded-l-none border-0 ${viewMode === 'list' ? 'bg-background-tertiary' : ''}`}
                onClick={() => handleViewChange('list')}
                title="List view"
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="page-content">
          {selectedTeam ? (
            <IssuesBoard
              team={selectedTeam}
              filter={filter}
              advancedFilters={advancedFilters}
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
