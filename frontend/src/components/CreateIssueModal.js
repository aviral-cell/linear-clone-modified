import React, { useState } from 'react';
import {
  X,
  Circle,
  CircleDashed,
  CircleDot,
  AlertCircle,
  Minus,
  BarChart2,
  BarChart3,
  BarChart4,
} from 'lucide-react';
import { getAvatarColor, baseURL } from '../utils';
import { getTeamIconDisplay } from '../utils/teamIcons';

const statusOptions = [
  {
    value: 'backlog',
    label: 'Backlog',
    Icon: CircleDashed,
    color: 'text-text-tertiary',
  },
  { value: 'todo', label: 'Todo', Icon: Circle, color: 'text-text-secondary' },
  {
    value: 'in_progress',
    label: 'In Progress',
    Icon: CircleDot,
    color: 'text-yellow-500',
  },
  {
    value: 'in_review',
    label: 'In Review',
    Icon: CircleDot,
    color: 'text-green-500',
  },
];

const priorityOptions = [
  {
    value: 'no_priority',
    label: 'No priority',
    Icon: Minus,
    color: 'text-text-tertiary',
  },
  {
    value: 'urgent',
    label: 'Urgent',
    Icon: AlertCircle,
    color: 'text-red-500',
  },
  { value: 'high', label: 'High', Icon: BarChart4, color: 'text-orange-500' },
  {
    value: 'medium',
    label: 'Medium',
    Icon: BarChart3,
    color: 'text-yellow-500',
  },
  { value: 'low', label: 'Low', Icon: BarChart2, color: 'text-text-tertiary' },
];

