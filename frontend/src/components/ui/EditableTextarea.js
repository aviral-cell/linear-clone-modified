import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import Textarea from './Textarea';

/**
 * Editable textarea with click-to-edit behavior.
 * @param {string} value
 * @param {(newValue: string) => void} onSave
 * @param {string} [placeholder]
 * @param {string} [className]
 * @param {string} [displayClassName]
 * @param {string} [minHeight='none']
 */
function EditableTextarea({
  value,
  onSave,
  placeholder,
  className,
  displayClassName,
  minHeight = 'none',
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');

  useEffect(() => {
    if (!isEditing) {
      setDraft(value || '');
    }
  }, [value, isEditing]);

  const handleSave = () => {
    const nextValue = draft;
    if (nextValue !== value) {
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
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Escape') handleCancel();
        }}
        placeholder={placeholder}
        minHeight={minHeight}
        autoFocus
        className={className}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        'px-0 py-2 text-text-primary cursor-text hover:opacity-70 min-h-[60px] transition-opacity',
        displayClassName
      )}
    >
      {value ? value : <span className="text-text-tertiary">{placeholder || 'Add details...'}</span>}
    </div>
  );
}

export default EditableTextarea;
