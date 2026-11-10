import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { VoiceState, ChatMessage } from '../types/frontend';
import { useAccessibility } from './AccessibilityContext';
import { jarvisAudio } from '../utils/jarvisSoundFx';

interface VoiceContextType extends VoiceState {
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  speakText: (text: string, lang?: 'hi' | 'en') => Promise<void>;
  stopSpeaking: () => void;
  executeVoiceCommand: (transcriptText: string, customFormContext?: any) => Promise<any>;
  registerSlotListener: (callback: (slots: Record<string, any>) => void) => () => void;
  navigationHandler: ((route: string) => void) | null;
  setNavigationHandler: (handler: (route: string) => void) => void;
  setHandsFreeMode: (enabled: boolean) => void;
  toggleHandsFree: () => void;
  setActiveFieldId: (fieldId?: string) => void;
  clearConversation: () => void;
  formSlots: Record<string, any>;
  updateFormSlot: (key: string, value: any) => void;
  sessionId: string;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useAccessibility();

  // Persistent session identifier across turns
  const [sessionId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      let sid = sessionStorage.getItem('vaani_session_id');
      if (!sid) {
        sid = `uk_ses_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        sessionStorage.setItem('vaani_session_id', sid);
      }
      return sid;
    }
    return `uk_ses_${Date.now()}`;
  });

  const [formSlots, setFormSlots] = useState<Record<string, any>>({});
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    handsFreeMode: true, // Continuous Speech Engine turn-taking enabled by default
    dialogueState: 'IDLE',
    transcript: '',
    assistantReplyHindi:
      'नमस्ते! मैं अपनी सरकार का AI सहायक वाणी-सेतु हूँ। बोलिए, मैं क्या सहायता करूँ?',
    assistantReplyEnglish:
      'Hello! I am VaaniSetu, your conversational assistant for Apuni Sarkar. How may I assist you today?',
    conversationHistory: [
      {
        id: 'msg_0',
        sender: 'jarvis',
        text:
          language === 'hi'
            ? 'नमस्ते! मैं अपनी सरकार का AI सहायक हूँ। आप बोलकर किसी भी सेवा का आवेदन कर सकते हैं, जैसे "आय प्रमाण पत्र", "स्थिति जांचें", या "हेल्पलाइन नंबर"।'
            : 'Hello! I am Apuni Sarkar AI assistant. You can speak naturally to apply for any service like "Income Certificate", "Track Application", or "Helpline 1905".',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
  });

  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const slotListenersRef = useRef<Array<(slots: Record<string, any>) => void>>([]);
  const [navigationHandler, setNavHandlerState] = useState<((route: string) => void) | null>(null);
  const shouldAutoListenNextRef = useRef<boolean>(false);
  const handsFreeRef = useRef<boolean>(true);
  const formSlotsRef = useRef<Record<string, any>>({});
  const activeFieldIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    handsFreeRef.current = state.handsFreeMode;
  }, [state.handsFreeMode]);

  useEffect(() => {
    formSlotsRef.current = formSlots;
  }, [formSlots]);

  useEffect(() => {
    activeFieldIdRef.current = state.activeFieldId;
  }, [state.activeFieldId]);

  // Audio Context Unlocker on First User Gesture
  useEffect(() => {
    const unlockAudio = () => {
      jarvisAudio.playListeningCue();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Initialize SpeechRecognition with Interruption Handling (Barge-in)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setState((prev) => ({
          ...prev,
          isListening: true,
          dialogueState: 'LISTENING',
          error: undefined,
        }));
      };

      // [⇆ INTERRUPTION HANDLING (BARGE-IN)]
      // The moment the citizen starts talking while assistant is speaking, halt audio output instantly!
      recognition.onspeechstart = () => {
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          audioPlayerRef.current = null;
        }
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        setState((prev) => ({ ...prev, isSpeaking: false }));
      };

      recognition.onresult = (event: any) => {
        // [⇆ INTERRUPTION HANDLING]
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          audioPlayerRef.current = null;
        }
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        setState((prev) => ({ ...prev, isSpeaking: false }));

        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setState((prev) => ({ ...prev, transcript }));

        if (event.results[current].isFinal) {
          executeVoiceCommand(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[VoiceContext] Speech recognition error:', event.error);
        setState((prev) => ({
          ...prev,
          isListening: false,
          dialogueState: 'IDLE',
          error: event.error,
        }));
      };

      recognition.onend = () => {
        setState((prev) => ({
          ...prev,
          isListening: false,
          dialogueState: prev.isSpeaking ? 'SPEAKING' : prev.isProcessing ? 'THINKING' : 'IDLE',
        }));
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const startListening = useCallback(() => {
    stopSpeaking();
    jarvisAudio.playWakeChime();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        recognitionRef.current.start();
        setState((prev) => ({
          ...prev,
          isListening: true,
          dialogueState: 'LISTENING',
        }));
      } catch (err) {
        console.warn('Recognition start caught error:', err);
      }
    } else {
      // Prompt modal fallback when browser mic permission is gated
      const sample = prompt(
        language === 'hi'
          ? 'अपनी सरकार आवाज कमांड बोलें या टाइप करें (उदा. "आय प्रमाण पत्र", "रमेश कुमार नेगी", "साठ हज़ार", "हाँ सबमिट कर दो"):'
          : 'Speak or type voice command for Apuni Sarkar (e.g. "Income Certificate", "Kuldeep Singh", "60000", "Yes submit"):',
        'आय प्रमाण पत्र'
      );
      if (sample) {
        executeVoiceCommand(sample);
      }
    }
  }, [language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }
    setState((prev) => ({
      ...prev,
      isListening: false,
      dialogueState: prev.isSpeaking ? 'SPEAKING' : 'IDLE',
    }));
  }, []);

  const toggleListening = useCallback(() => {
    if (state.isListening) stopListening();
    else startListening();
  }, [state.isListening, stopListening, startListening]);

  const stopSpeaking = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setState((prev) => ({
      ...prev,
      isSpeaking: false,
      dialogueState: prev.isListening ? 'LISTENING' : 'IDLE',
    }));
  }, []);

  const setHandsFreeMode = (enabled: boolean) => {
    handsFreeRef.current = enabled;
    setState((prev) => ({ ...prev, handsFreeMode: enabled }));
  };

  const toggleHandsFree = () => {
    setHandsFreeMode(!state.handsFreeMode);
  };

  const setActiveFieldId = (fieldId?: string) => {
    activeFieldIdRef.current = fieldId;
    setState((prev) => ({ ...prev, activeFieldId: fieldId }));
  };

  const updateFormSlot = (key: string, value: any) => {
    setFormSlots((prev) => {
      const next = { ...prev, [key]: value };
      formSlotsRef.current = next;
      return next;
    });

    // Real DOM Input Injection
    if (typeof document !== 'undefined') {
      const el = document.getElementById(key) as HTMLInputElement | HTMLSelectElement | null;
      if (el) {
        el.value = String(value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  const clearConversation = () => {
    setState((prev) => ({
      ...prev,
      conversationHistory: [],
    }));
  };

  /**
   * Conversational Streaming / Synthesized Voice Output via ElevenLabs
   */
  const speakText = async (text: string, lang?: 'hi' | 'en'): Promise<void> => {
    stopSpeaking();
    setState((prev) => ({
      ...prev,
      isSpeaking: true,
      dialogueState: 'SPEAKING',
    }));
    const speechLang = lang || language;

    try {
      // Call ElevenLabs with Alice premade voice (verified 200 OK from ElevenLabs API)
      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId: 'Xb7hH8MSUJpSbSDYk0k2',
          language: speechLang,
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioPlayerRef.current = audio;

        audio.onended = () => {
          setState((prev) => ({
            ...prev,
            isSpeaking: false,
            dialogueState: 'IDLE',
          }));
          URL.revokeObjectURL(audioUrl);

          // CONTINUOUS HANDS-FREE TURN-TAKING:
          // Immediately after assistant finishes speaking, trigger listening cue and open microphone
          if (handsFreeRef.current && shouldAutoListenNextRef.current) {
            setTimeout(() => {
              jarvisAudio.playListeningCue();
              startListening();
            }, 300);
          }
        };

        audio.onerror = (e) => {
          console.warn('[VoiceContext] Audio stream error, falling back to Web Speech API:', e);
          fallbackBrowserSpeech(text, speechLang);
        };

        try {
          await audio.play();
          return;
        } catch (playErr) {
          console.warn('[VoiceContext] Audio playback blocked by browser gesture restriction, using Web Speech API:', playErr);
          fallbackBrowserSpeech(text, speechLang);
          return;
        }
      }
    } catch (err) {
      console.warn('[VoiceContext] Backend TTS error, falling back to Web Speech API:', err);
    }

    fallbackBrowserSpeech(text, speechLang);
  };

  const fallbackBrowserSpeech = (text: string, lang: 'hi' | 'en') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 1.0;
      utterance.onend = () => {
        setState((prev) => ({
          ...prev,
          isSpeaking: false,
          dialogueState: 'IDLE',
        }));
        if (handsFreeRef.current && shouldAutoListenNextRef.current) {
          setTimeout(() => {
            jarvisAudio.playListeningCue();
            startListening();
          }, 300);
        }
      };
      utterance.onerror = () => {
        setState((prev) => ({ ...prev, isSpeaking: false, dialogueState: 'IDLE' }));
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setState((prev) => ({ ...prev, isSpeaking: false, dialogueState: 'IDLE' }));
    }
  };

  /**
   * Execute voice command through stateful backend session
   */
  const executeVoiceCommand = async (transcriptText: string, customFormContext?: any) => {
    if (!transcriptText || !transcriptText.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: transcriptText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setState((prev) => ({
      ...prev,
      transcript: transcriptText,
      isProcessing: true,
      dialogueState: 'THINKING',
      error: undefined,
      conversationHistory: [...prev.conversationHistory, userMsg],
    }));

    try {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

      const formContextPayload = customFormContext || {
        formId: currentPath.split('/').pop() || 'general',
        activeFieldId: activeFieldIdRef.current,
        filledFields: formSlotsRef.current,
      };

      const response = await fetch('/api/voice/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcriptText,
          sessionId,
          currentRoute: currentPath,
          formContext: formContextPayload,
        }),
      });

      if (!response.ok) {
        throw new Error(`Intent router error: ${response.status}`);
      }

      const data = await response.json();
      const replyHindi = data.spokenResponseHindi;
      const replyEnglish = data.spokenResponseEnglish;

      // Update auto-listen trigger for hands-free loop
      shouldAutoListenNextRef.current = Boolean(data.shouldAutoListen);

      // Real Form Filling: Populate slots into React and Real DOM Inputs!
      if (data.extractedSlots && Object.keys(data.extractedSlots).length > 0) {
        jarvisAudio.playSuccessChime();
        setFormSlots((prev) => {
          const merged = { ...prev, ...data.extractedSlots };
          formSlotsRef.current = merged;
          return merged;
        });

        // 1. Broadcast to React listeners
        slotListenersRef.current.forEach((listener) => listener(data.extractedSlots));

        // 2. Direct DOM Input Injection (guarantees real input elements display values)
        Object.entries(data.extractedSlots).forEach(([key, val]) => {
          if (typeof document !== 'undefined') {
            const inputEl = document.getElementById(key) as HTMLInputElement | HTMLSelectElement | null;
            if (inputEl) {
              inputEl.value = String(val);
              inputEl.dispatchEvent(new Event('input', { bubbles: true }));
              inputEl.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        });
      }

      if (data.isFormSubmitted) {
        jarvisAudio.playSuccessChime();
      }

      const jarvisMsg: ChatMessage = {
        id: `jar_${Date.now()}`,
        sender: 'jarvis',
        text: language === 'hi' ? replyHindi : replyEnglish,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: data.intent,
        slots: data.extractedSlots,
      };

      setState((prev) => ({
        ...prev,
        isProcessing: false,
        activeIntent: data.intent,
        lastTargetRoute: data.targetRoute,
        activeFieldId: data.activeFieldId || prev.activeFieldId,
        isConfirmationPending: Boolean(data.isConfirmationPending),
        submissionId: data.submissionId || prev.submissionId,
        assistantReplyHindi: replyHindi,
        assistantReplyEnglish: replyEnglish,
        conversationHistory: [...prev.conversationHistory, jarvisMsg],
      }));

      // Speak assistant reply aloud via ElevenLabs
      const replyToSpeak = language === 'hi' ? replyHindi : replyEnglish;
      await speakText(replyToSpeak, language);

      // Execute Navigation if returned
      if (data.targetRoute && data.targetRoute !== currentPath && navigationHandler) {
        setTimeout(() => {
          navigationHandler(data.targetRoute);
        }, 1000);
      }

      return data;
    } catch (err: any) {
      console.error('[VoiceContext] Error executing voice command:', err);
      setState((prev) => ({
        ...prev,
        isProcessing: false,
        dialogueState: 'IDLE',
        error: err.message,
      }));
    }
  };

  const registerSlotListener = (callback: (slots: Record<string, any>) => void) => {
    slotListenersRef.current.push(callback);
    return () => {
      slotListenersRef.current = slotListenersRef.current.filter((cb) => cb !== callback);
    };
  };

  const setNavigationHandler = (handler: (route: string) => void) => {
    setNavHandlerState(() => handler);
  };

  return (
    <VoiceContext.Provider
      value={{
        ...state,
        sessionId,
        startListening,
        stopListening,
        toggleListening,
        speakText,
        stopSpeaking,
        executeVoiceCommand,
        registerSlotListener,
        navigationHandler,
        setNavigationHandler,
        setHandsFreeMode,
        toggleHandsFree,
        setActiveFieldId,
        clearConversation,
        formSlots,
        updateFormSlot,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = (): VoiceContextType => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
