import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useVoice } from '../../context/VoiceContext';
import { FormFieldWithVoice } from '../../components/forms/FormFieldWithVoice';
import { CitizenSignOffModal } from '../../components/forms/CitizenSignOffModal';
import { CertificateViewer } from '../../components/certificates/CertificateViewer';

export const HillAreaCertificatePage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { language } = useAccessibility();
  const { registerSlotListener, speakText } = useVoice();

  const [formData, setFormData] = useState({
    applicant_name: '',
    father_husband_name: '',
    district: 'Chamoli',
    tehsil: 'Joshimath',
    hill_block: 'Ghat',
    village_name: '',
  });

  const [voiceFilledFields, setVoiceFilledFields] = useState<Record<string, boolean>>({});
  const [isSignOffOpen, setIsSignOffOpen] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = registerSlotListener((slots) => {
      setFormData((prev) => ({ ...prev, ...slots }));
      const flags: Record<string, boolean> = {};
      Object.keys(slots).forEach((k) => (flags[k] = true));
      setVoiceFilledFields((prev) => ({ ...prev, ...flags }));
    });

    speakText(
      language === 'hi'
        ? 'पर्वतीय क्षेत्र प्रमाण पत्र फॉर्म में आपका स्वागत है। बोलकर अपना नाम एवं पर्वतीय तहसील बताएं।'
        : 'Welcome to Hill Area Certificate application form.'
    );

    return () => unsub();
  }, []);

  const handleFieldChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleFinalSubmit = () => {
    const randomId = `UK-HIL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedId(randomId);
    speakText(
      language === 'hi'
        ? `आपका पर्वतीय क्षेत्र प्रमाण पत्र आवेदन सफलता पूर्वक जमा हुआ। आवेदन संख्या: ${randomId}।`
        : `Your Hill Area application has been submitted with ID ${randomId}.`
    );
  };

  if (submittedId) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 animate-fade-in">
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center space-y-3">
          <CheckCircle className="size-12 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-bold text-emerald-950">
            {language === 'hi' ? 'पर्वतीय क्षेत्र प्रमाण पत्र आवेदन जमा हुआ!' : 'Hill Area Application Submitted!'}
          </h2>
          <p className="text-sm font-mono font-bold text-emerald-900 bg-white inline-block px-4 py-1.5 rounded-lg border border-emerald-200">
            {submittedId}
          </p>
        </div>

        <CertificateViewer
          certificateType="HILL_AREA"
          applicantName={formData.applicant_name || 'कुलदीप सिंह नेगी'}
          fatherName={formData.father_husband_name || 'श्री खुशाल सिंह'}
          district={formData.district}
          certificateNo={submittedId}
        />

        <div className="text-center pt-4">
          <button
            onClick={() => onNavigate('/')}
            className="px-6 py-2.5 bg-navbar text-white rounded-xl text-sm font-bold hover:bg-navbar-dark"
          >
            {language === 'hi' ? 'मुख्य पृष्ठ पर जाएं' : 'Return Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate('/all-services')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-navbar"
        >
          <ArrowLeft className="size-4" />
          <span>{language === 'hi' ? 'सेवाओं की सूची' : 'Back to Services'}</span>
        </button>
        <span className="text-xs bg-blue-50 text-navbar font-semibold px-3 py-1 rounded-full border border-blue-200">
          राजस्व विभाग &bull; पर्वतीय प्रमाण पत्र &bull; Fee: ₹40
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-ink-900">
          {language === 'hi' ? 'पर्वतीय क्षेत्र प्रमाण पत्र (Hill Area Certificate)' : 'Hill Area Certificate Application'}
        </h1>
        <p className="text-xs text-gray-600 mt-1">उत्तराखंड के अधिसूचित पर्वतीय विकास खण्डों के निवासियों हेतु प्रमाण पत्र</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setIsSignOffOpen(true);
        }}
        className="space-y-6"
      >
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase text-navbar border-b pb-2">आवेदक एवं पर्वतीय निवास विवरण</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormFieldWithVoice
              id="applicant_name"
              label="Applicant Name"
              labelHindi="आवेदक का पूरा नाम"
              value={formData.applicant_name}
              onChange={(v) => handleFieldChange('applicant_name', v)}
              required
              voiceFilled={voiceFilledFields.applicant_name}
            />
            <FormFieldWithVoice
              id="father_husband_name"
              label="Father / Husband Name"
              labelHindi="पिता / पति का नाम"
              value={formData.father_husband_name}
              onChange={(v) => handleFieldChange('father_husband_name', v)}
              required
              voiceFilled={voiceFilledFields.father_husband_name}
            />
            <FormFieldWithVoice
              id="district"
              label="Hill District"
              labelHindi="पर्वतीय जनपद"
              type="select"
              value={formData.district}
              onChange={(v) => handleFieldChange('district', v)}
              options={[
                { value: 'Chamoli', label: 'Chamoli (चमोली)' },
                { value: 'Rudraprayag', label: 'Rudraprayag (रुद्रप्रयाग)' },
                { value: 'Tehri Garhwal', label: 'Tehri Garhwal (टिहरी)' },
                { value: 'Pithoragarh', label: 'Pithoragarh (पिथौरागढ़)' },
                { value: 'Bageshwar', label: 'Bageshwar (बागेश्वर)' },
                { value: 'Almora', label: 'Almora (अल्मोड़ा)' },
              ]}
              required
              voiceFilled={voiceFilledFields.district}
            />
            <FormFieldWithVoice
              id="tehsil"
              label="Tehsil"
              labelHindi="पर्वतीय तहसील"
              value={formData.tehsil}
              onChange={(v) => handleFieldChange('tehsil', v)}
              required
            />
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => onNavigate('/all-services')}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100"
          >
            रद्द करें (Cancel)
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-navbar hover:bg-navbar-dark text-white text-sm font-bold shadow-md"
          >
            <Send className="size-4" />
            <span>विवरण सत्यापित करें (Sign-off)</span>
          </button>
        </div>
      </form>

      <CitizenSignOffModal
        isOpen={isSignOffOpen}
        onClose={() => setIsSignOffOpen(false)}
        serviceTitle="पर्वतीय क्षेत्र प्रमाण पत्र (Hill Area Certificate)"
        formData={formData}
        onConfirm={handleFinalSubmit}
      />
    </div>
  );
};

