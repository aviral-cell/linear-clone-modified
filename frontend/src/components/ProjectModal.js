import { useEffect, useState } from 'react';
import { X, ChevronDown, FolderKanban } from '../icons';
import { api } from '../services/api';
import ProjectProperties from './ProjectProperties';
import {
  Button,
  DropdownMenu,
  DropdownMenuItem,
  FieldTrigger,
  IconBadge,
  IconButton,
  Input,
  TeamDisplay,
  Textarea,
} from './ui';

const ProjectModal = ({ isOpen, onClose, teams, initialProject, onSuccess, selectedTeam }) => {
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
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showTeamMenu, setShowTeamMenu] = useState(false);

  useEffect(() => {
    if (!teamId) {
      setTeamMembers([]);
      return;
    }
    const fetchTeamMembers = async () => {
      try {
        const data = await api.teams.getMembers(teamId);
        setTeamMembers(data.members);
      } catch (error) {
        console.error('Error fetching team members:', error);
        setTeamMembers([]);
      }
    };
    fetchTeamMembers();
  }, [teamId]);

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
  const selectedCreator = teamMembers.find((u) => u._id === creatorId);
  const selectedLead = teamMembers.find((u) => u._id === leadId);

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

  const handleTeamSelect = (newTeamId) => {
    setTeamId(newTeamId);
    setLeadId('');
    setSelectedMembers([]);
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
        memberIds: selectedMembers.length > 0 ? selectedMembers : undefined,
        startDate: startDate ? startDate.toISOString() : undefined,
        targetDate: targetDate ? targetDate.toISOString() : undefined,
      };

      if (initialProject) {
        await api.projects.update(initialProject.identifier, payload);
      } else {
        await api.post('/api/projects', payload);
      }

      if (onSuccess) onSuccess();
      onClose();
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
                      className={`border-transparent bg-transparent px-0 py-0 text-sm text-text-secondary hover:opacity-80 hover:bg-transparent ${showTeamMenu ? '!border-accent' : ''}`}
                      onClick={() => setShowTeamMenu((prev) => !prev)}
                    >
                      <TeamDisplay team={selectedTeamObj} size="md" label={selectedTeamObj.key} />
                      <ChevronDown className="w-4 h-4 text-text-tertiary" />
                    </FieldTrigger>
                  }
                >
                  {teams.map((team) => (
                    <DropdownMenuItem
                      key={team._id}
                      onClick={() => handleTeamSelect(team._id)}
                      selected={selectedTeamObj._id === team._id}
                      className="flex items-center gap-2"
                    >
                      <TeamDisplay team={team} size="md" label={team.name} />
                    </DropdownMenuItem>
                  ))}
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
              users={teamMembers}
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
