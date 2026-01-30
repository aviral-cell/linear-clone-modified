import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button, Card, Textarea } from './ui';

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
      <Card variant="secondary">
        <Card.Inner>
          <form onSubmit={handleSubmit}>
            <Textarea
          size="sm"
          minHeight="comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Leave a comment..."
          rows={3}
        />
        <div className="mt-3 flex justify-end">
          <Button
            type="submit"
            variant="tertiary"
            size="lg"
            className="min-w-[80px] touch-manipulation active:opacity-80 md:min-w-0"
            disabled={loading || !content.trim()}
          >
            <Send className="h-4 w-4 md:h-3.5 md:w-3.5" />
            <span>Add</span>
          </Button>
        </div>
          </form>
        </Card.Inner>
      </Card>
    </div>
  );
};

export default CommentInput;
