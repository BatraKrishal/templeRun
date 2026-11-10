import React, { useEffect, useState } from 'react';
import { ShieldCheck, Volume2, CheckCircle2, X, AlertTriangle } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useVoice } from '../../context/VoiceContext';

interface SignOffProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTitle: string;
  formData: Record<string, any>;
  onConfirm: () => void;
}

export const CitizenSignOffModal: React.FC<SignOffProps> = ({
  isOpen,
  onClose,
  serviceTitle,
  formData,
  onConfirm,
}) => {
  const { language } = useAccessibility();
  const { speakText, isSpeaking, stopSpeaking } = useVoice();
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const wasOpenRef = React.useRef(false);

  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      // Auto spoken summary read-back
      const summaryTextHindi = `कृपया अपने विवरण की पुष्टि करें। सेवा: ${serviceTitle}। आवेदक का नाम: ${
        formData.applicant_name || 'लागू नहीं'
      }। पिता या पति का नाम: ${formData.father_husband_name || 'लागू नहीं'}। वार्षिक आय: ₹${
        formData.annual_income || 'लागू नहीं'
      }। ज़िला: ${formData.district || 'लागू नहीं'}। क्या आप आधिकारिक आवेदन पत्र जमा करने की अनुमति देते हैं? बोलें "हाँ" या "स्वीकृत है"।`;

      const summaryTextEn = `Please confirm your application details. Service: ${serviceTitle}. Applicant: ${
        formData.applicant_name || 'N/A'
      }. Father/Spouse: ${formData.father_husband_name || 'N/A'}. Annual Income: ₹${
        formData.annual_income || 'N/A'
      }. District: ${formData.district || 'N/A'}. Do you authorize official submission? Say "Yes" or "Confirm".`;

      speakText(language === 'hi' ? summaryTextHindi : summaryTextEn);

      const handleVoiceConfirm = () => {
        setHasConfirmed(true);
        setTimeout(() => {
          onConfirm();
          onClose();
        }, 300);
      };

      const handleVoiceCancel = () => {
        onClose();
      };

      window.addEventListener('voice-signoff-confirm', handleVoiceConfirm);
      window.addEventListener('voice-signoff-cancel', handleVoiceCancel);

      return () => {
        window.removeEventListener('voice-signoff-confirm', handleVoiceConfirm);
        window.removeEventListener('voice-signoff-cancel', handleVoiceCancel);
      };
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      stopSpeaking();
    }
  }, [isOpen, serviceTitle, language]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-navbar text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-6 text-amber-400" />
            <div>
              <h3 className="font-bold text-base leading-tight">
                {language === 'hi' ? 'नागरिक सत्यापन एवं सहमति (Sign-off)' : 'Citizen Verification & Sign-off'}
              </h3>
              <p className="text-xs text-white/80">{serviceTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/80">
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <Volume2 className={`size-5 shrink-0 ${isSpeaking ? 'animate-pulse text-amber-600' : ''}`} />
            <div>
              <strong className="font-bold">
                {language === 'hi' ? 'आवाज द्वारा विवरण पढ़कर सुनाया जा रहा है' : 'Audio Summary Read-back in Progress'}
              </strong>
              <p className="text-[11px] text-amber-800">
                {language === 'hi'
                  ? 'उत्तराखंड ई-डिस्ट्रिक्ट नियमों के अनुसार, नागरिक की स्पष्ट सहमति के बिना कोई भी फॉर्म जमा नहीं होता।'
                  : 'Under statutory e-District rules, explicit citizen sign-off is mandatory before submission.'}
              </p>
            </div>
          </div>

          {/* Data Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 text-xs">
            {Object.entries(formData).map(([key, val]) => {
              if (!val) return null;
              const formattedKey = key
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase());

              return (
                <div key={key} className="flex justify-between py-2 px-3 hover:bg-gray-50">
                  <span className="font-semibold text-gray-600">{formattedKey}:</span>
                  <span className="font-bold text-ink-900 text-right">{String(val)}</span>
                </div>
              );
            })}
          </div>

          {/* Consent Checkbox */}
          <label className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer">
            <input
              type="checkbox"
              checked={hasConfirmed}
              onChange={(e) => setHasConfirmed(e.target.checked)}
              className="mt-0.5 size-4 rounded border-gray-300 text-navbar focus:ring-navbar"
            />
            <span className="text-xs text-ink-700 leading-snug">
              {language === 'hi'
                ? 'मैं प्रमाणित करता हूँ कि उपरोक्त सभी विवरण पूर्णतः सत्य हैं। मैं उत्तराखंड सेवा का अधिकार (RTS) के अंतर्गत आवेदन जमा करने की आधिकारिक स्वीकृति देता हूँ।'
                : 'I declare that the information provided is true and correct. I authorize official submission under the Uttarakhand Right to Service Act.'}
            </span>
          </label>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded-lg"
          >
            {language === 'hi' ? 'वापस जाएं (Edit)' : 'Go Back'}
          </button>
          <button
            type="button"
            disabled={!hasConfirmed}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-navbar hover:bg-navbar-dark rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <CheckCircle2 className="size-4" />
            <span>{language === 'hi' ? 'स्वीकृत एवं जमा करें' : 'Confirm & Submit'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

