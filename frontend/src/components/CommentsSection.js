import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { getAvatarColor, formatDateTime } from '../utils';
import toast from 'react-hot-toast';

const CommentsSection = ({
  comments,
  currentUser,
  onEditComment,
  onDeleteComment,
  baseURL,
  token,
}) => {
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
    <div className="space-y-4">
      {comments.map((comment, idx) => {
        const isOwner = currentUser && comment.user._id === currentUser._id;
        const isEditing = editingCommentId === comment._id;

        return (
          <div
            key={`comment-${comment._id}-${idx}`}
            className="p-4 bg-background-secondary border border-border rounded-md group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 ${getAvatarColor(comment.user._id)} rounded-full flex items-center justify-center text-xs text-white font-medium`}
                >
                  {comment.user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-text-primary">
                  {comment.user.name}
                </span>
                <span className="text-xs text-text-tertiary">
                  {formatDateTime(comment.createdAt, { relative: true })}
                </span>
                {comment.isEdited && (
                  <span className="text-xs text-text-tertiary italic">
                    (edited)
                  </span>
                )}
              </div>
              {isOwner && !isEditing && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditClick(comment)}
                    className="p-1 rounded transition-colors"
                    title="Edit comment"
                  >
                    <Pencil className="w-3.5 h-3.5 text-text-tertiary hover:text-text-primary" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(comment._id)}
                    className="p-1 rounded transition-colors"
                    title="Delete comment"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-text-tertiary hover:text-red-400" />
                  </button>
                </div>
              )}
            </div>
            {isEditing ? (
              <div className="ml-8">
                <div className="p-3 rounded-md relative">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-transparent text-text-primary focus:outline-none resize-none placeholder-text-tertiary text-sm pr-24"
                    rows={1}
                    autoFocus
                  />
                  <div className="flex justify-end mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 text-text-secondary hover:text-text-primary text-sm font-medium rounded-md transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(comment._id)}
                        className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-primary ml-8">
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
