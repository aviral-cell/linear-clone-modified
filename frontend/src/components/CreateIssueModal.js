import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { baseURL } from '../utils';
import { getTeamIconDisplay } from '../utils/teamIcons';
import IssueProperties from './IssueProperties';
import { useAuth } from '../context/AuthContext';

const CreateIssueModal = ({
  isOpen,
  onClose,
  team,
  project,
  onSuccess,
  initialStatus = 'backlog',
  teams: teamsProp = [],
}) => {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(initialStatus || 'backlog');
  const [priority, setPriority] = useState('no_priority');
  const [assignee, setAssignee] = useState('');
  const [projectId, setProjectId] = useState('');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState(teamsProp);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [showTeamMenu, setShowTeamMenu] = useState(false);
  const teamMenuRef = useRef(null);
  const teamHeaderRef = useRef(null);

  useEffect(() => {
    if (teamsProp.length > 0) {
      setTeams(teamsProp);
    } else if (isOpen && teams.length === 0) {
      fetchTeams();
    }
  }, [teamsProp, isOpen, teams.length]);

  useEffect(() => {
    if (!isOpen) return;
    setStatus(initialStatus || 'backlog');
    fetchUsers();
    const teamId = team?._id || project?.team?._id;
    if (teamId) {
      setSelectedTeamId(teamId);
      fetchProjects(teamId);
      if (project?._id) {
        setProjectId(project._id);
      }
    } else if (teams.length > 0) {
      const firstTeamId = teams[0]._id;
      setSelectedTeamId(firstTeamId);
      fetchProjects(firstTeamId);
    }
  }, [isOpen, team?._id, project?._id, project?.team?._id, initialStatus, teams]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        teamMenuRef.current &&
        !teamMenuRef.current.contains(event.target) &&
        teamHeaderRef.current &&
        !teamHeaderRef.current.contains(event.target)
      ) {
        setShowTeamMenu(false);
      }
    };
    if (showTeamMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTeamMenu]);

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${baseURL}/api/teams`, {
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
        if (data.teams && data.teams.length > 0 && !selectedTeamId) {
          setSelectedTeamId(data.teams[0]._id);
          fetchProjects(data.teams[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${baseURL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProjects = async (teamId) => {
    try {
      const response = await fetch(`${baseURL}/api/projects?teamId=${teamId}`, {
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleTeamSelect = (teamId) => {
    setSelectedTeamId(teamId);
    setShowTeamMenu(false);
    fetchProjects(teamId);
    setProjectId('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedTeamId) return;

    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title,
          description,
          teamId: selectedTeamId,
          projectId: projectId || undefined,
          status,
          priority,
          assignee: assignee || undefined,
        }),
      });

      if (response.ok) {
        setTitle('');
        setDescription('');
        setStatus('backlog');
        setPriority('no_priority');
        setAssignee('');
        setProjectId('');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error creating issue:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedTeamObj = teams.find((t) => t._id === selectedTeamId) || team || project?.team;

  const tempIssue = {
    status,
    priority,
    assignee: assignee ? users.find((u) => u._id === assignee) : null,
    project: projectId ? projects.find((p) => p._id === projectId) : null,
  };

  const handlePropertyUpdate = (updates) => {
    if (updates.status !== undefined) setStatus(updates.status);
    if (updates.priority !== undefined) setPriority(updates.priority);
    if (updates.assignee !== undefined) {
      setAssignee(updates.assignee || null);
    }
    if (updates.projectId !== undefined) {
      setProjectId(updates.projectId || '');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel-secondary" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header modal-header-secondary">
          <div className="flex items-center gap-2 relative" ref={teamHeaderRef}>
            {selectedTeamObj ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowTeamMenu(!showTeamMenu)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {(() => {
                    const { IconComponent, colorClass, icon } = getTeamIconDisplay(selectedTeamObj);
                    return (
                      <div className={`icon-badge icon-badge-md ${colorClass}`}>
                        {IconComponent ? (
                          <IconComponent className="w-3 h-3" />
                        ) : (
                          <span className="text-xs">{icon}</span>
                        )}
                      </div>
                    );
                  })()}
                  <span className="text-sm text-text-secondary">{selectedTeamObj.key}</span>
                  <ChevronDown className="w-4 h-4 text-text-tertiary" />
                </button>
                <span className="text-text-tertiary">›</span>
                <span className="text-sm text-text-primary font-medium">New Issue</span>
                {showTeamMenu && teams.length > 0 && (
                  <div ref={teamMenuRef} className="dropdown-panel dropdown-panel-wide">
                    {teams.map((teamItem) => {
                      const { IconComponent, colorClass, icon } = getTeamIconDisplay(teamItem);
                      return (
                        <button
                          key={teamItem._id}
                          type="button"
                          onClick={() => handleTeamSelect(teamItem._id)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-background-tertiary transition-colors flex items-center gap-2 ${
                            selectedTeamObj._id === teamItem._id
                              ? 'bg-background-tertiary'
                              : 'text-text-primary'
                          }`}
                        >
                          <div className={`icon-badge icon-badge-md ${colorClass}`}>
                            {IconComponent ? (
                              <IconComponent className="w-3 h-3" />
                            ) : (
                              <span className="text-xs">{icon}</span>
                            )}
                          </div>
                          <span>{teamItem.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <span className="text-sm text-text-primary font-medium">New Issue</span>
            )}
          </div>
          <button type="button" onClick={onClose} className="btn-icon" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="px-6 pb-4 space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Issue title"
              className="input-transparent text-lg"
              required
              autoFocus
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description..."
              rows={2}
              className="textarea-transparent"
            />

            <div className="pt-4">
              <IssueProperties
                issue={tempIssue}
                users={users}
                projects={projects}
                onUpdate={handlePropertyUpdate}
                disabled={loading}
                variant="horizontal"
                showStatus={true}
                showPriority={true}
                showAssignee={true}
                showProject={true}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary-header text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim() || !selectedTeamId}
                className="btn-primary"
              >
                {loading ? 'Creating...' : 'Create issue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateIssueModal;
