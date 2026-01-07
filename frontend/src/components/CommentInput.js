import React, { useState } from 'react';
import { Send } from 'lucide-react';

const CommentInput = ({ onSubmit, loading }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmit(content);
    setContent('');
  };

  return (
    <div className="mt-6">
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-background-secondary border border-border rounded-md"
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Leave a comment..."
          className="w-full bg-transparent text-text-primary focus:outline-none resize-none placeholder-text-tertiary text-sm"
          rows={2}
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="px-3 py-1.5 bg-background-tertiary hover:bg-background-hover text-text-primary text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentInput;
