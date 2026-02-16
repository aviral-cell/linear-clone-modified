import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import Input from './Input';

const sizeClasses = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl',
};

const titleStyles = 'font-semibold text-text-primary pb-2';

function EditableTitle({ value, onSave, placeholder, className, size = 'lg' }) {
  const [draft, setDraft] = useState(value ?? '');

  useEffect(() => {
    setDraft(value ?? '');
  }, [value]);

  const handleSave = () => {
    const nextValue = draft.trim();
    if (nextValue !== (value ?? '')) {
      onSave(nextValue);
    }
  };

  const handleCancel = () => {
    setDraft(value ?? '');
  };

  return (
    <Input
      type="text"
      variant="transparent"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSave();
        }
        if (e.key === 'Escape') handleCancel();
      }}
      placeholder={placeholder || 'Untitled'}
      className={cn(titleStyles, sizeClasses[size], className)}
    />
  );
}

export default EditableTitle;
