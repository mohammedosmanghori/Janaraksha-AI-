/**
 * JANARAKSHA AI — Sample Document Presets (Kalaburagi Only)
 * High-fidelity fictional police document templates and SVGs
 * for Kalaburagi police administrative testing.
 */

export interface SampleDocPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  fileName: string;
  mimeType: string;
  dataUrl: string;
  extractedValues: {
    caseReference: string;
    incidentType: string;
    dateTime: string;
    recordedLocation: string;
    district: 'Kalaburagi';
    policeStation: string;
    incidentSummary: string;
    peopleMentioned: Array<{ name: string; role: string; details?: string }>;
    vehicleReferences: string[];
    otherIdentifiers: string[];
    imeiNumbers?: string[];
    originalDocumentReference: string;
    confidenceNotes: string;
  };
}

// Generate realistic SVG police memorandum / FIR scanned look strictly for Kalaburagi
export function generatePoliceDocumentSvg(params: {
  titleEn: string;
  titleKn: string;
  caseRef: string;
  psName: string;
  dateStr: string;
  bodyParagraphs: string[];
  vehicleTag?: string;
  imeiTag?: string;
  stampText?: string;
}): string {
  const { titleEn, titleKn, caseRef, psName, dateStr, bodyParagraphs, vehicleTag, imeiTag, stampText } = params;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1050" width="800" height="1050">
  <!-- Paper background with aged tone -->
  <rect width="800" height="1050" fill="#fbf8ef" />
  <rect x="25" y="25" width="750" height="1000" fill="#fdfbf5" stroke="#d5cebc" stroke-width="1.5" />
  <rect x="35" y="35" width="730" height="980" fill="none" stroke="#e8e2d2" stroke-width="0.75" />

  <!-- Header: Government of Karnataka / Police Department -->
  <g fill="#1e293b" font-family="'Plus Jakarta Sans', Arial, sans-serif" text-anchor="middle">
    <circle cx="400" cy="85" r="28" fill="#1e3a5f" opacity="0.08" />
    <path d="M400 65 L415 90 L385 90 Z" fill="#1e3a5f" opacity="0.3" />
    <circle cx="400" cy="85" r="14" fill="none" stroke="#1e3a5f" stroke-width="2" />
    <text x="400" y="89" font-size="10" font-weight="700" fill="#1e3a5f">KSP</text>

    <text x="400" y="130" font-size="13" font-weight="700" letter-spacing="1">ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ / KARNATAKA STATE POLICE</text>
    <text x="400" y="148" font-size="11" font-weight="600" fill="#475569">KALABURAGI CITY POLICE COMMISSIONERATE / DISTRICT</text>
    <text x="400" y="166" font-size="12" font-weight="700" fill="#0f172a">${psName.toUpperCase()}</text>
  </g>

  <!-- Document Title & Case Bar -->
  <rect x="50" y="185" width="700" height="42" fill="#0f172a" rx="2" />
  <text x="400" y="204" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">${titleKn} / ${titleEn.toUpperCase()}</text>
  <text x="400" y="220" font-family="'JetBrains Mono', monospace" font-size="11" fill="#94a3b8" text-anchor="middle">INTERNAL REF: ${caseRef} · DATE: ${dateStr}</text>

  <!-- Meta Info Table -->
  <g font-family="Arial, sans-serif" font-size="11" fill="#334155">
    <rect x="50" y="240" width="700" height="68" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.75" />
    <line x1="50" y1="274" x2="750" y2="274" stroke="#e2e8f0" stroke-width="0.75" />
    <line x1="280" y1="240" x2="280" y2="308" stroke="#cbd5e1" stroke-width="0.75" />
    <line x1="520" y1="240" x2="520" y2="308" stroke="#cbd5e1" stroke-width="0.75" />

    <text x="60" y="258" font-weight="700" fill="#64748b">JURISDICTION:</text>
    <text x="60" y="294" font-weight="700" fill="#64748b">INCIDENT DATE:</text>

    <text x="160" y="258" font-weight="600">${psName}</text>
    <text x="160" y="294" font-weight="600">${dateStr}</text>

    <text x="290" y="258" font-weight="700" fill="#64748b">INTERNAL REF:</text>
    <text x="290" y="294" font-weight="700" fill="#64748b">LOCATION:</text>

    <text x="380" y="258" font-family="monospace" font-weight="700" fill="#0f172a">${caseRef}</text>
    <text x="380" y="294" font-weight="600">Kalaburagi, Karnataka</text>

    <text x="530" y="258" font-weight="700" fill="#64748b">CLASSIFICATION:</text>
    <text x="530" y="294" font-weight="700" fill="#64748b">IDENTIFIER:</text>

    <text x="640" y="258" font-weight="600">${titleEn}</text>
    <text x="640" y="294" font-family="monospace" font-weight="700" fill="#b91c1c">${vehicleTag || imeiTag || 'N/A'}</text>
  </g>

  <!-- Body Content -->
  <g font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="12" fill="#1e293b">
    <text x="50" y="340" font-weight="700" font-size="13" fill="#0f172a">RECORD DETAILS &amp; STATEMENTS (ದಾಖಲಾತಿ ವಿವರಗಳು):</text>
    ${bodyParagraphs
      .map(
        (p, idx) =>
          `<text x="50" y="${370 + idx * 45}" width="700" font-size="11.5" letter-spacing="0.2">${p}</text>`
      )
      .join('\n')}
  </g>

  <!-- Rubber Stamp -->
  <g transform="translate(560, 680) rotate(-7)">
    <rect width="160" height="60" fill="none" stroke="#dc2626" stroke-width="2.5" opacity="0.85" rx="4" />
    <rect x="3" y="3" width="154" height="54" fill="none" stroke="#dc2626" stroke-width="0.75" opacity="0.6" />
    <text x="80" y="24" font-family="Arial, sans-serif" font-size="9" font-weight="800" fill="#dc2626" text-anchor="middle">KALABURAGI POLICE</text>
    <text x="80" y="38" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#dc2626" text-anchor="middle">${stampText || 'STATION BAZAAR PS'}</text>
    <text x="80" y="50" font-family="Arial, sans-serif" font-size="8" font-weight="700" fill="#dc2626" text-anchor="middle">SEAL &amp; DISPATCH</text>
  </g>

  <!-- Officer Signature Area -->
  <g transform="translate(80, 760)">
    <line x1="0" y1="40" x2="200" y2="40" stroke="#94a3b8" stroke-dasharray="2,2" />
    <text x="0" y="55" font-family="Arial, sans-serif" font-size="10" font-weight="600" fill="#475569">Complainant / Spot Witness Acknowledgement</text>
    <path d="M10 32 Q 40 5, 80 30 T 140 25 T 180 35" fill="none" stroke="#1e3a8a" stroke-width="1.8" opacity="0.7" />
  </g>

  <g transform="translate(520, 760)">
    <line x1="0" y1="40" x2="200" y2="40" stroke="#94a3b8" stroke-dasharray="2,2" />
    <text x="0" y="55" font-family="Arial, sans-serif" font-size="10" font-weight="600" fill="#475569">Authorized Station Officer (SHO)</text>
    <path d="M20 30 Q 60 10, 110 35 T 160 20 T 190 32" fill="none" stroke="#1e3a8a" stroke-width="2" opacity="0.75" />
  </g>

  <!-- Bottom Regulatory Bar -->
  <rect x="50" y="960" width="700" height="28" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1" />
  <text x="400" y="978" font-family="Arial, sans-serif" font-size="9" fill="#64748b" text-anchor="middle" font-weight="500">
    JANARAKSHA AI DEMONSTRATION RECORD · PRESERVED DIGITAL ARCHIVE · KALABURAGI, KARNATAKA
  </text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_PRESETS: SampleDocPreset[] = [
  {
    id: 'sample-kal-001',
    name: 'Sample 1: Central Bus Stand Mobile Theft (DEMO-KAL-001)',
    category: 'Mobile Phone Theft',
    description: 'Brahampur PS Kalaburagi FIR. Stolen Samsung device with IMEI: DEMO-IMEI-001.',
    fileName: 'KAL_BUS_STAND_FIR_001.pdf',
    mimeType: 'image/svg+xml',
    dataUrl: generatePoliceDocumentSvg({
      titleEn: 'Mobile Snatching Incident Report',
      titleKn: 'ಮೊಬೈಲ್ ಕಳವು ಪ್ರಕರಣ',
      caseRef: 'DEMO-KAL-001',
      psName: 'Brahampur Police Station, Kalaburagi',
      dateStr: '14-Oct-2024, 19:30 IST',
      bodyParagraphs: [
        '1. Complainant Sri Suresh Patil reported snatching of Samsung Galaxy device outside Kalaburagi Central Bus Stand gate.',
        '2. Two unidentified male persons arrived on a commuter motorcycle and sped toward Super Market cross.',
        '3. Property Details: Mobile IMEI DEMO-IMEI-001 (864920048192019), SIM Contact +91 98450 12345.',
        '4. Spot Panchanama conducted in presence of witnesses at Central Bus Stand depot exit, Kalaburagi.',
      ],
      imeiTag: 'DEMO-IMEI-001',
      stampText: 'BRAHAMPUR PS KALABURAGI',
    }),
    extractedValues: {
      caseReference: 'DEMO-KAL-001',
      incidentType: 'Mobile Phone Theft',
      dateTime: '14-Oct-2024, 19:30 IST',
      recordedLocation: 'Central Bus Stand, Kalaburagi',
      district: 'Kalaburagi',
      policeStation: 'Brahampur Police Station',
      incidentSummary: 'Complainant reported two individuals on a commuter motorcycle snatched a smartphone outside Central Bus Stand and fled toward Super Market cross. Stolen phone IMEI: DEMO-IMEI-001.',
      peopleMentioned: [
        { name: 'Suresh Patil', role: 'Complainant', details: 'Shop Owner, Brahampur' },
        { name: 'ASI M. K. Rathod', role: 'Reporting Officer', details: 'Brahampur PS' },
        { name: 'Jagadish K.', role: 'Witness', details: 'Bus Stand Vendor' },
      ],
      vehicleReferences: ['KA-32-TEMP-41'],
      otherIdentifiers: ['IMEI: DEMO-IMEI-001', 'SIM: +91 98450 12345'],
      imeiNumbers: ['DEMO-IMEI-001', '864920048192019'],
      originalDocumentReference: 'FIR Book Vol. 4, Page 12 · Brahampur PS',
      confidenceNotes: 'High clarity carbon print; IMEI clearly legible.',
    },
  },
  {
    id: 'sample-kal-002',
    name: 'Sample 2: Railway Colony Two-Wheeler Theft (DEMO-KAL-002)',
    category: 'Vehicle Theft',
    description: 'Station Bazaar PS Kalaburagi theft complaint for motorcycle DEMO-VEHICLE-01.',
    fileName: 'KAL_STN_BAZAAR_VEH_002.pdf',
    mimeType: 'image/svg+xml',
    dataUrl: generatePoliceDocumentSvg({
      titleEn: 'Motor Vehicle Theft Report',
      titleKn: 'ದ್ವಿಚಕ್ರ ವಾಹನ ಕಳವು ದೂರು',
      caseRef: 'DEMO-KAL-002',
      psName: 'Station Bazaar Police Station, Kalaburagi',
      dateStr: '18-Oct-2024, 02:15 IST',
      bodyParagraphs: [
        '1. Complainant Sri Anand Kumar Biradar reported theft of black motorcycle parked in residential porch.',
        '2. Vehicle Details: Registration KA-32-EA-4912, identified under tracking code DEMO-VEHICLE-01.',
        '3. Engine Number: DH48291, Chassis: MD2A32EA4912, Hero Splendor Plus.',
        '4. CCTV footage retrieved from railway colony tea stall shows vehicle moving toward MSK Mill road.',
      ],
      vehicleTag: 'DEMO-VEHICLE-01',
      stampText: 'STATION BAZAAR PS',
    }),
    extractedValues: {
      caseReference: 'DEMO-KAL-002',
      incidentType: 'Vehicle Theft',
      dateTime: '18-Oct-2024, 02:15 IST',
      recordedLocation: 'Railway Station Colony, Kalaburagi',
      district: 'Kalaburagi',
      policeStation: 'Station Bazaar Police Station',
      incidentSummary: 'Two-wheeler motorcycle KA-32-EA-4912 (DEMO-VEHICLE-01) reported stolen outside residence. CCTV footage captured movement toward MSK Mill road at 02:10 AM.',
      peopleMentioned: [
        { name: 'Anand Kumar Biradar', role: 'Complainant', details: 'Resident, Railway Colony, Kalaburagi' },
        { name: 'PSI Raghavendra Swamy', role: 'Reporting Officer', details: 'Station Bazaar PS' },
      ],
      vehicleReferences: ['DEMO-VEHICLE-01', 'KA-32-EA-4912'],
      otherIdentifiers: ['Engine: DH48291', 'Chassis: MD2A32EA4912'],
      originalDocumentReference: 'Complaint No. 202/2024 · Station Bazaar PS',
      confidenceNotes: 'Registration number authenticated against attached RC copy.',
    },
  },
  {
    id: 'sample-kal-004',
    name: 'Sample 3: Suspicious Pawn Recovery (DEMO-KAL-004)',
    category: 'Property Seizure',
    description: 'Station Bazaar PS recovery memo. Seized phone matching IMEI: DEMO-IMEI-001.',
    fileName: 'KAL_NEHRU_GUNJ_PAWN_004.pdf',
    mimeType: 'image/svg+xml',
    dataUrl: generatePoliceDocumentSvg({
      titleEn: 'Suspicious Electronic Property Seizure Memo',
      titleKn: 'ಸಂಶಯಾಸ್ಪದ ಸ್ವತ್ತು ಜಪ್ತಿ ಮಹಜರ್',
      caseRef: 'DEMO-KAL-004',
      psName: 'Station Bazaar Police Station, Kalaburagi',
      dateStr: '22-Oct-2024, 16:45 IST',
      bodyParagraphs: [
        '1. Shop owner Sri Ramesh Electronics, Nehru Gunj Kalaburagi, alerted police regarding suspicious phone pawn attempt.',
        '2. Device seized under Section 102 CrPC: Samsung Galaxy smartphone with IMEI DEMO-IMEI-001 (864920048192019).',
        '3. Individual fled when requested to produce purchase invoice or identity card.',
        '4. Property deposited into Station Bazaar PS Malkhana pending identification.',
      ],
      imeiTag: 'DEMO-IMEI-001',
      stampText: 'STATION BAZAAR PS',
    }),
    extractedValues: {
      caseReference: 'DEMO-KAL-004',
      incidentType: 'Property Seizure',
      dateTime: '22-Oct-2024, 16:45 IST',
      recordedLocation: 'Nehru Gunj Market, Kalaburagi',
      district: 'Kalaburagi',
      policeStation: 'Station Bazaar Police Station',
      incidentSummary: 'Pawn shop alert led to recovery of suspicious Samsung Galaxy smartphone matching IMEI DEMO-IMEI-001. Suspect fled leaving device behind.',
      peopleMentioned: [
        { name: 'Ramesh Patil', role: 'Informant', details: 'Shop Owner, Nehru Gunj' },
        { name: 'PSI Raghavendra Swamy', role: 'Reporting Officer', details: 'Station Bazaar PS' },
      ],
      vehicleReferences: [],
      otherIdentifiers: ['IMEI: DEMO-IMEI-001', 'Seizure Tag: PF-KAL-14'],
      imeiNumbers: ['DEMO-IMEI-001', '864920048192019'],
      originalDocumentReference: 'PF No. 14/2024 · Station Bazaar PS',
      confidenceNotes: 'Hardware IMEI extracted directly from device motherboard label.',
    },
  },
  {
    id: 'sample-kal-005',
    name: 'Sample 4: Aland Checkpost Barricade Evasion (DEMO-KAL-005)',
    category: 'Incident Report',
    description: 'Farhatabad PS Kalaburagi GD entry. Vehicle DEMO-VEHICLE-01 evaded barricade.',
    fileName: 'KAL_ALAND_CHECKPOST_005.pdf',
    mimeType: 'image/svg+xml',
    dataUrl: generatePoliceDocumentSvg({
      titleEn: 'Checkpost Barricade Evasion Report',
      titleKn: 'ಚೆಕ್‌ಪೋಸ್ಟ್ ಬ್ಯಾರಿಕೇಡ್ ತಪ್ಪಿಸಿಕೊಂಡ ವರದಿ',
      caseRef: 'DEMO-KAL-005',
      psName: 'Farhatabad Police Station, Kalaburagi',
      dateStr: '25-Oct-2024, 23:45 IST',
      bodyParagraphs: [
        '1. Routine night barricade inspection at Aland Checkpost Outer Ring Road, Kalaburagi.',
        '2. Two-wheeler bearing registration KA-32-EA-4912 (DEMO-VEHICLE-01) approached barricade from city side.',
        '3. Rider accelerated abruptly on signal to halt, bypassing tire spikes and heading toward Afzalpur bypass.',
        '4. General Diary entry recorded under GD No. 88/2024.',
      ],
      vehicleTag: 'DEMO-VEHICLE-01',
      stampText: 'FARHATABAD PS KALABURAGI',
    }),
    extractedValues: {
      caseReference: 'DEMO-KAL-005',
      incidentType: 'Incident Report',
      dateTime: '25-Oct-2024, 23:45 IST',
      recordedLocation: 'Aland Checkpost Outer Ring Road, Kalaburagi',
      district: 'Kalaburagi',
      policeStation: 'Farhatabad Police Station',
      incidentSummary: 'During night patrol barricade inspection on outer ring road, motorcycle KA-32-EA-4912 (DEMO-VEHICLE-01) failed to halt when flagged and sped toward Afzalpur bypass.',
      peopleMentioned: [
        { name: 'HC Basavaraj Patil', role: 'Reporting Officer', details: 'Farhatabad PS' },
        { name: 'PC Sharanappa', role: 'Witness', details: 'Checkpost Team' },
      ],
      vehicleReferences: ['DEMO-VEHICLE-01', 'KA-32-EA-4912'],
      otherIdentifiers: ['GD Ref: 88/2024', 'Checkpost Log: CP-ALN-7'],
      originalDocumentReference: 'General Diary Extract Vol. 14 · Farhatabad PS',
      confidenceNotes: 'Registration number confirmed by both checkpost officers.',
    },
  },
];
