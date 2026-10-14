import React from 'react';

export default function Sidebar({ activeView, onViewChange }) {
  const navItems = [
    {
      id: 'sessions',
      label: 'Sessions',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: 'heatmap',
      label: 'Heatmap',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-64 bg-surface-900 text-white flex flex-col shrink-0 min-h-screen border-r border-surface-800">
      <div className="h-16 flex items-center px-6 border-b border-surface-800 gap-3">
        <span className="text-2xl" role="img" aria-label="analytics">📊</span>
        <div>
          <h1 className="font-bold text-lg tracking-tight text-white">CausalFunnel</h1>
          <p className="text-xs text-surface-400">Analytics Engine</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-surface-300 hover:bg-surface-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}

        <a
          href="/demo"
          className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-surface-300 hover:bg-surface-800 hover:text-white transition-colors duration-150"
        >
          <span className="mr-3" aria-hidden="true">↗</span>
          <span>View Demo</span>
        </a>
      </nav>

      
    </aside>
  );
}
