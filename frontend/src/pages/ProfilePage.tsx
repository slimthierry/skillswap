import React, { useState } from 'react';
import { useCurrentUser, useUpdateProfile, useUserReviews, useBalance } from '../services/api';
import { SkillBadge, TimeBalance, ReviewCard } from '../components';

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser();
  const { data: balance } = useBalance();
  const updateMutation = useUpdateProfile();
  const { data: reviews } = useUserReviews(user?.id || '');

  const [editing, setEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');

  const startEditing = () => {
    if (user) {
      setEditUsername(user.username);
      setEditBio(user.bio || '');
      setEditing(true);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({
      username: editUsername,
      bio: editBio,
    });
    setEditing(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="bg-surface-tertiary rounded-xl h-40" />
          <div className="bg-surface-tertiary rounded-xl h-32 mt-6" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <p className="text-sm text-red-700 dark:text-red-400">Impossible de charger le profil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-content-primary">Profil</h2>

      {/* Profile Card */}
      <div className="bg-surface-primary rounded-xl border border-edge-primary p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <span className="text-primary-700 dark:text-primary-400 font-bold text-2xl">
                {user.username[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              {editing ? (
                <form onSubmit={handleSave} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="input-field"
                      rows={2}
                      placeholder="Votre bio..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="px-3 py-1 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 disabled:opacity-50"
                    >
                      {updateMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-3 py-1 bg-surface-tertiary text-content-secondary rounded-md text-sm hover:bg-surface-tertiary/80"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-content-primary">{user.username}</h3>
                  <p className="text-content-tertiary">{user.email}</p>
                  {user.bio && <p className="text-sm text-content-secondary mt-1">{user.bio}</p>}
                </>
              )}
            </div>
          </div>
          {!editing && (
            <button
              onClick={startEditing}
              className="px-3 py-1 text-sm text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              Modifier
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-edge-primary">
          <div>
            <p className="text-sm text-content-tertiary">Heures enseignees</p>
            <p className="text-lg font-bold text-content-primary">{user.total_hours_taught.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-sm text-content-tertiary">Heures apprises</p>
            <p className="text-lg font-bold text-content-primary">{user.total_hours_learned.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-sm text-content-tertiary">Note moyenne</p>
            <p className="text-lg font-bold text-content-primary">
              {user.rating_count > 0 ? `${user.rating_avg.toFixed(1)}/5` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-content-tertiary">Avis recus</p>
            <p className="text-lg font-bold text-content-primary">{user.rating_count}</p>
          </div>
        </div>
      </div>

      {/* Time Balance */}
      {balance && (
        <div className="bg-surface-primary rounded-xl border border-edge-primary p-6">
          <h3 className="text-lg font-semibold text-content-primary mb-4">Solde temps</h3>
          <TimeBalance balance={balance} />
        </div>
      )}

      {/* Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offered */}
        <div className="bg-surface-primary rounded-xl border border-edge-primary p-6">
          <h3 className="text-lg font-semibold text-content-primary mb-4">Competences proposees</h3>
          {user.skills_offered && user.skills_offered.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.skills_offered.map((offered: any) => (
                <SkillBadge key={offered.id} skill={offered} type="offered" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-content-tertiary">Aucune competence proposee</p>
          )}
        </div>

        {/* Wanted */}
        <div className="bg-surface-primary rounded-xl border border-edge-primary p-6">
          <h3 className="text-lg font-semibold text-content-primary mb-4">Competences recherchees</h3>
          {user.skills_wanted && user.skills_wanted.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.skills_wanted.map((wanted: any) => (
                <SkillBadge key={wanted.id} skill={wanted} type="wanted" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-content-tertiary">Aucune competence recherchee</p>
          )}
        </div>
      </div>

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <div className="bg-surface-primary rounded-xl border border-edge-primary p-6">
          <h3 className="text-lg font-semibold text-content-primary mb-4">Avis recus</h3>
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
