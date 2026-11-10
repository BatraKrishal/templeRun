import React, { useState } from 'react';
import { Search, FileText, X, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useVoice } from '../context/VoiceContext';

export const TrackApplicationPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { language, narrateElement } = useAccessibility();
  const { speakText } = useVoice();
  const [appId, setAppId] = useState('');
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!appId.trim()) return;

    // Simulate authentic government status lookup
    const mockData = {
      appId: appId.trim().toUpperCase(),
      serviceName: 'Income Certificate (आय प्रमाण पत्र)',
      department: 'Revenue Department (राजस्व विभाग)',
      applicantName: 'कुलदीप सिंह नेगी / Kuldeep Singh Negi',
      district: 'Dehradun (देहरादून)',
      tehsil: 'Rishikesh (ऋषिकेश)',
      appliedDate: '04/11/2026',
      rtsDueDate: '19/11/2026 (Right to Service Act)',
      currentStatus: 'Under Process at Tehsildar Office',
      statusCode: 'IN_PROGRESS',
      timeline: [
        { title: 'Application Submitted Online', date: '04/11/2026 10:30 AM', status: 'Completed', officer: 'Citizen Self Portal' },
        { title: 'Lekhpal / Patwari Field Verification', date: '07/11/2026 02:15 PM', status: 'Verified & Recommended', officer: 'Shri R. P. Sharma (Patwari Circle 4)' },
        { title: 'Naib Tehsildar Review & Scrutiny', date: '09/11/2026 11:45 AM', status: 'Under Review', officer: 'Tehsildar Office Rishikesh' },
        { title: 'Digital Signature & Certificate Issuance', date: 'Pending', status: 'Awaiting Final Signoff', officer: 'Sub-Divisional Magistrate (SDM)' }
      ]
    };

    setResult(mockData);
    setSearched(true);

    const voiceMessage = language === 'hi'
      ? `आवेदन संख्या ${appId} की वर्तमान स्थिति: लेखपाल स्थलीय जांच पूर्ण हो चुकी है। फाइल वर्तमान में तहसीलदार कार्यालय में संस्तुति हेतु विचाराधीन है। सेवा का अधिकार के अनुसार नियत तिथि उन्नीस नवंबर है।`
      : `Application ${appId} status: Lekhpal field inquiry verified. Currently under review at Tehsildar Office. Expected completion by 19th November.`;
    speakText(voiceMessage);
  };

  const clearSearch = () => {
    setAppId('');
    setSearched(false);
    setResult(null);
  };

  return (
    <main id="main-content" className="flex min-h-0 flex-1 flex-col overflow-x-clip" style={{ scrollMarginTop: '140px' }}>
      <div className="bg-[#faf5ef] min-h-[70vh] py-8">
        <div className="max-w-5xl px-4 py-8 mx-auto sm:px-6 md:px-8">
          <h1 className="mb-4 text-xl font-semibold text-gray-800 sm:text-2xl">
            {language === 'hi' ? 'आवेदन स्थिति जानें (Know Application Status)' : 'Know Application Status'}
          </h1>

          {/* Search Form matching official UI */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="max-w-xl">
              <label htmlFor="search-field" className="inline-block text-sm font-medium text-gray-700">
                {language === 'hi' ? 'आवेदन संख्या दर्ज करें (Enter Application ID)' : 'Enter Application ID'}
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
                Tip: You can use sample ID: <span className="font-mono text-primary font-semibold cursor-pointer underline" onClick={() => { setAppId('UK23HF2400000000'); }}>UK23HF2400000000</span>
              </p>
            </div>
          </form>

          {/* Results Box matching official card structure */}
          <div className="overflow-hidden border border-gray-300 rounded-xl bg-white shadow-sm">
            {/* Box Header */}
            <div className="flex items-center gap-2 px-5 py-4 bg-gray-50 border-b border-gray-200">
              <FileText className="size-5 text-emerald-600" />
              <h3 className="flex-grow font-semibold text-gray-700 text-base">
                {language === 'hi' ? 'आवेदन का विवरण (Application Details)' : 'Application Details'}
              </h3>
              {searched && (
                <button
                  type="button"
                  onClick={clearSearch}
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
                    {language === 'hi' ? 'विवरण प्राप्त करने के लिए आवेदन खोजें' : 'Search application to get details'}
                  </h4>
                </label>
              </div>
            ) : (
              <div className="p-6 sm:p-8 space-y-6">
                {/* Meta details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50/50 p-5 rounded-xl border border-orange-200/60">
                  <div>
                    <span className="text-xs uppercase text-gray-500 font-semibold">Service Name</span>
                    <p className="text-base font-bold text-ink-900">{result.serviceName}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-gray-500 font-semibold">Department</span>
                    <p className="text-sm font-semibold text-gray-800">{result.department}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-gray-500 font-semibold">Applicant</span>
                    <p className="text-sm font-semibold text-gray-800">{result.applicantName}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-gray-500 font-semibold">District & Tehsil</span>
                    <p className="text-sm font-semibold text-gray-800">{result.district} / {result.tehsil}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-gray-500 font-semibold">Submission Date</span>
                    <p className="text-sm font-semibold text-gray-800">{result.appliedDate}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-gray-500 font-semibold">Right to Service SLA</span>
                    <p className="text-sm font-bold text-emerald-700">{result.rtsDueDate}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
                    Processing Timeline (प्रक्रियात्मक चरण)
                  </h4>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-gray-200">
                    {result.timeline.map((item: any, idx: number) => (
                      <div key={idx} className="relative flex items-start gap-4">
                        <div className={`size-7 rounded-full flex items-center justify-center shrink-0 z-10 text-white ${
                          item.status.includes('Completed') || item.status.includes('Verified')
                            ? 'bg-emerald-600'
                            : item.status.includes('Under Review')
                            ? 'bg-amber-500 animate-pulse'
                            : 'bg-gray-300'
                        }`}>
                          {item.status.includes('Completed') || item.status.includes('Verified') ? (
                            <CheckCircle2 className="size-4" />
                          ) : (
                            <Clock className="size-4" />
                          )}
                        </div>
                        <div className="flex-1 bg-white p-3.5 rounded-lg border border-gray-200 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-ink-900">{item.title}</span>
                            <span className="text-xs font-mono text-gray-500">{item.date}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">Officer: {item.officer}</p>
                          <span className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            item.status.includes('Completed') || item.status.includes('Verified')
                              ? 'bg-emerald-50 text-emerald-700'
                              : item.status.includes('Under Review')
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