const CreateIssueModal = ({ isOpen, onClose, team, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('no_priority');
  const [assignee, setAssignee] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const statusButtonRef = React.useRef(null);
  const priorityButtonRef = React.useRef(null);
  const assigneeButtonRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      const isOutsideStatus = !target.closest('[data-dropdown="status"]');
      const isOutsidePriority = !target.closest('[data-dropdown="priority"]');
      const isOutsideAssignee = !target.closest('[data-dropdown="assignee"]');

      if (isOutsideStatus && isOutsidePriority && isOutsideAssignee) {
        setShowStatusDropdown(false);
        setShowPriorityDropdown(false);
        setShowAssigneeDropdown(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  React.useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

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
          teamId: team._id,
          status,
          priority,
          assignee: assignee || null,
        }),
      });

      if (response.ok) {
        setTitle('');
        setDescription('');
        setStatus('backlog');
        setPriority('no_priority');
        setAssignee('');
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

  const selectedStatus = statusOptions.find((s) => s.value === status);
  const selectedPriority = priorityOptions.find((p) => p.value === priority);
  const selectedUser = users.find((u) => u._id === assignee);

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
                const { IconComponent, icon } = getTeamIconDisplay(team);
                return (
                  <div className="w-6 h-6 flex items-center justify-center text-text-secondary flex-shrink-0">
                    {IconComponent ? (
                      <IconComponent className="w-4 h-4" />
                    ) : (
                      <span className="text-sm">{icon}</span>
                    )}
                  </div>
                );
              })()}
              <span className="text-text-secondary">{team.key}</span>
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

            <div className="flex items-center flex-wrap gap-3 pt-4">
              <div className="relative" data-dropdown="status">
                <button
                  ref={statusButtonRef}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (statusButtonRef.current) {
                      const rect = statusButtonRef.current.getBoundingClientRect();
                      setDropdownPosition({
                        top: rect.bottom + 8,
                        left: rect.left,
                      });
                    }
                    setShowStatusDropdown(!showStatusDropdown);
                    setShowPriorityDropdown(false);
                    setShowAssigneeDropdown(false);
                  }}
                  className="px-3 py-1.5 bg-background-tertiary hover:bg-background-hover border border-border rounded-md flex items-center gap-2 text-sm transition-colors"
                >
                  <selectedStatus.Icon className={`w-4 h-4 ${selectedStatus.color}`} />
                  <span className="text-text-primary">{selectedStatus.label}</span>
                </button>
                {showStatusDropdown && (
                  <div
                    className="fixed bg-background-tertiary border border-border rounded-md shadow-xl z-[100] min-w-[160px]"
                    style={{
                      top: `${dropdownPosition.top}px`,
                      left: `${dropdownPosition.left}px`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatus(option.value);
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 hover:bg-background-hover flex items-center gap-3 text-sm transition-colors ${
                          status === option.value ? 'bg-background-hover' : ''
                        }`}
                      >
                        <option.Icon className={`w-4 h-4 ${option.color}`} />
                        <span className="text-text-primary">{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" data-dropdown="priority">
                <button
                  ref={priorityButtonRef}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (priorityButtonRef.current) {
                      const rect = priorityButtonRef.current.getBoundingClientRect();
                      setDropdownPosition({
                        top: rect.bottom + 8,
                        left: rect.left,
                      });
                    }
                    setShowPriorityDropdown(!showPriorityDropdown);
                    setShowStatusDropdown(false);
                    setShowAssigneeDropdown(false);
                  }}
                  className="px-3 py-1.5 bg-background-tertiary hover:bg-background-hover border border-border rounded-md flex items-center gap-2 text-sm transition-colors"
                >
                  <selectedPriority.Icon className={`w-4 h-4 ${selectedPriority.color}`} />
                  <span className="text-text-primary">{selectedPriority.label}</span>
                </button>
                {showPriorityDropdown && (
                  <div
                    className="fixed bg-background-tertiary border border-border rounded-md shadow-xl z-[100] min-w-[160px]"
                    style={{
                      top: `${dropdownPosition.top}px`,
                      left: `${dropdownPosition.left}px`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {priorityOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPriority(option.value);
                          setShowPriorityDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 hover:bg-background-hover flex items-center gap-3 text-sm transition-colors ${
                          priority === option.value ? 'bg-background-hover' : ''
                        }`}
                      >
                        <option.Icon className={`w-4 h-4 ${option.color}`} />
                        <span className="text-text-primary">{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" data-dropdown="assignee">
                <button
                  ref={assigneeButtonRef}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (assigneeButtonRef.current) {
                      const rect = assigneeButtonRef.current.getBoundingClientRect();
                      setDropdownPosition({
                        top: rect.bottom + 8,
                        left: rect.left,
                      });
                    }
                    setShowAssigneeDropdown(!showAssigneeDropdown);
                    setShowStatusDropdown(false);
                    setShowPriorityDropdown(false);
                  }}
                  className="px-3 py-1.5 bg-background-tertiary hover:bg-background-hover border border-border rounded-md flex items-center gap-2 text-sm transition-colors"
                >
                  {selectedUser ? (
                    <>
                      <div
                        className={`w-5 h-5 ${getAvatarColor(selectedUser._id)} rounded-full flex items-center justify-center text-xs text-white font-medium`}
                      >
                        {selectedUser.name.charAt(0)}
                      </div>
                      <span className="text-text-primary">{selectedUser.name}</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 text-text-primary" />
                      <span className="text-text-primary">Unassigned</span>
                    </>
                  )}
                </button>
                {showAssigneeDropdown && (
                  <div
                    className="fixed bg-background-tertiary border border-border rounded-md shadow-xl z-[100] min-w-[180px] max-h-64 overflow-y-auto"
                    style={{
                      top: `${dropdownPosition.top}px`,
                      left: `${dropdownPosition.left}px`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAssignee('');
                        setShowAssigneeDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 hover:bg-background-hover flex items-center gap-3 text-sm transition-colors ${
                        !assignee ? 'bg-background-hover' : ''
                      }`}
                    >
                      <Circle className="w-4 h-4 text-text-primary" />
                      <span className="text-text-primary">Unassigned</span>
                    </button>
                    {users.map((user) => (
                      <button
                        key={user._id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssignee(user._id);
                          setShowAssigneeDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 hover:bg-background-hover flex items-center gap-3 text-sm transition-colors ${
                          assignee === user._id ? 'bg-background-hover' : ''
                        }`}
                      >
                        <div
                          className={`w-5 h-5 ${getAvatarColor(user._id)} rounded-full flex items-center justify-center text-xs text-white font-medium`}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <span className="text-text-primary">{user.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1" />

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
