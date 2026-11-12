/**
 * JANARAKSHA AI — Document Processing & Extraction Service
 * Connects to server-side Gemini 3.8 Multimodal endpoint, with honest fallback support.
 */

export interface ExtractedDocumentData {
  caseReference: string;
  incidentType: string;
  dateTime: string;
  recordedLocation: string;
  district: string;
  policeStation: string;
  incidentSummary: string;
  peopleMentioned: Array<{ name: string; role: string; details?: string }>;
  vehicleReferences: string[];
  otherIdentifiers: string[];
  originalDocumentReference: string;
  confidenceNotes: string;
}

export interface ExtractionResult {
  success: boolean;
  data?: ExtractedDocumentData;
  source: 'gemini' | 'manual_fallback';
  error?: string;
  code?: string;
}

class DocumentService {
  /**
   * Extract information from document via server-side Gemini API
   */
  public async extractWithGemini(params: {
    imageBase64?: string;
    mimeType?: string;
    documentText?: string;
    fileName?: string;
  }): Promise<ExtractionResult> {
    try {
      const response = await fetch('/api/gemini/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        return {
          success: false,
          source: 'manual_fallback',
          error: json.message || 'Server extraction request failed',
          code: json.code || 'UNKNOWN_ERROR',
        };
      }

      return {
        success: true,
        source: 'gemini',
        data: json.extracted,
      };
    } catch (err: any) {
      return {
        success: false,
        source: 'manual_fallback',
        error: err.message || 'Network error communicating with server-side extraction engine',
        code: 'NETWORK_ERROR',
      };
    }
  }

  /**
   * Helper to convert File to Base64 string
   */
  public fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data:image/...;base64,
        const base64 = result.split(',')[1] || result;
        resolve({ base64, mimeType: file.type || 'image/jpeg' });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Check if server has Gemini API Key configured
   */
  public async checkServerHealth(): Promise<{ hasGeminiKey: boolean; app: string }> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) return { hasGeminiKey: false, app: 'JANARAKSHA AI' };
      const data = await res.json();
      return { hasGeminiKey: Boolean(data.hasGeminiKey), app: data.app };
    } catch {
      return { hasGeminiKey: false, app: 'JANARAKSHA AI' };
    }
  }
}

export const documentService = new DocumentService();
