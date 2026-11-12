import React, { useState, useRef } from 'react';
import {
  PoliceRecord,
  PoliceDocument,
  PersonMentioned,
  VerificationStatus,
  AppLanguage,
  District,
} from '../types';
import { translations } from '../i18n/translations';
import { SAMPLE_PRESETS, SampleDocPreset } from '../services/sampleDocuments';
import { documentService, ExtractedDocumentData } from '../services/documentService';
import { storageService } from '../services/storageService';
import {
  Upload,
  FileText,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Plus,
  Trash2,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  HelpCircle,
} from 'lucide-react';

interface DocumentScannerViewProps {
  onRecordSaved: (record: PoliceRecord) => void;
  onNavigateToConnections: (caseId: string) => void;
  lang: AppLanguage;
  defaultDistrict: District | string;
}

export const DocumentScannerView: React.FC<DocumentScannerViewProps> = ({
  onRecordSaved,
  onNavigateToConnections,
  lang,
  defaultDistrict,
}) => {
  const t = translations[lang];

  // Uploaded/Current Document State
  const [currentDoc, setCurrentDoc] = useState<{
    fileName: string;
    mimeType: string;
    fileSize: number;
    previewUrl: string;
    base64Data?: string;
  } | null>(null);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [extractionSource, setExtractionSource] = useState<'gemini' | 'preset_fallback' | 'manual' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields (Editable before officer verification)
  const [caseReference, setCaseReference] = useState('');
  const [incidentType, setIncidentType] = useState('Vehicle Theft');
  const [dateTime, setDateTime] = useState('');
  const [recordedLocation, setRecordedLocation] = useState('');
  const [district, setDistrict] = useState(defaultDistrict || 'Kalaburagi');
  const [policeStation, setPoliceStation] = useState('');
  const [incidentSummary, setIncidentSummary] = useState('');
  const [peopleMentioned, setPeopleMentioned] = useState<PersonMentioned[]>([]);
  const [vehicleReferences, setVehicleReferences] = useState<string[]>([]);
  const [otherIdentifiers, setOtherIdentifiers] = useState<string[]>([]);
  const [originalDocRef, setOriginalDocRef] = useState('');
  const [confidenceNotes, setConfidenceNotes] = useState('');

  // Verification state (Pending Verification vs Officer Verified)
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('Pending Verification');
  const [verifiedRecordSaved, setVerifiedRecordSaved] = useState<PoliceRecord | null>(null);

  // Form Helpers
  const [newVehicleInput, setNewVehicleInput] = useState('');
  const [newIdentifierInput, setNewIdentifierInput] = useState('');
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonRole, setNewPersonRole] = useState('Witness');
  const [zoomLevel, setZoomLevel] = useState(100);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load a fictional sample preset
  const handleLoadPreset = (preset: SampleDocPreset) => {
    setCurrentDoc({
      fileName: preset.fileName,
      mimeType: preset.mimeType,
      fileSize: 42000,
      previewUrl: preset.dataUrl,
    });

    setIsProcessing(true);
    setProcessingStep('Analyzing document structure with Kalyan Karnataka police template...');
    setErrorMessage(null);
    setVerifiedRecordSaved(null);

    setTimeout(() => {
      setProcessingStep('Extracting identifiers, vehicle tags, and officer signatures...');
      setTimeout(() => {
        applyExtractedData(preset.extractedValues);
        setExtractionSource('preset_fallback');
        setVerificationStatus('Pending Verification');
        setIsProcessing(false);
      }, 500);
    }, 400);
  };

  // Handle local file upload
  const handleFileUpload = async (file: File) => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setVerifiedRecordSaved(null);
      setProcessingStep('Reading binary document data...');

      const { base64, mimeType } = await documentService.fileToBase64(file);
      const previewUrl = URL.createObjectURL(file);

      setCurrentDoc({
        fileName: file.name,
        mimeType,
        fileSize: file.size,
        previewUrl,
        base64Data: base64,
      });

      setProcessingStep('Submitting to Gemini 3.8 Multimodal Extraction Engine on server...');

      // Call secure server-side Gemini route
      const result = await documentService.extractWithGemini({
        imageBase64: base64,
        mimeType,
        fileName: file.name,
      });

      if (result.success && result.data) {
        applyExtractedData(result.data);
        setExtractionSource('gemini');
        setVerificationStatus('Pending Verification');
      } else {
        // If API key is missing or failed, provide honest message and enable manual editing
        setErrorMessage(
          result.error ||
            'Gemini server-side extraction unavailable (GEMINI_API_KEY not configured or quota reached). Manual entry and preset testing enabled below.'
        );
        setExtractionSource('manual');
        populateFallbackDefaults(file.name);
      }
    } catch (err: any) {
      setErrorMessage(`File processing error: ${err.message}`);
      setExtractionSource('manual');
      populateFallbackDefaults(file.name);
    } finally {
      setIsProcessing(false);
    }
  };

  const populateFallbackDefaults = (fileName: string) => {
    setCaseReference(`REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setIncidentType('Vehicle Theft');
    setDateTime(new Date().toLocaleDateString('en-GB') + ', 14:00 IST');
    setRecordedLocation('Kalaburagi City Center');
    setDistrict(defaultDistrict || 'Kalaburagi');
    setPoliceStation('Station Bazaar Police Station');
    setIncidentSummary('Scanned physical document uploaded. Please inspect original document preview on the left and verify/enter information manually.');
    setVehicleReferences(['DEMO-VEHICLE-01']);
    setOtherIdentifiers([]);
    setPeopleMentioned([{ name: 'Sri Suresh Patil', role: 'Complainant' }]);
    setOriginalDocRef(`Scanned File: ${fileName}`);
    setConfidenceNotes('Manual entry mode activated. Please review fields against the preview.');
    setVerificationStatus('Pending Verification');
  };

  const applyExtractedData = (data: ExtractedDocumentData) => {
    setCaseReference(data.caseReference !== 'Not found in document' ? data.caseReference : '');
    setIncidentType(data.incidentType !== 'Not found in document' ? data.incidentType : 'General Diary Entry');
    setDateTime(data.dateTime !== 'Not found in document' ? data.dateTime : '');
    setRecordedLocation(data.recordedLocation !== 'Not found in document' ? data.recordedLocation : '');
    setDistrict(data.district !== 'Not found in document' ? data.district : defaultDistrict);
    setPoliceStation(data.policeStation !== 'Not found in document' ? data.policeStation : '');
    setIncidentSummary(data.incidentSummary || '');
    setPeopleMentioned(data.peopleMentioned || []);
    setVehicleReferences(data.vehicleReferences || []);
    setOtherIdentifiers(data.otherIdentifiers || []);
    setOriginalDocRef(data.originalDocumentReference || '');
    setConfidenceNotes(data.confidenceNotes || 'Extracted via Multimodal Analysis');
  };

  // Add vehicle tag
  const handleAddVehicle = () => {
    const trimmed = newVehicleInput.trim().toUpperCase();
    if (trimmed && !vehicleReferences.includes(trimmed)) {
      setVehicleReferences([...vehicleReferences, trimmed]);
      setNewVehicleInput('');
    }
  };

  // Remove vehicle tag
  const handleRemoveVehicle = (idx: number) => {
    setVehicleReferences(vehicleReferences.filter((_, i) => i !== idx));
  };

  // Add person mentioned
  const handleAddPerson = () => {
    if (newPersonName.trim()) {
      setPeopleMentioned([
        ...peopleMentioned,
        { name: newPersonName.trim(), role: newPersonRole },
      ]);
      setNewPersonName('');
    }
  };

  // Remove person
  const handleRemovePerson = (idx: number) => {
    setPeopleMentioned(peopleMentioned.filter((_, i) => i !== idx));
  };

  // Add other identifier
  const handleAddIdentifier = () => {
    const trimmed = newIdentifierInput.trim();
    if (trimmed && !otherIdentifiers.includes(trimmed)) {
      setOtherIdentifiers([...otherIdentifiers, trimmed]);
      setNewIdentifierInput('');
    }
  };

  // Remove identifier
  const handleRemoveIdentifier = (idx: number) => {
    setOtherIdentifiers(otherIdentifiers.filter((_, i) => i !== idx));
  };

  // Verification Action
  const handleOfficerVerification = () => {
    if (!caseReference.trim()) {
      alert('Please enter a Case Reference before verifying.');
      return;
    }

    const newRecordId = `rec-${Date.now()}`;
    const now = new Date().toISOString();

    const extractedImeis = otherIdentifiers
      .filter((id) => id.includes('IMEI') || /\b\d{14,16}\b/.test(id))
      .map((id) => {
        const m = id.match(/DEMO-IMEI-\w+|\b\d{14,16}\b/i);
        return m ? m[0] : id;
      });

    const verifiedRecord: PoliceRecord = {
      id: newRecordId,
      caseReference: caseReference.trim(),
      sourceType: 'scanned_document',
      incidentType,
      dateTime: dateTime.trim() || new Date().toISOString(),
      recordedLocation: recordedLocation.trim(),
      district: 'Kalaburagi',
      policeStation: policeStation.trim(),
      incidentSummary: incidentSummary.trim(),
      peopleMentioned,
      vehicleReferences,
      otherIdentifiers,
      imeiNumbers: extractedImeis,
      originalDocumentReference: originalDocRef.trim() || currentDoc?.fileName || 'Scanned Document',
      confidenceNotes,
      verificationStatus: 'Officer Verified',
      verifiedBy: 'Officer Demo',
      verifiedAt: now,
      attachedDocument: currentDoc
        ? {
            id: `doc-${Date.now()}`,
            fileName: currentDoc.fileName,
            fileType: currentDoc.mimeType,
            fileSize: currentDoc.fileSize,
            uploadedAt: now,
            uploadedBy: 'Officer Demo',
            previewUrl: currentDoc.previewUrl,
            originalRef: originalDocRef,
          }
        : undefined,
      createdAt: now,
      updatedAt: now,
    };

    // Save into persistent storage
    storageService.saveRecord(verifiedRecord);

    // Log activity
    storageService.logActivity({
      type: 'OFFICER_VERIFIED',
      caseId: verifiedRecord.id,
      caseReference: verifiedRecord.caseReference,
      title: 'Officer Verification Completed',
      description: `Record ${verifiedRecord.caseReference} (${verifiedRecord.incidentType}) officially confirmed by Officer Demo.`,
      performedBy: 'Officer Demo',
    });

    setVerificationStatus('Officer Verified');
    setVerifiedRecordSaved(verifiedRecord);
    onRecordSaved(verifiedRecord);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {t.scanner.title}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-0.5">
            {t.scanner.subtitle}
          </p>
        </div>

        {/* Verification Status Pill Header */}
        <div className="flex items-center gap-3">
          <div className="text-xs flex items-center gap-2">
            <span className="text-slate-500 font-medium">{t.common.status}:</span>
            <span
              className={`font-semibold px-2.5 py-1 rounded-md text-xs inline-flex items-center gap-1.5 ${
                verificationStatus === 'Officer Verified'
                  ? 'bg-teal-50 text-teal-800 border border-teal-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  verificationStatus === 'Officer Verified' ? 'bg-teal-600' : 'bg-amber-500'
                }`}
              />
              {verificationStatus === 'Officer Verified' ? t.scanner.officerVerified : t.scanner.pendingVerification}
            </span>
          </div>
        </div>
      </div>

      {/* Preset Pickers Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            {t.scanner.sampleFilesTitle}
          </span>
          <span className="text-[11px] text-slate-500">
            {lang === 'kn' ? 'ಕಲ್ಪಿತ ಕಲ್ಯಾಣ ಕರ್ನಾಟಕ ಪರೀಕ್ಷಾ ದಾಖಲೆಗಳು' : 'Fictional Kalyan Karnataka test records'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SAMPLE_PRESETS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleLoadPreset(sample)}
              className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-teal-50/50 hover:border-teal-300 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 group-hover:text-teal-900">
                  {sample.extractedValues.caseReference}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-200/70 rounded text-slate-700">
                  {sample.extractedValues.vehicleReferences[0]}
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-700 mt-1 truncate">
                {sample.extractedValues.incidentType}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                {sample.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error / Fallback Notice */}
      {errorMessage && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold">Extraction Notice:</span>
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Split Workspace: Left = Document Preview, Right = Extracted Information Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 spans): Upload & Original Document Preview */}
        <div className="lg:col-span-5 space-y-4">
          {/* Upload Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className="border-2 border-dashed border-slate-300 hover:border-teal-500 hover:bg-slate-50/80 rounded-xl p-5 text-center cursor-pointer transition-colors bg-white"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-2">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-slate-900">
              {t.scanner.uploadAreaTitle}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {t.scanner.dragDropText}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {t.scanner.formatNote}
            </div>
          </div>

          {/* Original Document Preview Container */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col min-h-[520px]">
            {/* Preview Toolbar */}
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span className="font-semibold text-slate-800">
                  {t.scanner.originalDocument}
                </span>
              </div>

              {currentDoc && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setZoomLevel(Math.max(50, zoomLevel - 15))}
                    className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono tabular-nums text-slate-600 w-9 text-center">
                    {zoomLevel}%
                  </span>
                  <button
                    onClick={() => setZoomLevel(Math.min(180, zoomLevel + 15))}
                    className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(100)}
                    className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded"
                    title="Reset Zoom"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Document Content / Canvas */}
            <div className="flex-1 p-4 bg-slate-100 flex items-center justify-center overflow-auto max-h-[640px]">
              {isProcessing ? (
                <div className="text-center p-8 space-y-3">
                  <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
                  <div className="text-xs font-bold text-slate-900">
                    {t.scanner.processingTitle}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {processingStep}
                  </div>
                </div>
              ) : currentDoc ? (
                <div
                  className="transition-transform duration-150 origin-top shadow-md border border-slate-300 rounded bg-white"
                  style={{ transform: `scale(${zoomLevel / 100})` }}
                >
                  <img
                    src={currentDoc.previewUrl}
                    alt="Scanned Police Document"
                    className="max-w-full h-auto object-contain select-none"
                  />
                </div>
              ) : (
                <div className="text-center p-8 text-slate-400 space-y-2">
                  <Layers className="w-8 h-8 mx-auto text-slate-300" />
                  <div className="text-xs font-medium">No document loaded</div>
                  <div className="text-[11px] text-slate-500">
                    Select a sample record above or upload a physical document scan.
                  </div>
                </div>
              )}
            </div>

            {/* Document Info Footer */}
            {currentDoc && (
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                <span className="truncate max-w-[200px] font-mono">{currentDoc.fileName}</span>
                <span>{(currentDoc.fileSize / 1024).toFixed(1)} KB</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 spans): Extracted Information Panel (Editable) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {t.scanner.extractedData}
                </h2>
                {extractionSource === 'gemini' && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded">
                    Gemini 3.8 Multimodal
                  </span>
                )}
                {extractionSource === 'preset_fallback' && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                    Template Extraction
                  </span>
                )}
                {extractionSource === 'manual' && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded">
                    Manual Field Entry
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.scanner.editNotice} OCR output does not become verified information until approved.
              </p>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Case Reference */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.scanner.caseRef} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={caseReference}
                onChange={(e) => setCaseReference(e.target.value)}
                placeholder="e.g. DEMO-101 or FIR-42/2024"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Incident Type */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.scanner.incidentType}
              </label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none bg-white cursor-pointer"
              >
                <option value="Vehicle Theft">Vehicle Theft</option>
                <option value="Mobile Phone Theft">Mobile Phone Theft</option>
                <option value="Incident Report">Incident Report</option>
                <option value="Property Seizure">Property Seizure</option>
                <option value="Burglary / Trespass">Burglary / Trespass</option>
                <option value="General Diary Entry">General Diary Entry</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date and Time */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.scanner.dateTime}
              </label>
              <input
                type="text"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                placeholder="e.g. 22-Oct-2024, 02:15 IST"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Police Station */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.scanner.policeStation}
              </label>
              <input
                type="text"
                value={policeStation}
                onChange={(e) => setPoliceStation(e.target.value)}
                placeholder="e.g. Station Bazaar PS, Kalaburagi"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* District (Strictly Kalaburagi) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                District (Fixed)
              </label>
              <input
                type="text"
                disabled
                value="Kalaburagi"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 font-semibold text-slate-700 cursor-not-allowed"
              />
            </div>

            {/* Recorded Location */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.scanner.location}
              </label>
              <input
                type="text"
                value={recordedLocation}
                onChange={(e) => setRecordedLocation(e.target.value)}
                placeholder="e.g. Super Market, Kalaburagi"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Incident Summary */}
          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">
              {t.scanner.summary}
            </label>
            <textarea
              rows={3}
              value={incidentSummary}
              onChange={(e) => setIncidentSummary(e.target.value)}
              placeholder="Factual summary extracted from original document..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Vehicle References Section (Critical for Case Connection Matching!) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">{t.scanner.vehicles}</span>
                <span className="text-[11px] text-slate-500 ml-2">
                  (Shared identifiers used by Case Connection Finder)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 items-center">
              {vehicleReferences.map((veh, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-300 rounded-md font-mono font-bold text-slate-800 text-xs shadow-xs"
                >
                  <span>{veh}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveVehicle(idx)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newVehicleInput}
                  onChange={(e) => setNewVehicleInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVehicle())}
                  placeholder="e.g. DEMO-VEHICLE-01"
                  className="px-2 py-1 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none w-40 bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddVehicle}
                  className="p-1 text-teal-700 hover:bg-teal-100 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* People Mentioned */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
            <div className="font-bold text-slate-900">{t.scanner.people}</div>
            <div className="space-y-1.5">
              {peopleMentioned.map((person, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-2.5 py-1.5 bg-white border border-slate-200 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{person.name}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600">{person.role}</span>
                    {person.details && (
                      <span className="text-slate-400 text-[11px]">({person.details})</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePerson(idx)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="Person Name"
                  className="px-2 py-1 border border-slate-300 rounded text-xs flex-1 bg-white focus:outline-none"
                />
                <select
                  value={newPersonRole}
                  onChange={(e) => setNewPersonRole(e.target.value)}
                  className="px-2 py-1 border border-slate-300 rounded text-xs bg-white focus:outline-none"
                >
                  <option value="Complainant">Complainant</option>
                  <option value="Witness">Witness</option>
                  <option value="Reporting Officer">Reporting Officer</option>
                  <option value="Mentioned Party">Mentioned Party</option>
                  <option value="Victim">Victim</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddPerson}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Other Identifiers */}
          <div className="text-xs space-y-1.5">
            <label className="block font-semibold text-slate-700">
              {t.scanner.identifiers} (Phone numbers, IMEI, Seizure tags)
            </label>
            <div className="flex flex-wrap gap-1.5 items-center">
              {otherIdentifiers.map((id, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[11px] text-slate-800"
                >
                  <span>{id}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIdentifier(idx)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newIdentifierInput}
                  onChange={(e) => setNewIdentifierInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIdentifier())}
                  placeholder="e.g. IMEI: 864920048192019"
                  className="px-2 py-1 border border-slate-300 rounded font-mono text-xs focus:outline-none w-48"
                />
                <button
                  type="button"
                  onClick={handleAddIdentifier}
                  className="p-1 text-teal-700 hover:bg-teal-100 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Original Ref & Confidence Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Original Document Reference
              </label>
              <input
                type="text"
                value={originalDocRef}
                onChange={(e) => setOriginalDocRef(e.target.value)}
                placeholder="e.g. Station Register Vol. 3, Page 12"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none text-slate-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Extraction &amp; Confidence Notes
              </label>
              <input
                type="text"
                value={confidenceNotes}
                onChange={(e) => setConfidenceNotes(e.target.value)}
                placeholder="e.g. Typed memo with clear official seal"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none text-slate-700"
              />
            </div>
          </div>

          {/* Action Row: Officer Verification Button */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-[11px] text-slate-500">
              {lang === 'kn' ? 'ಮೂಲ ಸ್ಕ್ಯಾನ್ ಅನ್ನು ಸಂರಕ್ಷಿಸುತ್ತದೆ ಮತ್ತು ಪರಿಶೀಲನಾ ಘಟನೆಯನ್ನು ದಾಖಲಿಸುತ್ತದೆ.' : 'Preserves original scan & logs verification event to audit trail.'}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleOfficerVerification}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>{t.scanner.verifyButton}</span>
              </button>
            </div>
          </div>

          {/* Post-Verification Feedback Box */}
          {verifiedRecordSaved && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-teal-950">
                    {lang === 'kn' ? `ದಾಖಲೆ ${verifiedRecordSaved.caseReference} ದೃಢೀಕರಿಸಿ ಉಳಿಸಲಾಗಿದೆ` : `Record ${verifiedRecordSaved.caseReference} Verified & Saved`}
                  </div>
                  <div className="text-[11px] text-teal-800">
                    {lang === 'kn' ? 'ಡಿಜಿಟಲೀಕೃತ ದಾಖಲೆಯು ಈಗ ಭಂಡಾರದಲ್ಲಿ ಸಕ್ರಿಯವಾಗಿದೆ ಮತ್ತು ಸಂಬಂಧ ಶೋಧನೆಗೆ ಲಭ್ಯವಿದೆ.' : 'Digitized record is now active in persistent storage and available for cross-case matching.'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigateToConnections(verifiedRecordSaved.id)}
                className="px-3 py-1.5 bg-white border border-teal-300 hover:bg-teal-100 text-teal-900 font-semibold text-xs rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-xs"
              >
                <span>{t.dashboard.checkConnections}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
