import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, Volume2, Radio, Globe } from 'lucide-react';
import { useVoice } from '../../context/VoiceContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { ConversationalVoiceOrb } from './ConversationalVoiceOrb';

export const VoiceCopilotDock: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { language, setLanguage } = useAccessibility();
  const {
    dialogueState,
    isListening,
    isSpeaking,
    isProcessing,
    handsFreeMode,
    toggleListening,
    startListening,
    stopListening,
    stopSpeaking,
    assistantReplyHindi,
    assistantReplyEnglish,
    transcript,
    executeVoiceCommand,
  } = useVoice();

  const [modalOpen, setModalOpen] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(true);

  // Keyboard shortcut: Ctrl + Space to trigger conversational listening
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.code === 'Space' || e.key === 'j' || e.key === 'J')) {
        e.preventDefault();
        toggleListening();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleListening]);

  const activeReply = language === 'hi' ? assistantReplyHindi : assistantReplyEnglish;

  return (
    <>
      {/* 1. Ultra-Minimal Floating Conversational Orb (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto select-none">
        {/* Floating Minimal Spoken Subtitle Pill (Clean 1-line feedback) */}
        {(isListening || isSpeaking || isProcessing) && showSubtitle && (
          <div className="max-w-xs sm:max-w-sm rounded-2xl bg-white/95 backdrop-blur-md px-4 py-2.5 text-xs text-slate-800 shadow-xl border border-sky-100 animate-fade-in flex items-start gap-2.5">
            <span
              className={`size-2 rounded-full shrink-0 mt-1 ${
                isListening
                  ? 'bg-sky-500 animate-ping'
                  : isSpeaking
                  ? 'bg-blue-600 animate-pulse'
                  : 'bg-amber-400'
              }`}
            />
            <div className="flex-1 leading-snug">
              {isListening ? (
                <span className="text-sky-700 font-semibold">
                  {language === 'hi' ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak now'}
                </span>
              ) : isProcessing ? (
                <span className="text-slate-500">
                  {language === 'hi' ? 'विश्लेषण हो रहा है...' : 'Processing...'}
                </span>
              ) : (
                <span>{activeReply}</span>
              )}
            </div>
            <button
              onClick={() => setShowSubtitle(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5"
              title="Dismiss"
            >
              <X className="size-3" />
            </button>
          </div>
        )}

        {/* Minimal Orb Trigger Button */}
        <div className="flex items-center gap-2">
          {/* Subtle label pill */}
          <button
            onClick={() => setModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-slate-700 shadow-md border border-slate-200 hover:bg-white transition-all cursor-pointer"
            title="Open Conversational Voice Modal"
          >
            <span className="size-2 rounded-full bg-sky-500 animate-pulse" />
            <span>{language === 'hi' ? 'आवाज सहायक' : 'Voice Agent'}</span>
          </button>

          {/* The ElevenLabs-Style Fluid Blue Orb */}
          <ConversationalVoiceOrb
            dialogueState={dialogueState}
            isListening={isListening}
            isSpeaking={isSpeaking}
            onClick={toggleListening}
            size="md"
          />
        </div>
      </div>

      {/* 2. Focused Minimal Voice Modal (1:1 Exact Match to Uploaded Screenshot) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in pointer-events-auto">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-7 text-left shadow-2xl border border-slate-100 animate-scale-in flex flex-col items-center">
            {/* Top Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              title="Close"
            >
              <X className="size-5" />
            </button>

            {/* Title & Subtitle */}
            <div className="w-full text-left mb-6 pr-6">
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {language === 'hi' ? 'वाणी-सेतु आवाज सहायक' : 'VaaniSetu Voice Agent'}
              </h2>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                {language === 'hi'
                  ? 'उत्तराखंड अपनी सरकार का सहज और प्राकृतिक बातचीत सहायक। किसी भी सेवा के लिए सिर्फ बोलिए।'
                  : 'Hands-free conversational agent for Apuni Sarkar. Speak naturally to navigate or fill forms.'}
              </p>
            </div>

            {/* The Signature Large Fluid Blue Watercolor Orb (Matching Screenshot) */}
            <div className="my-6 flex flex-col items-center justify-center">
              <ConversationalVoiceOrb
                dialogueState={dialogueState}
                isListening={isListening}
                isSpeaking={isSpeaking}
                onClick={toggleListening}
                size="lg"
              />

              {/* Minimal Telemetry Below Orb */}
              <div className="mt-6 flex items-center justify-between w-64 text-xs text-slate-500 font-medium">
                <div className="text-center">
                  <div className="text-[11px] text-slate-400">
                    {language === 'hi' ? 'स्थिति' : 'Status'}
                  </div>
                  <div className="font-semibold text-slate-700">
                    {isListening
                      ? 'Listening'
                      : isSpeaking
                      ? 'Speaking'
                      : isProcessing
                      ? 'Thinking'
                      : 'Standby'}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-[11px] text-slate-400">
                    {language === 'hi' ? 'माध्यम' : 'Engine'}
                  </div>
                  <div className="font-semibold text-sky-600">ElevenLabs</div>
                </div>
              </div>
            </div>

            {/* Current Speech Subtitle */}
            <div className="w-full min-h-[44px] flex items-center justify-center text-center px-2 mb-4">
              <p className="text-xs text-slate-600 italic">
                {isListening
                  ? language === 'hi'
                    ? 'सुन रहा हूँ... बोलिए'
                    : 'Listening... Please speak'
                  : activeReply}
              </p>
            </div>

            {/* Main Action Button (Black Pill, Exact match to "Create new" in screenshot) */}
            <button
              onClick={toggleListening}
              className={`w-full py-3.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                isListening
                  ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200'
                  : isSpeaking
                  ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-200'
                  : 'bg-black text-white hover:bg-slate-900'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="size-4" />
                  <span>{language === 'hi' ? 'बोलना रोकें' : 'Stop Listening'}</span>
                </>
              ) : isSpeaking ? (
                <>
                  <Volume2 className="size-4" />
                  <span>{language === 'hi' ? 'आवाज बंद करें' : 'Mute Speech'}</span>
                </>
              ) : (
                <>
                  <Mic className="size-4" />
                  <span>{language === 'hi' ? 'बातचीत शुरू करें' : 'Start Speaking'}</span>
                </>
              )}
            </button>

            {/* Language toggle at bottom */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
              <Globe className="size-3.5" />
              <button
                onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
                className="hover:text-slate-900 underline font-medium"
              >
                {language === 'hi' ? 'Switch to English' : 'हिन्दी में बात करें'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
