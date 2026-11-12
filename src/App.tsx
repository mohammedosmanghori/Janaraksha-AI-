/**
 * JANARAKSHA AI — Police Document Intelligence Platform
 * Kalaburagi, Karnataka, India
 * "From scattered records to connected intelligence"
 */

import React, { useState, useEffect } from 'react';
import {
  PoliceRecord,
  AdministrativeTask,
  ActivityEvent,
  AppLanguage,
} from './types';
import { storageService } from './services/storageService';
import { matchingService } from './services/matchingService';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { DigitalRecordCreatorView } from './components/DigitalRecordCreatorView';
import { DocumentScannerView } from './components/DocumentScannerView';
import { ConnectionFinderView } from './components/ConnectionFinderView';
import { ProgressTrackerView } from './components/ProgressTrackerView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [lang, setLang] = useState<AppLanguage>(storageService.getAppLanguage());

  // Layout responsiveness states
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Application records & activity states
  const [records, setRecords] = useState<PoliceRecord[]>(storageService.getRecords());
  const [tasks, setTasks] = useState<AdministrativeTask[]>(storageService.getTasks());
  const [activity, setActivity] = useState<ActivityEvent[]>(storageService.getActivityEvents());
  const [selectedCaseId, setSelectedCaseId] = useState<string>('rec-demo-kal-001');

  // Sync state when storage changes
  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setRecords(storageService.getRecords());
      setTasks(storageService.getTasks());
      setActivity(storageService.getActivityEvents());
      setLang(storageService.getAppLanguage());
    });
    return unsubscribe;
  }, []);

  const handleLangChange = (newLang: AppLanguage) => {
    setLang(newLang);
    storageService.setAppLanguage(newLang);
  };

  const handleResetData = () => {
    storageService.resetToDefaultDemoData();
    setSelectedCaseId('rec-demo-kal-001');
    setActiveTab('dashboard');
  };

  const handleCompleteTask = (taskId: string) => {
    storageService.updateTaskStatus(taskId, 'Completed');
  };

  // Live calculated stats for sidebar badges
  const verifiedRecords = records.filter((r) => r.verificationStatus === 'Officer Verified');
  const globalConnections = matchingService.getAllGlobalConnections(records);
  const pendingTasksCount = tasks.filter((t) => t.status !== 'Completed').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 w-full max-w-full overflow-x-hidden">
      {/* Top Header */}
      <Header
        lang={lang}
        onLangChange={handleLangChange}
        onResetData={handleResetData}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isDesktopSidebarCollapsed={isDesktopSidebarCollapsed}
        onToggleDesktopSidebar={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
      />

      {/* Main Workspace Layout (Sidebar + Content Viewport) */}
      <div className="flex-1 flex overflow-hidden w-full max-w-full min-w-0">
        {/* Navigation Sidebar (Collapsible Desktop + Slide-in Mobile Drawer) */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
          }}
          lang={lang}
          isCollapsed={isDesktopSidebarCollapsed}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          counts={{
            records: verifiedRecords.length,
            connections: globalConnections.length,
            tasks: pendingTasksCount,
          }}
        />

        {/* Central Content Viewport — Strictly guaranteed never to blank or clip */}
        <main className="flex-1 min-w-0 w-full p-3 sm:p-5 lg:p-6 overflow-y-auto overflow-x-hidden max-w-full">
          <div className="max-w-7xl mx-auto w-full min-w-0">
            {activeTab === 'dashboard' && (
              <DashboardView
                records={records}
                tasks={tasks}
                activity={activity}
                connections={globalConnections}
                lang={lang}
                onNavigate={(tab, caseId) => {
                  if (caseId) setSelectedCaseId(caseId);
                  setActiveTab(tab);
                }}
                onCompleteTask={handleCompleteTask}
              />
            )}

            {activeTab === 'digital_fir' && (
              <DigitalRecordCreatorView
                lang={lang}
                onRecordCreated={(newRec) => {
                  setSelectedCaseId(newRec.id);
                }}
                onNavigateToConnections={(caseId) => {
                  setSelectedCaseId(caseId);
                  setActiveTab('connections');
                }}
                onCancel={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'scanner' && (
              <DocumentScannerView
                lang={lang}
                defaultDistrict="Kalaburagi"
                onRecordSaved={(record) => {
                  setSelectedCaseId(record.id);
                }}
                onNavigateToConnections={(caseId) => {
                  setSelectedCaseId(caseId);
                  setActiveTab('connections');
                }}
              />
            )}

            {activeTab === 'connections' && (
              <ConnectionFinderView
                records={records}
                selectedCaseId={selectedCaseId}
                onSelectCase={(caseId) => setSelectedCaseId(caseId)}
                onOpenCaseTracker={(caseId) => {
                  setSelectedCaseId(caseId);
                  setActiveTab('tracker');
                }}
                lang={lang}
              />
            )}

            {activeTab === 'tracker' && (
              <ProgressTrackerView
                records={records}
                tasks={tasks}
                activity={activity}
                selectedCaseId={selectedCaseId}
                onSelectCase={(caseId) => setSelectedCaseId(caseId)}
                lang={lang}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                lang={lang}
                activeDistrict="Kalaburagi"
                onResetData={handleResetData}
              />
            )}
          </div>
        </main>
      </div>

      {/* Persistent Status & Compliance Footer */}
      <footer className="bg-white border-t border-slate-200 px-4 sm:px-6 py-2.5 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 w-full max-w-full">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-800">{storageService.getAppLanguage() === 'kn' ? 'ಜನರಕ್ಷಾ AI' : 'JANARAKSHA AI'}</span>
          <span>·</span>
          <span>{lang === 'kn' ? 'ಪೊಲೀಸ್ ದಾಖಲೆ ಗುಪ್ತಚರ ಮತ್ತು ಕಾಗದರಹಿತ ವೇದಿಕೆ' : 'Police Document Intelligence & Paperless Incident Platform'}</span>
          <span>·</span>
          <span className="font-semibold text-slate-700">{lang === 'kn' ? 'ಕಲಬುರಗಿ, ಕರ್ನಾಟಕ' : 'Kalaburagi, Karnataka'}</span>
        </div>
        <div className="text-[10px] text-slate-400 text-center sm:text-right">
          {lang === 'kn' ? 'ಪ್ರದರ್ಶನ ಪರಿಸರ · ಕಲಬುರಗಿ ಪೊಲೀಸ್ ಠಾಣೆಗಳು · ಕಲ್ಪಿತ ದಾಖಲೆಗಳು ಮಾತ್ರ' : 'Demonstration Environment · Kalaburagi Police Stations · Fictional Records Only'}
        </div>
      </footer>
    </div>
  );
}
