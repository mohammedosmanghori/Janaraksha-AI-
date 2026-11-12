import React from 'react';
import {
  PoliceRecord,
  AdministrativeTask,
  ActivityEvent,
  PotentialConnection,
  AppLanguage,
} from '../types';
import { translations } from '../i18n/translations';
import {
  FileCheck2,
  FileUp,
  GitBranch,
  ListTodo,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Plus,
} from 'lucide-react';

interface DashboardViewProps {
  records: PoliceRecord[];
  tasks: AdministrativeTask[];
  activity: ActivityEvent[];
  connections: PotentialConnection[];
  lang: AppLanguage;
  onNavigate: (tab: 'digital_fir' | 'scanner' | 'connections' | 'tracker' | 'settings', caseId?: string) => void;
  onCompleteTask: (taskId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  tasks,
  activity,
  connections,
  lang,
  onNavigate,
  onCompleteTask,
}) => {
  const t = translations[lang];

  // Dynamic live statistics calculated strictly from stored data
  const verifiedCount = records.filter((r) => r.verificationStatus === 'Officer Verified').length;
  const docsUploadedCount = records.filter((r) => Boolean(r.attachedDocument)).length;
  const potentialConnectionsCount = connections.length;
  const pendingTasksCount = tasks.filter((t) => t.status !== 'Completed').length;

  const recentRecords = records.slice(0, 6);
  const recentActivity = activity.slice(0, 6);
  const pendingTasks = tasks.filter((t) => t.status !== 'Completed').slice(0, 4);

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Welcome Banner & Prominent "+ CREATE NEW FIR / RECORD" Action */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="font-semibold text-teal-800">
              {lang === 'kn' ? 'ಕಲಬುರಗಿ ಠಾಣಾ ವೇದಿಕೆ' : 'Kalaburagi Station Workspace'}
            </span>
            <span>·</span>
            <span>{t.kspHeader}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 truncate">
            {t.appTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {t.tagline}. {t.dashboard.welcomeSub}
          </p>
        </div>

        {/* Action Buttons with Prominent + CREATE NEW FIR / RECORD */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('digital_fir')}
            className="px-4 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t.dashboard.createNewFir}</span>
          </button>

          <button
            onClick={() => onNavigate('scanner')}
            className="px-3.5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
          >
            <FileUp className="w-3.5 h-3.5 text-teal-400" />
            <span>{t.dashboard.uploadDoc}</span>
          </button>

          <button
            onClick={() => onNavigate('connections')}
            className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <GitBranch className="w-3.5 h-3.5 text-teal-700" />
            <span>{t.dashboard.findConnections}</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Verified Records */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t.stats.totalRecords}</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {verifiedCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {t.stats.totalRecordsSub} ({records.length})
            </span>
          </div>
          <div className="mt-2 text-[11px] text-teal-700 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t.stats.totalRecordsDesc}</span>
          </div>
        </div>

        {/* Stat 2: Documents Uploaded */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t.stats.documentsUploaded}</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <FileUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {docsUploadedCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {t.stats.documentsUploadedSub}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600">
            {t.stats.documentsUploadedDesc}
          </div>
        </div>

        {/* Stat 3: Potential Connections */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t.stats.potentialConnections}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
              <GitBranch className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {potentialConnectionsCount}
            </span>
            <span className="text-[11px] text-amber-800 font-semibold">
              {t.stats.potentialConnectionsSub}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600">
            {t.stats.potentialConnectionsDesc}
          </div>
        </div>

        {/* Stat 4: Pending Tasks */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t.stats.pendingTasks}</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {pendingTasksCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {t.stats.pendingTasksSub}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 truncate">
            {t.stats.pendingTasksDesc}
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Records Table + Pending Tasks & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Recent Verified Records in Kalaburagi */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">{t.dashboard.recentRecordsTitle}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t.dashboard.recentRecordsSub}
                </p>
              </div>
              <button
                onClick={() => onNavigate('digital_fir')}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition-colors"
              >
                <span>{t.dashboard.newRecordBadge}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4 whitespace-nowrap">{t.dashboard.caseRefHeader}</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">{t.dashboard.incidentTypeHeader}</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">{t.dashboard.stationDateHeader}</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">{t.dashboard.identifiersHeader}</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">{t.dashboard.statusHeader}</th>
                    <th className="py-2.5 px-4 text-right whitespace-nowrap">{t.dashboard.actionHeader}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        {t.dashboard.noRecords}
                      </td>
                    </tr>
                  ) : (
                    recentRecords.map((record) => {
                      const isVerified = record.verificationStatus === 'Officer Verified';

                      return (
                        <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-slate-900">{record.caseReference}</div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                              {lang === 'kn'
                                ? (record.sourceType === 'digital_fir' ? 'ಕಾಗದರಹಿತ ಎಫ್‌ಐಆರ್' : 'ಸ್ಕ್ಯಾನ್ ದಾಖಲೆ')
                                : (record.sourceType === 'digital_fir' ? 'Paperless FIR' : 'Scanned Archive')}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{record.incidentType}</div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                              {record.incidentSummary.slice(0, 50)}...
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-slate-800 font-medium truncate max-w-[160px]">
                              {record.policeStation}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span className="truncate">{record.dateTime}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                              {record.imeiNumbers && record.imeiNumbers.length > 0 && (
                                <span className="font-mono text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-900 rounded font-bold">
                                  {record.imeiNumbers[0]}
                                </span>
                              )}
                              {record.vehicleReferences.length > 0 && (
                                <span className="font-mono text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded font-bold">
                                  {record.vehicleReferences[0]}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                                isVerified ? 'text-teal-700' : 'text-amber-700'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isVerified ? 'bg-teal-600' : 'bg-amber-500'
                                }`}
                              />
                              {isVerified ? t.common.verified : t.common.pending}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => onNavigate('connections', record.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded transition-colors"
                            >
                              {t.dashboard.checkConnections}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Pending Actions & Activity Feed */}
        <div className="space-y-6">
          {/* Pending Tasks Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">{t.dashboard.pendingActionsTitle}</h3>
                <span className="text-[11px] text-slate-500">{t.dashboard.pendingActionsSub}</span>
              </div>
              <button
                onClick={() => onNavigate('tracker')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors"
              >
                {t.common.viewAll}
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {pendingTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  {t.dashboard.noTasks}
                </div>
              ) : (
                pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start gap-2.5"
                  >
                    <input
                      type="checkbox"
                      checked={task.status === 'Completed'}
                      onChange={() => onCompleteTask(task.id)}
                      className="mt-1 h-3.5 w-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {task.title}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            task.priority === 'Urgent'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {task.priority === 'Urgent' ? t.common.urgent : (task.priority === 'Normal' ? t.common.normal : t.common.low)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                        <span className="font-mono text-slate-700 font-semibold">{task.caseReference}</span>
                        <span>·</span>
                        <span>{lang === 'kn' ? 'ಅಂತಿಮ ದಿನಾಂಕ: ' : 'Due '}{task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chronological Activity Feed */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">{t.dashboard.recentActivityTitle}</h3>
              <span className="text-[11px] text-slate-500">{t.dashboard.auditFeed}</span>
            </div>

            <div className="mt-3 space-y-3">
              {recentActivity.map((ev) => (
                <div key={ev.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900 truncate">
                      {ev.title}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {ev.description}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span>{ev.performedBy}</span>
                      {ev.caseReference && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-slate-600 font-medium">{ev.caseReference}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
