import React, { useState, useEffect } from 'react';
import { Button, Input, Textarea } from './ui';
import { X } from '../icons';

const TeamModal = ({ isOpen, onClose, initialTeam, onSubmit }) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [icon, setIcon] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!initialTeam;

  useEffect(() => {
    if (isOpen) {
      if (initialTeam) {
        setName(initialTeam.name || '');
        setKey(initialTeam.key || '');
        setIcon(initialTeam.icon || '');
        setDescription(initialTeam.description || '');
      } else {
        setName('');
        setKey('');
        setIcon('');
        setDescription('');
      }
      setError('');
    }
  }, [isOpen, initialTeam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!isEdit && !key.trim()) {
      setError('Key is required');
      return;
    }

    try {
      setSaving(true);
      const data = { name: name.trim(), icon: icon || undefined, description };
      if (!isEdit) {
        data.key = key.toUpperCase().trim();
      }
      await onSubmit(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background-secondary border border-border rounded-lg w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text-primary">
            {isEdit ? 'Edit Team' : 'Create Team'}
          </h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {error && (
            <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Engineering"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Key</label>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              placeholder="e.g. ENG"
              disabled={isEdit}
              maxLength={10}
              className={isEdit ? 'opacity-50 cursor-not-allowed' : ''}
            />
            {!isEdit && (
              <p className="text-xs text-text-tertiary mt-1">2-10 alphanumeric characters. Cannot be changed later.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Icon</label>
            <div className="flex items-center gap-3">
              <Input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="e.g. \uD83D\uDCE6"
                className="flex-1"
              />
              {icon && <span className="text-2xl">{icon}</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this team"
              size="sm"
              minHeight="summary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={saving}>
              {saving ? (isEdit ? 'Saving...' : 'Creating...') : isEdit ? 'Save Changes' : 'Create Team'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamModal;
