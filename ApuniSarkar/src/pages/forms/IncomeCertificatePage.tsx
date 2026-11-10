import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, CheckCircle, Sparkles, FileText, Landmark } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useVoice } from '../../context/VoiceContext';
import { FormFieldWithVoice } from '../../components/forms/FormFieldWithVoice';
import { CitizenSignOffModal } from '../../components/forms/CitizenSignOffModal';
import { CertificateViewer } from '../../components/certificates/CertificateViewer';

export const IncomeCertificatePage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { language, narrateElement, saralMode } = useAccessibility();
  const {
    registerSlotListener,
    speakText,
    isConfirmationPending,
    submissionId,
    activeFieldId,
    setActiveFieldId,
    updateFormSlot,
  } = useVoice();

  const [formData, setFormData] = useState({
    applicant_name: '',
    father_husband_name: '',
    gender: 'MALE',
    mobile_number: '',
    aadhaar_last_four: '',
    district: '',
    tehsil: '',
    patwari_circle: '',
    village_ward: '',
    annual_income: '',
    income_source: 'AGRICULTURE',
    purpose: 'SCHOLARSHIP',
  });

  const [voiceFilledFields, setVoiceFilledFields] = useState<Record<string, boolean>>({});
  const [isSignOffOpen, setIsSignOffOpen] = useState(false);
  const [submittedApplicationId, setSubmittedApplicationId] = useState<string | null>(null);

  // Sync confirmation and submission states from VoiceContext
  useEffect(() => {
    if (isConfirmationPending) {
      setIsSignOffOpen(true);
    }
  }, [isConfirmationPending]);

  useEffect(() => {
    if (submissionId) {
      setSubmittedApplicationId(submissionId);
      setIsSignOffOpen(false);
    }
  }, [submissionId]);

  // Register Voice Copilot slot filling listener
  useEffect(() => {
    const unsubscribe = registerSlotListener((slots) => {
      console.log('[IncomeCertificatePage] Slots received from voice:', slots);
      setFormData((prev) => ({
        ...prev,
        ...slots,
      }));

      // Mark fields as voice filled
      const newVoiceFilled: Record<string, boolean> = {};
      Object.keys(slots).forEach((key) => {
        newVoiceFilled[key] = true;
      });
      setVoiceFilledFields((prev) => ({ ...prev, ...newVoiceFilled }));
    });

    // Welcome speech
    speakText(
      language === 'hi'
        ? 'आय प्रमाण पत्र आवेदन में आपका स्वागत है। आप बोलकर फॉर्म भर सकते हैं। जैसे: मेरा नाम कुलदीप सिंह नेगी है, पिता जी का नाम खुशाल सिंह, और वार्षिक आय साठ हज़ार रुपये है।'
        : 'Welcome to Income Certificate form. You can fill details by voice naturally.'
    );

    return () => unsubscribe();
  }, []);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    updateFormSlot(field, value);
  };

  const handleFinalSubmit = () => {
    const randomId = `UK-REV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedApplicationId(randomId);
    speakText(
      language === 'hi'
        ? `बधाई हो! आपका आय प्रमाण पत्र आवेदन सफलता पूर्वक जमा हो गया है। आपका आवेदन क्रमांक है: ${randomId}।`
        : `Congratulations! Your Income Certificate application has been submitted successfully with ID ${randomId}.`
    );
  };

  if (submittedApplicationId) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 animate-fade-in">
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center space-y-3">
          <div className="inline-flex size-14 items-center justify-center rounded-full bg-emerald-600 text-white mx-auto shadow-md">
            <CheckCircle className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-emerald-950">
            {language === 'hi' ? 'आवेदन सफलता पूर्वक जमा हुआ!' : 'Application Successfully Submitted!'}
          </h2>
          <p className="text-sm text-emerald-800">
            {language === 'hi' ? 'आवेदन क्रमांक (Application ID):' : 'Application Tracking Number:'}{' '}
            <strong className="font-mono text-base font-bold bg-white px-3 py-1 rounded-md border border-emerald-200">
              {submittedApplicationId}
            </strong>
          </p>
          <p className="text-xs text-emerald-700">
            उत्तराखंड सेवा का अधिकार (RTS) के तहत यह प्रमाण पत्र 15 कार्यदिवसों के भीतर जारी किया जाएगा।
          </p>
        </div>

        {/* Issued Certificate Preview */}
        <CertificateViewer
          certificateType="INCOME"
          applicantName={formData.applicant_name || 'कुलदीप सिंह नेगी'}
          fatherName={formData.father_husband_name || 'श्री खुशाल सिंह'}
          district={formData.district}
          annualIncome={Number(formData.annual_income) || 60000}
          certificateNo={submittedApplicationId}
        />

        <div className="text-center pt-4">
          <button
            onClick={() => onNavigate('/')}
            className="px-6 py-2.5 bg-navbar text-white rounded-xl text-sm font-bold hover:bg-navbar-dark"
          >
            {language === 'hi' ? 'पोर्टल मुख्य पृष्ठ पर जाएं' : 'Return to Portal Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate('/all-services')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-navbar"
        >
          <ArrowLeft className="size-4" />
          <span>{language === 'hi' ? 'सभी सेवाओं की सूची' : 'Back to Services'}</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-medium bg-blue-50 text-navbar px-3 py-1 rounded-full border border-blue-200">
          <Landmark className="size-3.5" />
          <span>राजस्व विभाग (Revenue Department) &bull; SLA: 15 Days &bull; Fee: ₹40</span>
        </div>
      </div>

      {/* Main Title Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink-900 leading-tight">
              {language === 'hi' ? 'आय प्रमाण पत्र हेतु आवेदन' : 'Application for Income Certificate'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              उत्तराखंड सेवा का अधिकार अधिनियम 2011 &bull; Form Code: UK-REV-01
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
            <Sparkles className="size-4 text-amber-600" />
            <span>वाणी-सेतु वॉइस एक्टिव</span>
          </div>
        </div>

        {saralMode && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium">
            <strong>सरल मोड सक्रिय है:</strong> फ़ील्ड बड़े अक्षरों में प्रदर्शित हैं। आप किसी भी फ़ील्ड पर कर्सर रखकर उसकी आवाज सुन सकते हैं।
          </div>
        )}
      </div>

      {/* Form Content */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setIsSignOffOpen(true);
        }}
        className="space-y-6"
      >
        {/* Section 1: Applicant Details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-navbar border-b border-gray-100 pb-2 flex items-center gap-2">
            <FileText className="size-4" />
            <span>1. आवेदक का विवरण (Applicant Details)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormFieldWithVoice
              id="applicant_name"
              label="Full Name of Applicant"
              labelHindi="आवेदक का पूरा नाम (अंग्रेजी/हिन्दी)"
              value={formData.applicant_name}
              onChange={(v) => handleFieldChange('applicant_name', v)}
              required
              placeholder="e.g. Kuldeep Singh Negi"
              voiceFilled={voiceFilledFields.applicant_name}
              helpText="आधार कार्ड के अनुसार नाम दर्ज करें"
            />

            <FormFieldWithVoice
              id="father_husband_name"
              label="Father / Husband Name"
              labelHindi="पिता अथवा पति का नाम"
              value={formData.father_husband_name}
              onChange={(v) => handleFieldChange('father_husband_name', v)}
              required
              placeholder="e.g. Khushal Singh"
              voiceFilled={voiceFilledFields.father_husband_name}
            />

            <FormFieldWithVoice
              id="mobile_number"
              label="Mobile Number"
              labelHindi="मोबाइल नंबर (OTP एवं SMS हेतु)"
              type="text"
              value={formData.mobile_number}
              onChange={(v) => handleFieldChange('mobile_number', v)}
              required
              placeholder="e.g. 9876543210"
              voiceFilled={voiceFilledFields.mobile_number}
            />

            <FormFieldWithVoice
              id="gender"
              label="Gender"
              labelHindi="लिंग (Gender)"
              type="select"
              value={formData.gender}
              onChange={(v) => handleFieldChange('gender', v)}
              options={[
                { value: 'MALE', label: 'पुरुष (Male)' },
                { value: 'FEMALE', label: 'महिला (Female)' },
                { value: 'OTHER', label: 'अन्य (Other)' },
              ]}
              required
            />
          </div>
        </div>

        {/* Section 2: Residential Location in Uttarakhand */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-navbar border-b border-gray-100 pb-2 flex items-center gap-2">
            <Landmark className="size-4" />
            <span>2. स्थायी निवास विवरण (Location & Jurisdiction)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormFieldWithVoice
              id="district"
              label="District"
              labelHindi="जनपद (District)"
              type="select"
              value={formData.district}
              onChange={(v) => handleFieldChange('district', v)}
              options={[
                { value: 'Dehradun', label: 'Dehradun (देहरादून)' },
                { value: 'Haridwar', label: 'Haridwar (हरिद्वार)' },
                { value: 'Nainital', label: 'Nainital (नैनीताल)' },
                { value: 'Pauri Garhwal', label: 'Pauri Garhwal (पौड़ी गढ़वाल)' },
                { value: 'Tehri Garhwal', label: 'Tehri Garhwal (टिहरी गढ़वाल)' },
                { value: 'Almora', label: 'Almora (अल्मोड़ा)' },
                { value: 'Chamoli', label: 'Chamoli (चमोली)' },
                { value: 'Rudraprayag', label: 'Rudraprayag (रुद्रप्रयाग)' },
                { value: 'Uttarkashi', label: 'Uttarkashi (उत्तरकाशी)' },
                { value: 'Pithoragarh', label: 'Pithoragarh (पिथौरागढ़)' },
                { value: 'Bageshwar', label: 'Bageshwar (बागेश्वर)' },
                { value: 'Champawat', label: 'Champawat (चंपावत)' },
                { value: 'Udham Singh Nagar', label: 'Udham Singh Nagar (ऊधम सिंह नगर)' },
              ]}
              required
              voiceFilled={voiceFilledFields.district}
            />

            <FormFieldWithVoice
              id="tehsil"
              label="Tehsil"
              labelHindi="तहसील (Tehsil)"
              value={formData.tehsil}
              onChange={(v) => handleFieldChange('tehsil', v)}
              required
              placeholder="e.g. Dehradun Sadar"
            />

            <FormFieldWithVoice
              id="patwari_circle"
              label="Patwari / Lekhpal Circle"
              labelHindi="पटवारी / लेखपाल चौकी"
              value={formData.patwari_circle}
              onChange={(v) => handleFieldChange('patwari_circle', v)}
              required
              placeholder="e.g. Raipur Chowki"
            />
          </div>
        </div>

        {/* Section 3: Annual Household Income Details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-navbar border-b border-gray-100 pb-2 flex items-center gap-2">
            <CheckCircle className="size-4" />
            <span>3. वार्षिक आय विवरण (Income Details)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormFieldWithVoice
              id="annual_income"
              label="Total Annual Family Income (₹)"
              labelHindi="परिवार की कुल वार्षिक आय (रुपये ₹)"
              type="number"
              value={formData.annual_income}
              onChange={(v) => handleFieldChange('annual_income', Number(v))}
              required
              placeholder="e.g. 60000"
              voiceFilled={voiceFilledFields.annual_income}
              helpText="सभी स्रोतों (कृषि, मजदूरी, पेंशन) से कुल वार्षिक आय"
            />

            <FormFieldWithVoice
              id="income_source"
              label="Primary Income Source"
              labelHindi="आय का मुख्य साधन"
              type="select"
              value={formData.income_source}
              onChange={(v) => handleFieldChange('income_source', v)}
              options={[
                { value: 'AGRICULTURE', label: 'कृषि / बागवानी (Agriculture)' },
                { value: 'LABOUR', label: 'दैनिक मजदूरी (Daily Labour)' },
                { value: 'BUSINESS', label: 'व्यापार / दुकान (Business)' },
                { value: 'SALARIED', label: 'वेतनभोगी (Private Job)' },
                { value: 'PENSION', label: 'पेंशन (Pensioner)' },
              ]}
              required
            />

            <FormFieldWithVoice
              id="purpose"
              label="Certificate Required For"
              labelHindi="प्रमाण पत्र का प्रयोजन"
              type="select"
              value={formData.purpose}
              onChange={(v) => handleFieldChange('purpose', v)}
              options={[
                { value: 'SCHOLARSHIP', label: 'छात्रवृत्ति (Scholarship)' },
                { value: 'ADMISSION', label: 'शैक्षणिक प्रवेश (School/College)' },
                { value: 'RATION_CARD', label: 'राशन कार्ड (Ration Card)' },
                { value: 'SCHEME', label: 'सरकारी योजना (Govt Welfare Scheme)' },
                { value: 'OTHER', label: 'अन्य प्रयोजन (Other)' },
              ]}
              required
            />
          </div>
        </div>

        {/* Submit & Consent Action Bar */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => onNavigate('/all-services')}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100"
          >
            {language === 'hi' ? 'रद्द करें' : 'Cancel'}
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-navbar hover:bg-navbar-dark text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Send className="size-4" />
            <span>{language === 'hi' ? 'विवरण सत्यापित करें एवं जमा करें' : 'Verify & Proceed to Sign-Off'}</span>
          </button>
        </div>
      </form>

      {/* Spoken Sign-off Modal */}
      <CitizenSignOffModal
        isOpen={isSignOffOpen}
        onClose={() => setIsSignOffOpen(false)}
        serviceTitle={language === 'hi' ? 'आय प्रमाण पत्र (Income Certificate)' : 'Income Certificate Application'}
        formData={formData}
        onConfirm={handleFinalSubmit}
      />
    </div>
  );
};

