import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import SubIssuesSection from '../components/SubIssuesSection';
import IssueActivityTimeline from '../components/IssueActivityTimeline';
import CommentsSection from '../components/CommentsSection';
import CommentInput from '../components/CommentInput';
import IssueSidebar from '../components/IssueSidebar';
import IssueProperties from '../components/IssueProperties';
import Header from '../components/Header';
import {
  Button,
  ConfirmDialog,
  DetailPanel,
  DropdownMenu,
  DropdownMenuItem,
  EditableTextarea,
  EditableTitle,
  LoadingScreen,
} from '../components/ui';
import { Bell, BellOff, Ellipsis, PanelRight, PanelRightClose, Trash2 } from '../icons';
import { issueStatusIcons } from '../constants';
import { useIssue, useUsers } from '../hooks';
import toast from 'react-hot-toast';

const IssueDetailPage = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const handleError = useCallback(() => {
    navigate('/');
  }, [navigate]);
  const { issue, subIssues, isSubscribed, setIsSubscribed, loading, refetch } = useIssue(
    identifier,
    {
      onError: handleError,
    }
  );
  const { users } = useUsers();
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [parentIssues, setParentIssues] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const sidebarRef = useRef(null);

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

  const fetchParentIssues = useCallback(async (issueIdentifier) => {
    try {
      const data = await api.issues.getValidParents(issueIdentifier);
      setParentIssues(data.validParents || []);
    } catch (error) {
      console.error('Error fetching valid parent issues:', error);
    }
  }, []);

  const fetchProjects = useCallback(async (teamId) => {
    try {
      const data = await api.projects.getByTeam(teamId);
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }, []);

  const fetchComments = useCallback(async () => {
    if (!issue?.identifier) return;
    try {
      const data = await api.comments.getByIssue(issue.identifier);
      setComments(data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, [issue?.identifier]);

  const fetchActivities = useCallback(async () => {
    if (!issue?.identifier) return;
    try {
      const data = await api.issueActivities.getByIssue(issue.identifier);
      setActivities(data.activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  }, [issue?.identifier]);

  useEffect(() => {
    if (issue) {
      setTitle(issue.title);
      setDescription(issue.description);
      fetchComments();
      fetchActivities();
      if (issue.team) {
        fetchProjects(issue.team._id);
        fetchParentIssues(issue.identifier);
      }
    }
  }, [issue, fetchComments, fetchActivities, fetchProjects, fetchParentIssues]);

  const updateIssue = async (updates) => {
    if (!issue) return;
    try {
      setSaving(true);

      const data = await api.issues.update(identifier, updates);
      toast.success('Issue updated');
      await fetchActivities();
      await refetch();
    } catch (error) {
      console.error('Error updating issue:', error);
      await refetch();
      toast.error('Failed to update issue');
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async (content) => {
    setCommentLoading(true);
    try {
      await api.comments.create(issue.identifier, content);
      fetchComments();
      fetchActivities();
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleToggleSubscribe = async () => {
    try {
      const data = await api.issues.toggleSubscribe(identifier);
      setIsSubscribed(data.subscribed);
      toast.success(data.subscribed ? 'Subscribed to issue' : 'Unsubscribed from issue');
    } catch (error) {
      console.error('Error toggling subscription:', error);
      toast.error('Failed to update subscription');
    }
  };

  const handleDeleteIssue = async () => {
    try {
      await api.issues.delete(identifier);
      toast.success('Issue deleted');
      navigate(`/team/${issue.team.key}/all`);
    } catch (error) {
      toast.error('Failed to delete issue');
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (!issue) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-background">
        <Header
          team={issue.team}
          issueKey={issue.identifier}
          onTeamClick={() => navigate(`/team/${issue.team.key}/all`)}
          menu={
            <DropdownMenu
              open={optionsOpen}
              onOpenChange={setOptionsOpen}
              minWidth="min-w-dropdown-sm"
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1.5"
                  aria-label="Options"
                  onClick={() => setOptionsOpen(!optionsOpen)}
                >
                  <Ellipsis className="h-4 w-4" />
                </Button>
              }
            >
              <DropdownMenuItem
                onClick={() => {
                  handleToggleSubscribe();
                  setOptionsOpen(false);
                }}
              >
                {isSubscribed ? (
                  <BellOff className="h-4 w-4 text-text-secondary" />
                ) : (
                  <Bell className="h-4 w-4 text-text-secondary" />
                )}
                {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setShowDeleteConfirm(true);
                  setOptionsOpen(false);
                }}
              >
                <Trash2 className="h-4 w-4 text-text-secondary" />
                Delete issue
              </DropdownMenuItem>
            </DropdownMenu>
          }
          actions={
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              title={isRightSidebarOpen ? 'Close panel' : 'Open panel'}
              aria-label={isRightSidebarOpen ? 'Close panel' : 'Open panel'}
            >
              {isRightSidebarOpen ? (
                <PanelRightClose className="h-5 w-5 text-text-primary" />
              ) : (
                <PanelRight className="h-5 w-5" />
              )}
            </Button>
          }
        />
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="page-content">
          <div className="page-container-narrow py-4 lg:py-6">
            <div>
              <EditableTitle
                value={title}
                placeholder="Issue title"
                size="xl"
                onSave={(nextTitle) => {
                  if (nextTitle && nextTitle !== issue.title) {
                    setTitle(nextTitle);
                    updateIssue({ title: nextTitle });
                  }
                }}
              />
            </div>

            {issue.parent &&
              (() => {
                const parentStatus = issue.parent.status || 'todo';
                const statusConfig = issueStatusIcons[parentStatus] || issueStatusIcons.todo;
                const StatusIcon = statusConfig.Icon;
                return (
                  <div className="py-2 text-sm">
                    <div className="flex items-center text-text-tertiary">
                      <span>Sub-issue of</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/issue/${issue.parent.identifier}`)}
                        className="flex items-center gap-1.5 px-2 py-1 ml-1 text-text-primary rounded-md transition-colors group relative hover:bg-background-secondary"
                      >
                        <StatusIcon
                          className={`w-4 h-4 ${statusConfig.color} flex-shrink-0 relative z-10`}
                        />
                        <span className="font-mono text-text-tertiary relative z-10">
                          {issue.parent.identifier}
                        </span>
                        <span className="relative z-10">{issue.parent.title}</span>
                      </Button>
                    </div>
                  </div>
                );
              })()}

            <div className="mb-4 mt-6">
              <EditableTextarea
                value={description}
                placeholder="Add description..."
                minHeight="description"
                className="min-h-[100px] px-0 py-2 bg-background"
                onSave={(nextDescription) => {
                  if (nextDescription !== issue.description) {
                    setDescription(nextDescription);
                    updateIssue({ description: nextDescription });
                  }
                }}
              />
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
                showParent={true}
                parentIssues={parentIssues}
              />
            </div>

            <SubIssuesSection
              issue={issue}
              subIssues={subIssues}
              onCreateSubIssue={() => refetch()}
              users={users}
            />

            <IssueActivityTimeline
              activities={activities}
              users={users}
              projects={projects}
              parentIssues={parentIssues}
              isSubscribed={isSubscribed}
              onToggleSubscribe={handleToggleSubscribe}
            />

            <CommentsSection
              identifier={identifier}
              comments={comments}
              onEditComment={fetchComments}
              onDeleteComment={fetchComments}
            />

            <CommentInput onSubmit={handleAddComment} loading={commentLoading} />
          </div>
        </div>

        <DetailPanel
          isOpen={isRightSidebarOpen}
          onClose={() => setIsRightSidebarOpen(false)}
          panelRef={sidebarRef}
        >
          <IssueSidebar
            issue={issue}
            users={users}
            projects={projects}
            parentIssues={parentIssues}
            onUpdate={updateIssue}
          />
        </DetailPanel>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteIssue}
        title="Delete issue"
        message="This will permanently delete this issue and all its sub-issues, including their comments and activities. This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
};

export default IssueDetailPage;
