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
  const [editingName, setEditingName] = useState(false);
  const [editingSummary, setEditingSummary] = useState(false);
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [updateStatus, setUpdateStatus] = useState('at_risk');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const statusMenuRef = useRef(null);
  const sidebarRef = useRef(null);

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

  const saveName = () => {
    if (name.trim() && name.trim() !== project.name) {
      handleUpdateProject({ name: name.trim() });
    }
    setEditingName(false);
  };

  const saveSummary = () => {
    if (summary !== (project.summary || project.description || '')) {
      handleUpdateProject({ summary });
    }
    setEditingSummary(false);
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
    return (
      <div className="loading-screen">
        <div className="loading-screen-text">Loading...</div>
      </div>
    );
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

          <div className="border-b border-border px-4 md:px-6 py-2 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1.5 flex-nowrap min-w-max">
              <button
                onClick={() => setActiveTab('overview')}
                className={`btn-secondary-header flex-shrink-0 ${
                  activeTab === 'overview'
                    ? 'bg-background-tertiary text-text-primary border-accent'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                }`}
              >
                <FileText className="w-4 h-4" />
                Overview
              </button>
              <button
                onClick={() => {
                  setActiveTab('updates');
                  setFocusUpdateInput(false);
                }}
                className={`btn-secondary-header flex-shrink-0 ${
                  activeTab === 'updates'
                    ? 'bg-background-tertiary text-text-primary border-accent'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                }`}
              >
                <Clock className="w-4 h-4" />
                Updates
              </button>
              <button
                onClick={() => setActiveTab('issues')}
                className={`btn-secondary-header flex-shrink-0 ${
                  activeTab === 'issues'
                    ? 'bg-background-tertiary text-text-primary border-accent'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                }`}
              >
                <List className="w-4 h-4" />
                Issues
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          <div className="page-content">
            <div className="w-full px-4 md:px-6 py-6">
              {activeTab === 'overview' && (
                <>
                  <div className="mb-6 flex items-start gap-3">
                    <button
                      className="w-10 h-10 rounded-md bg-background-secondary border border-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
                      title="Choose icon"
                    >
                      {project.icon ? (
                        <span className="text-lg">{project.icon}</span>
                      ) : (
                        <FolderKanban className="w-5 h-5" />
                      )}
                    </button>
                    <div className="flex-1">
                      {editingName ? (
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onBlur={saveName}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveName();
                            if (e.key === 'Escape') {
                              setName(project.name);
                              setEditingName(false);
                            }
                          }}
                          className="input-transparent editable-title editable-title-bordered"
                          autoFocus
                        />
                      ) : (
                        <h1 onClick={() => setEditingName(true)} className="editable-title">
                          {project.name}
                        </h1>
                      )}

                      {editingSummary ? (
                        <textarea
                          value={summary}
                          onChange={(e) => setSummary(e.target.value)}
                          onBlur={saveSummary}
                          placeholder="Add project summary..."
                          className="textarea-transparent textarea-transparent-sm mt-2 min-h-[60px] px-0 py-2 bg-background"
                          autoFocus
                        />
                      ) : (
                        <div
                          onClick={() => setEditingSummary(true)}
                          className="editable-title mt-2 px-0 py-2 text-text-secondary min-h-[40px] text-sm"
                        >
                          {project.summary || project.description || (
                            <span className="text-text-tertiary">Add project summary...</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h2 className="section-title-sm">Properties</h2>
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
                      <h2 className="text-xs font-medium text-text-tertiary">Latest update</h2>
                      <button
                        onClick={() => {
                          setActiveTab('updates');
                          setFocusUpdateInput(true);
                        }}
                        className="px-3 py-1.5 rounded-md bg-background-secondary border border-border text-xs text-text-primary hover:bg-background-tertiary transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Write new update
                      </button>
                    </div>
                    {latestUpdate ? (
                      <UpdateCard
                        update={latestUpdate}
                        statusConfig={getStatusConfig(latestUpdate.status)}
                        StatusIcon={getStatusConfig(latestUpdate.status).icon}
                        formatDate={(date) => new Date(date).toLocaleDateString()}
                      />
                    ) : (
                      <div className="empty-state empty-state-sm">
                        No updates yet. Write the first update to track progress.
                      </div>
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
                    <div className="empty-state empty-state-lg">
                      <p className="text-sm text-text-tertiary">No updates yet</p>
                    </div>
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
                    <button
                      onClick={() => {
                        setInitialIssueStatus('todo');
                        setShowCreateModal(true);
                      }}
                      className="px-2 py-1 rounded-md border border-border text-xs text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Add Issue</span>
                    </button>
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

          {isRightSidebarOpen && (
            <div
              className="lg:hidden overlay-backdrop"
              onClick={() => setIsRightSidebarOpen(false)}
            />
          )}

          <div
            ref={sidebarRef}
            className={`lg:hidden detail-panel ${isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full'} w-80`}
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
          </div>
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
