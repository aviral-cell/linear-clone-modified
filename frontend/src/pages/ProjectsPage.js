import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { baseURL, getAvatarColor } from '../utils';
import { getTeamIconDisplay } from '../utils/teamIcons';
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

const TABLE_GRID_CLASS = (showTeam) =>
  showTeam
    ? 'grid-cols-[18px_minmax(350px,2fr)_minmax(120px,auto)_50px_68px_48px_minmax(76px,auto)_minmax(76px,auto)_28px_12px]'
    : 'grid-cols-[18px_minmax(350px,2fr)_50px_68px_48px_minmax(76px,auto)_minmax(76px,auto)_28px_12px]';

const getStatusIndicator = (project) => {
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
};

const getPriorityColor = (priority) => {
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
};

const getPriorityMeta = (priority) => {
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
};

const getStatusIcon = (status) => {
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
};

const formatDate = (date) => {
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
};

const ProjectRow = React.memo(({ project, onClick, showTeam = false }) => {
  const statusIndicator = getStatusIndicator(project);
  const StatusIcon = statusIndicator.icon;
  const priorityMeta = getPriorityMeta(project.priority);
  const PriorityIcon = priorityMeta.Icon;
  const priorityColorClass = getPriorityColor(project.priority);
  const statusIcon = getStatusIcon(project.status);
  const StatusIconComponent = statusIcon.Icon;

  return (
    <button
      type="button"
      role="row"
      onClick={() => onClick(project)}
      className={`w-full grid gap-x-1.5 font-sans border-b border-border hover:bg-background-secondary/40 transition-colors ${TABLE_GRID_CLASS(showTeam)}`}
    >
      <div role="gridcell" className="py-2 px-2 pr-4 md:pr-6"></div>

      <div role="gridcell" className="py-2 px-2 flex items-center gap-2 min-w-0">
        <div className="w-5 h-5 rounded-md bg-background-secondary border border-border flex items-center justify-center text-text-secondary flex-shrink-0">
          {project.icon ? (
            <span className="text-xs">{project.icon}</span>
          ) : (
            <FolderKanban className="w-3.5 h-3.5" />
          )}
        </div>
        <span className="table-cell-text text-text-primary truncate">{project.name}</span>
      </div>

      {showTeam && (
        <div role="gridcell" className="py-2 px-2 flex items-center min-w-0">
          {project.team ? (
            <div className="flex items-center gap-1.5 min-w-0">
              {typeof project.team === 'object'
                ? (() => {
                    const { IconComponent, colorClass, icon } = getTeamIconDisplay(project.team);
                    return (
                      <div
                        className={`icon-badge icon-badge-md ${colorClass}`}
                        title={project.team.name || 'Team'}
                      >
                        {IconComponent ? (
                          <IconComponent className="w-3 h-3" />
                        ) : (
                          <span className="text-xs">{icon}</span>
                        )}
                      </div>
                    );
                  })()
                : null}
              <span
                className="table-cell-text text-text-secondary truncate"
                title={
                  typeof project.team === 'object' && project.team.name ? project.team.name : 'Team'
                }
              >
                {typeof project.team === 'object' && project.team.name
                  ? project.team.name
                  : typeof project.team === 'object' && project.team.key
                    ? project.team.key
                    : '-'}
              </span>
            </div>
          ) : (
            <span className="table-cell-text text-text-tertiary">-</span>
          )}
        </div>
      )}

      <div role="gridcell" className="py-2 px-2 flex items-center">
        {StatusIcon ? (
          <StatusIcon
            className={`w-4 h-4 ${statusIndicator.color}`}
            title={statusIndicator.label}
          />
        ) : (
          <span className="table-cell-text text-text-tertiary">-</span>
        )}
      </div>

      <div role="gridcell" className="py-2 px-2 flex items-center">
        {project.priority && project.priority !== 'no_priority' ? (
          <div className="flex items-center">
            <PriorityIcon
              className={`w-3.5 h-3.5 ${priorityColorClass}`}
              title={priorityMeta.label}
            />
          </div>
        ) : (
          <span className="table-cell-text text-text-tertiary">-</span>
        )}
      </div>

      <div role="gridcell" className="py-2 px-2 flex items-center">
        {project.creator ? (
          <div
            className={`w-5 h-5 text-[11px] font-medium ${getAvatarColor(
              typeof project.creator === 'object' && project.creator._id
                ? project.creator._id
                : project.creator
            )} rounded-full flex items-center justify-center text-white`}
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
          <span className="table-cell-text text-text-tertiary">-</span>
        )}
      </div>

      <div role="gridcell" className="py-2 px-2 flex items-center">
        <span className="table-cell-text text-text-secondary">{formatDate(project.startDate)}</span>
      </div>

      <div role="gridcell" className="py-2 px-2 flex items-center">
        <span className="table-cell-text text-text-secondary">{formatDate(project.targetDate)}</span>
      </div>

      <div role="gridcell" className="py-2 px-2 flex items-center">
        <StatusIconComponent
          className={`w-4 h-4 ${statusIcon.color}`}
          title={project.status.charAt(0).toUpperCase() + project.status.slice(1)}
        />
      </div>

      <div role="gridcell" className="py-2 px-2"></div>
    </button>
  );
});

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

  const handleRowClick = useCallback(
    (project) => {
      navigate(`/projects/${project.identifier}`);
    },
    [navigate]
  );

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
              <button className="btn-secondary-header flex-shrink-0 bg-background-tertiary text-text-primary border-accent">
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
              <div className="empty-state">
                No projects match your filters. Create a new project to get started.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto font-sans" role="grid" aria-label="Projects">
              <div className="min-w-full">
                <div
                  role="row"
                  className={`sticky top-0 z-10 grid gap-x-1.5 font-sans bg-background border-b border-border ${TABLE_GRID_CLASS(teamFilter === 'all')}`}
                >
                  <div role="columnheader" className="table-header-text px-2 py-2 pr-4 md:pr-6 text-text-tertiary" aria-label=""></div>
                  <div role="columnheader" className="table-header-text px-2 py-2 text-text-tertiary" aria-label="Name">Name</div>
                  {teamFilter === 'all' && (
                    <div role="columnheader" className="table-header-text px-2 py-2 text-text-tertiary" aria-label="Team">Team</div>
                  )}
                  <div role="columnheader" className="table-header-text px-2 py-2 text-text-tertiary" aria-label="Health">Health</div>
                  <div role="columnheader" className="table-header-text px-2 py-2 text-text-tertiary" aria-label="Priority">Priority</div>
                  <div role="columnheader" className="table-header-text px-2 py-2 text-text-tertiary" aria-label="Lead">Lead</div>
                  <div role="columnheader" className="table-header-text px-2 py-2 text-text-tertiary" aria-label="Start date">Start date</div>
                  <div role="columnheader" className="table-header-text px-2 py-2 text-text-tertiary" aria-label="Target date">Target date</div>
                  <div role="columnheader" className="table-header-text px-2 py-2 text-text-tertiary" aria-label="Status">Status</div>
                  <div role="columnheader" className="px-2 py-2" aria-label=""></div>
                </div>

                {filteredProjects.map((project) => (
                  <ProjectRow
                    key={project._id}
                    project={project}
                    onClick={handleRowClick}
                    showTeam={teamFilter === 'all'}
                  />
                ))}
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
