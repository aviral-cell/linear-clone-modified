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
  DetailPanel,
  EditableTextarea,
  EditableTitle,
  LoadingScreen,
} from '../components/ui';
import { PanelRight } from '../icons';
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
  const [saving, setSaving] = useState(false);
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
    if (!issue?._id) return;
    try {
      const data = await api.comments.getByIssue(issue._id);
      setComments(data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, [issue?._id]);

  const fetchActivities = useCallback(
    async (issueId = null) => {
      try {
        const targetIssueId = issueId || issue?._id;
        if (!targetIssueId) return;
        const data = await api.issueActivities.getByIssue(targetIssueId);
        setActivities(data.activities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    },
    [issue?._id]
  );

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
      await fetchActivities(data.issue._id);
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
      await api.comments.create(issue._id, content);
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
          panelOpenerIcon={PanelRight}
          onPanelOpenerClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          isPanelOpen={isRightSidebarOpen}
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
              comments={comments}
              onEditComment={fetchComments}
              onDeleteComment={() => {
                fetchComments();
                fetchActivities();
              }}
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
    </div>
  );
};

export default IssueDetailPage;
