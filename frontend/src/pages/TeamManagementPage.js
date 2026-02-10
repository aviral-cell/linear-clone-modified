import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeams } from '../context/TeamsContext';
import Header from '../components/Header';
import TeamModal from '../components/TeamModal';
import { Avatar, Button, EmptyState } from '../components/ui';
import { Plus, Pencil, Trash2, Users } from '../icons';
import toast from 'react-hot-toast';

const TeamManagementPage = () => {
  const navigate = useNavigate();
  const { teams, loading, createTeam, updateTeam, deleteTeam } = useTeams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleCreate = useCallback(() => {
    setEditingTeam(null);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((team) => {
    setEditingTeam(team);
    setIsModalOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (data) => {
      if (editingTeam) {
        await updateTeam(editingTeam._id, data);
        toast.success('Team updated');
      } else {
        await createTeam(data);
        toast.success('Team created');
      }
    },
    [editingTeam, createTeam, updateTeam]
  );

  const handleDelete = useCallback(
    async (team) => {
      if (deletingId === team._id) {
        try {
          await deleteTeam(team._id);
          toast.success('Team deleted');
        } catch (err) {
          toast.error(err.message || 'Failed to delete team');
        } finally {
          setDeletingId(null);
        }
      } else {
        setDeletingId(team._id);
        setTimeout(() => setDeletingId(null), 3000);
      }
    },
    [deletingId, deleteTeam]
  );

  const handleManageMembers = useCallback(
    (team) => {
      navigate(`/admin/teams/${team._id}`);
    },
    [navigate]
  );

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          fallbackText="Team Management"
          primaryActionLabel="Create Team"
          PrimaryActionIcon={Plus}
          onPrimaryActionClick={handleCreate}
        />

        <section aria-label="Teams list" className="page-content">
          {loading ? (
            <div className="px-4 md:px-6 py-4">
              <div className="text-text-secondary text-sm">Loading teams...</div>
            </div>
          ) : teams.length === 0 ? (
            <div className="px-4 md:px-6 py-4">
              <EmptyState>No teams yet. Create your first team to get started.</EmptyState>
            </div>
          ) : (
            <div className="px-4 md:px-6 py-4">
              <div className="space-y-2">
                {teams.map((team) => (
                  <div
                    key={team._id}
                    className="flex items-center justify-between gap-4 px-4 py-3 bg-background-secondary border border-border rounded-lg hover:border-border-hover transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-xl flex-shrink-0">{team.icon || '\uD83D\uDCE6'}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary truncate">
                            {team.name}
                          </span>
                          <span className="text-xs text-text-tertiary font-mono">{team.key}</span>
                        </div>
                        {team.description && (
                          <p className="text-xs text-text-tertiary truncate mt-0.5">
                            {team.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleManageMembers(team)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-background-hover rounded transition-colors"
                        title="Manage members"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{team.members?.length || 0}</span>
                      </button>
                      <button
                        onClick={() => handleEdit(team)}
                        className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-background-hover rounded transition-colors"
                        title="Edit team"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(team)}
                        className={`p-1.5 rounded transition-colors ${
                          deletingId === team._id
                            ? 'text-red-400 bg-red-400/10'
                            : 'text-text-tertiary hover:text-red-400 hover:bg-background-hover'
                        }`}
                        title={deletingId === team._id ? 'Click again to confirm' : 'Delete team'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <TeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTeam={editingTeam}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default TeamManagementPage;
