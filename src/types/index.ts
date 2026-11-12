/**
 * JANARAKSHA AI — Police Document Intelligence Platform
 * Kalaburagi, Karnataka, India
 * Domain Types Definition
 */

// Strictly Kalaburagi only
export type District = 'Kalaburagi';

export type RecordWorkflowStatus = 'Draft' | 'Awaiting Review' | 'Officer Verified';

export type VerificationStatus = 'Pending Verification' | 'Officer Verified';

export type IncidentCategory =
  | 'Vehicle Theft'
  | 'Mobile Phone Theft'
  | 'Incident Report'
  | 'Burglary / Trespass'
  | 'Property Seizure'
  | 'Assault / Public Order'
  | 'General Diary Entry'
  | 'Other';

export interface PersonMentioned {
  name: string;
  role: 'Complainant' | 'Witness' | 'Reporting Officer' | 'Mentioned Party' | 'Victim' | 'Informant' | string;
  details?: string;
}

export interface ComplainantInfo {
  fullName: string;
  age?: string;
  contactNumber: string;
  address: string;
  preferredLanguage: 'Kannada' | 'English' | 'Hindi' | 'Urdu';
}

export interface AccusedInfo {
  isUnknown: boolean;
  name?: string;
  alias?: string;
  physicalDescription?: string;
  clothingDetails?: string;
  approxAge?: string;
}

export interface WitnessInfo {
  id: string;
  name: string;
  role: string;
  contact?: string;
  address?: string;
}

export interface DigitalSignature {
  type: 'complainant' | 'officer';
  signatureDataUrl?: string; // Base64 PNG from drawing pad
  signerName: string;
  signerDesignation?: string;
  isTypedAcknowledgement?: boolean;
  timestamp: string;
  confirmed: boolean;
}

export interface PoliceDocument {
  id: string;
  fileName: string;
  fileType: 'image/png' | 'image/jpeg' | 'application/pdf' | string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  previewUrl?: string;
  extractedTextPreview?: string;
  originalRef?: string;
}

export interface PoliceRecord {
  id: string;
  caseReference: string; // e.g. DEMO-KAL-001
  sourceType: 'digital_fir' | 'scanned_document';
  incidentType: IncidentCategory | string;
  dateTime: string;
  recordedLocation: string;
  district: 'Kalaburagi';
  policeStation: string;
  incidentSummary: string;

  // Digital FIR detailed sections
  complainant?: ComplainantInfo;
  accused?: AccusedInfo;
  witnesses?: WitnessInfo[];
  originalStatement?: string;
  aiAssistedDraft?: string;
  propertyDetails?: string;
  imeiNumbers?: string[]; // e.g. DEMO-IMEI-001
  complainantSignature?: DigitalSignature;
  officerSignature?: DigitalSignature;

  // Spatial coordinates within Kalaburagi for incident pattern analysis
  coordinates?: {
    latitude: number;
    longitude: number;
    landmark: string;
  };

  // Common extracted fields
  peopleMentioned: PersonMentioned[];
  vehicleReferences: string[];
  otherIdentifiers: string[];
  originalDocumentReference: string;
  confidenceNotes?: string;

  // Workflow & Status
  verificationStatus: VerificationStatus;
  workflowStatus?: RecordWorkflowStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  attachedDocument?: PoliceDocument;
  createdAt: string;
  updatedAt: string;
}

export type ConnectionStatus = 'detected' | 'reviewed' | 'dismissed';

export type MatchingType =
  | 'Exact IMEI Match'
  | 'Vehicle Reference Match'
  | 'Phone Identifier Match'
  | 'Possible Incident Pattern Detected'
  | 'Geographic Proximity'
  | 'Similar Recorded Details';

export type ConfidenceLabel =
  | 'Exact Identifier Match'
  | 'Strong Similarity'
  | 'Possible Pattern'
  | 'Needs Human Review';

export interface PotentialConnection {
  id: string;
  sourceRecordId: string;
  targetRecordId: string;
  sourceCaseRef: string;
  targetCaseRef: string;
  matchingType: MatchingType;
  matchingField: string;
  matchingValue: string;
  explanation: string;
  confidenceLabel: ConfidenceLabel;
  spatialDistanceKm?: number;
  daysApart?: number;
  status: ConnectionStatus;
  officerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  detectedAt: string;
}

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Normal' | 'Urgent';

export interface AdministrativeTask {
  id: string;
  caseId: string;
  caseReference: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  notes?: string[];
}

export type ActivityEventType =
  | 'RECORD_CREATED'
  | 'FIR_DRAFT_CREATED'
  | 'DOCUMENT_UPLOADED'
  | 'EXTRACTION_COMPLETED'
  | 'OFFICER_VERIFIED'
  | 'SIGNATURE_CAPTURED'
  | 'CONNECTION_REVIEWED'
  | 'CONNECTION_DISMISSED'
  | 'TASK_CREATED'
  | 'TASK_STATUS_UPDATED'
  | 'ADMIN_NOTE_ADDED'
  | 'DATA_RESET';

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: ActivityEventType;
  caseId?: string;
  caseReference?: string;
  title: string;
  description: string;
  performedBy: string;
  meta?: Record<string, any>;
}

export type AppLanguage = 'en' | 'kn';
