import React, { useState } from 'react';
import { useMatches, useMutualMatches } from '@skillswap/api-client';
import { MatchCard } from '@skillswap/ui';

type MatchTab = 'all' | 'mutual';

export default function MatchingPage() {
  const [tab, setTab] = useState<MatchTab>('all');
  const { data: matches, isLoading: loadingMatches } = useMatches();
  const { data: mutualMatches, isLoading: loadingMutual } = useMutualMatches();

  const isLoading = tab === 'all' ? loadingMatches : loadingMutual;
  const currentMatches = tab === 'all' ? matches : mutualMatches;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-content-primary">Matching</h2>

      {/* Tab Selector */}
      <div className="inline-flex rounded-lg border border-edge-primary bg-surface-primary p-1">
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'all' ? 'bg-primary-500 text-white' : 'text-content-secondary hover:bg-surface-tertiary'
          }`}
        >
          Tous les matchs
        </button>
        <button
          onClick={() => setTab('mutual')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'mutual' ? 'bg-primary-500 text-white' : 'text-content-secondary hover:bg-surface-tertiary'
          }`}
        >
          Matchs mutuels
        </button>
      </div>

      {/* Description */}
      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
        <p className="text-sm text-primary-800 dark:text-primary-400">
          {tab === 'all'
            ? 'Utilisateurs qui proposent des competences que vous recherchez, ou qui recherchent des competences que vous proposez.'
            : 'Matchs mutuels : utilisateurs qui proposent ce que vous cherchez ET qui cherchent ce que vous proposez. Ideal pour un echange direct!'}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="bg-surface-tertiary animate-pulse rounded-lg h-40" />)}
        </div>
      ) : currentMatches && currentMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentMatches.map((match) => (
            <MatchCard key={match.user.id} match={match} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-content-tertiary">
            {tab === 'all'
              ? 'Aucun match trouve. Ajoutez des competences proposees et recherchees pour trouver des partenaires!'
              : 'Aucun match mutuel pour le moment. Continuez a enrichir votre profil!'}
          </p>
        </div>
      )}
    </div>
  );
}
