import React, { useState, useEffect } from 'react';
import { AppLanguage, District } from '../types';
import { translations } from '../i18n/translations';
import { storageService } from '../services/storageService';
import { documentService } from '../services/documentService';
import {
  ShieldAlert,
  Server,
  Database,
  RotateCcw,
  Download,
  CheckCircle2,
  Building,
  Cpu,
} from 'lucide-react';

interface SettingsViewProps {
  lang: AppLanguage;
  activeDistrict: District | string;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  lang,
  onResetData,
}) => {
  const t = translations[lang];

  const [serverHealth, setServerHealth] = useState<{
    hasGeminiKey: boolean;
    app: string;
    checked: boolean;
  }>({
    hasGeminiKey: false,
    app: 'JANARAKSHA AI',
    checked: false,
  });

  const [resetSuccessNotice, setResetSuccessNotice] = useState(false);

  useEffect(() => {
    documentService.checkServerHealth().then((res) => {
      setServerHealth({
        hasGeminiKey: res.hasGeminiKey,
        app: res.app,
        checked: true,
      });
    });
  }, []);

  const handleDownloadBackup = () => {
    const backupStr = storageService.exportBackup();
    const blob = new Blob([backupStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `janaraksha_ai_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTriggerReset = () => {
    if (window.confirm(t.settings.resetConfirm)) {
      onResetData();
      setResetSuccessNotice(true);
      setTimeout(() => setResetSuccessNotice(false), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          {t.settings.title}
        </h1>
        <p className="text-xs md:text-sm text-slate-600 mt-0.5">
          {t.settings.subtitle}
        </p>
      </div>


      {/* System Capabilities & Server Integration Status */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Server className="w-4 h-4 text-slate-700" />
          <span>{t.settings.systemStatus}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Server-Side Gemini */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-teal-700" />
                <span>{t.settings.geminiEngine}</span>
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  serverHealth.hasGeminiKey
                    ? 'bg-teal-100 text-teal-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {serverHealth.hasGeminiKey
                  ? (lang === 'kn' ? 'ಜೆಮಿನೈ 3.8 ಸಕ್ರಿಯವಾಗಿದೆ' : 'Gemini 3.8 Active')
                  : (lang === 'kn' ? 'ಪರ್ಯಾಯ / ಪ್ರದರ್ಶನ ಮೋಡ್' : 'Fallback / Preset Mode')}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {serverHealth.hasGeminiKey
                ? (lang === 'kn' ? 'ಸರ್ವರ್‌ನಲ್ಲಿ ಜೆಮಿನೈ ಮಾದರಿ ಸಂರಚಿಸಲಾಗಿದೆ. ಸ್ಕ್ಯಾನ್ ದಾಖಲೆಗಳನ್ನು ರಚನಾತ್ಮಕ ಜೈಸನ್ ಆಗಿ ಪರಿವರ್ತಿಸುತ್ತದೆ.' : 'Server-side Gemini 3.8 Flash model configured. Processes scanned police documents into structured JSON.')
                : (lang === 'kn' ? 'ಜೆಮಿನೈ ಕೀ ಸಂರಚಿಸಿಲ್ಲ. ಕಲಬುರಗಿ ಮಾದರಿ ದಾಖಲೆಗಳೊಂದಿಗೆ ವೇದಿಕೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.' : 'Server-side GEMINI_API_KEY is not configured. The platform operates with built-in fictional Kalyan Karnataka sample presets.')}
            </p>
            <div className="text-[10px] text-slate-500 font-mono pt-1">
              Backend Route: /api/gemini/extract (Server-Only, No Frontend Keys)
            </div>
          </div>

          {/* Persistent Data Engine */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-blue-700" />
                <span>{t.settings.storageEngine}</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                {lang === 'kn' ? 'ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ' : 'Operational'}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {t.settings.storageEngineDesc}
            </p>
            <div className="text-[10px] text-slate-500 font-mono pt-1">
              {lang === 'kn' ? 'ಕಲಬುರಗಿ ಠಾಣೆಗಳ ಮಾದರಿ ಭಂಡಾರ ಸಕ್ರಿಯವಾಗಿದೆ' : 'Kalaburagi police stations persistent repository active'}
            </div>
          </div>
        </div>
      </div>

      {/* Regional Governance Configuration */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Building className="w-4 h-4 text-slate-700" />
          <span>{t.settings.regionalGovTitle}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.settings.policeZoneLabel}</span>
            <span className="font-bold text-slate-900 mt-1 block">{t.settings.policeZoneValue}</span>
            <span className="text-[11px] text-slate-500">{t.kspHeader}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.settings.demoLocationLabel}</span>
            <span className="font-bold text-slate-900 mt-1 block">{t.settings.demoLocationValue}</span>
            <span className="text-[11px] text-slate-500">{lang === 'kn' ? 'ಕರ್ನಾಟಕ, ಭಾರತ' : 'Karnataka, India'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.settings.langEngineLabel}</span>
            <span className="font-bold text-slate-900 mt-1 block">
              {lang === 'kn' ? 'ಕನ್ನಡ (Kannada)' : 'English (en-IN)'}
            </span>
            <span className="text-[11px] text-slate-500">{t.settings.langEngineValue}</span>
          </div>
        </div>
      </div>

      {/* Data Management Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
          {t.settings.dataManagementTitle}
        </h2>

        {resetSuccessNotice && (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-700" />
            <span>{t.settings.resetSuccess}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleTriggerReset}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 rounded-lg font-semibold text-xs flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-700" />
            <span>{t.settings.resetData}</span>
          </button>

          <button
            onClick={handleDownloadBackup}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg font-semibold text-xs flex items-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>{t.settings.exportData}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
