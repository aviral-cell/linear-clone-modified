import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { baseURL } from '../utils';
import Sidebar from '../components/Sidebar';
import SubIssuesSection from '../components/SubIssuesSection';
import ActivityTimeline from '../components/ActivityTimeline';
import CommentsSection from '../components/CommentsSection';
import CommentInput from '../components/CommentInput';
import IssueSidebar from '../components/IssueSidebar';
import {
  X,
  Menu,
  PanelRight,
  CircleDashed,
  Circle,
  CircleDot,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const statusIcons = {
  backlog: { Icon: CircleDashed, color: 'text-text-tertiary' },
  todo: { Icon: Circle, color: 'text-text-secondary' },
  in_progress: { Icon: CircleDot, color: 'text-yellow-500' },
  in_review: { Icon: CircleDot, color: 'text-green-500' },
  done: { Icon: CheckCircle2, color: 'text-accent' },
  cancelled: { Icon: XCircle, color: 'text-text-tertiary' },
  duplicate: { Icon: XCircle, color: 'text-text-tertiary' },
};

const IssueDetailPage = () => {
  const [issue, setIssue] = useState(null);
  const [subIssues, setSubIssues] = useState([]);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const { identifier } = useParams();
  const { token, user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setIsLeftSidebarCollapsed(true);
        setIsRightSidebarOpen(false);
      } else if (width < 1024) {
        setIsLeftSidebarCollapsed(false);
        setIsRightSidebarOpen(false);
      } else {
        setIsLeftSidebarCollapsed(false);
        setIsRightSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchIssue();
    fetchUsers();
    fetchTeams();
  }, [identifier]);

  useEffect(() => {
    if (issue) {
      fetchComments();
      fetchActivities();
    }
  }, [issue]);

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${baseURL}/api/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchIssue = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await fetch(`${baseURL}/api/issues/${identifier}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setIssue(data.issue);
        setSubIssues(data.subIssues || []);
        setTitle(data.issue.title);
        setDescription(data.issue.description);
      } else {
        if (!silent) {
          toast.error('Issue not found');
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error fetching issue:', error);
      if (!silent) toast.error('Failed to fetch issue');
    } finally {
      if (!silent) setLoading(false);
    }
  };

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

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `${baseURL}/api/comments/issue/${issue._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchActivities = async (issueId = null) => {
    try {
      const targetIssueId = issueId || issue?._id;
      if (!targetIssueId) return;

      const response = await fetch(
        `${baseURL}/api/activities/issue/${targetIssueId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const updateIssue = async (updates) => {
    try {
      const response = await fetch(`${baseURL}/api/issues/${identifier}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        toast.success('Issue updated');
        const data = await response.json();
        await fetchIssue(true);
        await fetchActivities(data.issue._id);
      } else {
        toast.error('Failed to update issue');
      }
    } catch (error) {
      console.error('Error updating issue:', error);
      toast.error('Failed to update issue');
    }
  };

  const handleAddComment = async (content) => {
    setCommentLoading(true);
    try {
      const response = await fetch(
        `${baseURL}/api/comments/issue/${issue._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      if (response.ok) {
        fetchComments();
        fetchActivities();
        toast.success('Comment added');
      } else {
        toast.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const saveTitle = () => {
    if (title !== issue.title && title.trim()) {
      updateIssue({ title });
    }
    setEditingTitle(false);
  };

  const saveDescription = () => {
    if (description !== issue.description) {
      updateIssue({ description });
    }
    setEditingDescription(false);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  if (!issue) return null;

  return (
    <div className="h-screen flex bg-background">
      <Sidebar
        teams={teams}
        isCollapsed={isLeftSidebarCollapsed}
        onToggle={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border bg-background">
          <div className="px-4 md:px-6 py-3.5 lg:py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)
                }
                className="md:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-background-secondary rounded-md"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate(`/team/${issue.team._id}`)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-text-secondary font-mono">
                {issue.identifier}
              </span>
            </div>
            <button
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              className="lg:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-background-secondary rounded-md"
              title={isRightSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              <PanelRight
                className={`w-5 h-5 ${isRightSidebarOpen ? 'text-text-primary' : ''}`}
              />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 py-3.5 lg:py-6 lg:mt-2">
              <div>
                {editingTitle ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveTitle();
                      if (e.key === 'Escape') {
                        setTitle(issue.title);
                        setEditingTitle(false);
                      }
                    }}
                    className="w-full text-2xl font-semibold bg-transparent border-b border-border text-text-primary focus:outline-none pb-2"
                    autoFocus
                  />
                ) : (
                  <h1
                    onClick={() => setEditingTitle(true)}
                    className="text-2xl font-semibold text-text-primary cursor-text hover:opacity-70 transition-opacity"
                  >
                    {issue.title}
                  </h1>
                )}
              </div>

              {issue.parentIssue &&
                (() => {
                  const parentStatus = issue.parentIssue.status || 'todo';
                  const statusConfig =
                    statusIcons[parentStatus] || statusIcons.todo;
                  const StatusIcon = statusConfig.Icon;
                  return (
                    <div className="py-2 text-sm">
                      <div className="flex items-center text-text-tertiary">
                        <span>Sub-issue of</span>
                        <button
                          onClick={() =>
                            navigate(`/issue/${issue.parentIssue.identifier}`)
                          }
                          className="flex items-center gap-1.5 px-2 py-1 ml-1 text-text-primary rounded-md transition-colors group relative hover:bg-background-secondary"
                        >
                          <StatusIcon
                            className={`w-4 h-4 ${statusConfig.color} flex-shrink-0 relative z-10`}
                          />
                          <span className="font-mono text-text-tertiary relative z-10">
                            {issue.parentIssue.identifier}
                          </span>
                          <span className="relative z-10">
                            {issue.parentIssue.title}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

              <div className="mb-4 mt-6">
                {editingDescription ? (
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={saveDescription}
                    placeholder="Add description..."
                    className="w-full min-h-[100px] px-0 py-2 bg-background text-text-primary focus:outline-none resize-none placeholder-text-tertiary"
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => setEditingDescription(true)}
                    className="px-0 py-2 text-text-primary cursor-text hover:opacity-70 min-h-[60px] transition-opacity"
                  >
                    {issue.description || (
                      <span className="text-text-tertiary">
                        Add description...
                      </span>
                    )}
                  </div>
                )}
              </div>

              <SubIssuesSection
                issue={issue}
                subIssues={subIssues}
                onCreateSubIssue={() => fetchIssue(true)}
                token={token}
                baseURL={baseURL}
                users={users}
              />

              <ActivityTimeline activities={activities} users={users} />

              <CommentsSection
                comments={comments}
                currentUser={currentUser}
                onEditComment={fetchComments}
                onDeleteComment={() => {
                  fetchComments();
                  fetchActivities();
                }}
                baseURL={baseURL}
                token={token}
              />

              <CommentInput
                onSubmit={handleAddComment}
                loading={commentLoading}
              />
            </div>
          </div>

          <div
            className={`
            border-l border-border bg-background overflow-y-auto transition-all duration-300
            ${isRightSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}
            lg:w-80 lg:block
          `}
          >
            {isRightSidebarOpen && (
              <IssueSidebar
                issue={issue}
                users={users}
                onUpdate={updateIssue}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailPage;
