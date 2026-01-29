import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Link2,
  Circle,
  CircleDashed,
  CheckCircle2,
  CircleDot,
  XCircle,
  AlertCircle,
  Minus,
  BarChart2,
  BarChart3,
  BarChart4,
} from 'lucide-react';
import { getAvatarColor } from '../utils';
import { getTeamIconDisplay } from '../utils/teamIcons';
import { Avatar, Button } from './ui';
import { cn } from '../utils/cn';

const statusIcons = {
  backlog: { Icon: CircleDashed, color: 'text-text-tertiary' },
  todo: { Icon: Circle, color: 'text-text-secondary' },
  in_progress: { Icon: CircleDot, color: 'text-yellow-500' },
  in_review: { Icon: CircleDot, color: 'text-green-500' },
  done: { Icon: CheckCircle2, color: 'text-accent' },
  cancelled: { Icon: XCircle, color: 'text-text-tertiary' },
  duplicate: { Icon: XCircle, color: 'text-text-tertiary' },
};

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

const SubIssuesSection = ({ issue, subIssues, onCreateSubIssue, token, baseURL, users = [] }) => {
  const [showList, setShowList] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('no_priority');
  const [assignee, setAssignee] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          teamId: issue.team._id,
          status,
          priority,
          assignee: assignee || null,
          parentIssue: issue._id,
        }),
      });

      if (response.ok) {
        setTitle('');
        setDescription('');
        setStatus('todo');
        setPriority('no_priority');
        setAssignee('');
        setShowForm(false);
        onCreateSubIssue();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to create sub-issue');
      }
    } catch (error) {
      console.error('Error creating sub-issue:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedStatus = statusOptions.find((s) => s.value === status);
  const selectedPriority = priorityOptions.find((p) => p.value === priority);
  const selectedUser = users.find((u) => u._id === assignee);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowStatusDropdown(false);
      setShowPriorityDropdown(false);
      setShowAssigneeDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="pb-8 border-border border-b">
      {subIssues.length > 0 || showForm ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowList(!showList)}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
            >
              {showList ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <span className="font-medium">Sub-issues</span>
              <span className="text-text-tertiary">
                {subIssues.filter((s) => s.status === 'done').length}/{subIssues.length}
              </span>
            </button>
            {!issue.parentIssue && (
              <Plus
                className="w-4 h-4 text-text-tertiary hover:text-text-primary cursor-pointer"
                onClick={() => {
                  setShowForm(true);
                  setShowList(true);
                }}
              />
            )}
          </div>

          {showForm && !issue.parentIssue && (
            <div className="px-6 py-4 space-y-4 text-base bg-background-secondary rounded-md border border-border">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Issue title"
                className="input-transparent"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description..."
                className="textarea-transparent"
                rows={2}
              />

              <div className="flex items-center flex-wrap gap-3">
                <div className="px-3 py-1.5 bg-background-tertiary rounded-md text-sm text-text-secondary flex items-center gap-2">
                  {(() => {
                    const { IconComponent, icon } = getTeamIconDisplay(issue.team);
                    return (
                      <div className="w-4 h-4 flex items-center justify-center text-text-secondary flex-shrink-0">
                        {IconComponent ? (
                          <IconComponent className="w-4 h-4" />
                        ) : (
                          <span>{icon}</span>
                        )}
                      </div>
                    );
                  })()}
                  <span>{issue.team.key}</span>
                </div>

                <div className="relative">
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowStatusDropdown(!showStatusDropdown);
                      setShowPriorityDropdown(false);
                      setShowAssigneeDropdown(false);
                    }}
                    variant="tertiary"
                    size="md"
                  >
                    <selectedStatus.Icon className={`h-4 w-4 ${selectedStatus.color}`} />
                    <span className="text-text-primary">{selectedStatus.label}</span>
                  </Button>
                  {showStatusDropdown && (
                    <div
                      className="dropdown-panel dropdown-panel-alt min-w-[160px] max-w-[calc(100vw-2rem)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {statusOptions.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant="ghost"
                          className={cn(
                            'w-full justify-start px-4 py-2.5 gap-3 text-sm hover:bg-background-hover',
                            status === option.value && 'bg-background-hover'
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            setStatus(option.value);
                            setShowStatusDropdown(false);
                          }}
                        >
                          <option.Icon className={`h-4 w-4 ${option.color}`} />
                          <span className="text-text-primary">{option.label}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPriorityDropdown(!showPriorityDropdown);
                      setShowStatusDropdown(false);
                      setShowAssigneeDropdown(false);
                    }}
                    variant="tertiary"
                    size="md"
                  >
                    <selectedPriority.Icon className={`h-4 w-4 ${selectedPriority.color}`} />
                    <span className="text-text-primary">{selectedPriority.label}</span>
                  </Button>
                  {showPriorityDropdown && (
                    <div
                      className="dropdown-panel dropdown-panel-alt min-w-[160px] max-w-[calc(100vw-2rem)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {priorityOptions.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant="ghost"
                          className={cn(
                            'w-full justify-start px-4 py-2.5 gap-3 text-sm hover:bg-background-hover',
                            priority === option.value && 'bg-background-hover'
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPriority(option.value);
                            setShowPriorityDropdown(false);
                          }}
                        >
                          <option.Icon className={`h-4 w-4 ${option.color}`} />
                          <span className="text-text-primary">{option.label}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAssigneeDropdown(!showAssigneeDropdown);
                      setShowStatusDropdown(false);
                      setShowPriorityDropdown(false);
                    }}
                    variant="tertiary"
                    size="md"
                  >
                    {selectedUser ? (
                      <>
                        <Avatar size="md" className={getAvatarColor(selectedUser._id)}>
                          {selectedUser.name.charAt(0)}
                        </Avatar>
                        <span className="text-text-primary">{selectedUser.name}</span>
                      </>
                    ) : (
                      <>
                        <Circle className="h-4 w-4 text-text-primary" />
                        <span className="text-text-primary">Unassigned</span>
                      </>
                    )}
                  </Button>
                  {showAssigneeDropdown && (
                    <div
                      className="dropdown-panel dropdown-panel-alt min-w-[180px] max-w-[calc(100vw-2rem)] max-h-64 overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        className={cn(
                          'w-full justify-start px-4 py-2.5 gap-3 text-sm hover:bg-background-hover',
                          !assignee && 'bg-background-hover'
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssignee('');
                          setShowAssigneeDropdown(false);
                        }}
                      >
                        <Circle className="h-4 w-4 text-text-primary" />
                        <span className="text-text-primary">Unassigned</span>
                      </Button>
                      {users.map((user) => (
                        <Button
                          key={user._id}
                          type="button"
                          variant="ghost"
                          className={cn(
                            'w-full justify-start px-4 py-2.5 gap-3 text-sm hover:bg-background-hover',
                            assignee === user._id && 'bg-background-hover'
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssignee(user._id);
                            setShowAssigneeDropdown(false);
                          }}
                        >
                          <Avatar size="md" className={getAvatarColor(user._id)}>
                            {user.name.charAt(0)}
                          </Avatar>
                          <span className="text-text-primary">{user.name}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hidden lg:block flex-1" />

                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  className="text-sm text-text-secondary hover:text-text-primary"
                  onClick={() => {
                    setShowForm(false);
                    setTitle('');
                    setDescription('');
                    setStatus('todo');
                    setPriority('no_priority');
                    setAssignee('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={loading}
                  onClick={handleCreate}
                >
                  {loading ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          )}

          {showList && (
            <div className="space-y-2">
              {subIssues.map((subIssue) => {
                const statusConfig = statusIcons[subIssue.status] || statusIcons.todo;
                const StatusIcon = statusConfig.Icon;

                return (
                  <div
                    key={subIssue._id}
                    onClick={() => navigate(`/issue/${subIssue.identifier}`)}
                    className="p-3 bg-background hover:bg-background-hover cursor-pointer flex items-center justify-between rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                      <span className="text-sm text-text-primary">{subIssue.title}</span>
                    </div>
                    {subIssue.assignee && (
                      <Avatar size="md" className={getAvatarColor(subIssue.assignee._id)}>
                        {subIssue.assignee.name.charAt(0)}
                      </Avatar>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : !issue.parentIssue ? (
        <Button
          variant="ghost"
          size="md"
          className="text-sm text-text-secondary hover:text-text-primary"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4" />
          <span>Add sub-issue</span>
        </Button>
      ) : null}
    </div>
  );
};

export default SubIssuesSection;
