import React from 'react';
import { AppLanguage } from '../types';
import { translations } from '../i18n/translations';
import {
  MapPin,
  Menu,
  RotateCcw,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

interface HeaderProps {
  lang: AppLanguage;
  onLangChange: (lang: AppLanguage) => void;
  onResetData: () => void;
  onToggleMobileMenu: () => void;
  isDesktopSidebarCollapsed: boolean;
  onToggleDesktopSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLangChange,
  onResetData,
  onToggleMobileMenu,
  isDesktopSidebarCollapsed,
  onToggleDesktopSidebar,
}) => {
  const t = translations[lang];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-5 flex items-center justify-between gap-3 sticky top-0 z-30 w-full max-w-full">
      {/* Zone 1: Mobile Hamburger / Desktop Collapse + Brand */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
        {/* Mobile Hamburger Menu */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          title={lang === 'kn' ? 'ನ್ಯಾವಿಗೇಷನ್ ಮೆನು' : 'Toggle Navigation Menu'}
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Toggle Button */}
        <button
          type="button"
          onClick={onToggleDesktopSidebar}
          className="hidden md:flex p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          title={isDesktopSidebarCollapsed ? (lang === 'kn' ? 'ಮೆನು ವಿಸ್ತರಿಸಿ' : 'Expand Sidebar') : (lang === 'kn' ? 'ಮೆನು ಕುಗ್ಗಿಸಿ' : 'Collapse Sidebar')}
          aria-label="Toggle Sidebar Width"
        >
          {isDesktopSidebarCollapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* Brand Lockup */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-teal-400 flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
            JA
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-slate-900 text-base sm:text-lg leading-none truncate">
                {t.appTitle}
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded whitespace-nowrap">
                {lang === 'kn' ? 'ಕಲಬುರಗಿ' : 'Kalaburagi'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs md:max-w-md hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Zone 2: Fixed Location: Kalaburagi + Language + Reset */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Fixed Kalaburagi Location Indicator (No dropdown as requested!) */}
        <div className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
          <span className="font-semibold text-slate-900 whitespace-nowrap">
            {t.locationBadge}
          </span>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md text-xs">
          <button
            onClick={() => onLangChange('en')}
            className={`px-2 py-1 font-semibold rounded transition-colors ${
              lang === 'en'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => onLangChange('kn')}
            className={`px-2 py-1 font-semibold rounded transition-colors ${
              lang === 'kn'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ಕನ್ನಡ
          </button>
        </div>

        {/* Reset Demo Data button */}
        <button
          onClick={onResetData}
          title={lang === 'kn' ? 'ಕಲಬುರಗಿ ಮಾದರಿ ದಾಖಲೆಗಳಿಗೆ ಮರುಹೊಂದಿಸಿ (DEMO-KAL-001 ರಿಂದ DEMO-KAL-006)' : 'Reset demonstration data to pristine Kalaburagi records (DEMO-KAL-001 to DEMO-KAL-006)'}
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors text-xs flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">{t.resetDemo}</span>
        </button>
      </div>

      {/* Zone 3: Demonstration Profile */}
      <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200 shrink-0">
        <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 text-teal-900 flex items-center justify-center font-bold text-xs shrink-0">
          OD
        </div>
        <div className="text-left hidden lg:block">
          <div className="text-xs font-semibold text-slate-900 leading-tight">
            {t.officerName}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {t.demoBadge}
          </div>
        </div>
      </div>
    </header>
  );
};
