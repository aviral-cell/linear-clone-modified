import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import IssuesBoard from '../components/IssuesBoard';
import Header from '../components/Header';
import { Button, TabNavigation } from '../components/ui';
import { cn } from '../utils/cn';
import { LayoutList, LayoutPanelLeft, UserPlus, FileText, Bell } from '../icons';

const MyIssuesPage = () => {
  const { issuesFilter } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState(issuesFilter || 'assigned');
  const [viewMode, setViewMode] = useState('columns');
  const [issuesRefreshTrigger] = useState(0);

  useEffect(() => {
    if (issuesFilter) {
      setFilter(issuesFilter);
    } else {
      navigate('/my-issues/assigned', { replace: true });
    }
  }, [issuesFilter, navigate]);

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-background">
          <Header fallbackText="My Issues" />

          <TabNavigation
            tabs={[
              { id: 'assigned', label: 'Assigned', icon: <UserPlus className="h-4 w-4" /> },
              { id: 'created', label: 'Created', icon: <FileText className="h-4 w-4" /> },
              { id: 'subscribed', label: 'Subscribed', icon: <Bell className="h-4 w-4" /> },
            ]}
            activeTab={filter}
            onTabChange={(tabId) => navigate(`/my-issues/${tabId}`)}
            actions={
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
                  onClick={() => setViewMode('columns')}
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
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>
            }
          />
        </div>

        <div className="page-content">
          <IssuesBoard
            userFilter={filter}
            filter="all"
            refreshTrigger={issuesRefreshTrigger}
            view={viewMode}
            hideEmptyStatuses={true}
          />
        </div>
      </div>
    </>
  );
};

export default MyIssuesPage;
