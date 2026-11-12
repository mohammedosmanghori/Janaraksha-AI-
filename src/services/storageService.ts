/**
 * JANARAKSHA AI — Persistent Storage & Record Management Service
 * Kalaburagi, Karnataka, India
 * Manages police records, digital FIRs, administrative tasks, and chronological activity events.
 */

import { PoliceRecord, AdministrativeTask, ActivityEvent, PotentialConnection } from '../types';
import { SAMPLE_PRESETS } from './sampleDocuments';

const STORAGE_KEYS = {
  RECORDS: 'janaraksha_kalaburagi_records_v2',
  TASKS: 'janaraksha_kalaburagi_tasks_v2',
  ACTIVITY: 'janaraksha_kalaburagi_activity_v2',
  REVIEWS: 'janaraksha_kalaburagi_reviews_v2',
  APP_LANG: 'janaraksha_kalaburagi_lang_v2',
};

// Initial fictional dataset strictly for Kalaburagi (DEMO-KAL-001 to DEMO-KAL-006)
function getDefaultRecords(): PoliceRecord[] {
  const sample1 = SAMPLE_PRESETS.find((s) => s.id === 'sample-kal-001')!;
  const sample2 = SAMPLE_PRESETS.find((s) => s.id === 'sample-kal-002')!;
  const sample4 = SAMPLE_PRESETS.find((s) => s.id === 'sample-kal-004')!;
  const sample5 = SAMPLE_PRESETS.find((s) => s.id === 'sample-kal-005')!;

  return [
    // DEMO-KAL-001: Mobile phone theft at Bus Stand (Shares IMEI with KAL-004; Part of Cluster with KAL-003, KAL-006)
    {
      id: 'rec-demo-kal-001',
      caseReference: 'DEMO-KAL-001',
      sourceType: 'scanned_document',
      incidentType: 'Mobile Phone Theft',
      dateTime: '14-Oct-2024, 19:30 IST',
      recordedLocation: 'Central Bus Stand Depot Gate, Kalaburagi',
      district: 'Kalaburagi',
      policeStation: 'Brahampur Police Station',
      incidentSummary:
        'Complainant reported two individuals on a commuter motorcycle snatched a Samsung Galaxy smartphone while waiting near the bus depot gate and sped toward Super Market cross. Stolen phone IMEI: DEMO-IMEI-001.',
      coordinates: {
        latitude: 17.3325,
        longitude: 76.834,
        landmark: 'Central Bus Stand, Kalaburagi',
      },
      peopleMentioned: [
        { name: 'Suresh Patil', role: 'Complainant', details: 'Shop Owner, Brahampur, Kalaburagi' },
        { name: 'ASI M. K. Rathod', role: 'Reporting Officer', details: 'Brahampur PS' },
        { name: 'Jagadish K.', role: 'Witness', details: 'Bus Stand Vendor' },
      ],
      vehicleReferences: ['KA-32-TEMP-41'],
      otherIdentifiers: ['IMEI: DEMO-IMEI-001', 'Phone: +91 98450 12345'],
      imeiNumbers: ['DEMO-IMEI-001', '864920048192019'],
      originalDocumentReference: 'FIR No. 101/2024 · Book Vol. 4 · Brahampur PS',
      confidenceNotes: 'Legible scanned FIR carbon copy; hardware IMEI verified from invoice.',
      verificationStatus: 'Officer Verified',
      workflowStatus: 'Officer Verified',
      verifiedBy: 'Officer Demo',
      verifiedAt: '2024-10-15T10:15:00.000Z',
      attachedDocument: {
        id: 'doc-kal-001',
        fileName: sample1.fileName,
        fileType: sample1.mimeType,
        fileSize: 42100,
        uploadedAt: '2024-10-15T09:40:00.000Z',
        uploadedBy: 'Officer Demo',
        previewUrl: sample1.dataUrl,
        originalRef: 'Brahampur PS Station Register Vol. 4',
      },
      createdAt: '2024-10-15T09:40:00.000Z',
      updatedAt: '2024-10-15T10:15:00.000Z',
    },

    // DEMO-KAL-002: Vehicle Theft at Railway Colony (Shares Vehicle with KAL-005)
    {
      id: 'rec-demo-kal-002',
      caseReference: 'DEMO-KAL-002',
      sourceType: 'scanned_document',
      incidentType: 'Vehicle Theft',
      dateTime: '18-Oct-2024, 02:15 IST',
      recordedLocation: 'Railway Station Colony, Kalaburagi',
      district: 'Kalaburagi',
      policeStation: 'Station Bazaar Police Station',
      incidentSummary:
        'Two-wheeler Hero Splendor motorcycle KA-32-EA-4912 (DEMO-VEHICLE-01) parked in residential porch was stolen. CCTV footage captured movement toward MSK Mill road at 02:10 AM.',
      coordinates: {
        latitude: 17.3295,
        longitude: 76.8415,
        landmark: 'Railway Station Colony, Kalaburagi',
      },
      peopleMentioned: [
        { name: 'Anand Kumar Biradar', role: 'Complainant', details: 'Resident, Railway Colony, Kalaburagi' },
        { name: 'PSI Raghavendra Swamy', role: 'Reporting Officer', details: 'Station Bazaar PS' },
      ],
      vehicleReferences: ['DEMO-VEHICLE-01', 'KA-32-EA-4912'],
      otherIdentifiers: ['Engine: DH48291', 'Chassis: MD2A32EA4912'],
      originalDocumentReference: 'Complaint No. 202/2024 · Station Bazaar PS',
      confidenceNotes: 'Registration number authenticated against vehicle RC record.',
      verificationStatus: 'Officer Verified',
      workflowStatus: 'Officer Verified',
      verifiedBy: 'Officer Demo',
      verifiedAt: '2024-10-18T08:30:00.000Z',
      attachedDocument: {
        id: 'doc-kal-002',
        fileName: sample2.fileName,
        fileType: sample2.mimeType,
        fileSize: 48900,
        uploadedAt: '2024-10-18T08:00:00.000Z',
        uploadedBy: 'Officer Demo',
        previewUrl: sample2.dataUrl,
        originalRef: 'Station Bazaar PS Case Folder 202',
      },
      createdAt: '2024-10-18T08:00:00.000Z',
      updatedAt: '2024-10-18T08:30:00.000Z',
    },

    // DEMO-KAL-003: Mobile Phone Theft at Super Market (Part of Nearby Cluster with KAL-001 & KAL-006)
    {
      id: 'rec-demo-kal-003',
      caseReference: 'DEMO-KAL-003',
      sourceType: 'digital_fir',
      incidentType: 'Mobile Phone Theft',
      dateTime: '16-Oct-2024, 20:10 IST',
      recordedLocation: 'Super Market, Brahampur Cross, Kalaburagi',
      district: 'Kalaburagi',
      policeStation: 'Brahampur Police Station',
      incidentSummary:
        'Complainant Smt. Sunita Rao reported her Vivo smartphone was snatched by two persons on a black motorcycle outside a grocery shop in Super Market, about 800m from Central Bus Stand.',
      coordinates: {
        latitude: 17.338,
        longitude: 76.839,
        landmark: 'Super Market, Kalaburagi',
      },
      complainant: {
        fullName: 'Sunita Rao',
        age: '38',
        contactNumber: '+91 94481 44556',
        address: 'H.No 4-12, Brahampur, Kalaburagi',
        preferredLanguage: 'Kannada',
      },
      accused: {
        isUnknown: true,
        physicalDescription: 'Two males, slim build, riding dark motorcycle without visible number plate',
        clothingDetails: 'Dark hoodies, scarf covering lower face',
      },
      peopleMentioned: [
        { name: 'Sunita Rao', role: 'Complainant', details: 'Teacher, Brahampur' },
        { name: 'Mallikarjun G.', role: 'Witness', details: 'Grocery store owner' },
        { name: 'ASI M. K. Rathod', role: 'Reporting Officer', details: 'Brahampur PS' },
      ],
      vehicleReferences: ['KA-32-UNKNOWN-BLACK'],
      otherIdentifiers: ['IMEI: 869910284729103', 'SIM: +91 94481 44556'],
      imeiNumbers: ['869910284729103'],
      originalDocumentReference: 'Digital FIR Entry #KAL-DIG-003',
      confidenceNotes: 'Entered via Paperless Digital FIR workspace with complainant acknowledgement.',
      verificationStatus: 'Officer Verified',
      workflowStatus: 'Officer Verified',
      verifiedBy: 'Officer Demo',
      verifiedAt: '2024-10-17T09:00:00.000Z',
      createdAt: '2024-10-17T08:30:00.000Z',
      updatedAt: '2024-10-17T09:00:00.000Z',
    },

    // DEMO-KAL-004: Suspicious Pawn Recovery at Nehru Gunj (Matches KAL-001 on DEMO-IMEI-001)
    {
      id: 'rec-demo-kal-004',
      caseReference: 'DEMO-KAL-004',
      sourceType: 'scanned_document',
      incidentType: 'Property Seizure',
      dateTime: '22-Oct-2024, 16:45 IST',
      recordedLocation: 'Nehru Gunj Market, Kalaburagi',
      district: 'Kalaburagi',
      policeStation: 'Station Bazaar Police Station',
      incidentSummary:
        'Pawn shop owner reported a suspicious youth attempting to pledge a Samsung Galaxy phone without purchase bill. Officer seized device under Section 102 CrPC; IMEI confirmed as DEMO-IMEI-001.',
      coordinates: {
        latitude: 17.328,
        longitude: 76.845,
        landmark: 'Nehru Gunj, Kalaburagi',
      },
      peopleMentioned: [
        { name: 'Ramesh Patil', role: 'Informant', details: 'Electronics Shop Owner, Nehru Gunj' },
        { name: 'PSI Raghavendra Swamy', role: 'Reporting Officer', details: 'Station Bazaar PS' },
      ],
      vehicleReferences: [],
      otherIdentifiers: ['IMEI: DEMO-IMEI-001', 'Seizure Tag: PF-KAL-14'],
      imeiNumbers: ['DEMO-IMEI-001', '864920048192019'],
      originalDocumentReference: 'PF No. 14/2024 · Station Bazaar PS Malkhana',
      confidenceNotes: 'Hardware IMEI extracted from device motherboard label and confirmed.',
      verificationStatus: 'Officer Verified',
      workflowStatus: 'Officer Verified',
      verifiedBy: 'Officer Demo',
      verifiedAt: '2024-10-22T18:00:00.000Z',
      attachedDocument: {
        id: 'doc-kal-004',
        fileName: sample4.fileName,
        fileType: sample4.mimeType,
        fileSize: 41200,
        uploadedAt: '2024-10-22T17:15:00.000Z',
        uploadedBy: 'Officer Demo',
        previewUrl: sample4.dataUrl,
        originalRef: 'Station Bazaar PS Property Register Vol. 14',
      },
      createdAt: '2024-10-22T17:15:00.000Z',
      updatedAt: '2024-10-22T18:00:00.000Z',
    },

    // DEMO-KAL-005: Aland Checkpost Barricade Evasion (Matches KAL-002 on DEMO-VEHICLE-01)
    {
      id: 'rec-demo-kal-005',
      caseReference: 'DEMO-KAL-005',
      sourceType: 'scanned_document',
      incidentType: 'Incident Report',
      dateTime: '25-Oct-2024, 23:45 IST',
      recordedLocation: 'Aland Checkpost Outer Ring Road, Kalaburagi',
      district: 'Kalaburagi',
      policeStation: 'Farhatabad Police Station',
      incidentSummary:
        'During night barricade inspection on Kalaburagi outer ring road, motorcycle KA-32-EA-4912 (DEMO-VEHICLE-01) failed to halt when flagged and sped toward Afzalpur bypass.',
      coordinates: {
        latitude: 17.365,
        longitude: 76.812,
        landmark: 'Aland Checkpost Outer Ring Road, Kalaburagi',
      },
      peopleMentioned: [
        { name: 'HC Basavaraj Patil', role: 'Reporting Officer', details: 'Badge 1420, Farhatabad PS' },
        { name: 'PC Sharanappa', role: 'Witness', details: 'Checkpost Team' },
      ],
      vehicleReferences: ['DEMO-VEHICLE-01', 'KA-32-EA-4912'],
      otherIdentifiers: ['GD Ref: 88/2024', 'Checkpost Log: CP-ALN-7'],
      originalDocumentReference: 'General Diary Extract Vol. 14 · Farhatabad PS',
      confidenceNotes: 'Registration number confirmed by checkpost team.',
      verificationStatus: 'Officer Verified',
      workflowStatus: 'Officer Verified',
      verifiedBy: 'Officer Demo',
      verifiedAt: '2024-10-26T06:45:00.000Z',
      attachedDocument: {
        id: 'doc-kal-005',
        fileName: sample5.fileName,
        fileType: sample5.mimeType,
        fileSize: 39500,
        uploadedAt: '2024-10-26T06:00:00.000Z',
        uploadedBy: 'Officer Demo',
        previewUrl: sample5.dataUrl,
        originalRef: 'Farhatabad GD Book Vol 14',
      },
      createdAt: '2024-10-26T06:00:00.000Z',
      updatedAt: '2024-10-26T06:45:00.000Z',
    },

    // DEMO-KAL-006: Mobile Phone Theft at Station Road Overbridge (Completes 3-Incident Cluster with KAL-001 & KAL-003)
    {
      id: 'rec-demo-kal-006',
      caseReference: 'DEMO-KAL-006',
      sourceType: 'digital_fir',
      incidentType: 'Mobile Phone Theft',
      dateTime: '19-Oct-2024, 20:45 IST',
      recordedLocation: 'Station Road Railway Overbridge Junction, Kalaburagi',
      district: 'Kalaburagi',
      policeStation: 'Station Bazaar Police Station',
      incidentSummary:
        'Pedestrian Sri Vijay Kumar reported his smartphone snatched by two persons on a black commuter motorcycle near railway overbridge on Station Road (1.1 km from Bus Stand and 1.2 km from Super Market).',
      coordinates: {
        latitude: 17.329,
        longitude: 76.842,
        landmark: 'Station Road Overbridge, Kalaburagi',
      },
      complainant: {
        fullName: 'Vijay Kumar',
        age: '29',
        contactNumber: '+91 97410 88290',
        address: 'Ashok Nagar, Kalaburagi',
        preferredLanguage: 'English',
      },
      accused: {
        isUnknown: true,
        physicalDescription: 'Two youths on black motorcycle, face covered, wearing denim jackets',
      },
      peopleMentioned: [
        { name: 'Vijay Kumar', role: 'Complainant', details: 'Accountant, Kalaburagi' },
        { name: 'Basavaraj H.', role: 'Witness', details: 'Auto driver at Overbridge stand' },
        { name: 'PSI Raghavendra Swamy', role: 'Reporting Officer', details: 'Station Bazaar PS' },
      ],
      vehicleReferences: ['KA-32-UNKNOWN-BLACK'],
      otherIdentifiers: ['IMEI: 865520194829104', 'Phone: +91 97410 88290'],
      imeiNumbers: ['865520194829104'],
      originalDocumentReference: 'Digital FIR Entry #KAL-DIG-006',
      confidenceNotes: 'Recorded digitally with complainant electronic acknowledgement.',
      verificationStatus: 'Officer Verified',
      workflowStatus: 'Officer Verified',
      verifiedBy: 'Officer Demo',
      verifiedAt: '2024-10-20T09:30:00.000Z',
      createdAt: '2024-10-20T09:00:00.000Z',
      updatedAt: '2024-10-20T09:30:00.000Z',
    },
  ];
}

