import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import IssuesBoard from '../components/IssuesBoard';
import Header from '../components/Header';
import { Button } from '../components/ui';
import { cn } from '../utils/cn';
import { LayoutList, LayoutPanelLeft, UserPlus, FileText } from 'lucide-react';

const MyIssuesPage = () => {
  const [filter, setFilter] = useState('assigned');
  const [viewMode, setViewMode] = useState('columns');
  const [issuesRefreshTrigger, setIssuesRefreshTrigger] = useState(0);
  const { issuesFilter } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (issuesFilter) {
      setFilter(issuesFilter);
    } else {
      setFilter('assigned');
      navigate('/my-issues/assigned', { replace: true });
    }
  }, [issuesFilter, navigate]);

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-background">
          <Header fallbackText="My Issues" />

          <section aria-label="My issues filters" className="filter-bar">
            <div className="filter-bar-inner">
              <div className="filter-bar-tabs">
                <Button
                  variant="secondary"
                  size="sm"
                  className={cn(
                    'flex-shrink-0',
                    filter === 'assigned' &&
                      'border-accent bg-background-tertiary text-text-primary'
                  )}
                  onClick={() => navigate('/my-issues/assigned')}
                >
                  <UserPlus className="h-4 w-4" />
                  Assigned
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className={cn(
                    'flex-shrink-0',
                    filter === 'created' && 'border-accent bg-background-tertiary text-text-primary'
                  )}
                  onClick={() => navigate('/my-issues/created')}
                >
                  <FileText className="h-4 w-4" />
                  Created
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
            </div>
          </section>
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
