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
    <div className="mt-4 md:mt-6">
      <form onSubmit={handleSubmit} className="card-inner">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Leave a comment..."
          className="w-full bg-transparent text-text-primary focus:outline-none resize-none placeholder-text-tertiary text-sm min-h-[60px] md:min-h-[80px]"
          rows={3}
        />
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="px-4 py-2 md:px-3 md:py-1.5 bg-background-tertiary hover:bg-background-hover text-text-primary text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors touch-manipulation active:opacity-80 min-w-[80px] justify-center"
          >
            <Send className="w-4 h-4 md:w-3.5 md:h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentInput;
