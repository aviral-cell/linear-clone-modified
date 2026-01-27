import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { baseURL } from '../utils';
import SubIssuesSection from '../components/SubIssuesSection';
import ActivityTimeline from '../components/ActivityTimeline';
import CommentsSection from '../components/CommentsSection';
import CommentInput from '../components/CommentInput';
import IssueSidebar from '../components/IssueSidebar';
import IssueProperties from '../components/IssueProperties';
import Header from '../components/Header';
import { PanelRight, CircleDashed, Circle, CircleDot, CheckCircle2, XCircle } from 'lucide-react';
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
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const sidebarRef = useRef(null);
  const { identifier } = useParams();
  const { token, user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (window.innerWidth < 640) {
      setIsRightSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    let previousWidth = window.innerWidth;

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (previousWidth >= 640 && currentWidth < 640) {
        setIsRightSidebarOpen(false);
      }
      previousWidth = currentWidth;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isRightSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        const clickedButton = event.target.closest('button');
        const isPanelButton =
          clickedButton &&
          (clickedButton.querySelector('svg[class*="lucide-panel-right"]') ||
            clickedButton.querySelector('svg[class*="lucide-panel-right-close"]') ||
            clickedButton.title === 'Close panel' ||
            clickedButton.title === 'Open panel');

        if (!isPanelButton) {
          setIsRightSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRightSidebarOpen]);

  useEffect(() => {
    fetchIssue();
    fetchUsers();
    fetchTeams();
  }, [identifier]);

  useEffect(() => {
    if (issue) {
      fetchComments();
      fetchActivities();
      if (issue.team) {
        fetchProjects(issue.team._id);
      }
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

  const fetchProjects = async (teamId) => {
    try {
      const response = await fetch(`${baseURL}/api/projects?teamId=${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
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
      const response = await fetch(`${baseURL}/api/comments/issue/${issue._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

      const response = await fetch(`${baseURL}/api/activities/issue/${targetIssueId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const updateIssue = async (updates) => {
    if (!issue) return;
    try {
      setSaving(true);

      if (updates.status !== undefined) {
        setIssue((prev) => ({ ...prev, status: updates.status }));
      }
      if (updates.priority !== undefined) {
        setIssue((prev) => ({ ...prev, priority: updates.priority }));
      }
      if (updates.assignee !== undefined) {
        const assignee = updates.assignee ? users.find((u) => u._id === updates.assignee) : null;
        setIssue((prev) => ({ ...prev, assignee: assignee || null }));
      }
      if (updates.projectId !== undefined) {
        const project = updates.projectId
          ? projects.find((p) => p._id === updates.projectId)
          : null;
        setIssue((prev) => ({ ...prev, project: project || null }));
      }

      const response = await fetch(`${baseURL}/api/issues/${identifier}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setIssue((prev) => ({ ...prev, ...data.issue }));
        toast.success('Issue updated');
        await fetchActivities(data.issue._id);
      } else {
        await fetchIssue();
        toast.error('Failed to update issue');
      }
    } catch (error) {
      console.error('Error updating issue:', error);
      await fetchIssue();
      toast.error('Failed to update issue');
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async (content) => {
    setCommentLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/comments/issue/${issue._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

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
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-background">
        <Header
          team={issue.team}
          issueKey={issue.identifier}
          onTeamClick={() => navigate(`/team/${issue.team.key}/all`)}
          panelOpenerIcon={PanelRight}
          onPanelOpenerClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          isPanelOpen={isRightSidebarOpen}
        />
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
                const statusConfig = statusIcons[parentStatus] || statusIcons.todo;
                const StatusIcon = statusConfig.Icon;
                return (
                  <div className="py-2 text-sm">
                    <div className="flex items-center text-text-tertiary">
                      <span>Sub-issue of</span>
                      <button
                        onClick={() => navigate(`/issue/${issue.parentIssue.identifier}`)}
                        className="flex items-center gap-1.5 px-2 py-1 ml-1 text-text-primary rounded-md transition-colors group relative hover:bg-background-secondary"
                      >
                        <StatusIcon
                          className={`w-4 h-4 ${statusConfig.color} flex-shrink-0 relative z-10`}
                        />
                        <span className="font-mono text-text-tertiary relative z-10">
                          {issue.parentIssue.identifier}
                        </span>
                        <span className="relative z-10">{issue.parentIssue.title}</span>
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
                    <span className="text-text-tertiary">Add description...</span>
                  )}
                </div>
              )}
            </div>

            <div className="mb-6">
              <IssueProperties
                issue={issue}
                users={users}
                projects={projects}
                onUpdate={updateIssue}
                disabled={saving}
                variant="horizontal"
                showStatus={true}
                showPriority={true}
                showAssignee={true}
                showProject={true}
              />
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
              onEditComment={fetchComments}
              onDeleteComment={() => {
                fetchComments();
                fetchActivities();
              }}
              baseURL={baseURL}
              token={token}
            />

            <CommentInput onSubmit={handleAddComment} loading={commentLoading} />
          </div>
        </div>

        {isRightSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={() => setIsRightSidebarOpen(false)}
          />
        )}

        <div
          ref={sidebarRef}
          className={`
            fixed top-14 bottom-0 right-0 z-50 border-l border-border bg-background overflow-y-auto transition-transform duration-300 ease-in-out
            ${isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
            w-80
          `}
        >
          <IssueSidebar issue={issue} users={users} projects={projects} onUpdate={updateIssue} />
        </div>
      </div>
    </div>
  );
};

export default IssueDetailPage;
