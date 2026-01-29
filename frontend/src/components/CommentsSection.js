import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { getAvatarColor, formatDateTime } from '../utils';
import toast from 'react-hot-toast';

const CommentsSection = ({ comments, onEditComment, onDeleteComment, baseURL, token }) => {
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const handleEditClick = (comment) => {
    setEditingCommentId(comment._id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId) => {
    if (!editContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const response = await fetch(`${baseURL}/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        toast.success('Comment updated');
        onEditComment();
        setEditingCommentId(null);
        setEditContent('');
      } else {
        toast.error('Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleDeleteClick = async (commentId) => {
    try {
      const response = await fetch(`${baseURL}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Comment deleted');
        onDeleteComment();
      } else {
        toast.error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  if (comments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {comments.map((comment, idx) => {
        const isOwner = comment.isOwner || false;
        const isEditing = editingCommentId === comment._id;

        return (
          <div key={`comment-${comment._id}-${idx}`} className="card-inner group">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <div
                  className={`avatar avatar-lg md:w-7 md:h-7 flex-shrink-0 ${getAvatarColor(comment.user._id)}`}
                >
                  {comment.user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-text-primary">
                      {comment.user.name}
                    </span>
                    <span className="text-xs text-text-tertiary whitespace-nowrap">
                      {formatDateTime(comment.createdAt, { relative: true })}
                    </span>
                    {comment.isEdited && (
                      <span className="text-xs text-text-tertiary italic">(edited)</span>
                    )}
                  </div>
                </div>
              </div>
              {isOwner && !isEditing && (
                <div className="flex items-center gap-1 md:gap-2 flex-shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditClick(comment)}
                    className="btn-icon-sm md:p-1 touch-manipulation active:bg-background-tertiary"
                    title="Edit comment"
                    aria-label="Edit comment"
                  >
                    <Pencil className="w-4 h-4 md:w-3.5 md:h-3.5 text-text-tertiary hover:text-text-primary" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(comment._id)}
                    className="btn-icon-sm md:p-1 touch-manipulation active:bg-background-tertiary"
                    title="Delete comment"
                    aria-label="Delete comment"
                  >
                    <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5 text-text-tertiary hover:text-red-400" />
                  </button>
                </div>
              )}
            </div>
            {isEditing ? (
              <div className="ml-0 md:ml-8 mt-2">
                <div className="rounded-md relative">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="textarea-transparent textarea-transparent-sm"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex justify-end mt-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 sm:flex-initial btn-secondary-header text-text-secondary hover:text-text-primary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(comment._id)}
                        className="flex-1 sm:flex-initial btn-primary"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-primary ml-0 md:ml-8 break-words whitespace-pre-wrap">
                {comment.content}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CommentsSection;
