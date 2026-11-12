import React, { useRef, useState, useEffect } from 'react';
import { DigitalSignature, AppLanguage } from '../types';
import { translations } from '../i18n/translations';
import { Pen, Trash2, CheckCircle2, Type, Check } from 'lucide-react';

interface SignaturePadProps {
  title: string;
  type: 'complainant' | 'officer';
  defaultSignerName?: string;
  defaultDesignation?: string;
  initialSignature?: DigitalSignature;
  onSaveSignature: (sig: DigitalSignature) => void;
  allowTypedAlternative?: boolean;
  lang?: AppLanguage;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  title,
  type,
  defaultSignerName = '',
  defaultDesignation = '',
  initialSignature,
  onSaveSignature,
  allowTypedAlternative = true,
  lang = 'en',
}) => {
  const t = translations[lang];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(Boolean(initialSignature?.signatureDataUrl));
  const [signerName, setSignerName] = useState(initialSignature?.signerName || defaultSignerName);
  const [designation, setDesignation] = useState(initialSignature?.signerDesignation || defaultDesignation);
  const [useTyped, setUseTyped] = useState(initialSignature?.isTypedAcknowledgement || false);
  const [typedName, setTypedName] = useState(initialSignature?.signerName || defaultSignerName);
  const [savedSig, setSavedSig] = useState<DigitalSignature | null>(initialSignature || null);

  // Sync with defaultSignerName when parent passes new name (e.g. Complainant Name typed in Section 2)
  useEffect(() => {
    if (defaultSignerName && defaultSignerName.trim()) {
      if (!signerName || signerName === 'Complainant' || signerName === 'Sri Ramesh Patil') {
        setSignerName(defaultSignerName.trim());
      }
      if (!typedName || typedName === 'Complainant' || typedName === 'Sri Ramesh Patil') {
        setTypedName(defaultSignerName.trim());
      }
    }
  }, [defaultSignerName]);

  // Initialize canvas context and restore initial signature if provided
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a'; // Deep Navy ink

    if (initialSignature?.signatureDataUrl && !initialSignature.isTypedAcknowledgement) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHasDrawn(true);
      };
      img.src = initialSignature.signatureDataUrl;
    }
  }, [initialSignature]);

  // Coordinate helper for both mouse and touch events
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Helper to commit and emit signature
  const commitSignature = (dataUrl?: string, isTyped = useTyped) => {
    const effectiveName = isTyped
      ? (typedName.trim() || defaultSignerName.trim() || (type === 'complainant' ? 'Complainant' : 'Officer Demo'))
      : (signerName.trim() || defaultSignerName.trim() || (type === 'complainant' ? 'Complainant' : 'Officer Demo'));

    const sig: DigitalSignature = {
      type,
      signatureDataUrl: isTyped ? undefined : dataUrl,
      signerName: effectiveName,
      signerDesignation: type === 'officer' ? (designation.trim() || 'Station Duty Officer') : undefined,
      isTypedAcknowledgement: isTyped,
      timestamp: new Date().toISOString(),
      confirmed: true,
    };

    setSavedSig(sig);
    onSaveSignature(sig);
  };

  // When drawing finishes, automatically capture data URL and emit signature so it is ALWAYS saved
  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas && hasDrawn) {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        commitSignature(dataUrl, false);
      } catch (err) {
        console.error('Failed to capture signature image', err);
      }
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setSavedSig(null);
  };

  const handleManualSave = () => {
    const canvas = canvasRef.current;
    let dataUrl: string | undefined = undefined;
    if (!useTyped && canvas) {
      dataUrl = canvas.toDataURL('image/png');
    }
    commitSignature(dataUrl, useTyped);
  };

  const handleTypedNameChange = (val: string) => {
    setTypedName(val);
    setSignerName(val);
    if (val.trim()) {
      commitSignature(undefined, true);
    }
  };

  const effectiveTitle = title || (type === 'complainant' ? t.sig.complainantTitle : t.sig.officerTitle);
  const effectiveSubtitle = type === 'complainant' ? t.sig.complainantSubtitle : t.sig.officerSubtitle;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
      {/* Title & Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-slate-900 block">{effectiveTitle}</span>
          <span className="text-[10px] text-slate-500">
            {effectiveSubtitle}
          </span>
        </div>

        {allowTypedAlternative && (
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setUseTyped(false);
                if (hasDrawn && canvasRef.current) {
                  commitSignature(canvasRef.current.toDataURL('image/png'), false);
                }
              }}
              className={`px-2 py-0.5 rounded font-medium text-[11px] flex items-center gap-1 transition-colors ${
                !useTyped ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Pen className="w-3 h-3" />
              <span>{t.sig.drawMode}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setUseTyped(true);
                commitSignature(undefined, true);
              }}
              className={`px-2 py-0.5 rounded font-medium text-[11px] flex items-center gap-1 transition-colors ${
                useTyped ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Type className="w-3 h-3" />
              <span>{t.sig.typedMode}</span>
            </button>
          </div>
        )}
      </div>

      {/* Signer Particulars Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            {type === 'complainant' ? t.sig.signerNameComplainant : t.sig.signerNameOfficer} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={useTyped ? typedName : signerName}
            onChange={(e) => {
              if (useTyped) {
                handleTypedNameChange(e.target.value);
              } else {
                setSignerName(e.target.value);
                setTypedName(e.target.value);
                if (hasDrawn && canvasRef.current) {
                  commitSignature(canvasRef.current.toDataURL('image/png'), false);
                }
              }
            }}
            placeholder={type === 'complainant' ? (lang === 'kn' ? 'ಉದಾ: ಶ್ರೀ ರಮೇಶ್ ಪಾಟೀಲ್' : 'e.g. Sri Ramesh Patil') : (lang === 'kn' ? 'ಉದಾ: ಅಧಿಕಾರಿ ಡೆಮೊ' : 'e.g. Officer Demo')}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        {type === 'officer' && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              {t.sig.designationLabel}
            </label>
            <input
              type="text"
              value={designation}
              onChange={(e) => {
                setDesignation(e.target.value);
                if (savedSig) {
                  commitSignature(savedSig.signatureDataUrl, useTyped);
                }
              }}
              placeholder={lang === 'kn' ? 'ಉದಾ: ಪಿಎಸ್‌ಐ / ಠಾಣಾ ಕರ್ತವ್ಯ ಅಧಿಕಾರಿ' : 'e.g. Police Sub-Inspector (PSI) / Station Duty Officer'}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Drawing Canvas Area OR Typed Acknowledgement Box */}
      {!useTyped ? (
        <div className="space-y-2">
          <div className="relative border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/70 rounded-lg overflow-hidden touch-none">
            <canvas
              ref={canvasRef}
              width={500}
              height={140}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-[140px] cursor-crosshair block"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
                <span>{t.sig.canvasPlaceholder}</span>
              </div>
            )}
            <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-400 pointer-events-none">
              {t.sig.touchEnabled}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1 text-slate-500 hover:text-red-700 hover:bg-slate-100 rounded text-[11px] flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>{t.sig.clearBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleManualSave}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-teal-400" />
              <span>{t.sig.saveSigBtn}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
          <p className="text-slate-600 text-[11px] leading-relaxed">
            {t.sig.typedAcknowledgementText.replace('{name}', typedName || defaultSignerName || (lang === 'kn' ? '[ಹೆಸರು]' : '[Name]'))}
          </p>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleManualSave}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-teal-400" />
              <span>{t.sig.confirmTypedBtn}</span>
            </button>
          </div>
        </div>
      )}

      {/* Saved State Notification Badge */}
      {savedSig && (
        <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-900 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
            <div>
              <span className="font-bold">
                {type === 'complainant' ? t.sig.sigCapturedComplainant : t.sig.sigCapturedOfficer}
              </span>
              <span className="text-[11px] text-teal-800 ml-1.5">
                ({savedSig.signerName || defaultSignerName} · {new Date(savedSig.timestamp).toLocaleTimeString(lang === 'kn' ? 'kn-IN' : 'en-GB')})
              </span>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200">
            {savedSig.isTypedAcknowledgement ? t.sig.typedType : t.sig.drawnType} · {t.sig.sigSavedBadge}
          </span>
        </div>
      )}
    </div>
  );
};
