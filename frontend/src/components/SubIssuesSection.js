import React, { useState } from 'react';
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
import {
  Avatar,
  Button,
  CollapsibleSection,
  DropdownMenu,
  DropdownMenuItem,
  FieldTrigger,
  IconButton,
  Input,
  Textarea,
} from './ui';
import IssueCard from './IssueCard';

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

  return (
    <div className="pb-8 border-border border-b">
      {subIssues.length > 0 || showForm ? (
        <div>
          <CollapsibleSection
            title={
              <span className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="font-medium">Sub-issues</span>
                <span className="text-text-tertiary">
                  {subIssues.filter((s) => s.status === 'done').length}/{subIssues.length}
                </span>
              </span>
            }
            expanded={showList}
            onToggle={setShowList}
            headerClassName="px-0 py-0 text-sm text-text-secondary hover:text-text-primary"
            actions={
              !issue.parentIssue && (
                <IconButton
                  size="sm"
                  aria-label="Add sub-issue"
                  onClick={() => {
                    setShowForm(true);
                    setShowList(true);
                  }}
                  className="text-text-tertiary hover:text-text-primary"
                >
                  <Plus className="w-4 h-4" />
                </IconButton>
              )
            }
          >
            {showForm && !issue.parentIssue && (
              <div className="px-6 py-4 space-y-4 text-base bg-background-secondary rounded-md border border-border">
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Issue title"
                  className="input-transparent"
                />
                <Textarea
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

                  <DropdownMenu
                    open={showStatusDropdown}
                    onOpenChange={(open) => {
                      setShowStatusDropdown(open);
                      if (open) {
                        setShowPriorityDropdown(false);
                        setShowAssigneeDropdown(false);
                      }
                    }}
                    minWidth="min-w-dropdown-md"
                    trigger={
                      <FieldTrigger
                        className="text-sm"
                        onClick={() => setShowStatusDropdown((prev) => !prev)}
                      >
                        <selectedStatus.Icon className={`h-4 w-4 ${selectedStatus.color}`} />
                        <span className="text-text-primary">{selectedStatus.label}</span>
                      </FieldTrigger>
                    }
                  >
                    {statusOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        selected={status === option.value}
                        className="flex items-center gap-3"
                        onClick={() => {
                          setStatus(option.value);
                          setShowStatusDropdown(false);
                        }}
                      >
                        <option.Icon className={`h-4 w-4 ${option.color}`} />
                        <span className="text-text-primary">{option.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenu>

                  <DropdownMenu
                    open={showPriorityDropdown}
                    onOpenChange={(open) => {
                      setShowPriorityDropdown(open);
                      if (open) {
                        setShowStatusDropdown(false);
                        setShowAssigneeDropdown(false);
                      }
                    }}
                    minWidth="min-w-dropdown-md"
                    trigger={
                      <FieldTrigger
                        className="text-sm"
                        onClick={() => setShowPriorityDropdown((prev) => !prev)}
                      >
                        <selectedPriority.Icon className={`h-4 w-4 ${selectedPriority.color}`} />
                        <span className="text-text-primary">{selectedPriority.label}</span>
                      </FieldTrigger>
                    }
                  >
                    {priorityOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        selected={priority === option.value}
                        className="flex items-center gap-3"
                        onClick={() => {
                          setPriority(option.value);
                          setShowPriorityDropdown(false);
                        }}
                      >
                        <option.Icon className={`h-4 w-4 ${option.color}`} />
                        <span className="text-text-primary">{option.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenu>

                  <DropdownMenu
                    open={showAssigneeDropdown}
                    onOpenChange={(open) => {
                      setShowAssigneeDropdown(open);
                      if (open) {
                        setShowStatusDropdown(false);
                        setShowPriorityDropdown(false);
                      }
                    }}
                    minWidth="min-w-dropdown-md"
                    maxHeight="max-h-64"
                    trigger={
                      <FieldTrigger
                        className="text-sm"
                        onClick={() => setShowAssigneeDropdown((prev) => !prev)}
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
                      </FieldTrigger>
                    }
                  >
                    <DropdownMenuItem
                      selected={!assignee}
                      className="flex items-center gap-3"
                      onClick={() => {
                        setAssignee('');
                        setShowAssigneeDropdown(false);
                      }}
                    >
                      <Circle className="h-4 w-4 text-text-primary" />
                      <span className="text-text-primary">Unassigned</span>
                    </DropdownMenuItem>
                    {users.map((user) => (
                      <DropdownMenuItem
                        key={user._id}
                        selected={assignee === user._id}
                        className="flex items-center gap-3"
                        onClick={() => {
                          setAssignee(user._id);
                          setShowAssigneeDropdown(false);
                        }}
                      >
                        <Avatar size="md" className={getAvatarColor(user._id)}>
                          {user.name.charAt(0)}
                        </Avatar>
                        <span className="text-text-primary">{user.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenu>

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
                    <IssueCard
                      key={subIssue._id}
                      issue={subIssue}
                      variant="compact"
                      onClick={() => navigate(`/issue/${subIssue.identifier}`)}
                      statusIcon={StatusIcon}
                      statusColor={statusConfig.color}
                    />
                  );
                })}
              </div>
            )}
          </CollapsibleSection>
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
