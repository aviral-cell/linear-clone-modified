import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { baseURL } from '../utils';
import { getTeamIconDisplay } from '../utils/teamIcons';
import Header from '../components/Header';
import ProjectSidebar from '../components/ProjectSidebar';
import ProjectProperties from '../components/ProjectProperties';
import IssuesBoard from '../components/IssuesBoard';
import CreateIssueModal from '../components/CreateIssueModal';
import UpdateCard from '../components/UpdateCard';
import UpdateActivityList from '../components/UpdateActivityList';
import {
  Button,
  DetailPanel,
  EditableTextarea,
  EditableTitle,
  EmptyState,
  IconButton,
  LoadingScreen,
  SectionTitle,
  TabNavigation,
} from '../components/ui';
import {
  FolderKanban,
  FileText,
  List,
  Clock,
  Star,
  Plus,
  PanelRight,
  Check,
  TrendingUp,
  TrendingDown,
  X,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate, getAvatarColor, getInitials } from '../utils';
import { normalizeUpdateStatus } from '../utils/statusMapping';

const updateStatusOptions = [
  {
    value: 'on_track',
    label: 'On track',
    icon: TrendingUp,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
  },
  {
    value: 'at_risk',
    label: 'At risk',
    icon: AlertCircle,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
  },
  {
    value: 'off_track',
    label: 'Off track',
    icon: TrendingDown,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
  },
];

const getStatusConfig = (status) => {
  const displayStatus = normalizeUpdateStatus(status);
  const config = updateStatusOptions.find((opt) => opt.value === displayStatus);

  if (config) {
    return {
      label: config.label,
      icon: config.icon,
      color: config.color,
      bgColor: config.bgColor,
      borderColor: config.borderColor,
    };
  }

  return {
    label: status,
    icon: Check,
    color: 'text-text-tertiary',
    bgColor: 'bg-text-tertiary/20',
    borderColor: 'border-border',
  };
};

const ProjectDetailPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { projectIdentifier, tab } = useParams();
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [project, setProject] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [issues, setIssues] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [pendingActivities, setPendingActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [focusUpdateInput, setFocusUpdateInput] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [membersInitialized, setMembersInitialized] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [issuesRefreshTrigger, setIssuesRefreshTrigger] = useState(0);
  const [activitiesRefreshTrigger, setActivitiesRefreshTrigger] = useState(0);
  const [initialIssueStatus, setInitialIssueStatus] = useState('todo');

  const [activeTab, setActiveTab] = useState(tab || 'overview');
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [updateStatus, setUpdateStatus] = useState('at_risk');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const statusMenuRef = useRef(null);
  const sidebarRef = useRef(null);
  const skipNextFetchRef = useRef(false);

  useEffect(() => {
    if (focusUpdateInput) {
      setFocusUpdateInput(false);
    }
  }, [focusUpdateInput]);

  useEffect(() => {
    const urlTab = tab || 'overview';
    if (urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [tab]);

  useEffect(() => {
    if (activeTab && projectIdentifier) {
      const newPath = `/projects/${projectIdentifier}/${activeTab === 'overview' ? 'overview' : activeTab}`;
      if (window.location.pathname !== newPath) {
        window.history.replaceState(null, '', newPath);
      }
    }
  }, [activeTab, projectIdentifier]);

  useEffect(() => {
    if (window.innerWidth < 640) {
      setIsRightSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    let previousWidth = window.innerWidth;

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (previousWidth >= 640 && currentWidth < 640) {
        setIsRightSidebarOpen(false);
      }
      previousWidth = currentWidth;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target)) {
        setShowStatusMenu(false);
      }

      if (isRightSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        const clickedButton = event.target.closest('button');
        const isPanelButton =
          clickedButton &&
          (clickedButton.querySelector('svg[class*="lucide-panel-right"]') ||
            clickedButton.querySelector('svg[class*="lucide-panel-right-close"]') ||
            clickedButton.title === 'Close panel' ||
            clickedButton.title === 'Open panel');

        if (!isPanelButton) {
          setIsRightSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRightSidebarOpen]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [teamsRes, usersRes] = await Promise.all([
          fetch(`${baseURL}/api/teams`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${baseURL}/api/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (teamsRes.ok) {
          const data = await teamsRes.json();
          setTeams(data.teams);
        }

        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data.users);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, [token]);

  const fetchProject = React.useCallback(async () => {
    if (!projectIdentifier) return;
    try {
      setLoading(true);
      setMembersInitialized(false);
      const response = await fetch(`${baseURL}/api/projects/${projectIdentifier}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
        setMetrics(data.metrics || null);
        setName(data.project.name);
        setSummary(data.project.summary || data.project.description || '');
        setSelectedMembers(data.project.members?.map((m) => m._id || m) || []);
        setMembersInitialized(true);
      } else {
        toast.error('Project not found');
        navigate('/projects/all');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to fetch project');
    } finally {
      setLoading(false);
    }
  }, [projectIdentifier, token, navigate]);

  const fetchIssues = React.useCallback(async () => {
    if (!projectIdentifier) return;
    try {
      const response = await fetch(`${baseURL}/api/projects/${projectIdentifier}/issues`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setIssues(data.issues || []);
      }
    } catch (error) {
      console.error('Error fetching project issues:', error);
    }
  }, [projectIdentifier, token]);

  const fetchUpdates = React.useCallback(async () => {
    if (!projectIdentifier) return;
    try {
      const response = await fetch(
        `${baseURL}/api/projects/${projectIdentifier}/updates?includeActivities=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUpdates(data.updates || []);
        setPendingActivities(data.pendingActivities || []);
      }
    } catch (error) {
      console.error('Error fetching project updates:', error);
    }
  }, [projectIdentifier, token]);

  useEffect(() => {
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }
    fetchProject();
    fetchIssues();
    fetchUpdates();
  }, [fetchProject, fetchIssues, fetchUpdates]);

  useEffect(() => {
    if (!membersInitialized || !project) return;

    const currentMemberIds = (project.members || []).map((m) => m._id || m).sort();
    const selectedMemberIds = [...selectedMembers].sort();

    const membersChanged =
      currentMemberIds.length !== selectedMemberIds.length ||
      currentMemberIds.some((id, index) => id !== selectedMemberIds[index]);

    if (membersChanged) {
      handleUpdateProject({ memberIds: selectedMembers });
    }
  }, [selectedMembers, membersInitialized]);

  const handleUpdateProject = async (updates) => {
    if (!project) return;
    try {
      setSaving(true);

      if (updates.name !== undefined) {
        setProject((prev) => ({ ...prev, name: updates.name }));
        setName(updates.name);
      }
      if (updates.summary !== undefined) {
        setProject((prev) => ({ ...prev, summary: updates.summary }));
        setSummary(updates.summary);
      }
      if (updates.status !== undefined) {
        setProject((prev) => ({ ...prev, status: updates.status }));
      }
      if (updates.priority !== undefined) {
        setProject((prev) => ({ ...prev, priority: updates.priority }));
      }
      if (updates.leadId !== undefined) {
        const lead = updates.leadId ? users.find((u) => u._id === updates.leadId) : null;
        setProject((prev) => ({ ...prev, lead: lead || null }));
      }
      if (updates.teamId !== undefined) {
        const team = updates.teamId ? teams.find((t) => t._id === updates.teamId) : null;
        setProject((prev) => ({ ...prev, team: team || null }));
      }
      if (updates.startDate !== undefined) {
        setProject((prev) => ({ ...prev, startDate: updates.startDate || null }));
      }
      if (updates.targetDate !== undefined) {
        setProject((prev) => ({ ...prev, targetDate: updates.targetDate || null }));
      }
      if (updates.memberIds !== undefined) {
        const updatedMembers = updates.memberIds
          .map((id) => users.find((u) => u._id === id))
          .filter(Boolean);
        setProject((prev) => ({ ...prev, members: updatedMembers }));
      }

      const response = await fetch(`${baseURL}/api/projects/${project.identifier}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setProject((prev) => ({ ...prev, ...data.project }));
        setActivitiesRefreshTrigger((prev) => prev + 1);
        toast.success('Project updated');
        if (data.project.identifier && data.project.identifier !== projectIdentifier) {
          skipNextFetchRef.current = true;
          navigate(`/projects/${data.project.identifier}/${activeTab}`, { replace: true });
        }
      } else {
        await fetchProject();
        toast.error('Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      await fetchProject();
      toast.error('Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUpdate = async () => {
    if (!updateContent.trim()) {
      toast.error('Update content is required');
      return;
    }

    try {
      const response = await fetch(`${baseURL}/api/projects/${projectIdentifier}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: updateContent.trim(),
          status: updateStatus,
        }),
      });

      if (response.ok) {
        toast.success('Update created');
        setUpdateContent('');
        setUpdateStatus('at_risk');
        setActivitiesRefreshTrigger((prev) => prev + 1);
        await fetchUpdates();
        await fetchProject();
      } else {
        toast.error('Failed to create update');
      }
    } catch (error) {
      console.error('Error creating update:', error);
      toast.error('Failed to create update');
    }
  };

  const formatUpdateDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const getLatestUpdate = () => {
    if (updates.length === 0) return null;
    return updates[0];
  };

  const getStatusIndicator = () => {
    const latestUpdate = getLatestUpdate();
    if (!latestUpdate) {
      return { status: 'no_updates', label: 'No updates', color: 'text-text-tertiary' };
    }

    const hoursAgo = Math.floor(
      (Date.now() - new Date(latestUpdate.createdAt).getTime()) / (1000 * 60 * 60)
    );

    const statusConfig = getStatusConfig(latestUpdate.status);
    return {
      status: latestUpdate.status,
      label: `${statusConfig.label}, last update ${hoursAgo}h ago`,
      color: statusConfig.color,
    };
  };

  if (loading || !project) {
    return <LoadingScreen message="Loading..." />;
  }

  const totalIssues = metrics?.totalIssues || 0;
  const doneIssues = metrics?.doneIssues || 0;
  const percent = totalIssues === 0 ? 0 : Math.round((doneIssues / totalIssues) * 100);
  const statusIndicator = getStatusIndicator();
  const latestUpdate = getLatestUpdate();

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-background">
          <Header
            fallbackText={project.name}
            team={project.team}
            projectName={project.name}
            onTeamClick={() => {
              if (project.team) {
                navigate(`/team/${project.team.key}/projects/all`);
              } else {
                navigate('/projects/all');
              }
            }}
            panelOpenerIcon={PanelRight}
            onPanelOpenerClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            isPanelOpen={isRightSidebarOpen}
          />

          <TabNavigation
            tabs={[
              { id: 'overview', label: 'Overview', icon: <FileText className="h-4 w-4" /> },
              { id: 'updates', label: 'Updates', icon: <Clock className="h-4 w-4" /> },
              { id: 'issues', label: 'Issues', icon: <List className="h-4 w-4" /> },
            ]}
            activeTab={activeTab}
            onTabChange={(tabId) => {
              setActiveTab(tabId);
              if (tabId === 'updates') {
                setFocusUpdateInput(false);
              }
            }}
          />
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          <div className="page-content">
            <div className="w-full px-4 md:px-6 py-6">
              {activeTab === 'overview' && (
                <>
                  <div className="mb-6 flex items-start gap-3">
                    <IconButton
                      size="md"
                      aria-label="Choose icon"
                      className="w-10 h-10 rounded-md bg-background-secondary border border-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
                      title="Choose icon"
                    >
                      {project.icon ? (
                        <span className="text-lg">{project.icon}</span>
                      ) : (
                        <FolderKanban className="w-5 h-5" />
                      )}
                    </IconButton>
                    <div className="flex-1">
                      <EditableTitle
                        value={name}
                        placeholder="Project name"
                        size="xl"
                        onSave={(nextName) => {
                          if (nextName.trim() && nextName.trim() !== project.name) {
                            setName(nextName);
                            handleUpdateProject({ name: nextName.trim() });
                          }
                        }}
                      />

                      <EditableTextarea
                        value={summary}
                        placeholder="Add project summary..."
                        minHeight="comment"
                        className="mt-2 min-h-[60px] px-0 py-2 bg-background text-sm"
                        onSave={(nextSummary) => {
                          if (nextSummary !== (project.summary || project.description || '')) {
                            setSummary(nextSummary);
                            handleUpdateProject({ summary: nextSummary });
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <SectionTitle size="sm" className="mb-3">
                      Properties
                    </SectionTitle>
                    <ProjectProperties
                      project={project}
                      users={users}
                      teams={teams}
                      onUpdate={handleUpdateProject}
                      disabled={saving}
                      variant="horizontal"
                      showTeam={true}
                      showStartDate={true}
                      showTargetDate={true}
                      showStatus={true}
                      showPriority={true}
                      showLead={true}
                      showMembers={true}
                      selectedMembers={selectedMembers}
                      onMembersChange={setSelectedMembers}
                    />
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <SectionTitle size="sm">Latest update</SectionTitle>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => {
                          setActiveTab('updates');
                          setFocusUpdateInput(true);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Write new update
                      </Button>
                    </div>
                    {latestUpdate ? (
                      <UpdateCard
                        update={latestUpdate}
                        statusConfig={getStatusConfig(latestUpdate.status)}
                        StatusIcon={getStatusConfig(latestUpdate.status).icon}
                        formatDate={(date) => new Date(date).toLocaleDateString()}
                      />
                    ) : (
                      <EmptyState size="sm">
                        No updates yet. Write the first update to track progress.
                      </EmptyState>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'updates' && (
                <div className="max-w-3xl">
                  <div className="mb-6">
                    <UpdateCard
                      isEditable={true}
                      statusConfig={getStatusConfig(updateStatus)}
                      StatusIcon={getStatusConfig(updateStatus).icon}
                      autoFocus={focusUpdateInput}
                      statusMenuRef={statusMenuRef}
                      showStatusMenu={showStatusMenu}
                      onStatusMenuToggle={() => setShowStatusMenu(!showStatusMenu)}
                      statusOptions={updateStatusOptions}
                      currentStatus={updateStatus}
                      onStatusChange={(value) => {
                        setUpdateStatus(value);
                        setShowStatusMenu(false);
                      }}
                      content={updateContent}
                      onContentChange={setUpdateContent}
                      onPostUpdate={handleCreateUpdate}
                      showPostButton={true}
                    />
                    <UpdateActivityList activities={pendingActivities} />
                  </div>

                  {updates.length === 0 ? (
                    <EmptyState size="lg">
                      <p className="text-sm text-text-tertiary">No updates yet</p>
                    </EmptyState>
                  ) : (
                    <div className="space-y-4">
                      {updates.map((update) => {
                        const statusConfig = getStatusConfig(update.status);
                        const StatusIcon = statusConfig.icon;
                        return (
                          <div key={update._id}>
                            <UpdateCard
                              update={update}
                              statusConfig={statusConfig}
                              StatusIcon={StatusIcon}
                              formatDate={formatUpdateDate}
                            />
                            <UpdateActivityList
                              activities={update.activities}
                              updateStatus={update.status}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'issues' && (
                <div className="flex-1 flex flex-col overflow-hidden -mx-4 md:-mx-6">
                  <div className="px-4 md:px-6 flex items-center justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setInitialIssueStatus('todo');
                        setShowCreateModal(true);
                      }}
                      className="text-text-secondary hover:text-text-primary"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Add Issue</span>
                    </Button>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <IssuesBoard
                      project={project}
                      filter="all"
                      refreshTrigger={issuesRefreshTrigger}
                      view="list"
                      hideEmptyStatuses
                      onCreateIssueWithStatus={(status) => {
                        setInitialIssueStatus(status);
                        setShowCreateModal(true);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DetailPanel
            isOpen={isRightSidebarOpen}
            onClose={() => setIsRightSidebarOpen(false)}
            panelRef={sidebarRef}
          >
            <ProjectSidebar
              project={project}
              users={users}
              teams={teams}
              onUpdate={handleUpdateProject}
              selectedMembers={selectedMembers}
              onMembersChange={setSelectedMembers}
              token={token}
              activitiesRefreshTrigger={activitiesRefreshTrigger}
              onSeeAllActivities={() => {
                setIsRightSidebarOpen(false);
                setActiveTab('updates');
              }}
            />
          </DetailPanel>
        </div>
      </div>

      {showCreateModal && project && (
        <CreateIssueModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          team={project.team}
          project={project}
          teams={teams}
          initialStatus={initialIssueStatus}
          onSuccess={() => {
            setIssuesRefreshTrigger((prev) => prev + 1);
            fetchIssues();
          }}
        />
      )}
    </>
  );
};

export default ProjectDetailPage;
