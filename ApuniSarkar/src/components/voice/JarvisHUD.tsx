import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sliders,
  Radio,
  FileCheck,
} from 'lucide-react';
import { useVoice } from '../../context/VoiceContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { JarvisOrb } from './JarvisOrb';

interface JarvisHUDProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const JarvisHUD: React.FC<JarvisHUDProps> = ({ isOpen, onClose, onNavigate }) => {
  const { language, setLanguage } = useAccessibility();
  const {
    dialogueState,
    isListening,
    isSpeaking,
    isProcessing,
    handsFreeMode,
    setHandsFreeMode,
    toggleHandsFree,
    transcript,
    assistantReplyHindi,
    assistantReplyEnglish,
    activeIntent,
    activeFieldId,
    isConfirmationPending,
    submissionId,
    formSlots,
    conversationHistory,
    clearConversation,
    startListening,
    stopListening,
    toggleListening,
    stopSpeaking,
    executeVoiceCommand,
  } = useVoice();

  const [typedInput, setTypedInput] = useState('');
  const [showTelemetry, setShowTelemetry] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const isFormPage = currentPath.includes('/services/');

  // Auto scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationHistory, dialogueState]);

  // Keyboard shortcut Ctrl+Space or Ctrl+J to toggle listen
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

