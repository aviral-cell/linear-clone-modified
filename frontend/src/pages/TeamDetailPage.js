import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeams } from '../context/TeamsContext';
import { useUsers } from '../hooks/useUsers';
import { api } from '../services/api';
import Header from '../components/Header';
import AddMemberModal from '../components/AddMemberModal';
import { Avatar, Button, EmptyState } from '../components/ui';
import { UserPlus, Trash2, ChevronLeft } from '../icons';
import { getAvatarColor } from '../utils';
import toast from 'react-hot-toast';

const TeamDetailPage = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { teams, addMembers, removeMember } = useTeams();
  const { users } = useUsers();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const fetchTeam = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.teams.getByIdentifier(identifier);
      setTeam(data.team);
    } catch {
      toast.error('Failed to load team');
      navigate('/admin/teams');
    } finally {
      setLoading(false);
    }
  }, [identifier, navigate]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  useEffect(() => {
    if (team) {
      const updated = teams.find((t) => t._id === team._id);
      if (updated) setTeam(updated);
    }
  }, [teams, team]);

  const existingMemberIds = useMemo(
    () => (team?.members || []).map((m) => m._id),
    [team]
  );

  const handleAddMembers = useCallback(
    async (userIds) => {
      try {
        const updated = await addMembers(team._id, userIds);
        setTeam(updated);
        toast.success(`Added ${userIds.length} member(s)`);
      } catch (err) {
        toast.error(err.message || 'Failed to add members');
        throw err;
      }
    },
    [team, addMembers]
  );

  const handleRemoveMember = useCallback(
    async (userId) => {
      if (removingId === userId) {
        try {
          const updated = await removeMember(team._id, userId);
          setTeam(updated);
          toast.success('Member removed');
        } catch (err) {
          toast.error(err.message || 'Failed to remove member');
        } finally {
          setRemovingId(null);
        }
      } else {
        setRemovingId(userId);
        setTimeout(() => setRemovingId(null), 3000);
      }
    },
    [removingId, team, removeMember]
  );

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header fallbackText="Team" />
        <div className="px-4 md:px-6 py-4">
          <div className="text-text-secondary text-sm">Loading team...</div>
        </div>
      </div>
    );
  }

  if (!team) return null;

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          fallbackText={team.name}
          primaryActionLabel="Add Members"
          PrimaryActionIcon={UserPlus}
          onPrimaryActionClick={() => setIsAddModalOpen(true)}
        />

        <section aria-label="Team detail" className="page-content">
          <div className="px-4 md:px-6 py-4 space-y-6">
            <div>
              <button
                onClick={() => navigate('/admin/teams')}
                className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-primary transition-colors mb-4"
              >
                <ChevronLeft className="w-3 h-3" />
                All Teams
              </button>

              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">{team.icon || '\uD83D\uDCE6'}</span>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">{team.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-tertiary font-mono">{team.key}</span>
                    {team.description && (
                      <>
                        <span className="text-text-tertiary">·</span>
                        <span className="text-xs text-text-tertiary">{team.description}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-text-primary">
                  Members ({team.members?.length || 0})
                </h3>
              </div>

              {(!team.members || team.members.length === 0) ? (
                <EmptyState size="sm">No members in this team yet.</EmptyState>
              ) : (
                <div className="space-y-1">
                  {team.members.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 bg-background-secondary border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          size="md"
                          className={`${getAvatarColor(member._id)} text-[11px] font-medium`}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <div className="min-w-0">
                          <div className="text-sm text-text-primary truncate">{member.name}</div>
                          <div className="text-xs text-text-tertiary truncate">{member.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {member.role === 'admin' && (
                          <span className="text-[10px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                            Admin
                          </span>
                        )}
                        <button
                          onClick={() => handleRemoveMember(member._id)}
                          className={`p-1.5 rounded transition-colors ${
                            removingId === member._id
                              ? 'text-red-400 bg-red-400/10'
                              : 'text-text-tertiary hover:text-red-400 hover:bg-background-hover'
                          }`}
                          title={removingId === member._id ? 'Click again to confirm' : 'Remove member'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        users={users}
        existingMemberIds={existingMemberIds}
        onSubmit={handleAddMembers}
      />
    </>
  );
};

export default TeamDetailPage;
