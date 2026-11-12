import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health and capability check
app.get('/api/health', (req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    app: 'JANARAKSHA AI',
    region: 'Kalyan Karnataka',
    hasGeminiKey,
    timestamp: new Date().toISOString()
  });
});

// Secure server-side Gemini document extraction endpoint
app.post('/api/gemini/extract', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(400).json({
        success: false,
        code: 'MISSING_API_KEY',
        message: 'GEMINI_API_KEY is not configured on the server. Please use the clearly labelled manual fallback or configure the key in Settings > Secrets.'
      });
    }

    const { imageBase64, mimeType, documentText, fileName } = req.body;

    if (!imageBase64 && !documentText) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_INPUT',
        message: 'No document data provided. Please provide an image/PDF base64 or digital document text.'
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const parts: any[] = [];

    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64,
        },
      });
    }

    const promptText = `Analyze this police/administrative document for the Kalyan Karnataka region (e.g. Kalaburagi, Bidar, Yadgir, Raichur, Koppal, Ballari, Vijayanagara).
File context: ${fileName || 'Uploaded Document'}
${documentText ? `Digital document text:\n${documentText}\n` : ''}

Extract only what is explicitly recorded in the document.
Rules:
1. Do not invent missing information. If a field is not found, use "Not found in document".
2. If vehicle references (registration numbers, vehicle codes like DEMO-VEHICLE-01, KA-32-EA-4912, etc.) are present, capture all of them accurately.
3. If people are mentioned (complainants, witnesses, informants, officers, named individuals), list them along with their explicitly recorded role (e.g. Complainant, Reporting Officer, Witness, Mentioned Party). Do NOT classify anyone as guilty or criminal.
4. Extract exact dates, locations (police station, taluk/district in Kalyan Karnataka), and specific identifiers (IMEI, phone numbers, ID references).
5. Produce a factual, objective incident summary.`;

    parts.push({ text: promptText });

    const systemInstruction = `You are JANARAKSHA AI's Document Intelligence Extraction Engine for police records in Kalyan Karnataka.
You extract structured, verifiable information from scanned records, FIRs, Mahazars, seizure memos, and case notes.
Never hallucinate identifiers or connections. Never make guilt determinations or legal conclusions.
If an item is missing or unreadable, mark it as "Not found in document".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            caseReference: {
              type: Type.STRING,
              description: 'Case reference or FIR / General Diary / Memo reference number or "Not found in document"'
            },
            incidentType: {
              type: Type.STRING,
              description: 'Categorized incident type (e.g. Vehicle Theft, Mobile Phone Theft, Incident Report, Seizure Memo, General Complaint) or "Not found in document"'
            },
            dateTime: {
              type: Type.STRING,
              description: 'Recorded date and time of incident/record or "Not found in document"'
            },
            recordedLocation: {
              type: Type.STRING,
              description: 'Specific recorded location, landmark, street or area or "Not found in document"'
            },
            district: {
              type: Type.STRING,
              description: 'Kalyan Karnataka District (Kalaburagi, Bidar, Yadgir, Raichur, Koppal, Ballari, Vijayanagara) or "Not found in document"'
            },
            policeStation: {
              type: Type.STRING,
              description: 'Police Station jurisdiction or "Not found in document"'
            },
            incidentSummary: {
              type: Type.STRING,
              description: 'Objective factual summary of the document contents'
            },
            peopleMentioned: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING, description: 'Explicit role (Complainant, Witness, Reporting Officer, Mentioned Party, etc.)' },
                  details: { type: Type.STRING, description: 'Address, phone, or relation if mentioned' }
                },
                required: ['name', 'role']
              }
            },
            vehicleReferences: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of all vehicle registration numbers, vehicle identifiers, or reference tags found'
            },
            otherIdentifiers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of other identifiers (IMEI, phone numbers, property serials, seizure tags)'
            },
            originalDocumentReference: {
              type: Type.STRING,
              description: 'Document title, page number, stamp reference, or filing mark'
            },
            confidenceNotes: {
              type: Type.STRING,
              description: 'Legibility notes, stamp clarity, handwritten or typed format observations'
            }
          },
          required: [
            'caseReference',
            'incidentType',
            'dateTime',
            'recordedLocation',
            'district',
            'incidentSummary',
            'vehicleReferences',
            'peopleMentioned',
            'otherIdentifiers'
          ]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Gemini model returned empty response');
    }

    const parsed = JSON.parse(responseText);

    return res.json({
      success: true,
      extracted: parsed,
      metadata: {
        model: 'gemini-3.8-flash',
        extractedAt: new Date().toISOString(),
      }
    });

  } catch (err: any) {
    console.error('Document extraction error:', err);
    return res.status(500).json({
      success: false,
      code: 'EXTRACTION_FAILED',
      message: err.message || 'An error occurred while processing the document through Gemini.',
      details: process.env.NODE_ENV !== 'production' ? String(err) : undefined
    });
  }
});

// Secure server-side Gemini complaint statement assistance endpoint
app.post('/api/gemini/assist-statement', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(400).json({
        success: false,
        code: 'MISSING_API_KEY',
        message: 'GEMINI_API_KEY is not configured on the server. Please draft manually.'
      });
    }

    const { statement, incidentCategory, location } = req.body;
    if (!statement || typeof statement !== 'string' || statement.trim().length === 0) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_INPUT',
        message: 'Original statement text is required.'
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are a legal transcription and police administrative drafting assistant for Karnataka State Police in Kalaburagi.
Your role is to assist the officer in organizing the complainant's statement.
CRITICAL RULES:
1. NEVER alter the facts, dates, named individuals, or allegations in the original statement.
2. Improve grammatical clarity, fix typos, and organize chronologically into readable paragraphs.
3. Explicitly list any critical missing police information (e.g., missing landmark, phone serial, exact time, witness contacts).
4. Return pure JSON with organizedDraft, identifiedMissingInfo (array of strings), and correctionsMade (array of strings).`;

    const prompt = `Category: ${incidentCategory || 'General Incident'}
Location: ${location || 'Kalaburagi'}
Original Complainant Statement:
"""${statement}"""

Improve clarity and organize without changing any factual meaning.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            organizedDraft: {
              type: Type.STRING,
              description: 'Chronologically structured and grammatically polished statement preserving all original facts'
            },
            identifiedMissingInfo: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Items of information not found in the statement that would help police documentation'
            },
            correctionsMade: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Summary of structural or typographic improvements made'
            }
          },
          required: ['organizedDraft', 'identifiedMissingInfo', 'correctionsMade']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      draft: parsed.organizedDraft || statement,
      missingInfo: parsed.identifiedMissingInfo || [],
      corrections: parsed.correctionsMade || [],
      metadata: {
        model: 'gemini-3.8-flash',
        processedAt: new Date().toISOString()
      }
    });
  } catch (err: any) {
    console.error('Statement assist error:', err);
    return res.status(500).json({
      success: false,
      code: 'ASSIST_FAILED',
      message: err.message || 'Failed to process statement through Gemini.'
    });
  }
});

// Configure Vite or Static File Serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JANARAKSHA AI server running on port ${PORT} [mode: ${isProduction ? 'production' : 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
