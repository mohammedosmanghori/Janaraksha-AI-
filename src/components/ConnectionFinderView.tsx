import React, { useState, useMemo } from 'react';
import {
  PoliceRecord,
  PotentialConnection,
  AppLanguage,
  MatchingType,
} from '../types';
import { translations } from '../i18n/translations';
import { matchingService } from '../services/matchingService';
import { storageService } from '../services/storageService';
import {
  GitBranch,
  Search,
  CheckCircle2,
  XCircle,
  Car,
  Phone,
  Shield,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Filter,
  ChevronRight,
  Layers,
  MapPin,
  Columns,
} from 'lucide-react';

interface ConnectionFinderViewProps {
  records: PoliceRecord[];
  selectedCaseId?: string;
  onSelectCase: (caseId: string) => void;
  onOpenCaseTracker: (caseId: string) => void;
  lang: AppLanguage;
}

export const ConnectionFinderView: React.FC<ConnectionFinderViewProps> = ({
  records,
  selectedCaseId,
  onSelectCase,
  onOpenCaseTracker,
  lang,
}) => {
  const t = translations[lang];

  const verifiedRecords = useMemo(
    () => records.filter((r) => r.verificationStatus === 'Officer Verified'),
    [records]
  );

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Matching configuration controls (Geographic Radius & Time Proximity Window)
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(3.5);
  const [maxDaysApart, setMaxDaysApart] = useState<number>(14);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Active selected record to analyze
  const activeRecord = useMemo(() => {
    if (selectedCaseId) {
      return (
        verifiedRecords.find(
          (r) => r.id === selectedCaseId || r.caseReference === selectedCaseId
        ) || verifiedRecords[0]
      );
    }
    return verifiedRecords[0];
  }, [verifiedRecords, selectedCaseId]);

  // Detected matches for the active record based on options
  const rawConnections = useMemo(() => {
    if (!activeRecord) return [];
    return matchingService.findConnectionsForRecord(activeRecord, verifiedRecords, {
      maxRadiusKm,
      maxDaysApart,
    });
  }, [activeRecord, verifiedRecords, maxRadiusKm, maxDaysApart]);

  // Filtered by type tab
  const connections = useMemo(() => {
    if (typeFilter === 'ALL') return rawConnections;
    return rawConnections.filter((c) => {
      if (typeFilter === 'IMEI') return c.matchingType === 'Exact IMEI Match';
      if (typeFilter === 'VEHICLE') return c.matchingType === 'Vehicle Reference Match';
      if (typeFilter === 'PATTERN') return c.matchingType === 'Possible Incident Pattern Detected';
      if (typeFilter === 'PHONE') return c.matchingType === 'Phone Identifier Match';
      return true;
    });
  }, [rawConnections, typeFilter]);

  // Filtered list of verified records in sidebar
  const filteredRecordsList = useMemo(() => {
    if (!searchQuery.trim()) return verifiedRecords;
    const q = searchQuery.toLowerCase();
    return verifiedRecords.filter(
      (r) =>
        r.caseReference.toLowerCase().includes(q) ||
        r.incidentType.toLowerCase().includes(q) ||
        r.vehicleReferences.some((v) => v.toLowerCase().includes(q)) ||
        (r.imeiNumbers && r.imeiNumbers.some((im) => im.toLowerCase().includes(q))) ||
        r.peopleMentioned.some((p) => p.name.toLowerCase().includes(q)) ||
        r.otherIdentifiers.some((id) => id.toLowerCase().includes(q))
    );
  }, [verifiedRecords, searchQuery]);

  // Modal / Inline Officer Note State
  const [editingNoteConnId, setEditingNoteConnId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  // Side-by-Side Compare Modal State
  const [compareTargetRecord, setCompareTargetRecord] = useState<PoliceRecord | null>(null);

  // Review status handler
  const handleSetStatus = (
    conn: PotentialConnection,
    status: PotentialConnection['status'],
    note?: string
  ) => {
    storageService.setConnectionReview(conn.id, {
      status,
      note: note || conn.officerNotes,
    });

    storageService.logActivity({
      type: status === 'reviewed' ? 'CONNECTION_REVIEWED' : 'CONNECTION_DISMISSED',
      caseId: conn.sourceRecordId,
      caseReference: conn.sourceCaseRef,
      title: lang === 'kn' ? (status === 'reviewed' ? 'ಸಂಬಂಧ ಪರಿಶೀಲಿಸಲಾಗಿದೆ' : 'ಸಂಬಂಧ ತಿರಸ್ಕರಿಸಲಾಗಿದೆ') : `Connection ${status === 'reviewed' ? 'Approved & Reviewed' : 'Dismissed'}`,
      description: `Lead between ${conn.sourceCaseRef} and ${conn.targetCaseRef} (${conn.matchingType}) marked as ${status}.`,
      performedBy: lang === 'kn' ? 'ಅಧಿಕಾರಿ ಡೆಮೊ' : 'Officer Demo',
    });
  };

  const handleSaveObservation = (conn: PotentialConnection) => {
    if (noteInput.trim()) {
      handleSetStatus(conn, conn.status === 'dismissed' ? 'dismissed' : 'reviewed', noteInput.trim());
      setEditingNoteConnId(null);
      setNoteInput('');
    }
  };

  // Icon selector
  const getFieldIcon = (matchingType: MatchingType) => {
    switch (matchingType) {
      case 'Exact IMEI Match':
        return <Phone className="w-4 h-4 text-blue-700" />;
      case 'Vehicle Reference Match':
        return <Car className="w-4 h-4 text-amber-700" />;
      case 'Possible Incident Pattern Detected':
        return <MapPin className="w-4 h-4 text-teal-700" />;
      case 'Phone Identifier Match':
        return <Phone className="w-4 h-4 text-indigo-700" />;
      default:
        return <Shield className="w-4 h-4 text-slate-700" />;
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {t.connections.title}
            </h1>
            <span className="text-xs px-2.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded font-semibold">
              {lang === 'kn' ? 'ಕಲಬುರಗಿ ಗುಪ್ತಚರ ವಲಯ' : 'Kalaburagi Intelligence Zone'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            {t.connections.subtitle}
          </p>
        </div>
      </div>

      {/* Matching Criteria & Config Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 font-semibold">
          <span className="text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>{t.connections.filterLabel}</span>
          </span>
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-2.5 py-1 rounded transition-colors ${
              typeFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.connections.allLeads} ({rawConnections.length})
          </button>
          <button
            onClick={() => setTypeFilter('IMEI')}
            className={`px-2.5 py-1 rounded transition-colors ${
              typeFilter === 'IMEI'
                ? 'bg-blue-800 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.connections.exactImei}
          </button>
          <button
            onClick={() => setTypeFilter('VEHICLE')}
            className={`px-2.5 py-1 rounded transition-colors ${
              typeFilter === 'VEHICLE'
                ? 'bg-amber-800 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.connections.vehicleRef}
          </button>
          <button
            onClick={() => setTypeFilter('PATTERN')}
            className={`px-2.5 py-1 rounded transition-colors ${
              typeFilter === 'PATTERN'
                ? 'bg-teal-800 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.connections.similarPattern}
          </button>
        </div>

        {/* Configurable Radius and Time Window */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span>{t.connections.radiusLabel}</span>
            <select
              value={maxRadiusKm}
              onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-xs font-semibold cursor-pointer"
            >
              <option value={1.5}>1.5 km</option>
              <option value={3.5}>3.5 km</option>
              <option value={6}>6.0 km</option>
              <option value={10}>10.0 km</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span>{t.connections.windowLabel}</span>
            <select
              value={maxDaysApart}
              onChange={(e) => setMaxDaysApart(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-xs font-semibold cursor-pointer"
            >
              <option value={7}>7 {t.connections.days}</option>
              <option value={14}>14 {t.connections.days}</option>
              <option value={30}>30 {t.connections.days}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left = Records Selector, Right = Correlation Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left Column (4 spans): Verified Records Selector */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1.5">
              {t.connections.selectCase}
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.connections.searchPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* List of Verified Records */}
            <div className="space-y-2 mt-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredRecordsList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  {lang === 'kn' ? 'ಯಾವುದೇ ದೃಢೀಕೃತ ದಾಖಲೆ ಕಂಡುಬಂದಿಲ್ಲ.' : 'No verified records match your query.'}
                </div>
              ) : (
                filteredRecordsList.map((rec) => {
                  const isSelected = activeRecord?.id === rec.id;
                  const recordMatches = matchingService.findConnectionsForRecord(rec, verifiedRecords, {
                    maxRadiusKm,
                    maxDaysApart,
                  });

                  return (
                    <button
                      key={rec.id}
                      onClick={() => onSelectCase(rec.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-slate-900">
                          {rec.caseReference}
                        </span>
                        {recordMatches.length > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded font-mono">
                            {recordMatches.length} {lang === 'kn' ? 'ಸುಳಿವುಗಳು' : 'leads'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-800 mt-1 truncate">
                        {rec.incidentType}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {rec.policeStation}
                      </div>

                      {/* Identifiers preview */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {rec.imeiNumbers && rec.imeiNumbers.length > 0 && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-blue-100 text-blue-900">
                            {rec.imeiNumbers[0]}
                          </span>
                        )}
                        {rec.vehicleReferences.length > 0 && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-900">
                            {rec.vehicleReferences[0]}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (8 spans): Active Record Header & Detected Connections Cards */}
        <div className="lg:col-span-8 space-y-5 min-w-0">
          {activeRecord ? (
            <>
              {/* Selected Record Summary Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-extrabold text-base text-slate-900">
                        {activeRecord.caseReference}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="font-bold text-slate-800 text-sm truncate">
                        {activeRecord.incidentType}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-teal-50 text-teal-800 font-semibold rounded">
                        {activeRecord.verificationStatus === 'Officer Verified' ? t.common.verified : t.common.pending}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {activeRecord.incidentSummary}
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenCaseTracker(activeRecord.id)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-xs transition-colors"
                  >
                    <span>{t.tracker.title}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Metadata Strip */}
                <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.common.policeStation}</span>
                    <span className="font-semibold text-slate-800 truncate block">{activeRecord.policeStation}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.common.date} &amp; {t.common.time}</span>
                    <span className="font-medium text-slate-800 block truncate">{activeRecord.dateTime}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">IMEI / {lang === 'kn' ? 'ವಾಹನಗಳು' : 'Vehicles'}</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {activeRecord.imeiNumbers && activeRecord.imeiNumbers.map((im, i) => (
                        <span key={i} className="font-mono font-bold text-blue-900 bg-blue-50 px-1 py-0.5 rounded text-[10px]">
                          {im}
                        </span>
                      ))}
                      {activeRecord.vehicleReferences.map((v, i) => (
                        <span key={i} className="font-mono font-bold text-amber-900 bg-amber-50 px-1 py-0.5 rounded text-[10px]">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.common.location}</span>
                    <span className="font-medium text-slate-700 block truncate">{activeRecord.recordedLocation}</span>
                  </div>
                </div>
              </div>

              {/* Connections Section Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-teal-700" />
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                    {t.connections.detectedConnections} ({connections.length})
                  </h2>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {typeFilter === 'ALL' ? (lang === 'kn' ? 'ಎಲ್ಲಾ ವರ್ಗಗಳು' : 'All categories') : typeFilter}
                </span>
              </div>

              {/* Connections Cards */}
              {connections.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-2">
                  <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="text-sm font-semibold text-slate-800">
                    {t.connections.noConnections}
                  </div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {lang === 'kn'
                      ? 'DEMO-KAL-001 (IMEI ಹೊಂದಾಣಿಕೆ), DEMO-KAL-002 (ವಾಹನ ಹೊಂದಾಣಿಕೆ) ಅಥವಾ DEMO-KAL-003 ಆಯ್ಕೆಮಾಡಿ ಪರೀಕ್ಷಿಸಿ.'
                      : 'Try selecting DEMO-KAL-001 (IMEI match with KAL-004), DEMO-KAL-002 (Vehicle match with KAL-005), or DEMO-KAL-003.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {connections.map((conn) => {
                    const targetRecord = verifiedRecords.find((r) => r.id === conn.targetRecordId);
                    const isReviewed = conn.status === 'reviewed';
                    const isDismissed = conn.status === 'dismissed';

                    return (
                      <div
                        key={conn.id}
                        className={`bg-white border rounded-xl p-4 sm:p-5 shadow-xs transition-all ${
                          isReviewed
                            ? 'border-teal-300 bg-teal-50/20'
                            : isDismissed
                            ? 'border-slate-200 opacity-60 bg-slate-50'
                            : conn.matchingType === 'Exact IMEI Match'
                            ? 'border-blue-300 bg-white'
                            : conn.matchingType === 'Vehicle Reference Match'
                            ? 'border-amber-300 bg-white'
                            : 'border-teal-300 bg-white'
                        }`}
                      >
                        {/* Connection Card Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              {getFieldIcon(conn.matchingType)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-900">
                                  {conn.matchingType}
                                </span>
                                <span className="text-slate-300">·</span>
                                <span className="text-[11px] font-semibold text-slate-600">
                                  {conn.matchingField}
                                </span>
                              </div>
                              <div className="font-mono font-bold text-xs sm:text-sm text-teal-900 truncate">
                                {conn.matchingValue}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                              {conn.confidenceLabel}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                isReviewed
                                  ? 'bg-teal-100 text-teal-900'
                                  : isDismissed
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {isReviewed ? (lang === 'kn' ? 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ' : 'Reviewed') : isDismissed ? (lang === 'kn' ? 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ' : 'Dismissed') : (lang === 'kn' ? 'ಪರಿಶೀಲನೆ ಬಾಕಿ' : 'Pending Review')}
                            </span>
                          </div>
                        </div>

                        {/* Side-by-Side Snapshot Comparison Grid */}
                        <div className="py-3.5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* Source Record Snapshot */}
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                              {t.connections.sourceRecord}: {conn.sourceCaseRef}
                            </div>
                            <div className="font-bold text-slate-900">{activeRecord.incidentType}</div>
                            <div className="text-slate-600 mt-1 line-clamp-2">{activeRecord.incidentSummary}</div>
                            <div className="text-[11px] text-slate-500 mt-2 font-mono">
                              {activeRecord.policeStation} · {activeRecord.recordedLocation}
                            </div>
                          </div>

                          {/* Target Record Snapshot */}
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] uppercase font-bold text-teal-800">
                                {t.connections.relatedRecord}: {conn.targetCaseRef}
                              </span>
                              {targetRecord && (
                                <button
                                  onClick={() => onSelectCase(targetRecord.id)}
                                  className="text-[10px] text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-0.5"
                                >
                                  <span>{lang === 'kn' ? 'ದಾಖಲೆ ವೀಕ್ಷಿಸಿ' : 'View Record'}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            {targetRecord ? (
                              <>
                                <div className="font-bold text-slate-900">{targetRecord.incidentType}</div>
                                <div className="text-slate-600 mt-1 line-clamp-2">{targetRecord.incidentSummary}</div>
                                <div className="text-[11px] text-slate-500 mt-2 font-mono">
                                  {targetRecord.policeStation} · {targetRecord.recordedLocation}
                                </div>
                              </>
                            ) : (
                              <div className="text-slate-400 text-xs">{lang === 'kn' ? 'ವಿವರ ಲಭ್ಯವಿಲ್ಲ' : 'Details unavailable'}</div>
                            )}
                          </div>
                        </div>

                        {/* Explainable Matching Reason */}
                        <div className="p-3 bg-teal-50/60 border border-teal-100 rounded-lg text-xs space-y-1">
                          <span className="font-bold text-teal-950 block">
                            {t.connections.matchingReason}:
                          </span>
                          <p className="text-teal-900 leading-relaxed text-xs">
                            {conn.explanation}
                          </p>
                        </div>

                        {/* Officer Notes if attached */}
                        {conn.officerNotes && (
                          <div className="mt-2.5 p-2.5 bg-slate-100 border border-slate-200 rounded text-xs text-slate-700">
                            <span className="font-bold text-slate-900">{lang === 'kn' ? 'ಅಧಿಕಾರಿಯ ಟಿಪ್ಪಣಿ:' : 'Officer Observation:'}</span>{' '}
                            {conn.officerNotes}
                          </div>
                        )}

                        {/* Officer Actions Bar */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => handleSetStatus(conn, 'reviewed')}
                              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{t.connections.markReviewed}</span>
                            </button>

                            <button
                              onClick={() => handleSetStatus(conn, 'dismissed')}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5 text-slate-500" />
                              <span>{t.connections.dismiss}</span>
                            </button>

                            <button
                              onClick={() => {
                                setEditingNoteConnId(conn.id);
                                setNoteInput(conn.officerNotes || '');
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{t.connections.addNote}</span>
                            </button>

                            {targetRecord && (
                              <button
                                onClick={() => setCompareTargetRecord(targetRecord)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                              >
                                <Columns className="w-3.5 h-3.5 text-slate-600" />
                                <span>{t.connections.compareRecords}</span>
                              </button>
                            )}
                          </div>

                          {targetRecord && (
                            <button
                              onClick={() => onOpenCaseTracker(targetRecord.id)}
                              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 transition-colors"
                            >
                              <span>{targetRecord.caseReference} {t.tracker.title}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Inline Observation Form */}
                        {editingNoteConnId === conn.id && (
                          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                            <label className="font-bold text-slate-800 block">
                              {t.connections.observationLabel}
                            </label>
                            <textarea
                              rows={2}
                              value={noteInput}
                              onChange={(e) => setNoteInput(e.target.value)}
                              placeholder={lang === 'kn' ? 'ಉದಾ: ಸ್ಟೇಷನ್ ಬಜಾರ್ ಠಾಣಾಧಿಕಾರಿಯೊಂದಿಗೆ ಮೊಬೈಲ್ ಐಎಂಇಐ ದೃಢೀಕರಿಸಲಾಗಿದೆ...' : 'e.g. Cross-verified with Station Bazaar SHO regarding recovered phone IMEI...'}
                              className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-none bg-white text-xs"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingNoteConnId(null)}
                                className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                              >
                                {t.common.cancel}
                              </button>
                              <button
                                onClick={() => handleSaveObservation(conn)}
                                className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded font-semibold transition-colors"
                              >
                                {t.connections.saveObservation}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
              {lang === 'kn' ? 'ಕೇಸ್ ಸಂಬಂಧಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲು ಕಲಬುರಗಿ ದಾಖಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.' : 'Select a verified Kalaburagi record to begin cross-case matching.'}
            </div>
          )}
        </div>
      </div>

      {/* Side-by-Side Full Record Compare Modal */}
      {compareTargetRecord && activeRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Columns className="w-4 h-4 text-teal-700" />
                <span className="font-bold text-slate-900 text-sm">
                  {t.connections.compareTitle}: {activeRecord.caseReference} vs {compareTargetRecord.caseReference}
                </span>
              </div>
              <button
                onClick={() => setCompareTargetRecord(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Left: Active Record */}
              <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-mono font-bold text-sm text-slate-900">{activeRecord.caseReference}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-teal-100 text-teal-800 rounded">{t.connections.sourceBadge}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.scanner.incidentType}</span>
                  <span className="font-bold text-slate-800">{activeRecord.incidentType}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.common.policeStation} &amp; {t.common.location}</span>
                  <span className="font-semibold text-slate-800">{activeRecord.policeStation}</span>
                  <span className="text-slate-600 block">{activeRecord.recordedLocation}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.common.date} &amp; {t.common.time}</span>
                  <span className="font-medium text-slate-700">{activeRecord.dateTime}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.common.summary}</span>
                  <p className="text-slate-700 leading-relaxed mt-0.5">{activeRecord.incidentSummary}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.common.identifiers}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activeRecord.imeiNumbers?.map((im, i) => (
                      <span key={i} className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-900 rounded">
                        {im}
                      </span>
                    ))}
                    {activeRecord.vehicleReferences?.map((v, i) => (
                      <span key={i} className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Target Record */}
              <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-mono font-bold text-sm text-slate-900">{compareTargetRecord.caseReference}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">{t.connections.matchedBadge}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.scanner.incidentType}</span>
                  <span className="font-bold text-slate-800">{compareTargetRecord.incidentType}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.common.policeStation} &amp; {t.common.location}</span>
                  <span className="font-semibold text-slate-800">{compareTargetRecord.policeStation}</span>
                  <span className="text-slate-600 block">{compareTargetRecord.recordedLocation}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.common.date} &amp; {t.common.time}</span>
                  <span className="font-medium text-slate-700">{compareTargetRecord.dateTime}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.common.summary}</span>
                  <p className="text-slate-700 leading-relaxed mt-0.5">{compareTargetRecord.incidentSummary}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.common.identifiers}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {compareTargetRecord.imeiNumbers?.map((im, i) => (
                      <span key={i} className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-900 rounded">
                        {im}
                      </span>
                    ))}
                    {compareTargetRecord.vehicleReferences?.map((v, i) => (
                      <span key={i} className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setCompareTargetRecord(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                {t.connections.closeCompare}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
