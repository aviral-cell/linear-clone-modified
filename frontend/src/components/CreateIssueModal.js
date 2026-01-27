import React, { useState } from 'react';
import { X } from 'lucide-react';
import { baseURL } from '../utils';
import { getTeamIconDisplay } from '../utils/teamIcons';
import IssueProperties from './IssueProperties';

const CreateIssueModal = ({ isOpen, onClose, team, project, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('no_priority');
  const [assignee, setAssignee] = useState('');
  const [projectId, setProjectId] = useState('');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      fetchUsers();
      const teamId = team?._id || project?.team?._id;
      if (teamId) {
        fetchProjects(teamId);
        if (project?._id) {
          setProjectId(project._id);
        }
      }
    }
  }, [isOpen, team, project]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${baseURL}/api/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
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
          Authorization: `Bearer ${localStorage.getItem('token')}`,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title,
          description,
          teamId: team?._id || project?.team?._id,
          projectId: projectId || undefined,
          status,
          priority,
          assignee: assignee || undefined,
        }),
      });

      if (response.ok) {
        setTitle('');
        setDescription('');
        setStatus('todo');
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
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-background-secondary border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-background-secondary px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="px-2 py-1 bg-background-tertiary rounded flex items-center gap-2 text-md">
              {(() => {
                const displayTeam = team || project?.team;
                if (!displayTeam) return null;
                const { IconComponent, icon } = getTeamIconDisplay(displayTeam);
                return (
                  <>
                    <div className="w-6 h-6 flex items-center justify-center text-text-secondary flex-shrink-0">
                      {IconComponent ? (
                        <IconComponent className="w-4 h-4" />
                      ) : (
                        <span className="text-sm">{icon}</span>
                      )}
                    </div>
                    <span className="text-text-secondary">{displayTeam.key}</span>
                  </>
                );
              })()}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
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
              className="w-full bg-transparent text-text-primary text-lg placeholder-text-tertiary focus:outline-none"
              required
              autoFocus
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description..."
              rows={2}
              className="w-full bg-transparent text-text-primary placeholder-text-tertiary focus:outline-none resize-none"
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
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
