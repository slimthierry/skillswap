import React from 'react';
import { useDashboard, useSkillMap, useTopTeachers } from '@skillswap/api-client';
import { SkillMap, TopTeachers, TimeBalance } from '@skillswap/ui';

export default function DashboardPage() {
  const { data: dashboard, isLoading: loadingDashboard } = useDashboard();
  const { data: skillMap } = useSkillMap();
  const { data: topTeachers } = useTopTeachers();

  if (loadingDashboard) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="bg-surface-tertiary rounded-xl h-32 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => <div key={i} className="bg-surface-tertiary rounded-lg h-28" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Erreur de chargement</h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-400">Impossible de charger le tableau de bord</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold">Bienvenue sur SkillSwap</h2>
        <p className="text-primary-100 mt-1">Echangez vos competences et apprenez de nouvelles choses</p>
      </div>

      {/* Time Balance */}
      <div className="bg-surface-primary rounded-xl border border-edge-primary p-6">
        <h3 className="text-lg font-semibold text-content-primary mb-4">Solde temps</h3>
        <TimeBalance balance={dashboard.balance} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-primary rounded-xl border border-edge-primary p-5">
          <p className="text-sm text-content-tertiary">Heures enseignees</p>
          <p className="text-2xl font-bold text-content-primary mt-1">{dashboard.total_hours_taught.toFixed(1)}h</p>
        </div>
        <div className="bg-surface-primary rounded-xl border border-edge-primary p-5">
          <p className="text-sm text-content-tertiary">Heures apprises</p>
          <p className="text-2xl font-bold text-content-primary mt-1">{dashboard.total_hours_learned.toFixed(1)}h</p>
        </div>
        <div className="bg-surface-primary rounded-xl border border-edge-primary p-5">
          <p className="text-sm text-content-tertiary">Sessions completees</p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">{dashboard.completed_sessions_count}</p>
        </div>
        <div className="bg-surface-primary rounded-xl border border-edge-primary p-5">
          <p className="text-sm text-content-tertiary">Note moyenne</p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">
            {dashboard.rating_count > 0 ? `${dashboard.rating_avg.toFixed(1)}/5` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-primary rounded-xl border border-edge-primary p-5">
          <p className="text-sm text-content-tertiary">Sessions a venir</p>
          <p className="text-2xl font-bold text-content-primary mt-1">{dashboard.upcoming_sessions_count}</p>
        </div>
        <div className="bg-surface-primary rounded-xl border border-edge-primary p-5">
          <p className="text-sm text-content-tertiary">Competences proposees</p>
          <p className="text-2xl font-bold text-content-primary mt-1">{dashboard.skills_offered_count}</p>
        </div>
        <div className="bg-surface-primary rounded-xl border border-edge-primary p-5">
          <p className="text-sm text-content-tertiary">Competences recherchees</p>
          <p className="text-2xl font-bold text-content-primary mt-1">{dashboard.skills_wanted_count}</p>
        </div>
      </div>

      {/* Skill Map & Top Teachers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {skillMap && (
          <div className="bg-surface-primary rounded-xl border border-edge-primary p-6">
            <h3 className="text-lg font-semibold text-content-primary mb-4">Carte des competences</h3>
            <SkillMap entries={skillMap} />
          </div>
        )}

        {topTeachers && (
          <div className="bg-surface-primary rounded-xl border border-edge-primary p-6">
            <h3 className="text-lg font-semibold text-content-primary mb-4">Meilleurs enseignants</h3>
            <TopTeachers teachers={topTeachers} />
          </div>
        )}
      </div>
    </div>
  );
}
