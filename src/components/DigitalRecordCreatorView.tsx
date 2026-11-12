import React, { useState } from 'react';
import {
  PoliceRecord,
  WitnessInfo,
  DigitalSignature,
  RecordWorkflowStatus,
  IncidentCategory,
  AppLanguage,
} from '../types';
import { translations } from '../i18n/translations';
import { storageService } from '../services/storageService';
import { SignaturePad } from './SignaturePad';
import {
  FileText,
  Shield,
  Sparkles,
  CheckCircle2,
  Trash2,
  Printer,
  Save,
  ArrowRight,
  Eye,
  FileCheck2,
  RefreshCw,
  Plus,
} from 'lucide-react';

interface DigitalRecordCreatorViewProps {
  onRecordCreated: (record: PoliceRecord) => void;
  onNavigateToConnections: (caseId: string) => void;
  onCancel: () => void;
  lang: AppLanguage;
}

const KALABURAGI_STATIONS = [
  'Station Bazaar Police Station',
  'Brahampur Police Station',
  'Ashok Nagar Police Station',
  'Raghavendra Nagar Police Station',
  'Farhatabad Police Station',
  'Kalaburagi Traffic North PS',
  'Kalaburagi Traffic South PS',
  'Chowk Police Station',
  'University Police Station',
];