function getDefaultTasks(): AdministrativeTask[] {
  return [
    {
      id: 'task-1',
      caseId: 'rec-demo-kal-004',
      caseReference: 'DEMO-KAL-004',
      title: 'Summon Complainant of DEMO-KAL-001 for IMEI Identification',
      description: 'Notify Sri Suresh Patil (Complainant in DEMO-KAL-001) to visit Station Bazaar PS to inspect and identify recovered Samsung device (IMEI: DEMO-IMEI-001).',
      assignedTo: 'Officer Demo (Lead Reviewer)',
      dueDate: '2024-11-15',
      priority: 'Urgent',
      status: 'In Progress',
      createdAt: '2024-10-23T09:00:00.000Z',
      notes: ['Summons memo sent to Brahampur PS for delivery to complainant.'],
    },
    {
      id: 'task-2',
      caseId: 'rec-demo-kal-002',
      caseReference: 'DEMO-KAL-002',
      title: 'Inspect CCTV at MSK Mill Road and Aland Ring Road',
      description: 'Review Kalaburagi Smart City traffic cameras between Station Bazaar and Aland Checkpost for movement of motorcycle DEMO-VEHICLE-01 (KA-32-EA-4912).',
      assignedTo: 'Officer Demo (Lead Reviewer)',
      dueDate: '2024-11-18',
      priority: 'Urgent',
      status: 'Pending',
      createdAt: '2024-10-26T10:00:00.000Z',
      notes: [],
    },
    {
      id: 'task-3',
      caseId: 'rec-demo-kal-003',
      caseReference: 'DEMO-KAL-003',
      title: 'Deploy Evening Patrol at Central Bus Stand - Super Market Corridor',
      description: 'Coordinate joint motorcycle patrol between Brahampur PS and Station Bazaar PS along the 1.5 km corridor due to repeated snatching pattern.',
      assignedTo: 'Officer Demo (Lead Reviewer)',
      dueDate: '2024-11-12',
      priority: 'Normal',
      status: 'Completed',
      createdAt: '2024-10-20T11:00:00.000Z',
      completedAt: '2024-10-21T16:00:00.000Z',
      notes: ['Patrol log established with two Beat Constables from 19:00 to 22:00 hrs.'],
    },
  ];
}

