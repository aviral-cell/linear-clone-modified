import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  CircleDashed,
  Minus,
  User,
  Users,
  CalendarCheck2,
  CalendarClock,
  FolderKanban,
  AlertCircle,
  BarChart2,
  BarChart3,
  BarChart4,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/ProjectModal.css';
import { baseURL } from '../utils';
import { useAuth } from '../context/AuthContext';
import { getTeamIconDisplay } from '../utils/teamIcons';
import { getAvatarColor } from '../utils';
import ProjectProperties from './ProjectProperties';

const statusOptions = [
  { value: 'backlog', label: 'Backlog', icon: CircleDashed, color: 'text-orange-500' },
  { value: 'planned', label: 'Planned', icon: FolderKanban, color: 'text-text-tertiary' },
  { value: 'in_progress', label: 'In Progress', icon: CircleDashed, color: 'text-green-500' },
  { value: 'completed', label: 'Completed', icon: FolderKanban, color: 'text-accent' },
  { value: 'cancelled', label: 'Cancelled', icon: X, color: 'text-text-tertiary' },
];

const priorityOptions = [
  { value: 'no_priority', label: 'No priority', icon: Minus, color: 'text-text-tertiary' },
  { value: 'urgent', label: 'Urgent', icon: AlertCircle, color: 'text-red-500' },
  { value: 'high', label: 'High', icon: BarChart4, color: 'text-orange-500' },
  { value: 'medium', label: 'Medium', icon: BarChart3, color: 'text-yellow-500' },
  { value: 'low', label: 'Low', icon: BarChart2, color: 'text-text-tertiary' },
];

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
  const teamMenuRef = useRef(null);
  const teamHeaderRef = useRef(null);

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

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTeamMenu]);

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
  const selectedStatus = statusOptions.find((s) => s.value === status);
  const selectedPriorityObj = priorityOptions.find((p) => p.value === priority);
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
                <span className="text-sm text-text-primary font-medium">
                  {initialProject ? 'Edit project' : 'New project'}
                </span>
                {showTeamMenu && (
                  <div ref={teamMenuRef} className="dropdown-panel dropdown-panel-wide">
                    {teams.map((team) => {
                      const { IconComponent, colorClass, icon } = getTeamIconDisplay(team);
                      return (
                        <button
                          key={team._id}
                          type="button"
                          onClick={() => handleTeamSelect(team._id)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-background-tertiary transition-colors flex items-center gap-2 ${
                            selectedTeamObj._id === team._id
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
                          <span>{team.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <span className="text-sm text-text-primary font-medium">
                {initialProject ? 'Edit project' : 'New project'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-icon"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="flex-1 px-6 py-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="icon-badge icon-badge-lg bg-background-secondary border border-border text-text-tertiary">
                <FolderKanban className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-2xl font-semibold bg-transparent border-none text-text-primary focus:outline-none placeholder:text-text-tertiary"
                  placeholder="Project name"
                  required
                  autoFocus
                />
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full mt-2 text-sm bg-transparent border-none text-text-secondary focus:outline-none resize-none placeholder:text-text-tertiary min-h-[24px]"
                  placeholder="Add a short summary..."
                  rows={1}
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
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full px-0 py-2 bg-transparent border-none text-text-primary text-sm focus:outline-none resize-none placeholder:text-text-tertiary"
                placeholder="Write a description, a project brief, or collect ideas..."
              />
            </div>
          </div>

          <div className="modal-footer modal-footer-primary">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary-header text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !teamId}
              className="btn-primary"
            >
              {loading
                ? initialProject
                  ? 'Saving...'
                  : 'Creating...'
                : initialProject
                  ? 'Save changes'
                  : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
