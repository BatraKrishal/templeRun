import React, { useState, useEffect } from 'react';
import { Search, FileText, X, CheckCircle, ShieldCheck, Download, Printer } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useVoice } from '../context/VoiceContext';

export const VerifyCertificatePage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { language, narrateElement } = useAccessibility();
  const { speakText, registerSlotListener } = useVoice();
  const [appId, setAppId] = useState('');
  const [searched, setSearched] = useState(false);
  const [certificateData, setCertificateData] = useState<any>(null);

  useEffect(() => {
    const unsub = registerSlotListener((slots) => {
      const id = slots.tracking_id || slots.application_number || slots.application_id;
      if (id) {
        setAppId(String(id));
      }
    });
    return () => unsub();
  }, [registerSlotListener]);

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!appId.trim()) return;

    const mockCert = {
      certNumber: 'UK/REV/2026/INC/89201',
      applicationNumber: appId.trim().toUpperCase(),
      serviceName: 'Income Certificate / आय प्रमाण पत्र',
      applicantName: 'कुलदीप सिंह नेगी (Kuldeep Singh Negi)',
      fatherName: 'श्री राजेन्द्र सिंह नेगी (Shri Rajendra Singh Negi)',
      address: 'ग्राम व पोस्ट - तपोवन, ऋषिकेश, जनपद - देहरादून (उत्तराखंड)',
      annualIncome: '₹ 1,80,000/- (एक लाख अस्सी हजार रुपये मात्र)',
      issueDate: '02/11/2026',
      validUntil: '01/11/2029 (तीन वर्ष हेतु मान्य)',
      issuingAuthority: 'तहसीलदार, ऋषिकेश, जनपद देहरादून (उत्तराखंड)',
      digitalSignatureStatus: 'Valid Digitally Signed (CCA India Certified)'
    };

    setCertificateData(mockCert);
    setSearched(true);

    const voiceText = language === 'hi'
      ? `प्रमाण पत्र क्रमांक ${mockCert.certNumber} सत्यापित है। यह कुलदीप सिंह नेगी के नाम पर तहसीलदार ऋषिकेश द्वारा जारी किया गया वैध आय प्रमाण पत्र है।`
      : `Certificate ${mockCert.certNumber} is authentic and verified. Issued to Kuldeep Singh Negi by Tehsildar Rishikesh.`;
    speakText(voiceText);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main id="main-content" className="flex min-h-0 flex-1 flex-col overflow-x-clip" style={{ scrollMarginTop: '140px' }}>
      <div className="bg-[#faf5ef] min-h-[70vh] py-8">
        <div className="max-w-5xl px-4 py-8 mx-auto sm:px-6 md:px-8">
          <h1 className="mb-4 text-xl font-semibold text-gray-800 sm:text-2xl">
            {language === 'hi' ? 'प्रमाण पत्र सत्यापन (View & Verify Certificate)' : 'View Certificate'}
          </h1>

          {/* Search Form matching official UI */}
          <form onSubmit={handleVerify} className="mb-8">
            <div className="max-w-xl">
              <label htmlFor="search-field" className="inline-block text-sm font-medium text-gray-700">
                {language === 'hi' ? 'आवेदन संख्या दर्ज करें (Enter Application Number)' : 'Enter Application Number'}
              </label>
              <div className="flex gap-2 mt-1.5">
                <input
                  id="search-field"
                  className="flex-1 px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                  name="applicationId"
                  placeholder="Application Number (e.g. UK23HF2400000000)"
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  Search
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Quick verify sample: <span className="font-mono text-primary font-semibold cursor-pointer underline" onClick={() => setAppId('UK23HF2400000000')}>UK23HF2400000000</span>
              </p>
            </div>
          </form>

          {/* Results Box matching official card structure */}
          <div className="overflow-hidden border border-gray-300 rounded-xl bg-white shadow-sm">
            {/* Box Header */}
            <div className="flex items-center gap-2 px-5 py-4 bg-gray-50 border-b border-gray-200">
              <FileText className="size-5 text-emerald-600" />
              <h3 className="flex-grow font-semibold text-gray-700 text-base">
                {language === 'hi' ? 'प्रमाण पत्र विवरण (Certificate)' : 'Certificate'}
              </h3>
              {searched && (
                <button
                  type="button"
                  onClick={() => { setSearched(false); setAppId(''); setCertificateData(null); }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Box Content */}
            {!searched ? (
              <div className="p-8">
                <label
                  htmlFor="search-field"
                  className="flex flex-col items-center justify-center w-full gap-3 py-10 text-base text-gray-400 cursor-pointer"
                >
                  <Search className="size-10 text-gray-300 stroke-1" />
                  <h4 className="text-sm font-medium text-gray-500">
                    {language === 'hi'
                      ? 'प्रमाण पत्र पूर्वावलोकन प्राप्त करने के लिए आवेदन संख्या खोजें'
                      : 'Search Application Number To Get Certificate Preview'}
                  </h4>
                </label>
              </div>
            ) : (
              <div className="p-6 sm:p-10 space-y-6">
                {/* Official Certificate Paper Replica */}
                <div className="relative border-4 border-double border-amber-900/30 p-8 sm:p-12 rounded-xl bg-gradient-to-b from-amber-50/20 via-white to-amber-50/10 shadow-lg">
                  {/* Watermark Logo */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
                    <img src="/logo.webp" alt="" className="size-96 object-contain" />
                  </div>

                  {/* Top Certificate Header */}
                  <div className="flex flex-col items-center text-center border-b-2 border-primary/20 pb-6 mb-6">
                    <img src="/indian-emblem.svg" alt="Emblem" className="h-16 w-auto mb-2" />
                    <h2 className="text-xl sm:text-2xl font-bold text-ink-900 font-serif tracking-wide">
                      उत्तराखंड शासन | GOVERNMENT OF UTTARAKHAND
                    </h2>
                    <h3 className="text-sm sm:text-base font-semibold text-primary mt-1">
                      राजस्व विभाग (REVENUE DEPARTMENT)
                    </h3>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold">
                      <ShieldCheck className="size-4 text-emerald-600" />
                      डिजिटली सत्यापित आधिकारिक अभिलेख (Digitally Verified Official Record)
                    </div>
                  </div>

                  {/* Certificate Body */}
                  <div className="space-y-4 text-sm text-gray-800 leading-relaxed font-serif">
                    <div className="flex flex-wrap justify-between text-xs text-gray-600 border-b pb-2 font-mono">
                      <span>प्रमाण पत्र सं. (Cert No): <strong>{certificateData.certNumber}</strong></span>
                      <span>आवेदन क्रमांक (App ID): <strong>{certificateData.applicationNumber}</strong></span>
                      <span>दिनांक (Date): <strong>{certificateData.issueDate}</strong></span>
                    </div>

                    <div className="pt-2 text-base text-justify">
                      <p>
                        प्रमाणित किया जाता है कि <strong>{certificateData.applicantName}</strong>, 
                        आत्मज/आत्मजा <strong>{certificateData.fatherName}</strong>, 
                        निवासी <strong>{certificateData.address}</strong> के परिवार की सभी स्रोतों से कुल वार्षिक आय 
                        <strong> {certificateData.annualIncome}</strong> है।
                      </p>
                      <p className="mt-3">
                        यह प्रमाण पत्र आवेदक द्वारा प्रस्तुत स्व-प्रमाणित घोषणा-पत्र एवं क्षेत्रीय पटवारी/लेखपाल की स्थलीय जांच आख्या के आधार पर जारी किया गया है।
                      </p>
                      <p className="mt-2 text-xs text-gray-600 font-mono">
                        वैधता अवधि: {certificateData.validUntil}
                      </p>
                    </div>

                    {/* Bottom Signatures & QR Code */}
                    <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-3">
                        <div className="size-20 border-2 border-primary/40 bg-white p-1 rounded-lg flex items-center justify-center">
                          {/* Simulated SVG QR */}
                          <svg className="size-full text-ink-900" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2 2h8v8H2zm2 2v4h4V4zm10-2h8v8h-8zm2 2v4h4V4zM2 14h8v8H2zm2 2v4h4v-4zm14-2h4v2h-4zm-4 2h2v4h-2zm4 2h4v4h-4zm-4 4h4v2h-4zm2-6h2v2h-2z" />
                          </svg>
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono">
                          <p>Scan to verify authenticity</p>
                          <p>eservices.uk.gov.in/verify</p>
                        </div>
                      </div>

                      <div className="text-center sm:text-right text-xs">
                        <div className="font-bold text-ink-900">Digitally signed by Tehsildar</div>
                        <div className="text-gray-600">{certificateData.issuingAuthority}</div>
                        <div className="text-[10px] text-emerald-700 font-mono mt-1 font-semibold">
                          Timestamp: {certificateData.issueDate} 15:30:22 IST
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-colors cursor-pointer"
                  >
                    <Printer className="size-4" />
                    Print Certificate
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-sm shadow-sm transition-colors cursor-pointer"
                  >
                    <Download className="size-4" />
                    Download Official PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