function getDefaultActivityEvents(): ActivityEvent[] {
  return [
    {
      id: 'act-1',
      timestamp: '2024-10-15T09:40:00.000Z',
      type: 'DOCUMENT_UPLOADED',
      caseId: 'rec-demo-kal-001',
      caseReference: 'DEMO-KAL-001',
      title: 'Central Bus Stand FIR Digitized',
      description: 'Uploaded Brahampur FIR copy (KAL_BUS_STAND_FIR_001.pdf). Extracted IMEI DEMO-IMEI-001.',
      performedBy: 'Officer Demo',
    },
    {
      id: 'act-2',
      timestamp: '2024-10-15T10:15:00.000Z',
      type: 'OFFICER_VERIFIED',
      caseId: 'rec-demo-kal-001',
      caseReference: 'DEMO-KAL-001',
      title: 'Officer Verification Completed',
      description: 'Record DEMO-KAL-001 verified and approved for cross-case matching.',
      performedBy: 'Officer Demo',
    },
    {
      id: 'act-3',
      timestamp: '2024-10-18T08:30:00.000Z',
      type: 'OFFICER_VERIFIED',
      caseId: 'rec-demo-kal-002',
      caseReference: 'DEMO-KAL-002',
      title: 'Vehicle Theft Record Verified',
      description: 'Confirmed theft of motorcycle KA-32-EA-4912 (DEMO-VEHICLE-01) in Station Bazaar jurisdiction.',
      performedBy: 'Officer Demo',
    },
    {
      id: 'act-4',
      timestamp: '2024-10-22T18:00:00.000Z',
      type: 'OFFICER_VERIFIED',
      caseId: 'rec-demo-kal-004',
      caseReference: 'DEMO-KAL-004',
      title: 'Suspicious Property Seizure Confirmed',
      description: 'Malkhana deposit confirmed for device with IMEI DEMO-IMEI-001.',
      performedBy: 'Officer Demo',
    },
    {
      id: 'act-5',
      timestamp: '2024-10-26T06:45:00.000Z',
      type: 'OFFICER_VERIFIED',
      caseId: 'rec-demo-kal-005',
      caseReference: 'DEMO-KAL-005',
      title: 'Checkpost Barricade Evasion Verified',
      description: 'Farhatabad GD log for vehicle DEMO-VEHICLE-01 authenticated.',
      performedBy: 'Officer Demo',
    },
  ];
}

