import React, { useState, useMemo } from 'react';
import {
  PoliceRecord,
  AdministrativeTask,
  ActivityEvent,
  TaskPriority,
  TaskStatus,
  AppLanguage,
} from '../types';
import { translations } from '../i18n/translations';
import { storageService } from '../services/storageService';
import { matchingService } from '../services/matchingService';
import {
  Plus,
  GitBranch,
  MessageSquare,
  Send,
  User,
  Calendar,
  ChevronDown,
} from 'lucide-react';

interface ProgressTrackerViewProps {
  records: PoliceRecord[];
  tasks: AdministrativeTask[];
  activity: ActivityEvent[];
  selectedCaseId?: string;
  onSelectCase: (caseId: string) => void;
  lang: AppLanguage;
}

const DEMO_OFFICERS = [
  'Officer Demo (Lead Reviewer)',
  'ASI M. K. Rathod (Brahampur PS)',
  'PSI Raghavendra Swamy (Station Bazaar PS)',
  'HC Basavaraj Patil (Farhatabad PS)',
];

export const ProgressTrackerView: React.FC<ProgressTrackerViewProps> = ({
  records,
  tasks,
  activity,
  selectedCaseId,
  onSelectCase,
  lang,
}) => {
  const t = translations[lang];

  // Active selected record
  const activeRecord = useMemo(() => {
    if (selectedCaseId) {
      return (
        records.find((r) => r.id === selectedCaseId || r.caseReference === selectedCaseId) ||
        records[0]
      );
    }
    return records[0];
  }, [records, selectedCaseId]);

  // Case-specific tasks and activity
  const caseTasks = useMemo(() => {
    if (!activeRecord) return [];
    return tasks.filter(
      (t) => t.caseId === activeRecord.id || t.caseReference === activeRecord.caseReference
    );
  }, [tasks, activeRecord]);

  const caseActivity = useMemo(() => {
    if (!activeRecord) return [];
    return activity.filter(
      (a) => a.caseId === activeRecord.id || a.caseReference === activeRecord.caseReference
    );
  }, [activity, activeRecord]);

  // Verified matches for this case
  const caseConnections = useMemo(() => {
    if (!activeRecord) return [];
    return matchingService.findConnectionsForRecord(activeRecord, records);
  }, [activeRecord, records]);

  // Task creation state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [assignedTo, setAssignedTo] = useState(DEMO_OFFICERS[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<TaskPriority>('Normal');

  // Administrative note state
  const [adminNote, setAdminNote] = useState('');

  // Inline note on a task
  const [editingTaskNoteId, setEditingTaskNoteId] = useState<string | null>(null);
  const [taskNoteInput, setTaskNoteInput] = useState('');

  // Handle task submission
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !activeRecord) return;

    const newTask: AdministrativeTask = {
      id: `task-${Date.now()}`,
      caseId: activeRecord.id,
      caseReference: activeRecord.caseReference,
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      assignedTo,
      dueDate,
      priority,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      notes: [],
    };

    storageService.saveTask(newTask);

    storageService.logActivity({
      type: 'TASK_CREATED',
      caseId: activeRecord.id,
      caseReference: activeRecord.caseReference,
      title: lang === 'kn' ? 'ಆಡಳಿತಾತ್ಮಕ ಅನುಸರಣಾ ಕಾರ್ಯ ನಿಯೋಜಿಸಲಾಗಿದೆ' : 'Administrative Follow-Up Assigned',
      description: `Task "${newTask.title}" assigned to ${newTask.assignedTo}. Due ${newTask.dueDate}.`,
      performedBy: lang === 'kn' ? 'ಅಧಿಕಾರಿ ಡೆಮೊ' : 'Officer Demo',
    });

    setShowTaskModal(false);
    setTaskTitle('');
    setTaskDesc('');
  };

  // Handle task status update
  const handleUpdateStatus = (taskId: string, status: TaskStatus) => {
    storageService.updateTaskStatus(taskId, status);
  };

  // Handle adding note to task
  const handleSaveTaskNote = (taskId: string) => {
    if (taskNoteInput.trim()) {
      storageService.addTaskNote(taskId, taskNoteInput.trim());
      setEditingTaskNoteId(null);
      setTaskNoteInput('');
    }
  };

  // Handle adding administrative note to case timeline
  const handleAddAdminNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNote.trim() || !activeRecord) return;

    storageService.logActivity({
      type: 'ADMIN_NOTE_ADDED',
      caseId: activeRecord.id,
      caseReference: activeRecord.caseReference,
      title: lang === 'kn' ? 'ಆಡಳಿತಾತ್ಮಕ ಪ್ರಗತಿ ಟಿಪ್ಪಣಿ' : 'Administrative Progress Note',
      description: adminNote.trim(),
      performedBy: lang === 'kn' ? 'ಅಧಿಕಾರಿ ಡೆಮೊ' : 'Officer Demo',
    });

    setAdminNote('');
  };

  // Helper styles for task status badge & dropdown
  const getStatusDropdownStyle = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-teal-50/90 text-teal-800 border-teal-300 hover:bg-teal-100/90 focus:ring-teal-500';
      case 'In Progress':
        return 'bg-amber-50/90 text-amber-800 border-amber-300 hover:bg-amber-100/90 focus:ring-amber-500';
      case 'Pending':
      default:
        return 'bg-slate-100/80 text-slate-700 border-slate-300 hover:bg-slate-200/70 focus:ring-slate-400';
    }
  };

  const getStatusDotColor = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-teal-600';
      case 'In Progress':
        return 'bg-amber-500 animate-pulse';
      case 'Pending':
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Case Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {t.tracker.title}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-0.5">
            {t.tracker.subtitle}
          </p>
        </div>

        {/* Case Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">{t.tracker.caseSelectorLabel}</span>
          <select
            value={activeRecord?.id}
            onChange={(e) => onSelectCase(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer shadow-xs"
          >
            {records.map((r) => (
              <option key={r.id} value={r.id}>
                {r.caseReference} — {r.incidentType} ({r.policeStation})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeRecord && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 spans): Case Workspace Details & Follow-up Tasks */}
          <div className="lg:col-span-7 space-y-6">
            {/* Case Overview Summary Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-base text-slate-900">
                    {activeRecord.caseReference}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="font-bold text-slate-800 text-sm">{activeRecord.incidentType}</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 bg-teal-50 text-teal-800 font-semibold rounded-md border border-teal-200">
                  {activeRecord.verificationStatus === 'Officer Verified' ? t.common.verified : t.common.pending}
                </span>
              </div>

              <p className="text-xs text-slate-700 mt-3 leading-relaxed">
                {activeRecord.incidentSummary}
              </p>

              {/* Verified Information Badges */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.common.location}</span>
                  <span className="font-medium text-slate-800 block truncate">{activeRecord.recordedLocation}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.common.policeStation}</span>
                  <span className="font-medium text-slate-800 block truncate">{activeRecord.policeStation}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.common.date} &amp; {t.common.time}</span>
                  <span className="font-medium text-slate-800 block truncate">{activeRecord.dateTime}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{lang === 'kn' ? 'ವಾಹನ ಉಲ್ಲೇಖ' : 'Shared Vehicle(s)'}</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {activeRecord.vehicleReferences.map((v, i) => (
                      <span key={i} className="font-mono text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{lang === 'kn' ? 'ಮೂಲ ದಾಖಲೆ' : 'Source Document'}</span>
                  <span className="font-medium text-slate-700 block truncate">{activeRecord.originalDocumentReference}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{lang === 'kn' ? 'ದೃಢೀಕರಿಸಿದವರು' : 'Verified By'}</span>
                  <span className="font-medium text-teal-800 block truncate">{activeRecord.verifiedBy || (lang === 'kn' ? 'ಅಧಿಕಾರಿ ಡೆಮೊ' : 'Officer Demo')}</span>
                </div>
              </div>

              {/* Reviewed Potential Connections Notice */}
              {caseConnections.length > 0 && (
                <div className="mt-4 p-3 bg-teal-50/60 border border-teal-200 rounded-lg text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-teal-700 shrink-0" />
                    <span className="text-teal-900 font-medium">
                      <strong>{caseConnections.length} {lang === 'kn' ? 'ಸಂಭಾವ್ಯ ಸಂಬಂಧಗಳು ಪತ್ತೆಯಾಗಿವೆ' : 'Potential Connection(s)'}</strong> ({caseConnections[0].matchingValue}).
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-teal-800">{lang === 'kn' ? 'ಪರಿಶೀಲಿತ' : 'Cross-Referenced'}</span>
                </div>
              )}
            </div>

            {/* Tasks Section */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {t.tracker.pendingTasks} ({caseTasks.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t.tracker.tasksSub}
                  </p>
                </div>

                <button
                  onClick={() => setShowTaskModal(true)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.tracker.createTask}</span>
                </button>
              </div>

              {/* Tasks List */}
              <div className="space-y-3.5">
                {caseTasks.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    {t.tracker.noTasksForCase}
                  </div>
                ) : (
                  caseTasks.map((task) => {
                    const isCompleted = task.status === 'Completed';

                    return (
                      <div
                        key={task.id}
                        className={`p-4 sm:p-4.5 rounded-xl border transition-all text-xs ${
                          isCompleted
                            ? 'bg-slate-50/70 border-slate-200'
                            : task.priority === 'Urgent'
                            ? 'bg-white border-slate-200 hover:border-red-300 shadow-xs border-l-4 border-l-red-500'
                            : task.status === 'In Progress'
                            ? 'bg-white border-slate-200 hover:border-amber-300 shadow-xs border-l-4 border-l-amber-500'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                        }`}
                      >
                        {/* Header Row: Checkbox + Title + Priority (Left) & Status Dropdown (Right) */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={() =>
                                handleUpdateStatus(task.id, isCompleted ? 'Pending' : 'Completed')
                              }
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer shrink-0 transition-colors"
                              title={isCompleted ? (lang === 'kn' ? 'ಬಾಕಿ ಎಂದು ಗುರುತಿಸಿ' : 'Mark Pending') : (lang === 'kn' ? 'ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ಗುರುತಿಸಿ' : 'Mark Completed')}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3
                                  className={`text-sm font-bold tracking-tight ${
                                    isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                                  }`}
                                >
                                  {task.title}
                                </h3>
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                    task.priority === 'Urgent'
                                      ? 'bg-red-50 text-red-700 border border-red-200/80'
                                      : task.priority === 'Normal'
                                      ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                      : 'bg-slate-50 text-slate-600 border border-slate-200'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      task.priority === 'Urgent'
                                        ? 'bg-red-500'
                                        : task.priority === 'Normal'
                                        ? 'bg-slate-500'
                                        : 'bg-slate-400'
                                    }`}
                                  />
                                  {task.priority === 'Urgent'
                                    ? t.common.urgent
                                    : task.priority === 'Normal'
                                    ? t.common.normal
                                    : t.common.low}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Properly Spaced Status Dropdown with ample room */}
                          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pl-7 sm:pl-0">
                            <div className="relative inline-block">
                              <div className="flex items-center pointer-events-none absolute inset-y-0 left-2.5 z-10">
                                <span className={`w-2 h-2 rounded-full ${getStatusDotColor(task.status)}`} />
                              </div>
                              <select
                                value={task.status}
                                onChange={(e) => handleUpdateStatus(task.id, e.target.value as TaskStatus)}
                                className={`appearance-none text-xs font-semibold py-1.5 pl-6 pr-8 rounded-lg border shadow-xs cursor-pointer focus:outline-none focus:ring-2 transition-all min-w-[135px] ${getStatusDropdownStyle(
                                  task.status
                                )}`}
                              >
                                <option value="Pending" className="bg-white text-slate-800 py-1">
                                  {t.common.pending}
                                </option>
                                <option value="In Progress" className="bg-white text-slate-800 py-1">
                                  {t.common.inProgress}
                                </option>
                                <option value="Completed" className="bg-white text-slate-800 py-1">
                                  {t.common.completed}
                                </option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-slate-500">
                                <ChevronDown className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        {task.description && (
                          <p className="text-slate-600 text-xs mt-2 pl-7 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Metadata Row: Officer, Due Date, and Note Action */}
                        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs pl-7">
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-600">
                            <div className="inline-flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-slate-400 text-[11px]">{lang === 'kn' ? 'ನಿಯೋಜಿತ:' : 'Officer:'}</span>
                              <span className="font-semibold text-slate-800 text-[11px]">{task.assignedTo}</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-slate-400 text-[11px]">{lang === 'kn' ? 'ಅಂತಿಮ ದಿನಾಂಕ:' : 'Due:'}</span>
                              <span className="font-semibold font-mono text-slate-800 text-[11px]">{task.dueDate}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setEditingTaskNoteId(task.id);
                              setTaskNoteInput('');
                            }}
                            className="text-[11px] font-semibold text-slate-600 hover:text-teal-700 flex items-center gap-1 hover:bg-slate-50 px-2 py-1 rounded transition-colors"
                          >
                            <MessageSquare className="w-3 h-3 text-slate-400" />
                            <span>{t.tracker.addTaskNote}</span>
                          </button>
                        </div>

                        {/* Task Notes Log */}
                        {task.notes && task.notes.length > 0 && (
                          <div className="mt-3 pl-7 space-y-1.5">
                            {task.notes.map((note, idx) => (
                              <div
                                key={idx}
                                className="text-[11px] p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/90 text-slate-700 flex items-start gap-2"
                              >
                                <span className="font-bold text-slate-900 shrink-0">{lang === 'kn' ? 'ಟಿಪ್ಪಣಿ:' : 'Note:'}</span>
                                <span className="leading-relaxed">{note}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Inline Note Editor */}
                        {editingTaskNoteId === task.id && (
                          <div className="mt-3 pl-7 pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <input
                              type="text"
                              value={taskNoteInput}
                              onChange={(e) => setTaskNoteInput(e.target.value)}
                              placeholder={lang === 'kn' ? 'ಕಾರ್ಯಕ್ಕೆ ಟಿಪ್ಪಣಿ ಸೇರಿಸಿ...' : 'Add follow-up note (e.g. CCTV requested from traffic wing)...'}
                              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs flex-1 focus:ring-1 focus:ring-teal-500 focus:outline-none bg-white"
                              autoFocus
                            />
                            <div className="flex items-center gap-1.5 justify-end">
                              <button
                                onClick={() => handleSaveTaskNote(task.id)}
                                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
                              >
                                {t.tracker.saveNote}
                              </button>
                              <button
                                onClick={() => setEditingTaskNoteId(null)}
                                className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 text-xs rounded-lg hover:bg-slate-100 transition-colors"
                              >
                                {t.common.cancel}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column (5 spans): Chronological Activity Timeline & Add Administrative Note */}
          <div className="lg:col-span-5 space-y-6">
            {/* Add Administrative Note Form */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                {t.tracker.addAdminNote}
              </h3>
              <form onSubmit={handleAddAdminNote} className="mt-3 space-y-2 text-xs">
                <textarea
                  rows={2}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={lang === 'kn' ? 'ಆಡಳಿತಾತ್ಮಕ ನವೀಕರಣ ಅಥವಾ ತಪಾಸಣಾ ಟಿಪ್ಪಣಿಯನ್ನು ಇಲ್ಲಿ ದಾಖಲಿಸಿ...' : 'Record administrative update or case inspection remark...'}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none leading-relaxed"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!adminNote.trim()}
                    className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t.tracker.postUpdate}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Chronological Activity Timeline */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {t.tracker.timeline}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {t.tracker.auditedEvents} {activeRecord.caseReference}
                  </span>
                </div>
              </div>

              <div className="mt-4 relative pl-5 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {caseActivity.length === 0 ? (
                  <div className="text-xs text-slate-500 py-4">
                    {t.tracker.noEventsForCase}
                  </div>
                ) : (
                  caseActivity.map((ev) => (
                    <div key={ev.id} className="relative text-xs">
                      {/* Timeline Dot */}
                      <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-teal-600 border-2 border-white shadow-xs" />

                      <div className="font-bold text-slate-900">{ev.title}</div>
                      <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                        {ev.description}
                      </p>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>{ev.performedBy}</span>
                        <span>·</span>
                        <span>{new Date(ev.timestamp).toLocaleString(lang === 'kn' ? 'kn-IN' : 'en-GB')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {t.tracker.createTask}: {activeRecord?.caseReference}
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.tracker.taskTitle} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder={lang === 'kn' ? 'ಉದಾ: ಎಂಎಸ್‌ಕೆ ಮಿಲ್ ರಸ್ತೆ ಜಂಕ್ಷನ್‌ನಲ್ಲಿ ಸಿಸಿಟಿವಿ ಪರಿಶೀಲನೆ' : 'e.g. Inspect CCTV at MSK Mill Road Junction'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.tracker.taskDesc}
                </label>
                <textarea
                  rows={2}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder={lang === 'kn' ? 'ನಿರ್ದಿಷ್ಟ ಸುಳಿವುಗಳು ಅಥವಾ ಸಮನ್ವಯದ ವಿವರಗಳನ್ನು ಇಲ್ಲಿ ನಮೂದಿಸಿ...' : 'Detail exact leads, dates, or coordination with nearby stations...'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.tracker.assignedTo}
                  </label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none"
                  >
                    {DEMO_OFFICERS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.tracker.dueDate}
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.tracker.priority}
                </label>
                <div className="flex gap-2">
                  {(['Low', 'Normal', 'Urgent'] as TaskPriority[]).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-1.5 rounded-lg border font-semibold text-xs ${
                        priority === p
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p === 'Urgent' ? t.common.urgent : (p === 'Normal' ? t.common.normal : t.common.low)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
                >
                  {t.tracker.createTask}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
