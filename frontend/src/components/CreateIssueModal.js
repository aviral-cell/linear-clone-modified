import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from '../icons';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import IssueProperties from './IssueProperties';
import {
  Button,
  DropdownMenu,
  DropdownMenuItem,
  FieldTrigger,
  IconButton,
  Input,
  TeamDisplay,
  Textarea,
} from './ui';

const CreateIssueModal = ({
  isOpen,
  onClose,
  team,
  project,
  onSuccess,
  initialStatus = 'backlog',
  teams: teamsProp = [],
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(initialStatus || 'backlog');
  const [priority, setPriority] = useState('no_priority');
  const [assignee, setAssignee] = useState('');
  const [projectId, setProjectId] = useState('');
  const [parent, setParent] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [parentIssues, setParentIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState(teamsProp);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [showTeamMenu, setShowTeamMenu] = useState(false);
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
      fetchParentIssues(teamId);
      if (project?._id) {
        setProjectId(project._id);
      }
    } else if (teams.length > 0) {
      const firstTeamId = teams[0]._id;
      setSelectedTeamId(firstTeamId);
      fetchProjects(firstTeamId);
      fetchParentIssues(firstTeamId);
    }
  }, [isOpen, team?._id, project?._id, project?.team?._id, initialStatus, teams]);

  const fetchTeams = async () => {
    try {
      const data = await api.teams.getAll();
      setTeams(data.teams || []);
      if (data.teams && data.teams.length > 0 && !selectedTeamId) {
        setSelectedTeamId(data.teams[0]._id);
        fetchProjects(data.teams[0]._id);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.users.getAll();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProjects = async (teamId) => {
    try {
      const data = await api.projects.getByTeam(teamId);
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchParentIssues = async (teamId) => {
    try {
      const data = await api.issues.getByTeam(teamId);
      setParentIssues(data.issues || []);
    } catch (error) {
      console.error('Error fetching parent issues:', error);
    }
  };

  const handleTeamSelect = (teamId) => {
    setSelectedTeamId(teamId);
    setShowTeamMenu(false);
    fetchProjects(teamId);
    fetchParentIssues(teamId);
    setProjectId('');
    setParent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedTeamId) return;

    setLoading(true);
    try {
      await api.issues.create({
        title,
        description,
        teamId: selectedTeamId,
        projectId: projectId || undefined,
        status,
        priority,
        assignee: assignee || undefined,
        parent: parent || undefined,
      });

      setTitle('');
      setDescription('');
      setStatus('backlog');
      setPriority('no_priority');
      setAssignee('');
      setProjectId('');
      setParent(null);
      onSuccess();
      onClose();
    } catch (error) {
      if (error.status !== 401) {
        toast.error(error.message || 'Failed to create issue');
      }
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
    parent: parent ? parentIssues.find((i) => i._id === parent) : null,
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
    if (updates.parent !== undefined) {
      setParent(updates.parent || null);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel-secondary" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header modal-header-secondary">
          <div className="flex items-center gap-2 relative">
            {selectedTeamObj ? (
              <>
                <DropdownMenu
                  open={showTeamMenu}
                  onOpenChange={setShowTeamMenu}
                  minWidth="min-w-dropdown-lg"
                  trigger={
                    <FieldTrigger
                      className={`border-transparent bg-transparent px-0 py-0 text-sm text-text-secondary hover:opacity-80 hover:bg-transparent ${showTeamMenu ? '!border-accent' : ''}`}
                      onClick={() => setShowTeamMenu((prev) => !prev)}
                    >
                      <TeamDisplay team={selectedTeamObj} size="md" label={selectedTeamObj.key} />
                      <ChevronDown className="w-4 h-4 text-text-tertiary" />
                    </FieldTrigger>
                  }
                >
                  {teams.map((teamItem) => (
                    <DropdownMenuItem
                      key={teamItem._id}
                      onClick={() => handleTeamSelect(teamItem._id)}
                      selected={selectedTeamObj._id === teamItem._id}
                      className="flex items-center gap-2"
                    >
                      <TeamDisplay team={teamItem} size="md" label={teamItem.name} />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenu>
                <span className="text-text-tertiary">›</span>
                <span className="text-sm text-text-primary font-medium">New Issue</span>
              </>
            ) : (
              <span className="text-sm text-text-primary font-medium">New Issue</span>
            )}
          </div>
          <IconButton size="md" aria-label="Close" onClick={onClose}>
            <X className="h-5 w-5" />
          </IconButton>
        </div>

        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="px-6 pt-1 pb-4 space-y-4">
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Issue title"
              variant="transparent"
              className="text-lg"
              required
              autoFocus
            />

            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description..."
              rows={2}
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
                showParent={true}
                parentIssues={parentIssues}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="text-text-secondary hover:text-text-primary"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading || !title.trim() || !selectedTeamId}
              >
                {loading ? 'Creating...' : 'Create issue'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateIssueModal;
