import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { VoiceState } from '../types/frontend';
import { useAccessibility } from './AccessibilityContext';

interface VoiceContextType extends VoiceState {
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  speakText: (text: string, lang?: 'hi' | 'en') => Promise<void>;
  stopSpeaking: () => void;
  executeVoiceCommand: (transcriptText: string) => Promise<any>;
  registerSlotListener: (callback: (slots: Record<string, any>) => void) => () => void;
  navigationHandler: ((route: string) => void) | null;
  setNavigationHandler: (handler: (route: string) => void) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useAccessibility();
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    transcript: '',
    assistantReplyHindi: 'नमस्ते! मैं अपनी सरकार वाणी-सेतु आवाज सहायक हूँ। बोलिए, मैं आपकी क्या सहायता कर सकता हूँ?',
    assistantReplyEnglish: 'Hello! I am Apuni Sarkar VaaniSetu voice assistant. How may I assist you today?',
  });

  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const slotListenersRef = useRef<Array<(slots: Record<string, any>) => void>>([]);
  const [navigationHandler, setNavHandlerState] = useState<((route: string) => void) | null>(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setState((prev) => ({ ...prev, isListening: true, error: undefined }));
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setState((prev) => ({ ...prev, transcript }));

        if (event.results[current].isFinal) {
          executeVoiceCommand(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[VoiceContext] Speech recognition error:', event.error);
        setState((prev) => ({ ...prev, isListening: false, error: event.error }));
      };

      recognition.onend = () => {
        setState((prev) => ({ ...prev, isListening: false }));
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const startListening = () => {
    stopSpeaking();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    } else {
      // Mock prompt for testing when microphone is unavailable in browser
      const sample = prompt('Enter voice command (e.g. "आय प्रमाण पत्र", "ट्रैक करें UK-REV-2026-9812", "हेल्पलाइन नंबर"):', 'आय प्रमाण पत्र');
      if (sample) {
        executeVoiceCommand(sample);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }
    setState((prev) => ({ ...prev, isListening: false }));
  };

  const toggleListening = () => {
    if (state.isListening) stopListening();
    else startListening();
  };

  const stopSpeaking = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setState((prev) => ({ ...prev, isSpeaking: false }));
  };

  const speakText = async (text: string, lang?: 'hi' | 'en'): Promise<void> => {
    stopSpeaking();
    setState((prev) => ({ ...prev, isSpeaking: true }));
    const speechLang = lang || language;

    try {
      // 1. Call Backend ElevenLabs proxy endpoint with Key Rotation & Audio Hash Caching
      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: speechLang,
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioPlayerRef.current = audio;

        audio.onended = () => {
          setState((prev) => ({ ...prev, isSpeaking: false }));
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
          console.warn('[VoiceContext] Audio stream error, falling back to Web Speech API');
          fallbackBrowserSpeech(text, speechLang);
        };

        await audio.play();
        return;
      }
    } catch (err) {
      console.warn('[VoiceContext] Backend TTS unreachable, falling back to Web Speech API:', err);
    }

    // 2. Fail-safe Fallback: Web Speech API
    fallbackBrowserSpeech(text, speechLang);
  };

  const fallbackBrowserSpeech = (text: string, lang: 'hi' | 'en') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 1.0;
      utterance.onend = () => {
        setState((prev) => ({ ...prev, isSpeaking: false }));
      };
      utterance.onerror = () => {
        setState((prev) => ({ ...prev, isSpeaking: false }));
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setState((prev) => ({ ...prev, isSpeaking: false }));
    }
  };

  const executeVoiceCommand = async (transcriptText: string) => {
    setState((prev) => ({
      ...prev,
      transcript: transcriptText,
      isProcessing: true,
      error: undefined,
    }));

    try {
      const currentPath = window.location.pathname;
      const response = await fetch('/api/voice/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcriptText,
          currentRoute: currentPath,
        }),
      });

      if (!response.ok) {
        throw new Error(`Intent router error: ${response.status}`);
      }

      const data = await response.json();
      const replyHindi = data.spokenResponseHindi;
      const replyEnglish = data.spokenResponseEnglish;

      setState((prev) => ({
        ...prev,
        isProcessing: false,
        activeIntent: data.intent,
        lastTargetRoute: data.targetRoute,
        assistantReplyHindi: replyHindi,
        assistantReplyEnglish: replyEnglish,
      }));

      // Speak assistant reply in user's active language
      const replyToSpeak = language === 'hi' ? replyHindi : replyEnglish;
      await speakText(replyToSpeak, language);

      // Perform Navigation if returned
      if (data.targetRoute && data.targetRoute !== currentPath && navigationHandler) {
        setTimeout(() => {
          navigationHandler(data.targetRoute);
        }, 1200);
      }

      // If slots are extracted, notify form listeners
      if (data.extractedSlots && Object.keys(data.extractedSlots).length > 0) {
        slotListenersRef.current.forEach((listener) => listener(data.extractedSlots));
      }

      return data;
    } catch (err: any) {
      console.error('[VoiceContext] Error executing voice command:', err);
      setState((prev) => ({
        ...prev,
        isProcessing: false,
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
        startListening,
        stopListening,
        toggleListening,
        speakText,
        stopSpeaking,
        executeVoiceCommand,
        registerSlotListener,
        navigationHandler,
        setNavigationHandler,
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

