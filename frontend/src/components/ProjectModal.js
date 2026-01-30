import React, { useEffect, useState } from 'react';
import { X, ChevronDown, FolderKanban } from '../icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/ProjectModal.css';
import { baseURL } from '../utils';
import { useAuth } from '../context/AuthContext';
import { getTeamIconDisplay } from '../utils/teamIcons';
import { getAvatarColor } from '../utils';
import ProjectProperties from './ProjectProperties';
import {
  Button,
  DropdownMenu,
  DropdownMenuItem,
  FieldTrigger,
  IconBadge,
  IconButton,
  Input,
  Textarea,
} from './ui';

const ProjectModal = ({ isOpen, onClose, teams, initialProject, onSuccess, selectedTeam }) => {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState('backlog');
  const [priority, setPriority] = useState('no_priority');
  const [teamId, setTeamId] = useState('');
  const [creatorId, setCreatorId] = useState('');
  const [leadId, setLeadId] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [targetDate, setTargetDate] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showTeamMenu, setShowTeamMenu] = useState(false);
  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      try {
        const response = await fetch(`${baseURL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [isOpen, token]);

  useEffect(() => {
    if (initialProject) {
      setName(initialProject.name || '');
      setDescription(initialProject.description || '');
      setSummary(initialProject.summary || '');
      setStatus(initialProject.status || 'backlog');
      setPriority(initialProject.priority || 'no_priority');
      setTeamId(initialProject.team?._id || '');
      setCreatorId(initialProject.creator?._id || '');
      setLeadId(initialProject.lead?._id || '');
      const loadedStartDate = initialProject.startDate ? new Date(initialProject.startDate) : null;
      const loadedTargetDate = initialProject.targetDate
        ? new Date(initialProject.targetDate)
        : null;
      setStartDate(loadedStartDate);
      setTargetDate(loadedTargetDate);
    } else if (isOpen) {
      setName('');
      setDescription('');
      setSummary('');
      setStatus('backlog');
      setPriority('no_priority');
      setTeamId(selectedTeam?._id || teams[0]?._id || '');
      setCreatorId('');
      setLeadId('');
      setStartDate(null);
      setTargetDate(null);
      setSelectedMembers([]);
    }
  }, [initialProject, isOpen, teams, selectedTeam]);

  if (!isOpen) return null;

  const selectedTeamObj = teams.find((t) => t._id === teamId) || selectedTeam;
  const selectedCreator = users.find((u) => u._id === creatorId);
  const selectedLead = users.find((u) => u._id === leadId);

  const tempProject = {
    status,
    priority,
    creator: selectedCreator || null,
    lead: selectedLead || null,
    startDate: startDate ? startDate.toISOString() : null,
    targetDate: targetDate ? targetDate.toISOString() : null,
    team: selectedTeamObj || null,
  };

  const handlePropertyUpdate = (updates) => {
    if (updates.status !== undefined) setStatus(updates.status);
    if (updates.priority !== undefined) setPriority(updates.priority);
    if (updates.creatorId !== undefined) {
      setCreatorId(updates.creatorId || '');
    }
    if (updates.leadId !== undefined) {
      setLeadId(updates.leadId || '');
    }
    if (updates.startDate !== undefined) {
      setStartDate(
        updates.startDate && updates.startDate !== '' ? new Date(updates.startDate) : null
      );
    }
    if (updates.targetDate !== undefined) {
      setTargetDate(
        updates.targetDate && updates.targetDate !== '' ? new Date(updates.targetDate) : null
      );
    }
    if (updates.teamId !== undefined) {
      setTeamId(updates.teamId || '');
    }
  };

  const handleTeamSelect = (teamId) => {
    setTeamId(teamId);
    setShowTeamMenu(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !teamId) return;

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description,
        summary: summary.trim() || undefined,
        status,
        priority,
        teamId,
        creatorId: creatorId || undefined,
        leadId: leadId || undefined,
        startDate: startDate ? startDate.toISOString() : undefined,
        targetDate: targetDate ? targetDate.toISOString() : undefined,
      };

      const method = initialProject ? 'PUT' : 'POST';
      const url = initialProject
        ? `${baseURL}/api/projects/${initialProject.identifier}`
        : `${baseURL}/api/projects`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header modal-header-primary">
          <div className="flex items-center gap-2 relative">
            {selectedTeamObj ? (
              <>
                <DropdownMenu
                  open={showTeamMenu}
                  onOpenChange={setShowTeamMenu}
                  minWidth="min-w-dropdown-lg"
                  trigger={
                    <FieldTrigger
                      className="border-transparent bg-transparent px-0 py-0 text-sm text-text-secondary hover:opacity-80 hover:bg-transparent"
                      onClick={() => setShowTeamMenu((prev) => !prev)}
                    >
                      {(() => {
                        const { IconComponent, colorClass, icon } = getTeamIconDisplay(selectedTeamObj);
                        return (
                          <IconBadge size="md" className={colorClass}>
                            {IconComponent ? (
                              <IconComponent className="w-3 h-3" />
                            ) : (
                              <span className="text-xs">{icon}</span>
                            )}
                          </IconBadge>
                        );
                      })()}
                      <span>{selectedTeamObj.key}</span>
                      <ChevronDown className="w-4 h-4 text-text-tertiary" />
                    </FieldTrigger>
                  }
                >
                  {teams.map((team) => {
                    const { IconComponent, colorClass, icon } = getTeamIconDisplay(team);
                    return (
                      <DropdownMenuItem
                        key={team._id}
                        onClick={() => handleTeamSelect(team._id)}
                        selected={selectedTeamObj._id === team._id}
                        className="flex items-center gap-2"
                      >
                        <IconBadge size="md" className={colorClass}>
                          {IconComponent ? (
                            <IconComponent className="w-3 h-3" />
                          ) : (
                            <span className="text-xs">{icon}</span>
                          )}
                        </IconBadge>
                        <span>{team.name}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenu>
                <span className="text-text-tertiary">›</span>
                <span className="text-sm text-text-primary font-medium">
                  {initialProject ? 'Edit project' : 'New project'}
                </span>
              </>
            ) : (
              <span className="text-sm text-text-primary font-medium">
                {initialProject ? 'Edit project' : 'New project'}
              </span>
            )}
          </div>
          <IconButton size="md" aria-label="Close" onClick={onClose}>
            <X className="h-5 w-5" />
          </IconButton>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col pt-1">
          <div className="flex-1 px-6 py-6 space-y-6">
            <div className="flex items-start gap-4">
              <IconBadge
                size="lg"
                className="bg-background-secondary border border-border text-text-tertiary"
              >
                <FolderKanban className="w-6 h-6" />
              </IconBadge>
              <div className="flex-1">
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  variant="transparent"
                  className="text-2xl font-semibold border-none"
                  placeholder="Project name"
                  required
                  autoFocus
                />
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="mt-2 border-none text-text-secondary min-h-[24px]"
                  placeholder="Add a short summary..."
                  rows={1}
                  size="sm"
                />
              </div>
            </div>

            <ProjectProperties
              project={tempProject}
              users={users}
              teams={teams}
              onUpdate={handlePropertyUpdate}
              disabled={loading}
              variant="horizontal"
              showTeam={false}
              showStartDate={true}
              showTargetDate={true}
              showStatus={true}
              showPriority={true}
              showLead={true}
              showMembers={true}
              selectedMembers={selectedMembers}
              onMembersChange={setSelectedMembers}
            />

            <div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="px-0 py-2 border-none"
                placeholder="Write a description, a project brief, or collect ideas..."
                size="sm"
              />
            </div>
          </div>

          <div className="modal-footer modal-footer-primary">
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
              disabled={loading || !name.trim() || !teamId}
            >
              {loading
                ? initialProject
                  ? 'Saving...'
                  : 'Creating...'
                : initialProject
                  ? 'Save changes'
                  : 'Create project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
