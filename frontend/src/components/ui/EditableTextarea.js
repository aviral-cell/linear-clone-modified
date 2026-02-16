import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import Textarea from './Textarea';

function EditableTextarea({ value, onSave, placeholder, className, minHeight = 'none' }) {
  const [draft, setDraft] = useState(value ?? '');

  useEffect(() => {
    setDraft(value ?? '');
  }, [value]);

  const handleSave = () => {
    if (draft !== (value ?? '')) {
      onSave(draft);
    }
  };

  const handleCancel = () => {
    setDraft(value ?? '');
  };

  return (
    <Textarea
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => {
        if (e.key === 'Escape') handleCancel();
      }}
      placeholder={placeholder || 'Add details...'}
      minHeight={minHeight}
      className={cn('px-0 py-2 text-text-primary min-h-[60px]', className)}
    />
  );
}

export default EditableTextarea;
