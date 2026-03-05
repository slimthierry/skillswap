import React from 'react';
import { useCurrentUser } from '../../services/api';
import { ThemeToggleIcon } from '../../styles/theme';

export function Header() {
  const { data: user } = useCurrentUser();

  return (
    <header className="h-16 bg-surface-primary border-b border-edge-primary flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-content-primary">SkillSwap</h1>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-content-secondary">Solde:</span>
            <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">{user.time_balance_hours.toFixed(1)}h</span>
          </div>
        )}
        <ThemeToggleIcon />
        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
          <span className="text-primary-700 dark:text-primary-400 font-medium text-sm">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
      </div>
    </header>
  );
}
