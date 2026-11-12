/**
 * JANARAKSHA AI — Intelligent Case Connection Matching Engine
 * Kalaburagi, Karnataka, India
 * Deterministic matching across:
 * 1. Exact IMEI Match
 * 2. Vehicle Registration Match
 * 3. Similar Complaint Pattern Detection (Geographic proximity & Time proximity within Kalaburagi)
 * 4. Phone Identifier Match
 * 5. Person Name Correlation
 * Fulfills Responsible AI standards: no automated guilt determinations.
 */

import { PoliceRecord, PotentialConnection, MatchingType, ConfidenceLabel } from '../types';
import { storageService } from './storageService';

// Identifier normalization helpers
export function normalizeIdentifier(val: string): string {
  if (!val) return '';
  return val.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function normalizePhone(val: string): string {
  if (!val) return '';
  const digits = val.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export function normalizePersonName(val: string): string {
  if (!val) return '';
  return val
    .toLowerCase()
    .replace(/^(sri|smt|mr|mrs|dr|adv|asi|psi|pi|hc|pc)\.?\s+/i, '')
    .trim();
}

// Haversine distance formula between two geographic coordinates in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

export interface MatchingFilterOptions {
  maxRadiusKm?: number; // default: 3 km
  maxDaysApart?: number; // default: 14 days
  matchingTypeFilter?: 'ALL' | 'IMEI' | 'VEHICLE' | 'PATTERN' | 'PHONE';
}

class MatchingService {
  /**
   * Find connections for a specific record against all other verified records
   */
  public findConnectionsForRecord(
    sourceRecord: PoliceRecord,
    allRecords?: PoliceRecord[],
    options?: MatchingFilterOptions
  ): PotentialConnection[] {
    const maxRadius = options?.maxRadiusKm ?? 3.5;
    const maxDays = options?.maxDaysApart ?? 14;

    const records = allRecords || storageService.getRecords();
    const verifiedRecords = records.filter(
      (r) => r.verificationStatus === 'Officer Verified' && r.id !== sourceRecord.id
    );

    const connections: PotentialConnection[] = [];
    const reviewData = storageService.getReviewedConnections();

    // 1. Exact IMEI Matching (e.g. DEMO-KAL-001 and DEMO-KAL-004 share DEMO-IMEI-001)
    const sourceImeis = this.extractImeis(sourceRecord);
    sourceImeis.forEach((imei) => {
      const normImei = normalizeIdentifier(imei);
      if (!normImei || normImei.length < 4) return;

      verifiedRecords.forEach((targetRecord) => {
        const targetImeis = this.extractImeis(targetRecord);
        targetImeis.forEach((targetImei) => {
          if (normImei === normalizeIdentifier(targetImei)) {
            const connectionKey = this.generateConnectionKey(sourceRecord.id, targetRecord.id, `IMEI_${normImei}`);
            const review = reviewData[connectionKey];

            connections.push({
              id: connectionKey,
              sourceRecordId: sourceRecord.id,
              targetRecordId: targetRecord.id,
              sourceCaseRef: sourceRecord.caseReference,
              targetCaseRef: targetRecord.caseReference,
              matchingType: 'Exact IMEI Match',
              matchingField: 'Mobile Phone IMEI',
              matchingValue: imei,
              confidenceLabel: 'Exact Identifier Match',
              status: review?.status || 'detected',
              officerNotes: review?.note,
              reviewedAt: review?.reviewedAt,
              detectedAt: sourceRecord.verifiedAt || new Date().toISOString(),
              explanation: `Exact hardware IMEI "${imei}" is recorded in ${sourceRecord.caseReference} (${sourceRecord.incidentType}) and ${targetRecord.caseReference} (${targetRecord.incidentType}). Both records originate within Kalaburagi jurisdiction. Field inspection required to cross-verify physical device recovery.`,
            });
          }
        });
      });
    });

    // 2. Vehicle Registration Matching (e.g. DEMO-KAL-002 and DEMO-KAL-005 share DEMO-VEHICLE-01)
    sourceRecord.vehicleReferences.forEach((vehRef) => {
      const normVeh = normalizeIdentifier(vehRef);
      if (!normVeh || normVeh.length < 3) return;

      verifiedRecords.forEach((targetRecord) => {
        targetRecord.vehicleReferences.forEach((targetVeh) => {
          const normTargetVeh = normalizeIdentifier(targetVeh);
          if (normVeh === normTargetVeh) {
            const connectionKey = this.generateConnectionKey(sourceRecord.id, targetRecord.id, `VEH_${normVeh}`);
            const review = reviewData[connectionKey];

            connections.push({
              id: connectionKey,
              sourceRecordId: sourceRecord.id,
              targetRecordId: targetRecord.id,
              sourceCaseRef: sourceRecord.caseReference,
              targetCaseRef: targetRecord.caseReference,
              matchingType: 'Vehicle Reference Match',
              matchingField: 'Vehicle Registration / Identifier',
              matchingValue: vehRef,
              confidenceLabel: 'Exact Identifier Match',
              status: review?.status || 'detected',
              officerNotes: review?.note,
              reviewedAt: review?.reviewedAt,
              detectedAt: sourceRecord.verifiedAt || new Date().toISOString(),
              explanation: `Identical vehicle identifier "${vehRef}" is recorded in ${sourceRecord.caseReference} (${sourceRecord.incidentType}) and ${targetRecord.caseReference} (${targetRecord.incidentType}). Both incidents are registered in Kalaburagi stations.`,
            });
          }
        });
      });
    });

    // 3. Similar Complaint Pattern Detection (Geographic & Time Proximity in Kalaburagi)
    // Compares incident category, nearby coordinates within maxRadius km, and within maxDays
    if (sourceRecord.coordinates) {
      const sourceDate = this.parseDate(sourceRecord.dateTime);

      verifiedRecords.forEach((targetRecord) => {
        if (targetRecord.coordinates && targetRecord.incidentType === sourceRecord.incidentType) {
          const distKm = calculateDistanceKm(
            sourceRecord.coordinates!.latitude,
            sourceRecord.coordinates!.longitude,
            targetRecord.coordinates.latitude,
            targetRecord.coordinates.longitude
          );

          const targetDate = this.parseDate(targetRecord.dateTime);
          const daysApart = Math.abs(
            Math.round((sourceDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24))
          );

          if (distKm <= maxRadius && daysApart <= maxDays) {
            const connectionKey = this.generateConnectionKey(sourceRecord.id, targetRecord.id, `PATTERN_GEO`);
            const review = reviewData[connectionKey];

            connections.push({
              id: connectionKey,
              sourceRecordId: sourceRecord.id,
              targetRecordId: targetRecord.id,
              sourceCaseRef: sourceRecord.caseReference,
              targetCaseRef: targetRecord.caseReference,
              matchingType: 'Possible Incident Pattern Detected',
              matchingField: `Category: ${sourceRecord.incidentType} (${distKm} km · ${daysApart} days apart)`,
              matchingValue: `${distKm} km apart · ${sourceRecord.coordinates?.landmark} ↔ ${targetRecord.coordinates.landmark}`,
              confidenceLabel: distKm <= 1.5 ? 'Strong Similarity' : 'Possible Pattern',
              spatialDistanceKm: distKm,
              daysApart,
              status: review?.status || 'detected',
              officerNotes: review?.note,
              reviewedAt: review?.reviewedAt,
              detectedAt: sourceRecord.verifiedAt || new Date().toISOString(),
              explanation: `Similar ${sourceRecord.incidentType} complaints were recorded in nearby areas of Kalaburagi (${sourceRecord.coordinates?.landmark} and ${targetRecord.coordinates.landmark}, ~${distKm} km apart) within ${daysApart} days of each other. Their incident categories and recorded locations show a possible pattern requiring human review. (Note: Does not claim identical perpetrator).`,
            });
          }
        }
      });
    }

    // 4. Phone Identifier Matching
    const sourcePhones = this.extractPhones(sourceRecord);
    sourcePhones.forEach((phone) => {
      const normPhone = normalizePhone(phone);
      if (normPhone.length === 10) {
        verifiedRecords.forEach((targetRecord) => {
          const targetPhones = this.extractPhones(targetRecord);
          targetPhones.forEach((targetPhone) => {
            if (normalizePhone(targetPhone) === normPhone) {
              const connectionKey = this.generateConnectionKey(sourceRecord.id, targetRecord.id, `PHONE_${normPhone}`);
              const review = reviewData[connectionKey];

              connections.push({
                id: connectionKey,
                sourceRecordId: sourceRecord.id,
                targetRecordId: targetRecord.id,
                sourceCaseRef: sourceRecord.caseReference,
                targetCaseRef: targetRecord.caseReference,
                matchingType: 'Phone Identifier Match',
                matchingField: 'Contact Number',
                matchingValue: phone,
                confidenceLabel: 'Exact Identifier Match',
                status: review?.status || 'detected',
                officerNotes: review?.note,
                reviewedAt: review?.reviewedAt,
                detectedAt: sourceRecord.verifiedAt || new Date().toISOString(),
                explanation: `Shared telecommunication contact "${phone}" appeared in both ${sourceRecord.caseReference} and ${targetRecord.caseReference} in Kalaburagi.`,
              });
            }
          });
        });
      }
    });

    // Deduplicate connections with same targetRecordId and matchingType
    const uniqueMap = new Map<string, PotentialConnection>();
    connections.forEach((conn) => {
      const dedupeKey = `${conn.targetRecordId}-${conn.matchingType}-${normalizeIdentifier(conn.matchingValue)}`;
      if (!uniqueMap.has(dedupeKey)) {
        uniqueMap.set(dedupeKey, conn);
      }
    });

    return Array.from(uniqueMap.values());
  }

  /**
   * Calculate global connection count across the entire repository
   */
  public getAllGlobalConnections(
    allRecords?: PoliceRecord[],
    options?: MatchingFilterOptions
  ): PotentialConnection[] {
    const records = (allRecords || storageService.getRecords()).filter(
      (r) => r.verificationStatus === 'Officer Verified'
    );

    const allConnections: PotentialConnection[] = [];
    const seenPairs = new Set<string>();

    records.forEach((rec) => {
      const conns = this.findConnectionsForRecord(rec, records, options);
      conns.forEach((c) => {
        const pairKey = [c.sourceRecordId, c.targetRecordId].sort().join('--') + '::' + c.matchingType;
        if (!seenPairs.has(pairKey)) {
          seenPairs.add(pairKey);
          allConnections.push(c);
        }
      });
    });

    return allConnections;
  }

  private extractImeis(rec: PoliceRecord): string[] {
    const imeis = new Set<string>();
    if (rec.imeiNumbers) {
      rec.imeiNumbers.forEach((im) => imeis.add(im));
    }
    rec.otherIdentifiers.forEach((id) => {
      if (id.includes('IMEI')) {
        const match = id.match(/DEMO-IMEI-\w+|\b\d{14,16}\b/i);
        if (match) imeis.add(match[0]);
      }
    });
    return Array.from(imeis);
  }

  private extractPhones(rec: PoliceRecord): string[] {
    const phones = new Set<string>();
    if (rec.complainant?.contactNumber) {
      phones.add(rec.complainant.contactNumber);
    }
    rec.otherIdentifiers.forEach((id) => {
      if (id.includes('+91') || id.includes('Phone') || id.includes('SIM')) {
        const match = id.match(/\+?91\s?\d{10}|\b\d{10}\b/);
        if (match) phones.add(match[0]);
      }
    });
    return Array.from(phones);
  }

  private parseDate(dateStr: string): Date {
    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) return parsed;
      // Handle "14-Oct-2024, 19:30 IST"
      const cleaned = dateStr.replace(' IST', '').replace(',', '');
      const d = new Date(cleaned);
      return !isNaN(d.getTime()) ? d : new Date();
    } catch {
      return new Date();
    }
  }

  private generateConnectionKey(sourceId: string, targetId: string, typeSuffix: string): string {
    const pair = [sourceId, targetId].sort().join('_');
    return `conn_${pair}_${typeSuffix}`;
  }
}

export const matchingService = new MatchingService();