  const handleSendTyped = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    executeVoiceCommand(typedInput);
    setTypedInput('');
  };

  // Interactive voice suggestion chips
  const quickChips = isFormPage
    ? [
        { label: 'कुलदीप सिंह नेगी', cmd: 'मेरा नाम कुलदीप सिंह नेगी है' },
        { label: 'पिता खुशाल सिंह', cmd: 'पिता जी का नाम खुशाल सिंह' },
        { label: 'वार्षिक आय ₹60,000', cmd: 'मेरी वार्षिक आय साठ हज़ार रुपये है' },
        { label: 'ज़िला देहरादून', cmd: 'ज़िला देहरादून' },
        { label: 'हाँ, सबमिट कर दो', cmd: 'हाँ सबमिट कर दो' },
        { label: 'दस्तावेज़ क्या चाहिए?', cmd: 'दस्तावेज़ क्या चाहिए' },
      ]
    : [
        { label: 'आय प्रमाण पत्र (Income)', cmd: 'मुझे आय प्रमाण पत्र बनवाना है' },
        { label: 'मूल निवास (Domicile)', cmd: 'स्थायी निवास प्रमाण पत्र खोलो' },
        { label: 'परिवार रजिस्टर नकल', cmd: 'परिवार रजिस्टर की नकल' },
        { label: 'ट्रैक आवेदन UK-REV-9812', cmd: 'आवेदन ट्रैक करें UK-REV-2026-9812' },
        { label: 'हेल्पलाइन 1905', cmd: 'सीएम हेल्पलाइन नंबर क्या है' },
        { label: 'शासनादेश (GOs)', cmd: 'महत्वपूर्ण शासनादेश खोलो' },
        { label: 'डैशबोर्ड (Analytics)', cmd: 'राज्य डैशबोर्ड खोलो' },
      ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in pointer-events-auto">
      {/* HUD Container */}
      <div className="relative w-full max-w-xl rounded-3xl bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-black border border-cyan-500/40 shadow-[0_0_50px_rgba(14,165,233,0.35)] text-white overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-scale-in">
        {/* Holographic Top Banner */}
        <div className="relative px-5 py-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-slate-950/80 flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <JarvisOrb dialogueState={dialogueState} onClick={toggleListening} size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-wider bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 bg-clip-text text-transparent">
                  VAANI-JARVIS
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-900/60 border border-cyan-500/40 text-cyan-300">
                  v3.0 HUD
                </span>
              </div>
              <div className="text-[11px] font-mono text-cyan-400/80 flex items-center gap-1.5">
                <span className="inline-block size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>RTS CITIZEN COPILOT &bull; ELEVENLABS v2.5</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Hands-Free Toggle */}
            <button
              onClick={toggleHandsFree}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                handsFreeMode
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Hands-Free Continuous Turn-Taking Mode (Auto-Listen after reply)"
            >
              <Radio className="size-3" />
              <span className="hidden sm:inline">Hands-Free:</span>
              <span>{handsFreeMode ? 'ON' : 'OFF'}</span>
            </button>

            {/* Language switch */}
            <button
              onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
              className="px-2 py-1 rounded-md text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
              title="Switch language"
            >
              {language === 'hi' ? 'English' : 'हिन्दी'}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Close HUD"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Form Progress Checklist HUD (Visible on form pages) */}
        {isFormPage && (
          <div className="px-5 py-2.5 bg-slate-900/60 border-b border-cyan-500/20 text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold">
              <FileCheck className="size-4 text-cyan-400" />
              <span>आय प्रमाण पत्र (Income Certificate Form)</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className={formSlots.applicant_name ? 'text-emerald-400' : 'text-slate-500'}>
                {formSlots.applicant_name ? '✓ नाम' : '○ नाम'}
              </span>
              <span className={formSlots.father_husband_name ? 'text-emerald-400' : 'text-slate-500'}>
                {formSlots.father_husband_name ? '✓ पिता' : '○ पिता'}
              </span>
              <span className={formSlots.annual_income ? 'text-emerald-400' : 'text-slate-500'}>
                {formSlots.annual_income ? '✓ आय' : '○ आय'}
              </span>
              <span className={formSlots.district ? 'text-emerald-400' : 'text-slate-500'}>
                {formSlots.district ? '✓ ज़िला' : '○ ज़िला'}
              </span>
            </div>
          </div>
        )}

        {/* Central Live Dialogue Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 min-h-[220px] max-h-[360px] scrollbar-thin scrollbar-thumb-cyan-900/50">
          {conversationHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-mono text-slate-400">
                <span>{msg.sender === 'user' ? 'नागरिक (Citizen)' : 'VAANI-JARVIS'}</span>
                <span>&bull;</span>
                <span>{msg.time}</span>
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600/30 border border-cyan-400/50 text-cyan-100 rounded-br-none shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-900/90 border border-amber-500/30 text-slate-100 rounded-bl-none shadow-[0_0_15px_rgba(245,158,11,0.12)]'
                }`}
              >
                {msg.text}

                {/* Slots preview badge */}
                {msg.slots && Object.keys(msg.slots).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-1">
                    {Object.entries(msg.slots).map(([k, v]) => (
                      <span
                        key={k}
                        className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-[10px] font-mono text-cyan-300"
                      >
                        {k}: {String(v)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Active Listening / Processing Indicator */}
          {dialogueState === 'LISTENING' && (
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono py-1 px-2 animate-pulse">
              <span className="size-2 rounded-full bg-cyan-400 animate-ping" />
              <span>सुन रहा हूँ... बोलिए (Listening...)</span>
            </div>
          )}

          {dialogueState === 'THINKING' && (
            <div className="flex items-center gap-2 text-sky-300 text-xs font-mono py-1 px-2">
              <div className="size-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span>विश्लेषण कर रहा हूँ... (Processing with ElevenLabs & RTS Catalog)...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Voice Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-cyan-500/20 overflow-x-auto scrollbar-none flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-500/70 shrink-0">
            QUICK PROMPTS:
          </span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => executeVoiceCommand(chip.cmd)}
              className="shrink-0 px-2.5 py-1 rounded-full text-xs bg-slate-900 hover:bg-cyan-950/70 border border-cyan-500/30 text-cyan-200 hover:text-white transition-all hover:scale-105 active:scale-95"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Bar with Mic Trigger */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-cyan-500/30 flex items-center gap-2">
          {/* Main Glowing Mic Button */}
          <button
            onClick={toggleListening}
            className={`relative size-12 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              isListening
                ? 'bg-cyan-500 text-black shadow-[0_0_20px_#22d3ee] scale-110'
                : isSpeaking
                ? 'bg-amber-500 text-black shadow-[0_0_20px_#f59e0b]'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-cyan-500/40'
            }`}
            title="Toggle Mic (Ctrl + Space)"
          >
            {isListening ? (
              <Mic className="size-6 text-slate-950 animate-pulse" />
            ) : isSpeaking ? (
              <Volume2 className="size-6 text-slate-950 animate-bounce" />
            ) : (
              <Mic className="size-5 text-cyan-400" />
            )}
            {isListening && (
              <span className="absolute -inset-1 rounded-full border border-cyan-400 animate-ping" />
            )}
          </button>

          {/* Fallback Text Input Form */}
          <form onSubmit={handleSendTyped} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                placeholder={
                  language === 'hi'
                    ? 'जार्विस से बात करें या कमांड टाइप करें...'
                    : 'Speak to Jarvis or type command...'
                }
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={!typedInput.trim()}
              className="size-10 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors"
            >
              <Send className="size-4" />
            </button>
          </form>

          {/* Stop Speaking / Clear */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="px-2.5 py-2 rounded-xl bg-red-600/20 border border-red-500 text-red-400 hover:bg-red-600/30 text-xs font-semibold shrink-0"
              title="Stop Speaking"
            >
              <VolumeX className="size-4" />
            </button>
          )}
        </div>

        {/* Bottom Telemetry Footer */}
        <div className="px-4 py-1.5 bg-black/90 border-t border-cyan-900/40 text-[10px] font-mono text-cyan-400/60 flex items-center justify-between">
          <span>SHORTCUT: [CTRL + SPACE] TO TALK</span>
          <span>AUTONOMOUS HANDS-FREE LOOP: {handsFreeMode ? 'ENGAGED' : 'PAUSED'}</span>
        </div>
      </div>
    </div>
  );
};

