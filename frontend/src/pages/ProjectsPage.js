import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { baseURL, getAvatarColor } from '../utils';
import ProjectModal from '../components/ProjectModal';
import Header from '../components/Header';
import {
  Plus,
  FolderKanban,
  AlertCircle,
  Ban,
  CircleDashed,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart2,
  BarChart3,
  BarChart4,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { normalizeUpdateStatus } from '../utils/statusMapping';

const ProjectsPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { teamKey } = useParams();
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectsWithUpdates, setProjectsWithUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState(() => {
    return teamKey || 'all';
  });
  const [creatorFilter, setCreatorFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const teamsRef = useRef([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const teamsRes = await fetch(`${baseURL}/api/teams`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (teamsRes.ok) {
          const data = await teamsRes.json();
          setTeams(data.teams);
          teamsRef.current = data.teams;
        } else {
          toast.error('Failed to fetch teams');
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Failed to load workspace data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [token]);

  const fetchProjects = useCallback(
    async (opts = {}) => {
      try {
        setProjectsLoading(true);
        const params = new URLSearchParams();
        if (opts.status && opts.status !== 'all') {
          params.append('status', opts.status);
        }
        if (opts.teamKey && opts.teamKey !== 'all') {
          const team = teamsRef.current.find((t) => t.key === opts.teamKey);
          if (team) {
            params.append('teamId', team._id);
          }
        }
        if (opts.creatorId && opts.creatorId !== 'all') {
          params.append('creatorId', opts.creatorId);
        }

        const query = params.toString();
        const url = `${baseURL}/api/projects${query ? `?${query}` : ''}`;

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects || []);

          const projectsWithUpdatesData = await Promise.all(
            (data.projects || []).map(async (project) => {
              try {
                const updateRes = await fetch(
                  `${baseURL}/api/projects/${project.identifier}/updates`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                if (updateRes.ok) {
                  const updateData = await updateRes.json();
                  return {
                    ...project,
                    latestUpdate: updateData.updates?.[0] || null,
                  };
                }
                return { ...project, latestUpdate: null };
              } catch {
                return { ...project, latestUpdate: null };
              }
            })
          );
          setProjectsWithUpdates(projectsWithUpdatesData);
        } else {
          toast.error('Failed to fetch projects');
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to fetch projects');
      } finally {
        setProjectsLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (teamFilter !== 'all' && teams.length === 0) {
      return;
    }

    fetchProjects({
      status: statusFilter,
      teamKey: teamFilter,
      creatorId: creatorFilter,
    });
  }, [fetchProjects, statusFilter, teamFilter, creatorFilter, teams]);

  useEffect(() => {
    if (teamKey) {
      setTeamFilter(teamKey);
    } else {
      setTeamFilter('all');
    }
  }, [teamKey]);

  const filteredProjects = useMemo(() => {
    return projectsWithUpdates.length > 0 ? projectsWithUpdates : projects;
  }, [projectsWithUpdates, projects]);

  const getStatusIndicator = useCallback((project) => {
    const latestUpdate = project.latestUpdate;
    if (!latestUpdate) {
      return {
        status: 'no_updates',
        label: 'No updates',
        color: 'text-text-tertiary',
        icon: null,
      };
    }

    const hoursAgo = Math.floor(
      (Date.now() - new Date(latestUpdate.createdAt).getTime()) / (1000 * 60 * 60)
    );

    const displayStatus = normalizeUpdateStatus(latestUpdate.status);

    switch (displayStatus) {
      case 'on_track':
        return {
          status: 'on_track',
          label: `On track, last update ${hoursAgo}h ago`,
          color: 'text-green-400',
          icon: TrendingUp,
        };
      case 'at_risk':
        return {
          status: 'at_risk',
          label: `At risk, last update ${hoursAgo}h ago`,
          color: 'text-yellow-400',
          icon: AlertCircle,
        };
      case 'off_track':
        return {
          status: 'off_track',
          label: `Off track, last update ${hoursAgo}h ago`,
          color: 'text-red-400',
          icon: TrendingDown,
        };
      default:
        return {
          status: 'unknown',
          label: `Last update ${hoursAgo}h ago`,
          color: 'text-text-tertiary',
          icon: null,
        };
    }
  }, []);

  const selectedTeam = useMemo(() => {
    if (teamFilter && teamFilter !== 'all') {
      return teams.find((t) => t.key === teamFilter);
    }
    return null;
  }, [teamFilter, teams]);

  const handleOpenNewProject = useCallback(() => {
    setEditingProject(null);
    setIsModalOpen(true);
  }, []);

  const handleEditProject = useCallback((project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  }, []);

  const handleModalSuccess = useCallback(() => {
    fetchProjects({
      status: statusFilter,
      teamKey: teamFilter,
      creatorId: creatorFilter,
    });
  }, [fetchProjects, statusFilter, teamFilter, creatorFilter]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const getPriorityColor = useCallback((priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-text-tertiary';
    }
  }, []);

  const getPriorityMeta = useCallback((priority) => {
    switch (priority) {
      case 'urgent':
        return { Icon: AlertCircle, label: 'Urgent' };
      case 'high':
        return { Icon: BarChart4, label: 'High' };
      case 'medium':
        return { Icon: BarChart3, label: 'Medium' };
      case 'low':
        return { Icon: BarChart2, label: 'Low' };
      case 'no_priority':
        return { Icon: Minus, label: 'No priority' };
      default:
        return { Icon: Minus, label: 'No priority' };
    }
  }, []);

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'backlog':
        return { Icon: CircleDashed, color: 'text-text-tertiary' };
      case 'planned':
        return { Icon: FolderKanban, color: 'text-blue-500' };
      case 'in_progress':
        return { Icon: CircleDashed, color: 'text-green-500' };
      case 'completed':
        return { Icon: FolderKanban, color: 'text-text-tertiary' };
      case 'cancelled':
        return { Icon: Ban, color: 'text-text-tertiary' };
      default:
        return { Icon: CircleDashed, color: 'text-text-tertiary' };
    }
  }, []);

  const formatDate = useCallback((date) => {
    if (!date) return '-';
    const d = new Date(date);
    const day = d.getDate();
    const daySuffix =
      day === 1 || day === 21 || day === 31
        ? 'st'
        : day === 2 || day === 22
          ? 'nd'
          : day === 3 || day === 23
            ? 'rd'
            : 'th';
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    return `${month} ${day}${daySuffix}`;
  }, []);

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
            fallbackText="Projects"
            primaryActionLabel="Add Project"
            PrimaryActionIcon={Plus}
            onPrimaryActionClick={handleOpenNewProject}
          />

          <div className="border-b border-border px-4 md:px-6 py-2 flex items-center justify-between gap-3 overflow-hidden">
            <div className="flex items-center gap-1.5 flex-nowrap min-w-max flex-shrink-0 overflow-x-auto scrollbar-hide">
              <button className="px-3 py-1 rounded-md border border-border text-xs font-medium transition-colors flex items-center gap-1.5 flex-shrink-0 bg-background-tertiary text-text-primary border-accent">
                <FolderKanban className="w-4 h-4" />
                All projects
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {projectsLoading ? (
            <div className="px-4 md:px-6 py-4">
              <div className="text-text-secondary text-sm">Loading projects...</div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="px-4 md:px-6 py-4">
              <div className="border border-dashed border-border rounded-lg p-6 text-center text-text-tertiary text-sm">
                No projects match your filters. Create a new project to get started.
              </div>
            </div>
          ) : (
            <div
              className="overflow-x-auto"
              style={{
                fontFamily:
                  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              <div className="min-w-full">
                <div
                  className="sticky top-0 z-10 bg-background border-b border-border"
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      '[indent] 18px [title] minmax(350px, 2fr) [health] 50px [priority] 68px [lead] 48px [startDate] minmax(76px, auto) [targetDate] minmax(76px, auto) [status] 28px [end-padding] 12px',
                    columnGap: '6px',
                    fontFamily:
                      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  <div
                    className="px-2 py-2 text-text-tertiary"
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.01em',
                      lineHeight: '16px',
                    }}
                  ></div>
                  <div
                    className="px-2 py-2 text-text-tertiary"
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.01em',
                      lineHeight: '16px',
                    }}
                  >
                    Name
                  </div>
                  <div
                    className="px-2 py-2 text-text-tertiary"
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.01em',
                      lineHeight: '16px',
                    }}
                  >
                    Health
                  </div>
                  <div
                    className="px-2 py-2 text-text-tertiary"
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.01em',
                      lineHeight: '16px',
                    }}
                  >
                    Priority
                  </div>
                  <div
                    className="px-2 py-2 text-text-tertiary"
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.01em',
                      lineHeight: '16px',
                    }}
                  >
                    Lead
                  </div>
                  <div
                    className="px-2 py-2 text-text-tertiary"
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.01em',
                      lineHeight: '16px',
                    }}
                  >
                    Start date
                  </div>
                  <div
                    className="px-2 py-2 text-text-tertiary"
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.01em',
                      lineHeight: '16px',
                    }}
                  >
                    Target date
                  </div>
                  <div
                    className="px-2 py-2 text-text-tertiary"
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.01em',
                      lineHeight: '16px',
                    }}
                  >
                    Status
                  </div>
                  <div className="px-2 py-2"></div>
                </div>

                {filteredProjects.map((project) => {
                  const statusIndicator = getStatusIndicator(project);
                  const StatusIcon = statusIndicator.icon;

                  return (
                    <button
                      key={project._id}
                      onClick={() => navigate(`/projects/${project.identifier}`)}
                      className="w-full border-b border-border"
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          '[indent] 18px [title] minmax(350px, 2fr) [health] 50px [priority] 68px [lead] 48px [startDate] minmax(76px, auto) [targetDate] minmax(76px, auto) [status] 28px [end-padding] 12px',
                        columnGap: '6px',
                        fontFamily:
                          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        transition: 'background-color 0.1s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          'var(--background-hover, rgba(255, 255, 255, 0.03))';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div
                        className="px-2"
                        style={{ paddingTop: '8px', paddingBottom: '8px' }}
                      ></div>

                      <div
                        className="px-2 flex items-center gap-2 min-w-0"
                        style={{ paddingTop: '8px', paddingBottom: '8px' }}
                      >
                        <div
                          className="rounded-md bg-background-secondary border border-border flex items-center justify-center text-text-secondary flex-shrink-0"
                          style={{ width: '20px', height: '20px' }}
                        >
                          {project.icon ? (
                            <span style={{ fontSize: '12px' }}>{project.icon}</span>
                          ) : (
                            <FolderKanban className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <span
                          className="text-text-primary truncate"
                          style={{
                            fontSize: '13px',
                            fontWeight: 400,
                            lineHeight: '20px',
                          }}
                        >
                          {project.name}
                        </span>
                      </div>

                      <div
                        className="px-2 flex items-center"
                        style={{ paddingTop: '8px', paddingBottom: '8px' }}
                      >
                        {StatusIcon ? (
                          <StatusIcon
                            className={`${statusIndicator.color}`}
                            style={{ width: '16px', height: '16px' }}
                            title={statusIndicator.label}
                          />
                        ) : (
                          <span
                            className="text-text-tertiary"
                            style={{ fontSize: '13px', lineHeight: '20px' }}
                          >
                            -
                          </span>
                        )}
                      </div>

                      <div
                        className="px-2 flex items-center"
                        style={{ paddingTop: '8px', paddingBottom: '8px' }}
                      >
                        {project.priority && project.priority !== 'no_priority' ? (
                          <div className="flex items-center">
                            {(() => {
                              const { Icon, label } = getPriorityMeta(project.priority);
                              const PriorityIcon = Icon;
                              const colorClass = getPriorityColor(project.priority);
                              return (
                                <PriorityIcon
                                  className={colorClass}
                                  style={{ width: '14px', height: '14px' }}
                                  title={label}
                                />
                              );
                            })()}
                          </div>
                        ) : (
                          <span
                            className="text-text-tertiary"
                            style={{ fontSize: '13px', lineHeight: '20px' }}
                          >
                            -
                          </span>
                        )}
                      </div>

                      <div
                        className="px-2 flex items-center"
                        style={{ paddingTop: '8px', paddingBottom: '8px' }}
                      >
                        {project.creator ? (
                          <div
                            className={`${getAvatarColor(
                              typeof project.creator === 'object' && project.creator._id
                                ? project.creator._id
                                : project.creator
                            )} rounded-full flex items-center justify-center text-white`}
                            style={{
                              width: '20px',
                              height: '20px',
                              fontSize: '11px',
                              fontWeight: 500,
                            }}
                            title={
                              typeof project.creator === 'object' && project.creator.name
                                ? project.creator.name
                                : 'Creator'
                            }
                          >
                            {typeof project.creator === 'object' && project.creator.name
                              ? project.creator.name.charAt(0).toUpperCase()
                              : 'C'}
                          </div>
                        ) : (
                          <span
                            className="text-text-tertiary"
                            style={{ fontSize: '13px', lineHeight: '20px' }}
                          >
                            -
                          </span>
                        )}
                      </div>

                      <div
                        className="px-2 flex items-center"
                        style={{ paddingTop: '8px', paddingBottom: '8px' }}
                      >
                        <span
                          className="text-text-secondary"
                          style={{
                            fontSize: '13px',
                            fontWeight: 400,
                            lineHeight: '20px',
                          }}
                        >
                          {formatDate(project.startDate)}
                        </span>
                      </div>

                      <div
                        className="px-2 flex items-center"
                        style={{ paddingTop: '8px', paddingBottom: '8px' }}
                      >
                        <span
                          className="text-text-secondary"
                          style={{
                            fontSize: '13px',
                            fontWeight: 400,
                            lineHeight: '20px',
                          }}
                        >
                          {formatDate(project.targetDate)}
                        </span>
                      </div>

                      <div
                        className="px-2 flex items-center"
                        style={{ paddingTop: '8px', paddingBottom: '8px' }}
                      >
                        {(() => {
                          const statusIcon = getStatusIcon(project.status);
                          const StatusIconComponent = statusIcon.Icon;
                          return (
                            <StatusIconComponent
                              className={statusIcon.color}
                              style={{ width: '16px', height: '16px' }}
                              title={
                                project.status.charAt(0).toUpperCase() + project.status.slice(1)
                              }
                            />
                          );
                        })()}
                      </div>

                      <div
                        className="px-2"
                        style={{ paddingTop: '8px', paddingBottom: '8px' }}
                      ></div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        teams={teams}
        initialProject={editingProject}
        selectedTeam={selectedTeam}
        onSuccess={handleModalSuccess}
      />
    </>
  );
};

export default ProjectsPage;
