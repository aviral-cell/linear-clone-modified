import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import IssuesBoard from '../components/IssuesBoard';
import Header from '../components/Header';
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
                <button
                  onClick={() => navigate('/my-issues/assigned')}
                  className={`btn-secondary-header flex-shrink-0 ${
                    filter === 'assigned'
                      ? 'bg-background-tertiary text-text-primary border-accent'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  Assigned
                </button>
                <button
                  onClick={() => navigate('/my-issues/created')}
                  className={`btn-secondary-header flex-shrink-0 ${
                    filter === 'created'
                      ? 'bg-background-tertiary text-text-primary border-accent'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Created
                </button>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('columns')}
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
                  onClick={() => setViewMode('list')}
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
          </section>
        </div>

        <IssuesBoard
          userFilter={filter}
          filter="all"
          refreshTrigger={issuesRefreshTrigger}
          view={viewMode}
          hideEmptyStatuses={true}
        />
      </div>
    </>
  );
};

export default MyIssuesPage;