export const DigitalRecordCreatorView: React.FC<DigitalRecordCreatorViewProps> = ({
  onRecordCreated,
  onNavigateToConnections,
  onCancel,
  lang,
}) => {
  const t = translations[lang];

  // 1. Registration Info
  const [caseReference, setCaseReference] = useState(storageService.generateNextReference());
  const [policeStation, setPoliceStation] = useState(KALABURAGI_STATIONS[0]);
  const [entryDateTime, setEntryDateTime] = useState(new Date().toLocaleString(lang === 'kn' ? 'kn-IN' : 'en-GB') + ' IST');
  const [incidentCategory, setIncidentCategory] = useState<IncidentCategory>('Mobile Phone Theft');

  // 2. Complainant Info
  const [complainantName, setComplainantName] = useState('');
  const [complainantAge, setComplainantAge] = useState('');
  const [complainantContact, setComplainantContact] = useState('');
  const [complainantAddress, setComplainantAddress] = useState('');
  const [complainantLang, setComplainantLang] = useState<'Kannada' | 'English' | 'Hindi' | 'Urdu'>('Kannada');

  // 3. Incident Info
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState('19:30');
  const [incidentLocation, setIncidentLocation] = useState('Super Market, Kalaburagi');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [propertyDetails, setPropertyDetails] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');
  const [imeiInput, setImeiInput] = useState('');
  const [otherIdentifiers, setOtherIdentifiers] = useState<string[]>([]);

  // 4. Accused & Witnesses
  const [isUnknownAccused, setIsUnknownAccused] = useState(true);
  const [accusedName, setAccusedName] = useState('');
  const [accusedDesc, setAccusedDesc] = useState('');
  const [witnesses, setWitnesses] = useState<WitnessInfo[]>([
    { id: 'wit-1', name: '', role: 'Eyewitness', contact: '' },
  ]);

  // 5. Statement & AI Assist
  const [originalStatement, setOriginalStatement] = useState('');
  const [aiAssistedDraft, setAiAssistedDraft] = useState('');
  const [activeStatementTab, setActiveStatementTab] = useState<'original' | 'ai_draft'>('original');
  const [isAssistingStatement, setIsAssistingStatement] = useState(false);
  const [missingInfoNotice, setMissingInfoNotice] = useState<string[]>([]);
  const [correctionsNotice, setCorrectionsNotice] = useState<string[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  // 6. Signatures (Auto-captured & stored)
  const [complainantSignature, setComplainantSignature] = useState<DigitalSignature | undefined>(undefined);
  const [officerSignature, setOfficerSignature] = useState<DigitalSignature | undefined>(undefined);

  // 7. Workflow & Preview
  const [workflowStatus, setWorkflowStatus] = useState<RecordWorkflowStatus>('Draft');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [savedRecord, setSavedRecord] = useState<PoliceRecord | null>(null);

  // Dynamic Witnesses Helpers
  const handleAddWitness = () => {
    setWitnesses([
      ...witnesses,
      { id: `wit-${Date.now()}`, name: '', role: 'Eyewitness', contact: '' },
    ]);
  };

  const handleUpdateWitness = (id: string, field: keyof WitnessInfo, value: string) => {
    setWitnesses(witnesses.map((w) => (w.id === id ? { ...w, [field]: value } : w)));
  };

  const handleRemoveWitness = (id: string) => {
    setWitnesses(witnesses.filter((w) => w.id !== id));
  };

  // AI Assist for Complaint Statement
  const handleAIAssistStatement = async () => {
    if (!originalStatement.trim()) {
      alert(lang === 'kn' ? 'ದಯವಿಟ್ಟು ಮೊದಲು ಮೂಲ ಹೇಳಿಕೆಯನ್ನು ನಮೂದಿಸಿ.' : 'Please enter the original complainant statement first.');
      return;
    }

    try {
      setIsAssistingStatement(true);
      setAiError(null);

      const res = await fetch('/api/gemini/assist-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statement: originalStatement,
          incidentCategory,
          location: incidentLocation,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAiAssistedDraft(data.draft);
        setMissingInfoNotice(data.missingInfo || []);
        setCorrectionsNotice(data.corrections || []);
        setActiveStatementTab('ai_draft');
      } else {
        setAiError(data.message || (lang === 'kn' ? 'AI ನೆರವು ಪ್ರಸ್ತುತ ಲಭ್ಯವಿಲ್ಲ; ಮೂಲ ಹೇಳಿಕೆಯೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ.' : 'AI assistance unavailable; please continue with original statement.'));
      }
    } catch (err: any) {
      setAiError(lang === 'kn' ? 'ಜೆಮಿನೈ ಸಂಪರ್ಕ ದೋಷ: ' + err.message : 'Network error connecting to Gemini assistant: ' + err.message);
    } finally {
      setIsAssistingStatement(false);
    }
  };

  // Assemble full record object
  const buildRecord = (
    status: RecordWorkflowStatus,
    customComplainantSig?: DigitalSignature,
    customOfficerSig?: DigitalSignature
  ): PoliceRecord => {
    const now = new Date().toISOString();
    const vehRefs = vehicleReg.trim() ? [vehicleReg.trim().toUpperCase()] : [];
    const imeis = imeiInput.trim() ? [imeiInput.trim().toUpperCase()] : [];

    const people: any[] = [];
    if (complainantName.trim()) {
      people.push({
        name: complainantName.trim(),
        role: 'Complainant',
        details: `${complainantAddress} · Contact: ${complainantContact}`,
      });
    }

    witnesses
      .filter((w) => w.name.trim())
      .forEach((w) => {
        people.push({
          name: w.name.trim(),
          role: w.role || 'Witness',
          details: w.contact ? `Contact: ${w.contact}` : undefined,
        });
      });

    const effectiveCompSig = customComplainantSig || complainantSignature;
    const effectiveOffSig = customOfficerSig || officerSignature;
    const isVerified = status === 'Officer Verified';

    return {
      id: `rec-${Date.now()}`,
      caseReference: caseReference.trim(),
      sourceType: 'digital_fir',
      incidentType: incidentCategory,
      dateTime: `${incidentDate}, ${incidentTime} IST`,
      recordedLocation: incidentLocation.trim(),
      district: 'Kalaburagi', // strictly Kalaburagi
      policeStation,
      incidentSummary:
        incidentDescription.trim() ||
        (lang === 'kn'
          ? `${policeStation}, ಕಲಬುರಗಿಯಲ್ಲಿ ${incidentCategory} ಸಂಬಂಧ ದಾಖಲಿಸಲಾದ ಡಿಜಿಟಲ್ ಘಟನಾ ವರದಿ.`
          : `Digital incident report recorded at ${policeStation}, Kalaburagi regarding ${incidentCategory}.`),
      complainant: {
        fullName: complainantName.trim() || (lang === 'kn' ? 'ದೂರುದಾರರು' : 'Complainant Name'),
        age: complainantAge.trim(),
        contactNumber: complainantContact.trim(),
        address: complainantAddress.trim() || 'Kalaburagi',
        preferredLanguage: complainantLang,
      },
      accused: {
        isUnknown: isUnknownAccused,
        name: isUnknownAccused ? undefined : accusedName.trim(),
        physicalDescription: accusedDesc.trim(),
      },
      witnesses: witnesses.filter((w) => w.name.trim()),
      originalStatement: originalStatement.trim(),
      aiAssistedDraft: aiAssistedDraft.trim(),
      peopleMentioned: people,
      propertyDetails: propertyDetails.trim(),
      imeiNumbers: imeis,
      vehicleReferences: vehRefs,
      otherIdentifiers: [
        ...otherIdentifiers,
        ...(imeis.length > 0 ? [`IMEI: ${imeis[0]}`] : []),
        ...(complainantContact ? [`Phone: ${complainantContact}`] : []),
      ],
      originalDocumentReference: `Paperless Digital Entry #${caseReference}`,
      complainantSignature: effectiveCompSig,
      officerSignature: effectiveOffSig,
      verificationStatus: isVerified ? 'Officer Verified' : 'Pending Verification',
      workflowStatus: status,
      verifiedBy: isVerified ? (effectiveOffSig?.signerName || (lang === 'kn' ? 'ಅಧಿಕಾರಿ ಡೆಮೊ' : 'Officer Demo')) : undefined,
      verifiedAt: isVerified ? now : undefined,
      coordinates: {
        latitude: 17.3325,
        longitude: 76.834,
        landmark: incidentLocation,
      },
      createdAt: now,
      updatedAt: now,
    };
  };

  // Save as Draft
  const handleSaveDraft = () => {
    if (!caseReference.trim()) {
      alert(lang === 'kn' ? 'ಆಂತರಿಕ ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ ಕಡ್ಡಾಯವಾಗಿದೆ.' : 'Internal record reference is required.');
      return;
    }
    const rec = buildRecord('Draft');
    storageService.saveRecord(rec);
    storageService.logActivity({
      type: 'FIR_DRAFT_CREATED',
      caseId: rec.id,
      caseReference: rec.caseReference,
      title: lang === 'kn' ? 'ಡಿಜಿಟಲ್ ಎಫ್‌ಐಆರ್ ಕರಡು ಉಳಿಸಲಾಗಿದೆ' : 'Digital FIR Draft Saved',
      description: lang === 'kn' ? `${rec.policeStation} ನಲ್ಲಿ ${rec.caseReference} (${rec.incidentType}) ಕರಡು ರಚಿಸಲಾಗಿದೆ.` : `Draft created for ${rec.caseReference} (${rec.incidentType}) at ${rec.policeStation}.`,
      performedBy: lang === 'kn' ? 'ಅಧಿಕಾರಿ ಡೆಮೊ' : 'Officer Demo',
    });
    setWorkflowStatus('Draft');
    setSavedRecord(rec);
  };

  // Save as Officer Verified
  const handleSaveVerified = () => {
    if (!caseReference.trim()) {
      alert(lang === 'kn' ? 'ದಯವಿಟ್ಟು ಕೇಸ್ ಉಲ್ಲೇಖ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.' : 'Please provide Case Reference before verifying.');
      return;
    }

    // Auto-resolve Complainant Signature if user provided complainant name or typed
    let finalComplainantSig = complainantSignature;
    if (!finalComplainantSig) {
      finalComplainantSig = {
        type: 'complainant',
        signerName: complainantName.trim() || (lang === 'kn' ? 'ದೂರುದಾರರು' : 'Complainant'),
        isTypedAcknowledgement: true,
        timestamp: new Date().toISOString(),
        confirmed: true,
      };
      setComplainantSignature(finalComplainantSig);
    }

    // Auto-resolve Officer Signature
    let finalOfficerSig = officerSignature;
    if (!finalOfficerSig) {
      finalOfficerSig = {
        type: 'officer',
        signerName: lang === 'kn' ? 'ಅಧಿಕಾರಿ ಡೆಮೊ' : 'Officer Demo',
        signerDesignation: lang === 'kn' ? 'ಪಿಎಸ್‌ಐ / ಕರ್ತವ್ಯ ಅಧಿಕಾರಿ' : 'Police Sub-Inspector / Duty Officer',
        isTypedAcknowledgement: true,
        timestamp: new Date().toISOString(),
        confirmed: true,
      };
      setOfficerSignature(finalOfficerSig);
    }

    const rec = buildRecord('Officer Verified', finalComplainantSig, finalOfficerSig);
    storageService.saveRecord(rec);
    storageService.logActivity({
      type: 'OFFICER_VERIFIED',
      caseId: rec.id,
      caseReference: rec.caseReference,
      title: lang === 'kn' ? 'ಡಿಜಿಟಲ್ ಎಫ್‌ಐಆರ್ ಅಧಿಕೃತವಾಗಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ' : 'Digital FIR Officially Verified',
      description: lang === 'kn' ? `${rec.caseReference} ಡಿಜಿಟಲ್ ಸಹಿಗಳೊಂದಿಗೆ ಅಧಿಕೃತವಾಗಿ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟಿದೆ.` : `Paperless record ${rec.caseReference} verified with dual digital acknowledgements.`,
      performedBy: finalOfficerSig.signerName || 'Officer Demo',
    });

    setWorkflowStatus('Officer Verified');
    setSavedRecord(rec);
    onRecordCreated(rec);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      {/* Header & Internal Demo Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              {t.fir.title}
            </h1>
            <span className="text-xs px-2.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded font-semibold">
              {lang === 'kn' ? 'ಕಲಬುರಗಿ ಠಾಣಾ ವೇದಿಕೆ' : 'Kalaburagi Station Workspace'}
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mt-0.5">
            {t.fir.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t.fir.previewBtn}</span>
          </button>
        </div>
      </div>

      {/* Form Sections Grid */}
      <div className="space-y-5">
        {/* Section 1: Registration Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
            <span>{t.fir.regInfo}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.fir.caseRefLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={caseReference}
                onChange={(e) => setCaseReference(e.target.value)}
                placeholder={t.fir.caseRefPlaceholder}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.fir.districtFixed}
              </label>
              <input
                type="text"
                disabled
                value={lang === 'kn' ? 'ಕಲಬುರಗಿ' : 'Kalaburagi'}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-100 text-slate-600 font-semibold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.fir.policeStationLabel} <span className="text-red-500">*</span>
              </label>
              <select
                value={policeStation}
                onChange={(e) => setPoliceStation(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none cursor-pointer"
              >
                {KALABURAGI_STATIONS.map((ps) => (
                  <option key={ps} value={ps}>
                    {ps}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.fir.entryDateTimeLabel}
              </label>
              <input
                type="text"
                value={entryDateTime}
                onChange={(e) => setEntryDateTime(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Complainant Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
            <span>{t.fir.complainantInfo}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.fir.complainantNameLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={complainantName}
                onChange={(e) => setComplainantName(e.target.value)}
                placeholder={t.fir.complainantNamePlaceholder}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.fir.ageLabel}
              </label>
              <input
                type="number"
                value={complainantAge}
                onChange={(e) => setComplainantAge(e.target.value)}
                placeholder="42"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.fir.contactNumberLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={complainantContact}
                onChange={(e) => setComplainantContact(e.target.value)}
                placeholder="+91 98450 12345"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.fir.preferredLangLabel}
              </label>
              <select
                value={complainantLang}
                onChange={(e) => setComplainantLang(e.target.value as any)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none"
              >
                <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                <option value="English">English</option>
                <option value="Hindi">हिंदी (Hindi)</option>
                <option value="Urdu">اردو (Urdu)</option>
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">
              {t.fir.addressLabel}
            </label>
            <input
              type="text"
              value={complainantAddress}
              onChange={(e) => setComplainantAddress(e.target.value)}
              placeholder={lang === 'kn' ? 'ಉದಾ: ಸೂಪರ್ ಮಾರ್ಕೆಟ್ ಹತ್ತಿರ, ಬ್ರಹ್ಮಪುರ, ಕಲಬುರಗಿ' : 'e.g. Near Super Market, Brahampur, Kalaburagi'}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
            />
          </div>
        </div>

        {/* Section 3: Incident Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">3</span>
            <span>{t.fir.incidentInfo}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.fir.incidentCategoryLabel}
              </label>
              <select
                value={incidentCategory}
                onChange={(e) => setIncidentCategory(e.target.value as IncidentCategory)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none cursor-pointer"
              >
                <option value="Mobile Phone Theft">{lang === 'kn' ? 'ಮೊಬೈಲ್ ಫೋನ್ ಕಳ್ಳತನ' : 'Mobile Phone Theft'}</option>
                <option value="Vehicle Theft">{lang === 'kn' ? 'ವಾಹನ ಕಳ್ಳತನ' : 'Vehicle Theft'}</option>
                <option value="Burglary / Trespass">{lang === 'kn' ? 'ಮನೆಗಳ್ಳತನ / ಅಕ್ರಮ ಪ್ರವೇಶ' : 'Burglary / Trespass'}</option>
                <option value="Property Seizure">{lang === 'kn' ? 'ಸ್ವತ್ತು ಜಪ್ತಿ' : 'Property Seizure'}</option>
                <option value="Assault / Public Order">{lang === 'kn' ? 'ಹಲ್ಲೆ / ಸಾರ್ವಜನಿಕ ಶಾಂತಿ ಭಂಗ' : 'Assault / Public Order'}</option>
                <option value="Incident Report">{lang === 'kn' ? 'ಘಟನಾ ವರದಿ' : 'Incident Report'}</option>
                <option value="General Diary Entry">{lang === 'kn' ? 'ಸಾಮಾನ್ಯ ದಿನಚರಿ ನಮೂದು' : 'General Diary Entry'}</option>
                <option value="Other">{lang === 'kn' ? 'ಇತರೆ' : 'Other'}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.fir.incidentDateLabel}
              </label>
              <input
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.fir.incidentTimeLabel}
              </label>
              <input
                type="time"
                value={incidentTime}
                onChange={(e) => setIncidentTime(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.fir.incidentLocationLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={incidentLocation}
                onChange={(e) => setIncidentLocation(e.target.value)}
                placeholder={lang === 'kn' ? 'ಉದಾ: ಸೆಂಟ್ರಲ್ ಬಸ್ ನಿಲ್ದಾಣ, ಕಲಬುರಗಿ' : 'e.g. Central Bus Stand, Kalaburagi'}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
            {/* Vehicle Registration */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.fir.vehicleRegLabel}
              </label>
              <input
                type="text"
                value={vehicleReg}
                onChange={(e) => setVehicleReg(e.target.value)}
                placeholder="e.g. KA-32-EA-4912"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
              />
            </div>

            {/* Mobile Phone IMEI */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.fir.imeiNumberLabel}
              </label>
              <input
                type="text"
                value={imeiInput}
                onChange={(e) => setImeiInput(e.target.value)}
                placeholder="e.g. DEMO-IMEI-001 or 864920048192019"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">
              {t.fir.incidentDescLabel}
            </label>
            <textarea
              rows={2}
              value={incidentDescription}
              onChange={(e) => setIncidentDescription(e.target.value)}
              placeholder={lang === 'kn' ? 'ಘಟನೆಯ ವಾಸ್ತವಿಕ ಸಾರಾಂಶವನ್ನು ಇಲ್ಲಿ ನಮೂದಿಸಿ...' : 'Factual summary of the sequence of events as reported...'}
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none leading-relaxed"
            />
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">
              {t.fir.propertyDetailsLabel}
            </label>
            <input
              type="text"
              value={propertyDetails}
              onChange={(e) => setPropertyDetails(e.target.value)}
              placeholder={lang === 'kn' ? 'ಉದಾ: ಕಪ್ಪು ಬಣ್ಣದ ಸ್ಯಾಮ್‌ಸಂಗ್ ಗ್ಯಾಲಕ್ಸಿ A54, ಏರ್‌ಟೆಲ್ ಸಿಮ್' : 'e.g. Black Samsung Galaxy A54, SIM Airtel'}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
            />
          </div>
        </div>

        {/* Section 4: Accused and Witness Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">4</span>
            <span>{t.fir.accusedWitnessInfo}</span>
          </h2>

          {/* Accused Section */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{t.fir.accusedParticulars}</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold">
                <input
                  type="checkbox"
                  checked={isUnknownAccused}
                  onChange={(e) => setIsUnknownAccused(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>{t.fir.unknownAccused}</span>
              </label>
            </div>

            {!isUnknownAccused && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-medium text-slate-700 mb-0.5">{t.fir.knownAccusedName}</label>
                  <input
                    type="text"
                    value={accusedName}
                    onChange={(e) => setAccusedName(e.target.value)}
                    placeholder={lang === 'kn' ? 'ಆರೋಪಿಯ ಹೆಸರು ಅಥವಾ ಅಡ್ಡಹೆಸರು' : 'Accused Name or Alias'}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-medium text-slate-700 mb-0.5">
                {t.fir.accusedDesc}
              </label>
              <input
                type="text"
                value={accusedDesc}
                onChange={(e) => setAccusedDesc(e.target.value)}
                placeholder={lang === 'kn' ? 'ಉದಾ: ಇಬ್ಬರು ವ್ಯಕ್ತಿಗಳು, ಮುಖಕ್ಕೆ ಬಟ್ಟೆ ಕಟ್ಟಿಕೊಂಡಿದ್ದರು, ಕಪ್ಪು ಬೈಕ್‌ನಲ್ಲಿ ಪರಾರಿಯಾದರು' : 'e.g. Two slim males, face covered with muffler, fled toward Station Road'}
                className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white"
              />
            </div>
          </div>

          {/* Dynamic Witnesses */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{t.fir.witnessesTitle}</span>
              <button
                type="button"
                onClick={handleAddWitness}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-xs flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.fir.addWitness}</span>
              </button>
            </div>

            <div className="space-y-2">
              {witnesses.map((wit, idx) => (
                <div
                  key={wit.id}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                >
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={wit.name}
                      onChange={(e) => handleUpdateWitness(wit.id, 'name', e.target.value)}
                      placeholder={`${lang === 'kn' ? 'ಸಾಕ್ಷಿ' : 'Witness'} #${idx + 1}`}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <select
                      value={wit.role}
                      onChange={(e) => handleUpdateWitness(wit.id, 'role', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                    >
                      <option value="Eyewitness">{lang === 'kn' ? 'ಪ್ರತ್ಯಕ್ಷದರ್ಶಿ' : 'Eyewitness'}</option>
                      <option value="Spot Panch">{lang === 'kn' ? 'ಸ್ಥಳ ಪಂಚರು' : 'Spot Panch'}</option>
                      <option value="Shop Owner">{lang === 'kn' ? 'ಅಂಗಡಿ ಮಾಲೀಕ' : 'Shop Owner'}</option>
                      <option value="Passerby">{lang === 'kn' ? 'ದಾರಿಹೋಕ' : 'Passerby'}</option>
                      <option value="Relative">{lang === 'kn' ? 'ಸಂಬಂಧಿಕ' : 'Relative'}</option>
                    </select>
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={wit.contact || ''}
                      onChange={(e) => handleUpdateWitness(wit.id, 'contact', e.target.value)}
                      placeholder={lang === 'kn' ? 'ಕಲಬುರಗಿಯಲ್ಲಿನ ಸಂಪರ್ಕ / ವಿಳಾಸ' : 'Contact / Address in Kalaburagi'}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                    />
                  </div>
                  <div className="sm:col-span-1 text-right">
                    {witnesses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveWitness(wit.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                        title={lang === 'kn' ? 'ತೆಗೆದುಹಾಕಿ' : 'Remove'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 5: Complaint Statement with AI Assistance */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">5</span>
              <span>{t.fir.statementInfo}</span>
            </h2>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAIAssistStatement}
                disabled={isAssistingStatement || !originalStatement.trim()}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 disabled:opacity-50 text-teal-900 border border-teal-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {isAssistingStatement ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-700" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                )}
                <span>{isAssistingStatement ? t.fir.aiAssisting : t.fir.aiAssistBtn}</span>
              </button>
            </div>
          </div>

          {/* Statement Tabs: Original vs AI-Assisted Draft */}
          <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveStatementTab('original')}
              className={`pb-2 px-1 border-b-2 transition-colors ${
                activeStatementTab === 'original'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.fir.originalStatementTab}
            </button>
            {aiAssistedDraft && (
              <button
                type="button"
                onClick={() => setActiveStatementTab('ai_draft')}
                className={`pb-2 px-1 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeStatementTab === 'ai_draft'
                    ? 'border-teal-600 text-teal-900'
                    : 'border-transparent text-teal-700 hover:text-teal-900'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>{t.fir.aiDraftTab}</span>
              </button>
            )}
          </div>

          {activeStatementTab === 'original' ? (
            <div className="text-xs space-y-1">
              <textarea
                rows={5}
                value={originalStatement}
                onChange={(e) => setOriginalStatement(e.target.value)}
                placeholder={t.fir.originalStatementPlaceholder}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none leading-relaxed text-slate-800"
              />
              <p className="text-[11px] text-slate-400">
                {t.fir.statementPreserveNotice}
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-lg">
                <div className="flex items-center gap-1.5 text-teal-900 font-bold mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                  <span>{t.fir.aiDraftTab}</span>
                </div>
                <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {aiAssistedDraft}
                </p>
              </div>

              {missingInfoNotice.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <span>{t.fir.missingInfoTitle}</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {missingInfoNotice.map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {aiError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-800">
              {aiError}
            </div>
          )}
        </div>

        {/* Section 6: Online Digital Signatures (Complainant + Officer) */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">6</span>
            <span>{t.fir.signatureInfo}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Signature 1: Complainant Acknowledgement */}
            <SignaturePad
              title={t.fir.complainantAcknowledgementTitle}
              type="complainant"
              defaultSignerName={complainantName}
              initialSignature={complainantSignature}
              onSaveSignature={(sig) => setComplainantSignature(sig)}
              allowTypedAlternative={true}
              lang={lang}
            />

            {/* Signature 2: Officer Sign-Off */}
            <SignaturePad
              title={t.fir.officerSignOffTitle}
              type="officer"
              defaultSignerName={lang === 'kn' ? 'ಅಧಿಕಾರಿ ಡೆಮೊ' : 'Officer Demo'}
              defaultDesignation={lang === 'kn' ? 'ಪಿಎಸ್‌ಐ / ಠಾಣಾ ಕರ್ತವ್ಯ ಅಧಿಕಾರಿ' : 'Police Sub-Inspector / Duty Officer'}
              initialSignature={officerSignature}
              onSaveSignature={(sig) => setOfficerSignature(sig)}
              allowTypedAlternative={true}
              lang={lang}
            />
          </div>
        </div>

        {/* Section 7: Action & Verification Workflow */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-slate-500">
            {lang === 'kn' ? 'ಪ್ರಸ್ತುತ ದಾಖಲೆಯ ಸ್ಥಿತಿ: ' : 'Current Record State: '}
            <strong
              className={`font-semibold ${
                workflowStatus === 'Officer Verified' ? 'text-teal-700' : 'text-slate-800'
              }`}
            >
              {workflowStatus === 'Officer Verified' ? t.common.verified : t.common.draft}
            </strong>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.fir.saveDraftBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t.fir.previewBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveVerified}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{t.fir.saveVerifiedBtn}</span>
            </button>
          </div>
        </div>

        {/* Post-Verification Feedback Box */}
        {savedRecord && workflowStatus === 'Officer Verified' && (
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0" />
              <div>
                <div className="text-xs font-bold text-teal-950">
                  {t.fir.recordSavedNotice}: {savedRecord.caseReference}
                </div>
                <div className="text-[11px] text-teal-800">
                  {t.fir.recordSavedSub}
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateToConnections(savedRecord.id)}
              className="px-3.5 py-1.5 bg-white border border-teal-300 hover:bg-teal-100 text-teal-900 font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <span>{t.fir.analyzeInFinder}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Printable Preview Record Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-700" />
                <span className="font-bold text-slate-900 text-sm">
                  {t.fir.previewModalTitle}: {caseReference}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-xs flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.common.print}</span>
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-slate-400 hover:text-slate-700 text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
              <div className="text-center border-b border-slate-200 pb-3">
                <div className="font-extrabold text-sm text-slate-900">
                  {t.kspHeader} · {lang === 'kn' ? 'ಕಲಬುರಗಿ' : 'KALABURAGI'}
                </div>
                <div className="font-semibold text-slate-600 text-xs mt-0.5">
                  {policeStation.toUpperCase()}
                </div>
                <div className="font-mono text-slate-500 text-[11px] mt-1">
                  {lang === 'kn' ? 'ಆಂತರಿಕ ಉಲ್ಲೇಖ: ' : 'INTERNAL RECORD REFERENCE: '}{caseReference} · {incidentCategory.toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">{lang === 'kn' ? 'ದೂರುದಾರರು' : 'Complainant'}</span>
                  <span className="font-bold text-slate-900">{complainantName || (lang === 'kn' ? 'ದೂರುದಾರರ ವಿವರ' : 'N/A')}</span>
                  <span className="text-slate-600 block">{complainantContact}</span>
                  <span className="text-slate-500 block truncate">{complainantAddress}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">{lang === 'kn' ? 'ಘಟನೆಯ ವಿವರ' : 'Incident Details'}</span>
                  <span className="font-semibold text-slate-900">{incidentLocation}</span>
                  <span className="text-slate-600 block">{incidentDate}, {incidentTime} IST</span>
                  {vehicleReg && <span className="font-mono font-bold text-teal-800 block">Veh: {vehicleReg}</span>}
                  {imeiInput && <span className="font-mono font-bold text-blue-800 block">IMEI: {imeiInput}</span>}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 uppercase text-[11px] block mb-1">
                  {lang === 'kn' ? 'ದೂರು ಹೇಳಿಕೆ' : 'Incident Statement'}
                </span>
                <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
                  {aiAssistedDraft || originalStatement || incidentDescription || (lang === 'kn' ? 'ಯಾವುದೇ ಹೇಳಿಕೆ ನಮೂದಿಸಿಲ್ಲ.' : 'No statement entered.')}
                </p>
              </div>

              {/* Signatures Preview */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div className="p-3 border border-slate-200 rounded-lg text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {t.fir.complainantAcknowledgementTitle}
                  </span>
                  {complainantSignature?.signatureDataUrl ? (
                    <img
                      src={complainantSignature.signatureDataUrl}
                      alt="Complainant Signature"
                      className="h-12 mx-auto object-contain"
                    />
                  ) : (
                    <div className="h-12 flex items-center justify-center font-serif italic text-slate-700">
                      {complainantSignature?.signerName || (lang === 'kn' ? '[ದೂರುದಾರರ ಸಹಿ]' : '[Pending Signature]')}
                    </div>
                  )}
                  <span className="text-[11px] font-semibold text-slate-800 block mt-1">
                    {complainantSignature?.signerName || complainantName || (lang === 'kn' ? 'ದೂರುದಾರರು' : 'Complainant')}
                  </span>
                </div>

                <div className="p-3 border border-slate-200 rounded-lg text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {t.fir.officerSignOffTitle}
                  </span>
                  {officerSignature?.signatureDataUrl ? (
                    <img
                      src={officerSignature.signatureDataUrl}
                      alt="Officer Signature"
                      className="h-12 mx-auto object-contain"
                    />
                  ) : (
                    <div className="h-12 flex items-center justify-center font-serif italic text-slate-700">
                      {officerSignature?.signerName || (lang === 'kn' ? '[ಅಧಿಕಾರಿಯ ಸಹಿ]' : '[Pending Signature]')}
                    </div>
                  )}
                  <span className="text-[11px] font-semibold text-slate-800 block mt-1">
                    {officerSignature?.signerName || (lang === 'kn' ? 'ಅಧಿಕಾರಿ ಡೆಮೊ' : 'Officer Demo')}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {officerSignature?.signerDesignation || (lang === 'kn' ? 'ಪಿಎಸ್‌ಐ / ಕರ್ತವ್ಯ ಅಧಿಕಾರಿ' : 'Station Duty Officer')}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
