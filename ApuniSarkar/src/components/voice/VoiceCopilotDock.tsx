import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Sparkles, ChevronDown, CheckCircle2, AlertCircle, X, Compass, FileEdit } from 'lucide-react';
import { useVoice } from '../../context/VoiceContext';
import { useAccessibility } from '../../context/AccessibilityContext';

export const VoiceCopilotDock: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { language, narrateElement } = useAccessibility();
  const {
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    assistantReplyHindi,
    assistantReplyEnglish,
    detectedLanguage,
    actionStatus,
    activeIntent,
    lastTargetRoute,
    voiceMode,
    setVoiceMode,
    toggleListening,
    executeVoiceCommand,
    stopSpeaking,
    recognitionLang,
    setRecognitionLang,
    isHandsFreeActive,
  } = useVoice();

  const [expanded, setExpanded] = useState<boolean>(false);

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isFormRoute =
    pathname.includes('/services/') ||
    pathname.includes('/forms/') ||
    pathname.includes('/download-certificates') ||
    pathname.includes('/track');

  const effectiveMode = voiceMode === 'AUTO' ? (isFormRoute ? 'FORM' : 'NAVIGATION') : voiceMode;

  const navPrompts = [
    { labelHindi: 'आय प्रमाण पत्र', labelEn: 'Income Certificate', query: 'मुझे आय प्रमाण पत्र बनवाना है' },
    { labelHindi: 'मूल निवास', labelEn: 'Domicile Form', query: 'स्थायी निवास प्रमाण पत्र खोलो' },
    { labelHindi: 'प्रमाण पत्र डाउनलोड', labelEn: 'Download Certificate', query: 'Go to Download Certificate page' },
    { labelHindi: 'आवेदन ट्रैक', labelEn: 'Track Status', query: 'आवेदन ट्रैक करें UK-REV-2026-9812' },
    { labelHindi: 'हेल्पलाइन 1905', labelEn: 'Helpline 1905', query: 'टोल फ्री हेल्पलाइन नंबर क्या है' },
  ];

  const formPrompts = [
    { labelHindi: '✍️ पिता का नाम', labelEn: '✍️ Father Name', query: 'father name Indra Singh Bisht' },
    { labelHindi: '💰 वार्षिक आय ₹60,000', labelEn: '💰 Annual Income 60k', query: 'annual income 60000' },
    { labelHindi: '📱 मोबाइल नंबर', labelEn: '📱 Mobile 9876543210', query: 'mobile number 9876543210' },
    { labelHindi: '👤 लिंग (पुरुष)', labelEn: '👤 Gender (Male)', query: 'select male' },
    { labelHindi: '📋 फॉर्म जांचें', labelEn: '📋 Review Form', query: 'review form' },
    { labelHindi: '🚀 फॉर्म जमा करें', labelEn: '🚀 Submit Form', query: 'submit form' },
  ];

  if (!expanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-3 rounded-full bg-navbar px-4 py-2.5 text-white shadow-2xl hover:bg-navbar/95 transition-all border border-white/20 hover:scale-105 select-none cursor-pointer"
          title="Open VaaniSetu Voice Assistant"
        >
          <div className="relative flex items-center justify-center size-8 rounded-full bg-primary text-white shadow-inner">
            <Mic className="size-4 text-white" />
            {isSpeaking && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            )}
          </div>
          <div className="text-left pr-1">
            <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>VaaniSetu (वाणी-सेतु)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-normal">
                ElevenLabs
              </span>
            </div>
            <div className="text-[10px] text-white/70">AI Voice Assistant & Narrator</div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="VaaniSetu Voice Assistant Dock"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full sm:w-[400px] transition-all duration-300 pointer-events-auto"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/90 shadow-2xl overflow-hidden animate-scale-in">
        {/* Header Bar */}
        <div className="bg-navbar text-white px-4 py-3 flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center size-8 rounded-full bg-primary text-white">
              <Sparkles className="size-4 text-amber-300" />
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                <span>VaaniSetu (वाणी-सेतु)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-normal">
                  ElevenLabs v2.5
                </span>
              </div>
              <div className="text-[10px] text-white/70">
                {isListening
                  ? 'सुन रहा हूँ... (Listening)'
                  : isSpeaking
                  ? 'बोल रहा हूँ... (Speaking)'
                  : isProcessing
                  ? 'विश्लेषण कर रहा हूँ... (Processing)'
                  : 'सहायता के लिए बोलें या क्लिक करें'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="p-1 rounded hover:bg-white/10 text-white/90 text-xs"
                title="Stop Audio"
              >
                <Volume2 className="size-4 text-amber-300 animate-pulse" />
              </button>
            )}
            <button
              onClick={() => setExpanded(false)}
              className="p-1 rounded hover:bg-white/10 text-white/80"
              aria-label="Collapse dock"
            >
              <ChevronDown className="size-4" />
            </button>
          </div>
        </div>

        {/* Mode Switcher Banner */}
        <div className="bg-gray-100/95 border-b border-gray-200 px-3.5 py-1.5 flex items-center justify-between text-[11px] select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 font-medium">मोड:</span>
            <button
              type="button"
              onClick={() => setVoiceMode(effectiveMode === 'FORM' ? 'NAVIGATION' : 'FORM')}
              className={`px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-all ${
                effectiveMode === 'FORM'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                  : 'bg-blue-100 text-blue-900 border border-blue-300 hover:bg-blue-200'
              }`}
              title="Click to toggle between Form Filling Mode and Navigation Mode"
            >
              {effectiveMode === 'FORM' ? (
                <>
                  <FileEdit className="size-3 text-amber-700" />
                  <span>फॉर्म मोड (Form Mode)</span>
                </>
              ) : (
                <>
                  <Compass className="size-3 text-blue-700" />
                  <span>नेविगेशन मोड (Nav Mode)</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                isHandsFreeActive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-gray-100 text-gray-600 border-gray-300'
              }`}
              title={isHandsFreeActive ? "सतत बातचीत ऑन ('रुको' या 'Stop' बोलकर रोक सकते हैं)" : 'माइक बंद है'}
            >
              <span className={`size-1.5 rounded-full ${isHandsFreeActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
              <span>{isHandsFreeActive ? 'सतत संवाद (Continuous)' : 'माइक पॉज्ड (Paused)'}</span>
            </span>
          </div>
        </div>

        {/* Expanded Body */}
        <div className="p-3.5 space-y-3 text-xs">
          {/* Live Waveform / Mic Visualizer */}
          <div className="flex items-center justify-between gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`flex items-center justify-center size-12 rounded-full transition-all shrink-0 shadow-md ${
                isListening
                  ? 'bg-red-600 text-white scale-110 ring-4 ring-red-200 animate-pulse'
                  : isSpeaking
                  ? 'bg-amber-500 text-white animate-bounce'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
              title={isListening ? 'माइक बंद करें' : 'माइक चालू करें (Speak)'}
            >
              {isListening ? <Mic className="size-6 animate-pulse" /> : <Mic className="size-5" />}
            </button>

            {/* Status / Transcript Wave */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-ink-700">
                <span>
                  {isListening
                    ? '🔴 आवाज सुन रहे हैं (Continuous)...'
                    : isSpeaking
                    ? '🔊 ई-सहायक बोल रहा है...'
                    : '🎙️ अपनी भाषा में बोलें:'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setRecognitionLang(recognitionLang === 'hi-IN' ? 'en-IN' : 'hi-IN')}
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-gray-300 text-ink-800 hover:bg-gray-100 cursor-pointer shadow-2xs"
                    title="Click to toggle recognition language (English / हिन्दी)"
                  >
                    {recognitionLang === 'hi-IN' ? '🇮🇳 हिन्दी' : '🌐 English'}
                  </button>
                </div>
              </div>
              <p className="mt-1 text-xs text-ink-900 font-medium truncate bg-white px-2 py-1 rounded border border-gray-200 min-h-[26px]">
                {transcript || (
                  <span className="text-gray-400 italic">
                    {effectiveMode === 'FORM'
                      ? 'उदा: "पिता का नाम इन्द्र सिंह बिष्ट", "annual income 60000"'
                      : 'उदा: "आय प्रमाण पत्र खोलो", "Download Certificate"'}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Assistant Voice Reply Bubble */}
          {(assistantReplyHindi || assistantReplyEnglish) && (
            <div className="bg-orange-50/70 border border-orange-200 p-2.5 rounded-xl space-y-1 animate-fade-in">
              <div className="flex items-center justify-between text-[10px] font-bold text-primary uppercase">
                <div className="flex items-center gap-1.5">
                  <span>उत्तराखंड ई-सहायक उत्तर (ElevenLabs Voice):</span>
                  {actionStatus && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        actionStatus === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : actionStatus === 'AMBIGUOUS'
                          ? 'bg-amber-100 text-amber-800'
                          : actionStatus === 'NEEDS_CONFIRMATION'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {actionStatus}
                    </span>
                  )}
                </div>
                {lastTargetRoute && (
                  <button
                    onClick={() => onNavigate(lastTargetRoute)}
                    className="text-primary underline font-semibold flex items-center gap-0.5 hover:text-primary/80"
                  >
                    <span>पेज खोलें</span> →
                  </button>
                )}
              </div>
              <p className="text-xs text-ink-900 leading-snug font-medium">
                {detectedLanguage === 'hi'
                  ? assistantReplyHindi
                  : detectedLanguage === 'hinglish'
                  ? assistantReplyHindi || assistantReplyEnglish
                  : assistantReplyEnglish || assistantReplyHindi}
              </p>
            </div>
          )}

          {/* Quick Voice Chips (Context-Aware) */}
          <div>
            <div className="text-[10px] font-semibold text-gray-500 mb-1.5 uppercase flex items-center justify-between">
              <span>
                {effectiveMode === 'FORM'
                  ? 'फॉर्म त्वरित सुझाव (Form Voice Prompts):'
                  : 'नेविगेशन सुझाव (Navigation Prompts):'}
              </span>
              <span className="text-[9px] text-primary/80 lowercase">
                {effectiveMode === 'FORM' ? 'form mode' : 'nav mode'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(effectiveMode === 'FORM' ? formPrompts : navPrompts).map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => executeVoiceCommand(p.query)}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-orange-100 hover:text-primary text-[11px] font-medium text-ink-700 transition-colors border border-gray-200"
                >
                  {language === 'hi' ? p.labelHindi : p.labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
