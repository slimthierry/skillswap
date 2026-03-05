import React, { useState } from 'react';
import {
  useMySessions,
  useConfirmSession,
  useCompleteSession,
  useCancelSession,
} from '../services/api';
import { SessionCard } from '../components';
import type { SessionStatus } from '../types';

const statusFilters: { value: string; label: string }[] = [
  { value: '', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmees' },
  { value: 'completed', label: 'Completees' },
  { value: 'cancelled', label: 'Annulees' },
];

export default function SessionsPage() {
  const { data: sessions, isLoading } = useMySessions();
  const confirmMutation = useConfirmSession();
  const completeMutation = useCompleteSession();
  const cancelMutation = useCancelSession();
  const [filterStatus, setFilterStatus] = useState('');

  const filteredSessions = sessions?.filter(
    (s) => !filterStatus || s.status === filterStatus,
  );

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-content-primary">Sessions</h2>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterStatus === f.value
                ? 'bg-primary-500 text-white'
                : 'bg-surface-primary text-content-secondary border border-edge-primary hover:bg-surface-secondary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="bg-surface-tertiary animate-pulse rounded-lg h-32" />)}
        </div>
      ) : filteredSessions && filteredSessions.length > 0 ? (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onConfirm={() => confirmMutation.mutate(session.id)}
              onComplete={() => completeMutation.mutate(session.id)}
              onCancel={() => cancelMutation.mutate(session.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-content-tertiary">
            {filterStatus
              ? `Aucune session avec le statut "${statusFilters.find((f) => f.value === filterStatus)?.label}".`
              : 'Aucune session pour le moment. Trouvez un partenaire via le matching et reservez une session!'}
          </p>
        </div>
      )}
    </div>
  );
}
