import React from 'react';
import { Shield } from 'lucide-react';
import { AppLanguage } from '../types';
import { translations } from '../i18n/translations';

interface Props {
  lang: AppLanguage;
  compact?: boolean;
}

export const ResponsibleAiBanner: React.FC<Props> = ({ lang, compact = false }) => {
  const t = translations[lang];

  return (
    <div className={`bg-amber-50/90 border border-amber-200/80 rounded-lg p-3 text-amber-950 flex items-start gap-3 ${compact ? 'text-xs' : 'text-xs md:text-sm'}`}>
      <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-900">{t.responsibleBadge}</span>
          <span className="text-amber-700">·</span>
          <span className="text-amber-800">{t.humanRequired}</span>
        </div>
        <p className="text-amber-900/90 leading-relaxed">
          {t.connections.responsibleNotice}{' '}
          {lang === 'kn'
            ? 'ಹಂಚಿಕೆಯಾದ ಗುರುತು ಕೇವಲ ವಾಸ್ತವಿಕ ದಾಖಲೆ ಸಂಬಂಧವನ್ನು ಸೂಚಿಸುತ್ತದೆ, ಯಾವುದೇ ಆಪಾದನೆಯನ್ನಲ್ಲ. ಪ್ರತಿಯೊಂದು ಸುಳಿವನ್ನು ಅಧಿಕೃತ ತನಿಖಾಧಿಕಾರಿಗಳು ಪರಿಶೀಲಿಸಬೇಕು.'
            : 'A shared identifier indicates a factual document correlation, not an allegation or guilt determination. Every suggestion remains strictly subject to authorized officer evaluation.'}
        </p>
      </div>
    </div>
  );
};
