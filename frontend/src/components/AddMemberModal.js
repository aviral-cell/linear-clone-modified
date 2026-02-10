import React, { useState, useMemo } from 'react';
import { Button, Input, Avatar } from './ui';
import { X, Search, Check } from '../icons';
import { getAvatarColor } from '../utils';

const AddMemberModal = ({ isOpen, onClose, users, existingMemberIds, onSubmit }) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [saving, setSaving] = useState(false);

  const availableUsers = useMemo(() => {
    const existing = new Set(existingMemberIds.map((id) => id.toString()));
    return users.filter((u) => {
      if (existing.has(u._id.toString())) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });
  }, [users, existingMemberIds, search]);

  const toggleUser = (userId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selectedIds.size === 0) return;
    try {
      setSaving(true);
      await onSubmit(Array.from(selectedIds));
      setSelectedIds(new Set());
      setSearch('');
      onClose();
    } catch {
      // error handled by parent
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background-secondary border border-border rounded-lg w-full max-w-md mx-4 shadow-xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text-primary">Add Members</h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-border">
          <Input.WithIcon>
            <Search className="w-4 h-4" />
            <Input
              variant="transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              autoFocus
            />
          </Input.WithIcon>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2 min-h-0">
          {availableUsers.length === 0 ? (
            <div className="py-8 text-center text-sm text-text-tertiary">
              {search ? 'No matching users found' : 'All users are already members'}
            </div>
          ) : (
            <div className="space-y-1">
              {availableUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => toggleUser(user._id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left ${
                    selectedIds.has(user._id)
                      ? 'bg-accent/10 border border-accent/30'
                      : 'hover:bg-background-hover border border-transparent'
                  }`}
                >
                  <Avatar size="md" className={`${getAvatarColor(user._id)} text-[11px] font-medium`}>
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-text-primary truncate">{user.name}</div>
                    <div className="text-xs text-text-tertiary truncate">{user.email}</div>
                  </div>
                  {selectedIds.has(user._id) && (
                    <Check className="w-4 h-4 text-accent flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
          <span className="text-xs text-text-tertiary">
            {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select users to add'}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={selectedIds.size === 0 || saving}
            >
              {saving ? 'Adding...' : `Add ${selectedIds.size > 0 ? `(${selectedIds.size})` : ''}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
