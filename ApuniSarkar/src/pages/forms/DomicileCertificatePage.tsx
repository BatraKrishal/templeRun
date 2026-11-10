import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, CheckCircle, Landmark, Sparkles, FileText } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useVoice } from '../../context/VoiceContext';
import { FormFieldWithVoice } from '../../components/forms/FormFieldWithVoice';
import { CitizenSignOffModal } from '../../components/forms/CitizenSignOffModal';
import { CertificateViewer } from '../../components/certificates/CertificateViewer';

export const DomicileCertificatePage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { language } = useAccessibility();
  const { registerSlotListener, speakText, isConfirmationPending, submissionId, updateFormSlot } = useVoice();

  const [formData, setFormData] = useState({
    applicant_name: '',
    father_husband_name: '',
    gender: 'MALE',
    mobile_number: '',
    district: '',
    tehsil: '',
    ancestral_village: '',
    years_living_in_uk: '',
    reason_for_domicile: 'EMPLOYMENT',
  });

  const [voiceFilledFields, setVoiceFilledFields] = useState<Record<string, boolean>>({});
  const [isSignOffOpen, setIsSignOffOpen] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    if (isConfirmationPending) setIsSignOffOpen(true);
  }, [isConfirmationPending]);

  useEffect(() => {
    if (submissionId) {
      setSubmittedId(submissionId);
      setIsSignOffOpen(false);
    }
  }, [submissionId]);

  useEffect(() => {
    const unsub = registerSlotListener((slots) => {
      setFormData((prev) => ({ ...prev, ...slots }));
      const flags: Record<string, boolean> = {};
      Object.keys(slots).forEach((k) => (flags[k] = true));
      setVoiceFilledFields((prev) => ({ ...prev, ...flags }));
    });

    speakText(
      language === 'hi'
        ? 'स्थायी निवास प्रमाण पत्र पृष्ठ में आपका स्वागत है। कृपया अपना नाम, पिता का नाम और जनपद बताएं।'
        : 'Welcome to Permanent Residence (Domicile) Certificate form.'
    );

    return () => unsub();
  }, []);

  const handleFieldChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    updateFormSlot(field, val);
  };

  const handleFinalSubmit = () => {
    const randomId = `UK-DOM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedId(randomId);
    speakText(
      language === 'hi'
        ? `आपका स्थायी निवास प्रमाण पत्र आवेदन क्रमांक ${randomId} सफलता पूर्वक जमा कर लिया गया है।`
        : `Your Permanent Residence application has been submitted with ID ${randomId}.`
    );
  };

  if (submittedId) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 animate-fade-in">
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center space-y-3">
          <CheckCircle className="size-12 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-bold text-emerald-950">
            {language === 'hi' ? 'स्थायी निवास आवेदन जमा हुआ!' : 'Domicile Application Submitted!'}
          </h2>
          <p className="text-sm font-mono font-bold text-emerald-900 bg-white inline-block px-4 py-1.5 rounded-lg border border-emerald-200">
            {submittedId}
          </p>
        </div>

        <CertificateViewer
          certificateType="DOMICILE"
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
          राजस्व विभाग &bull; स्थायी निवास (Domicile) &bull; Fee: ₹40
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-ink-900">
          {language === 'hi' ? 'स्थायी निवास प्रमाण पत्र (Domicile Certificate)' : 'Application for Permanent Residence (Domicile)'}
        </h1>
        <p className="text-xs text-gray-600 mt-1">उत्तराखंड में 15 वर्ष अथवा उससे अधिक निरंतर निवास का वैधानिक प्रमाण पत्र</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setIsSignOffOpen(true);
        }}
        className="space-y-6"
      >
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase text-navbar border-b pb-2">1. आवेदक विवरण (Applicant Data)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormFieldWithVoice
              id="applicant_name"
              label="Full Name of Applicant"
              labelHindi="आवेदक का पूरा नाम"
              value={formData.applicant_name}
              onChange={(v) => handleFieldChange('applicant_name', v)}
              required
              voiceFilled={voiceFilledFields.applicant_name}
            />
            <FormFieldWithVoice
              id="father_husband_name"
              label="Father / Husband Name"
              labelHindi="पिता अथवा पति का नाम"
              value={formData.father_husband_name}
              onChange={(v) => handleFieldChange('father_husband_name', v)}
              required
              voiceFilled={voiceFilledFields.father_husband_name}
            />
            <FormFieldWithVoice
              id="mobile_number"
              label="Mobile Number"
              labelHindi="मोबाइल नंबर"
              value={formData.mobile_number}
              onChange={(v) => handleFieldChange('mobile_number', v)}
              required
              voiceFilled={voiceFilledFields.mobile_number}
            />
            <FormFieldWithVoice
              id="district"
              label="District"
              labelHindi="गृह जनपद"
              type="select"
              value={formData.district}
              onChange={(v) => handleFieldChange('district', v)}
              options={[
                { value: 'Pauri Garhwal', label: 'Pauri Garhwal' },
                { value: 'Dehradun', label: 'Dehradun' },
                { value: 'Haridwar', label: 'Haridwar' },
                { value: 'Nainital', label: 'Nainital' },
                { value: 'Almora', label: 'Almora' },
                { value: 'Tehri Garhwal', label: 'Tehri Garhwal' },
                { value: 'Chamoli', label: 'Chamoli' },
              ]}
              required
              voiceFilled={voiceFilledFields.district}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase text-navbar border-b pb-2">2. निवास पात्रता (Residence Criteria)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormFieldWithVoice
              id="years_living_in_uk"
              label="Years in Uttarakhand"
              labelHindi="उत्तराखंड में निवास वर्ष (15+)"
              type="number"
              value={formData.years_living_in_uk}
              onChange={(v) => handleFieldChange('years_living_in_uk', v)}
              required
            />
            <FormFieldWithVoice
              id="ancestral_village"
              label="Ancestral Village"
              labelHindi="मूल पैतृक गांव"
              value={formData.ancestral_village}
              onChange={(v) => handleFieldChange('ancestral_village', v)}
              required
            />
            <FormFieldWithVoice
              id="reason_for_domicile"
              label="Purpose"
              labelHindi="प्रमाण पत्र प्रयोजन"
              type="select"
              value={formData.reason_for_domicile}
              onChange={(v) => handleFieldChange('reason_for_domicile', v)}
              options={[
                { value: 'EMPLOYMENT', label: 'राजकीय सेवा / नौकरी (Job)' },
                { value: 'EDUCATION', label: 'शिक्षा / दाखिला (Education)' },
                { value: 'LAND', label: 'भूमि क्रय / राजस्व (Land Registry)' },
              ]}
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
            <span>सत्यापित करें एवं जमा करें (Sign-off)</span>
          </button>
        </div>
      </form>

      <CitizenSignOffModal
        isOpen={isSignOffOpen}
        onClose={() => setIsSignOffOpen(false)}
        serviceTitle="स्थायी निवास प्रमाण पत्र (Domicile Certificate)"
        formData={formData}
        onConfirm={handleFinalSubmit}
      />
    </div>
  );
};

