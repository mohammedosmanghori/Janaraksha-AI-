import React from 'react';
import {
  LayoutDashboard,
  FilePlus,
  ScanText,
  GitBranch,
  ListTodo,
  Settings,
  ShieldAlert,
  X,
} from 'lucide-react';
import { AppLanguage } from '../types';
import { translations } from '../i18n/translations';

export type ActiveTab = 'dashboard' | 'digital_fir' | 'scanner' | 'connections' | 'tracker' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  lang: AppLanguage;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  counts: {
    records: number;
    connections: number;
    tasks: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  lang,
  isCollapsed,
  isMobileOpen,
  onCloseMobile,
  counts,
}) => {
  const t = translations[lang];

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: t.nav.dashboard,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'digital_fir' as ActiveTab,
      label: t.nav.digitalFir,
      icon: FilePlus,
      highlight: true,
      badge: lang === 'kn' ? '+ ಹೊಸತು' : '+ New',
    },
    {
      id: 'scanner' as ActiveTab,
      label: t.nav.scanner,
      icon: ScanText,
      badge: `${counts.records}`,
    },
    {
      id: 'connections' as ActiveTab,
      label: t.nav.connectionFinder,
      icon: GitBranch,
      badge: counts.connections > 0 ? `${counts.connections}` : null,
      highlightBadge: counts.connections > 0,
    },
    {
      id: 'tracker' as ActiveTab,
      label: t.nav.progressTracker,
      icon: ListTodo,
      badge: counts.tasks > 0 ? `${counts.tasks}` : null,
    },
    {
      id: 'settings' as ActiveTab,
      label: t.nav.settings,
      icon: Settings,
      badge: null,
    },
  ];

  const renderNavContent = () => (
    <div className="flex flex-col h-full select-none">
      {/* Sidebar Header */}
      <div className={`p-4 border-b border-slate-800 flex items-center justify-between ${isCollapsed ? 'justify-center p-3' : ''}`}>
        {!isCollapsed && (
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-teal-400">
              {t.kspHeader}
            </div>
            <div className="text-xs font-semibold text-slate-300 mt-0.5">
              {lang === 'kn' ? 'ಕಲಬುರಗಿ ನಗರ ಪೊಲೀಸ್' : 'Kalaburagi City Police'}
            </div>
          </div>
        )}
        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1 text-slate-400 hover:text-white rounded"
          title={lang === 'kn' ? 'ಮೆನು ಮುಚ್ಚಿ' : 'Close Navigation'}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                onCloseMobile();
              }}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center rounded-lg text-xs font-semibold transition-colors text-left ${
                isCollapsed
                  ? 'justify-center p-2.5'
                  : 'justify-between px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-teal-600 text-white shadow-xs'
                  : item.highlight
                  ? 'bg-slate-800/90 text-teal-300 hover:bg-slate-800 hover:text-white border border-teal-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : item.highlight ? 'text-teal-400' : 'text-slate-400'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isCollapsed && item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 tabular-nums ${
                    isActive
                      ? 'bg-teal-700 text-white'
                      : item.highlightBadge
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Safeguard Note */}
      {!isCollapsed && (
        <div className="p-3.5 border-t border-slate-800 text-[10px] space-y-1 text-slate-400 bg-slate-950/40">
          <div className="flex items-center gap-1.5 text-teal-400 font-bold">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>{lang === 'kn' ? 'ಕಲಬುರಗಿ ಠಾಣಾ ವೇದಿಕೆ' : 'Kalaburagi Station Workspace'}</span>
          </div>
          <p className="leading-relaxed">
            {lang === 'kn' ? 'ಕಾಗದರಹಿತ ಡಿಜಿಟಲ್ ದಾಖಲೆಗಳು & ಗುಪ್ತಚರತೆ.' : 'Paperless digital records & document intelligence.'}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in"
        />
      )}

      {/* Mobile Slide-in Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 z-50 transform transition-transform duration-200 ease-in-out md:hidden shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderNavContent()}
      </aside>

      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-200 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {renderNavContent()}
      </aside>
    </>
  );
};
