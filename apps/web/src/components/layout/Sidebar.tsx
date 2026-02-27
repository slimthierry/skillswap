import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

const navigation = [
  { name: 'Tableau de bord', path: '/', icon: '\u{1F3E0}' },
  { name: 'Matching', path: '/matching', icon: '\u{1F50D}' },
  { name: 'Competences', path: '/skills', icon: '\u{1F4DA}' },
  { name: 'Sessions', path: '/sessions', icon: '\u{1F4C5}' },
  { name: 'Profil', path: '/profile', icon: '\u{1F464}' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className={clsx(
      'bg-surface-primary border-r border-edge-primary transition-all duration-300 flex flex-col',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-edge-primary">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            SS
          </div>
          {!collapsed && (
            <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              SkillSwap
            </span>
          )}
        </div>
        <button onClick={onToggle} className="text-content-tertiary hover:text-content-secondary text-sm">
          {collapsed ? '\u2192' : '\u2190'}
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={clsx(
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border-r-2 border-primary-600 dark:border-primary-400'
                  : 'text-content-secondary hover:bg-surface-secondary',
                'flex items-center w-full text-sm font-medium transition-colors rounded-l-md',
                collapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span className="ml-3 truncate">{item.name}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