class StorageService {
  private listeners: Array<() => void> = [];

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.RECORDS)) {
      this.resetToDefaultDemoData();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in storage listener', err);
      }
    });
  }

  // --- RECORDS ---
  public getRecords(): PoliceRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getRecordById(id: string): PoliceRecord | undefined {
    return this.getRecords().find((r) => r.id === id || r.caseReference === id);
  }

  public saveRecord(record: PoliceRecord): PoliceRecord {
    const records = this.getRecords();
    const existingIndex = records.findIndex((r) => r.id === record.id);

    const now = new Date().toISOString();
    const updatedRecord: PoliceRecord = {
      ...record,
      district: 'Kalaburagi', // strictly Kalaburagi
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      records[existingIndex] = updatedRecord;
    } else {
      records.unshift(updatedRecord);
    }

    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    this.notify();
    return updatedRecord;
  }

  public deleteRecord(id: string): boolean {
    const records = this.getRecords().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    this.notify();
    return true;
  }

  // Next internal case reference generator (e.g. DEMO-KAL-007)
  public generateNextReference(): string {
    const records = this.getRecords();
    const kalRefs = records
      .map((r) => {
        const match = r.caseReference.match(/DEMO-KAL-(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));

    const max = kalRefs.length > 0 ? Math.max(...kalRefs) : 6;
    const nextNum = max + 1;
    return `DEMO-KAL-${String(nextNum).padStart(3, '0')}`;
  }

  // --- TASKS ---
  public getTasks(): AdministrativeTask[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getTasksForCase(caseId: string): AdministrativeTask[] {
    return this.getTasks().filter((t) => t.caseId === caseId || t.caseReference === caseId);
  }

  public saveTask(task: AdministrativeTask): AdministrativeTask {
    const tasks = this.getTasks();
    const existingIndex = tasks.findIndex((t) => t.id === task.id);

    if (existingIndex >= 0) {
      tasks[existingIndex] = task;
    } else {
      tasks.unshift(task);
    }

    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    this.notify();
    return task;
  }

  public updateTaskStatus(taskId: string, status: AdministrativeTask['status']): AdministrativeTask | undefined {
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return undefined;

    task.status = status;
    if (status === 'Completed') {
      task.completedAt = new Date().toISOString();
    } else {
      task.completedAt = undefined;
    }

    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

    this.logActivity({
      type: 'TASK_STATUS_UPDATED',
      caseId: task.caseId,
      caseReference: task.caseReference,
      title: `Task Status: ${status}`,
      description: `Task "${task.title}" updated to ${status}.`,
      performedBy: 'Officer Demo',
    });

    this.notify();
    return task;
  }

  public addTaskNote(taskId: string, note: string): AdministrativeTask | undefined {
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return undefined;

    task.notes = [...(task.notes || []), note];
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    this.notify();
    return task;
  }

  // --- ACTIVITY TIMELINE ---
  public getActivityEvents(): ActivityEvent[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public logActivity(event: Omit<ActivityEvent, 'id' | 'timestamp'>): ActivityEvent {
    const events = this.getActivityEvents();
    const newEvent: ActivityEvent = {
      ...event,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    events.unshift(newEvent);
    if (events.length > 150) {
      events.length = 150;
    }

    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(events));
    this.notify();
    return newEvent;
  }

  // --- CONNECTION REVIEWS ---
  public getReviewedConnections(): Record<string, { status: PotentialConnection['status']; note?: string; reviewedAt: string }> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  public setConnectionReview(
    connectionKey: string,
    review: { status: PotentialConnection['status']; note?: string }
  ) {
    const reviews = this.getReviewedConnections();
    reviews[connectionKey] = {
      ...review,
      reviewedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    this.notify();
  }

  // --- LANGUAGE (Kalaburagi is fixed district) ---
  public getAppLanguage(): 'en' | 'kn' {
    const lang = localStorage.getItem(STORAGE_KEYS.APP_LANG);
    return lang === 'kn' ? 'kn' : 'en';
  }

  public setAppLanguage(lang: 'en' | 'kn') {
    localStorage.setItem(STORAGE_KEYS.APP_LANG, lang);
    this.notify();
  }

  // --- DATA RESET & BACKUP ---
  public resetToDefaultDemoData() {
    const defaultRecords = getDefaultRecords();
    const defaultTasks = getDefaultTasks();
    const defaultActivity = getDefaultActivityEvents();

    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(defaultRecords));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(defaultTasks));
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(defaultActivity));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify({}));

    this.logActivity({
      type: 'DATA_RESET',
      title: 'Kalaburagi Demonstration Data Reset',
      description: 'Pristine fictional records (DEMO-KAL-001 through DEMO-KAL-006) restored.',
      performedBy: 'System Administrator',
    });

    this.notify();
  }

  public exportBackup(): string {
    const backup = {
      app: 'JANARAKSHA AI',
      district: 'Kalaburagi',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      records: this.getRecords(),
      tasks: this.getTasks(),
      activity: this.getActivityEvents(),
      reviews: this.getReviewedConnections(),
    };
    return JSON.stringify(backup, null, 2);
  }
}

export const storageService = new StorageService();
