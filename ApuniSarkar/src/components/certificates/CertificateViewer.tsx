import React from 'react';
import { Download, Printer, CheckCircle, Shield, QrCode } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

interface CertificateProps {
  certificateType: 'INCOME' | 'DOMICILE' | 'HILL_AREA' | 'PARIWAR_REGISTER';
  applicantName: string;
  fatherName: string;
  district: string;
  tehsil?: string;
  annualIncome?: number;
  certificateNo: string;
  issueDate?: string;
}

export const CertificateViewer: React.FC<CertificateProps> = ({
  certificateType,
  applicantName,
  fatherName,
  district,
  tehsil = 'Dehradun Sadar',
  annualIncome = 60000,
  certificateNo,
  issueDate = '10/11/2026',
}) => {
  const { language } = useAccessibility();

  const titleMap = {
    INCOME: { en: 'INCOME CERTIFICATE (आय प्रमाण पत्र)', hi: 'आय प्रमाण पत्र' },
    DOMICILE: { en: 'PERMANENT RESIDENCE CERTIFICATE (स्थायी निवास प्रमाण पत्र)', hi: 'स्थायी निवास प्रमाण पत्र' },
    HILL_AREA: { en: 'HILL AREA CERTIFICATE (पर्वतीय क्षेत्र प्रमाण पत्र)', hi: 'पर्वतीय क्षेत्र प्रमाण पत्र' },
    PARIWAR_REGISTER: { en: 'EXTRACT OF PARIWAR REGISTER (परिवार रजिस्टर की नकल)', hi: 'परिवार रजिस्टर की नकल' },
  };

  return (
    <div className="bg-white rounded-2xl border-4 border-double border-amber-900/30 p-8 max-w-3xl mx-auto shadow-xl relative overflow-hidden select-none print:shadow-none print:border-none">
      {/* Background Watermark Crest */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <svg viewBox="0 0 100 120" className="w-[500px] h-[500px]" fill="currentColor">
          <path d="M50 5 C35 5 25 15 25 30 C25 42 33 50 42 54 L42 62 C30 63 20 72 20 85 C20 95 28 102 38 105 L35 115 L65 115 L62 105 C72 102 80 95 80 85 C80 72 70 63 58 62 L58 54 C67 50 75 42 75 30 C75 15 65 5 50 5 Z" />
        </svg>
      </div>

      {/* Header */}
      <div className="text-center border-b-2 border-amber-900/40 pb-4 mb-6 relative">
        <div className="flex justify-center mb-2">
          <div className="h-14 w-12 text-ink-900">
            <svg viewBox="0 0 100 120" className="h-full w-full" fill="currentColor">
              <path d="M50 5 C35 5 25 15 25 30 C25 42 33 50 42 54 L42 62 C30 63 20 72 20 85 C20 95 28 102 38 105 L35 115 L65 115 L62 105 C72 102 80 95 80 85 C80 72 70 63 58 62 L58 54 C67 50 75 42 75 30 C75 15 65 5 50 5 Z" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-extrabold uppercase text-amber-950 tracking-wider">
          उत्तराखंड शासन (GOVERNMENT OF UTTARAKHAND)
        </h2>
        <h3 className="text-sm font-semibold text-gray-700">कार्यालय तहसीलदार / राजस्व विभाग, जनपद {district}</h3>
        <p className="text-xs text-gray-500 mt-1">उत्तराखंड सेवा का अधिकार अधिनियम 2011 के अंतर्गत जारी</p>
        <div className="mt-3 inline-block px-4 py-1 bg-amber-50 border border-amber-300 rounded-md">
          <span className="text-sm font-bold text-amber-900 tracking-wide">
            {language === 'hi' ? titleMap[certificateType].hi : titleMap[certificateType].en}
          </span>
        </div>
      </div>

      {/* Certificate Identifiers */}
      <div className="flex justify-between items-center text-xs font-mono text-gray-600 mb-6 border-b border-gray-100 pb-2">
        <div>
          <span>प्रमाण पत्र संख्या: </span>
          <strong className="text-ink-900">{certificateNo}</strong>
        </div>
        <div>
          <span>जारी तिथि (Date): </span>
          <strong className="text-ink-900">{issueDate}</strong>
        </div>
      </div>

      {/* Main Body Statement */}
      <div className="space-y-4 text-sm text-gray-800 leading-relaxed text-justify mb-8">
        <p>
          प्रमाणित किया जाता है कि श्री/सुश्री <strong className="text-ink-900 font-bold">{applicantName}</strong> आत्मज/आत्मजा श्री{' '}
          <strong className="text-ink-900 font-bold">{fatherName}</strong>, निवासी ग्राम/वार्ड:{' '}
          <strong className="text-ink-900">रायपुर</strong>, तहसील: <strong className="text-ink-900">{tehsil}</strong>, जनपद:{' '}
          <strong className="text-ink-900">{district}</strong>, उत्तराखंड राज्य के स्थायी निवासी हैं।
        </p>

        {certificateType === 'INCOME' && (
          <p>
            लेखपाल एवं राजस्व उप-निरीक्षक की स्थानीय जांच आख्या के अनुसार आवेदक के परिवार की समस्त स्रोतों से कुल वार्षिक आय{' '}
            <strong className="text-amber-900 font-bold">₹{annualIncome.toLocaleString('en-IN')}</strong> (रुपये{' '}
            {annualIncome === 60000 ? 'साठ हज़ार मात्र' : `${annualIncome} मात्र`}) पाई गई है।
          </p>
        )}

        {certificateType === 'DOMICILE' && (
          <p>
            यह भी प्रमाणित किया जाता है कि आवेदक अथवा उनके पूर्वज विगत 15 वर्षों से अधिक समय से उत्तराखंड राज्य की सीमाओं के भीतर निवास
            करते आ रहे हैं और यह स्थायी निवास प्रमाण पत्र समस्त राजकीय सेवाओं एवं शैक्षणिक प्रवेश हेतु पूर्णतः वैध है।
          </p>
        )}

        {certificateType === 'HILL_AREA' && (
          <p>
            तहसीलदार जांच रिपोर्ट के आधार पर पुष्टि की जाती है कि आवेदक का मूल निवास पर्वतीय क्षेत्र घोषित ब्लॉक के अंतर्गत आता है और
            आवेदक पर्वतीय क्षेत्र प्रमाण पत्र के नियमानुसार समस्त आरक्षित छूट का पात्र है।
          </p>
        )}

        <p className="text-xs text-gray-500 italic mt-4">
          नोट: यह प्रमाण पत्र डिजिटल रूप से हस्ताक्षरित है तथा किसी भौतिक हस्ताक्षर की आवश्यकता नहीं है। इसकी प्रामाणिकता
          eservices.uk.gov.in/verify पर जांची जा सकती है।
        </p>
      </div>

      {/* Footer: Digital Seal, QR Code & Officer Stamp */}
      <div className="flex items-center justify-between pt-6 border-t-2 border-amber-900/30">
        {/* QR Code Container */}
        <div className="flex items-center gap-3">
          <div className="size-20 border-2 border-gray-400 p-1 rounded-lg bg-gray-50 flex items-center justify-center">
            <QrCode className="size-16 text-ink-900" />
          </div>
          <div className="text-[10px] text-gray-500 leading-tight">
            <p className="font-bold text-gray-700">QR Code Verification</p>
            <p>Scan to verify with</p>
            <p>ITDA State Data Centre</p>
          </div>
        </div>

        {/* Digital Signature Stamp */}
        <div className="text-right">
          <div className="inline-flex items-center gap-1 text-emerald-700 text-xs font-bold mb-1">
            <CheckCircle className="size-4" />
            <span>Digitally Signed</span>
          </div>
          <div className="text-xs font-bold text-ink-900">सक्षम अधिकारी / तहसीलदार</div>
          <div className="text-[11px] text-gray-600">तहसील: {tehsil}, जनपद {district}</div>
          <div className="text-[10px] text-gray-400 font-mono">Timestamp: {new Date().toISOString()}</div>
        </div>
      </div>

      {/* Action Bar (Hidden on print) */}
      <div className="mt-8 flex justify-end gap-3 print:hidden">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          <Printer className="size-4" />
          <span>{language === 'hi' ? 'प्रिंट करें' : 'Print Certificate'}</span>
        </button>
        <button
          onClick={() => alert(`Certificate ${certificateNo} downloaded successfully!`)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-navbar text-white hover:bg-navbar-dark shadow-sm"
        >
          <Download className="size-4" />
          <span>{language === 'hi' ? 'पीडीएफ डाउनलोड' : 'Download PDF'}</span>
        </button>
      </div>
    </div>
  );
};

