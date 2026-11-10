import React, { useState } from 'react';
import { Info, Download, CheckCircle, FileText, Smartphone } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useVoice } from '../context/VoiceContext';

export const DownloadCertificatesPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { language } = useAccessibility();
  const { speakText } = useVoice();
  const [searchBy, setSearchBy] = useState<'applicationId' | 'userMobile'>('applicationId');
  const [appId, setAppId] = useState('');
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [searched, setSearched] = useState(false);

  const certificatesList = [
    {
      sNo: 1,
      appNumber: 'UK23HF2400000000',
      applicantName: 'कुलदीप सिंह नेगी (Kuldeep Singh Negi)',
      service: 'Income Certificate (आय प्रमाण पत्र)',
      issueDate: '02/11/2026',
      pdfUrl: '/docs/rts-act.pdf'
    }
  ];

  const handleSendOtp = () => {
    setOtpSent(true);
    speakText(language === 'hi' ? 'सत्यापन हेतु ओटीपी आपके पंजीकृत नंबर पर भेज दिया गया है।' : 'OTP has been dispatched to your registered number.');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    speakText(language === 'hi' ? 'आपका प्रमाण पत्र डाउनलोड के लिए उपलब्ध है।' : 'Your issued certificate is ready for download.');
  };

  return (
    <main id="main-content" className="flex min-h-0 flex-1 flex-col overflow-x-clip" style={{ scrollMarginTop: '140px' }}>
      <div className="bg-[#faf5ef] min-h-[70vh] py-8">
        <div className="p-4 max-w-5xl mx-auto">
          {/* Header */}
          <div className="my-6">
            <h1 className="text-xl font-medium text-gray-800 sm:text-2xl">
              {language === 'hi' ? 'प्रमाण पत्र डाउनलोड करें (Download Certificates)' : 'Download Certificates'}
            </h1>
            <p className="text-gray-700 text-sm mt-1">
              Download your application certificate using your 16 digit <b>Application Id</b> or the{' '}
              <b>Mobile Number</b> used while filling the application form.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col gap-4 mb-8">
            {/* Radio Button Group matching ant-radio-group */}
            <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1 mb-2 w-fit">
              <button
                type="button"
                onClick={() => setSearchBy('applicationId')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  searchBy === 'applicationId' ? 'bg-primary text-white shadow-xs' : 'text-gray-700 hover:text-ink-900'
                }`}
              >
                Application Id
              </button>
              <button
                type="button"
                onClick={() => setSearchBy('userMobile')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  searchBy === 'userMobile' ? 'bg-primary text-white shadow-xs' : 'text-gray-700 hover:text-ink-900'
                }`}
              >
                Mobile Number
              </button>
            </div>

            {/* Verification Card */}
            <div className="border border-gray-300 rounded-xl bg-white shadow-xs overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Info className="size-4 text-primary" />
                  <span>Verify {searchBy === 'applicationId' ? 'Application Id' : 'Mobile Number'}</span>
                </div>
              </div>

              <div className="p-5">
                {searchBy === 'applicationId' ? (
                  <div className="flex flex-col sm:flex-row items-start gap-3">
                    <input
                      id="appId"
                      name="appId"
                      aria-label="Application Id"
                      type="text"
                      maxLength={16}
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      placeholder="Enter Application Id (e.g. UK23HF2400000000)"
                      className="w-full sm:w-80 px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="px-5 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <span>Send OTP</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start gap-3">
                    <input
                      id="mobile"
                      name="mobile"
                      aria-label="Mobile Number"
                      type="text"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="Enter 10-digit Mobile Number"
                      className="w-full sm:w-80 px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="px-5 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <span>Send OTP</span>
                    </button>
                  </div>
                )}

                {otpSent && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP (e.g. 123456)"
                      className="w-48 px-3.5 py-2 text-sm border border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-widest text-center"
                    />
                    <span className="text-xs text-emerald-700 font-medium">OTP sent successfully to registered mobile</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="self-end px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Search certificates
            </button>
          </form>

          {/* Table matching official UI */}
          <div className="overflow-hidden border border-gray-300 rounded-xl bg-white shadow-xs">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">S. No.</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Application Number</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Applicant's Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Service</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {!searched ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      <FileText className="size-10 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm font-medium">कोई आकड़ा उपलब्ध नहीं है (No Data Available)</p>
                      <p className="text-xs text-gray-400">Search above with Application ID to see your certificates</p>
                    </td>
                  </tr>
                ) : (
                  certificatesList.map((c) => (
                    <tr key={c.sNo} className="hover:bg-orange-50/50">
                      <td className="px-4 py-3 text-gray-900 font-medium">{c.sNo}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-primary">{c.appNumber}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{c.applicantName}</td>
                      <td className="px-4 py-3 text-gray-700">{c.service}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => onNavigate('/verify')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 shadow-xs cursor-pointer"
                        >
                          <Download className="size-3.5" />
                          Download PDF
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

