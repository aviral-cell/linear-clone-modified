import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import Input from './Input';

const sizeClasses = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl',
};

/**
 * Editable title with click-to-edit behavior.
 * @param {string} value
 * @param {(newValue: string) => void} onSave
 * @param {string} [placeholder]
 * @param {string} [className]
 * @param {'sm'|'md'|'lg'|'xl'} [size='lg']
 */
function EditableTitle({ value, onSave, placeholder, className, size = 'lg' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');

  useEffect(() => {
    if (!isEditing) {
      setDraft(value || '');
    }
  }, [value, isEditing]);

  const handleSave = () => {
    const nextValue = draft.trim();
    if (nextValue && nextValue !== value) {
      onSave(nextValue);
    }
    setIsEditing(false);
    setDraft(value || '');
  };

  const handleCancel = () => {
    setDraft(value || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') handleCancel();
        }}
        placeholder={placeholder}
        autoFocus
        className={cn(
          'input-transparent editable-title editable-title-bordered',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <h1
      onClick={() => setIsEditing(true)}
      className={cn('editable-title', sizeClasses[size], className)}
    >
      {value || <span className="text-text-tertiary">{placeholder || 'Untitled'}</span>}
    </h1>
  );
}

export default EditableTitle;
