import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { VoiceState } from '../types/frontend';
import { useAccessibility } from './AccessibilityContext';
import { LanguageDetector, DetectedLanguage } from '../services/LanguageDetector';
import { RouteRegistry, RouteResolution } from '../services/RouteRegistry';
import { FormInteractionEngine, FormActionResult } from '../services/FormInteractionEngine';

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
  voiceMode: 'AUTO' | 'FORM' | 'NAVIGATION';
  setVoiceMode: (mode: 'AUTO' | 'FORM' | 'NAVIGATION') => void;
  activeFocusedField: string | null;
  startFieldDictation: (fieldId: string, promptText?: string) => void;
  recognitionLang: 'en-IN' | 'hi-IN';
  setRecognitionLang: (lang: 'en-IN' | 'hi-IN') => void;
  activeFieldId?: string;
  setActiveFieldId?: (fieldId?: string) => void;
  isConfirmationPending?: boolean;
  submissionId?: string;
  formSlots?: Record<string, any>;
  updateFormSlot?: (key: string, value: any) => void;
  clearConversation?: () => void;
  sessionId?: string;
  setHandsFreeMode?: (enabled: boolean) => void;
  toggleHandsFree?: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language: uiLanguage } = useAccessibility();
  const [voiceMode, setVoiceMode] = useState<'AUTO' | 'FORM' | 'NAVIGATION'>('AUTO');
  const [activeFocusedField, setActiveFocusedField] = useState<string | null>(null);
  const [activeFieldId, setActiveFieldId] = useState<string | undefined>(undefined);
  const [formSlots, setFormSlots] = useState<Record<string, any>>({});
  const [sessionId] = useState<string>(() => `uk_ses_${Date.now()}`);
  const updateFormSlot = (key: string, value: any) => {
    setFormSlots((prev) => ({ ...prev, [key]: value }));
  };
  const clearConversation = () => {
    setFormSlots({});
  };
  const setHandsFreeMode = (_enabled: boolean) => {};
  const toggleHandsFree = () => {};
  const [recognitionLang, setRecognitionLangState] = useState<'en-IN' | 'hi-IN'>(
    uiLanguage === 'hi' ? 'hi-IN' : 'en-IN'
  );

  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    transcript: '',
    assistantReplyHindi: 'नमस्ते! मैं अपनी सरकार वाणी-सेतु आवाज सहायक हूँ। बोलिए, मैं आपकी क्या सहायता कर सकता हूँ?',
    assistantReplyEnglish: 'Hello! I am Apuni Sarkar VaaniSetu voice assistant. How may I assist you today?',
    detectedLanguage: 'en',
    actionStatus: undefined,
    voiceMode: 'AUTO',
    activeFocusedField: null,
    recognitionLang: uiLanguage === 'hi' ? 'hi-IN' : 'en-IN',
  });

  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const slotListenersRef = useRef<Array<(slots: Record<string, any>) => void>>([]);
  const [navigationHandler, setNavHandlerState] = useState<((route: string) => void) | null>(null);
  const navHandlerRef = useRef<((route: string) => void) | null>(null);

  // Lifecyle & Silence Detection Refs
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isListeningRef = useRef<boolean>(false);
  const isExecutingRef = useRef<boolean>(false);
  const accumulatedTranscriptRef = useRef<string>('');
  const lastExecutedTextRef = useRef<string>('');

  useEffect(() => {
    navHandlerRef.current = navigationHandler;
  }, [navigationHandler]);

  // Keep recognition language synced with state
  const setRecognitionLang = (lang: 'en-IN' | 'hi-IN') => {
    setRecognitionLangState(lang);
    setState((prev) => ({ ...prev, recognitionLang: lang }));
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = lang;
      } catch (e) {}
    }
  };

  // Keep default language synced with accessibility context language when user switches UI
  useEffect(() => {
    const lang = uiLanguage === 'hi' ? 'hi-IN' : 'en-IN';
    setRecognitionLangState(lang);
    setState((prev) => ({ ...prev, recognitionLang: lang }));
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = lang;
      } catch (e) {}
    }
  }, [uiLanguage]);

  // Initialize focus tracker for contextual voice form filling
  useEffect(() => {
    FormInteractionEngine.initFocusTracker();
  }, []);

  // Initialize SpeechRecognition with Continuous Listening & 1400ms Silence Debounce
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      // continuous = true prevents browser from prematurely killing the session on natural pauses
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = recognitionLang;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setState((prev) => ({ ...prev, isListening: true, error: undefined }));
      };

      recognition.onresult = (event: any) => {
        // Collect entire transcript across current session
        let interim = '';
        let final = '';
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            final += res[0].transcript + ' ';
          } else {
            interim += res[0].transcript + ' ';
          }
        }
        const fullTranscript = (final + interim).trim();
        accumulatedTranscriptRef.current = fullTranscript;

        // Provide real-time streaming visual feedback to citizen
        setState((prev) => ({ ...prev, transcript: fullTranscript }));

        // Clear previous silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }

        // Natural speech pause tolerance (1400ms silence detection)
        // Allows elderly/rural citizens to speak naturally without words being cut off
        silenceTimerRef.current = setTimeout(() => {
          const textToExecute = accumulatedTranscriptRef.current.trim();
          if (
            textToExecute &&
            !isExecutingRef.current &&
            textToExecute !== lastExecutedTextRef.current
          ) {
            isExecutingRef.current = true;
            lastExecutedTextRef.current = textToExecute;
            stopListening();
            executeVoiceCommand(textToExecute).finally(() => {
              isExecutingRef.current = false;
            });
          }
        }, 1400);
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // Normal background silence, ignore
          return;
        }
        console.warn('[VoiceContext] Speech recognition error:', event.error);
        setState((prev) => ({ ...prev, isListening: false, error: event.error }));
      };

      recognition.onend = () => {
        // If silence timer was still pending when session ended, execute pending transcript
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
          const textToExecute = accumulatedTranscriptRef.current.trim();
          if (
            textToExecute &&
            !isExecutingRef.current &&
            textToExecute !== lastExecutedTextRef.current
          ) {
            isExecutingRef.current = true;
            lastExecutedTextRef.current = textToExecute;
            executeVoiceCommand(textToExecute).finally(() => {
              isExecutingRef.current = false;
            });
            setState((prev) => ({ ...prev, isListening: false }));
            return;
          }
        }

        // If continuous listening was active and interrupted unexpectedly (browser buffer cycling), auto-restart
        if (isListeningRef.current && !isExecutingRef.current) {
          try {
            recognition.start();
            return;
          } catch (e) {
            // Ignored
          }
        }

        setState((prev) => ({ ...prev, isListening: false }));
      };

      recognitionRef.current = recognition;
    }
  }, [recognitionLang]);

  const startListening = () => {
    stopSpeaking();
    accumulatedTranscriptRef.current = '';
    lastExecutedTextRef.current = '';
    isListeningRef.current = true;
    isExecutingRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    } else {
      // Mock prompt fallback when microphone is unavailable in browser
      const sample = prompt(
        'Enter voice command (e.g. "Go to Download Certificate page", "Enter Vimal in the name field", "आय प्रमाण पत्र", "ट्रैक करें UK-REV-2026-9812"):',
        'Go to Download Certificate page'
      );
      if (sample) {
        executeVoiceCommand(sample);
      }
    }
  };

  const stopListening = () => {
    isListeningRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
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
    const speechLang = lang || 'hi';

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

  /**
   * Helper to select response text matching the user's detected language
   */
  const pickResponse = (
    detected: DetectedLanguage,
    en: string,
    hi: string,
    hinglish?: string
  ): string => {
    if (detected === 'en') return en;
    if (detected === 'hinglish') return hinglish || hi;
    return hi;
  };

  /**
   * Master Voice Command Execution Pipeline
   * User speech -> Language detection -> Intent & Entity extraction -> Action validation
   * -> Action execution -> Result verification -> Localized response -> Speech output
   */
  const executeVoiceCommand = async (transcriptText: string): Promise<any> => {
    if (!transcriptText || !transcriptText.trim()) return;

    const trimmed = transcriptText.trim();

    // 1. AUTOMATIC LANGUAGE DETECTION (CRITICAL: happens before response generation)
    const detectedLang: DetectedLanguage = LanguageDetector.detect(trimmed);
    const ttsLang = LanguageDetector.toTtsLanguage(detectedLang);

    setState((prev) => ({
      ...prev,
      transcript: trimmed,
      isProcessing: true,
      detectedLanguage: detectedLang,
      error: undefined,
    }));

    const currentPath = window.location.pathname || '/';
    const lower = trimmed.toLowerCase();

    // 2. CHECK FOR VOICE MODE TOGGLE DIRECTIVES
    if (
      lower.includes('switch to form mode') ||
      lower.includes('form mode on') ||
      lower.includes('switch to form filling') ||
      lower.includes('form filling mode') ||
      lower.includes('फॉर्म मोड') ||
      lower.includes('फॉर्म भरो')
    ) {
      setVoiceMode('FORM');
      const msg = pickResponse(
        detectedLang,
        'Form filling mode activated. You can speak any field name and value.',
        'फॉर्म भरने का मोड सक्रिय कर दिया गया है। आप कोई भी फ़ील्ड और उसका विवरण बोल सकते हैं।',
        'Form filling mode active kar diya gaya hai. Aap kisi bhi field ki details bol sakte hain.'
      );
      setState((prev) => ({
        ...prev,
        isProcessing: false,
        actionStatus: 'SUCCESS',
        activeIntent: 'SWITCH_MODE',
        voiceMode: 'FORM',
        assistantReplyEnglish: 'Form filling mode activated. You can speak any field name and value.',
        assistantReplyHindi: 'फॉर्म भरने का मोड सक्रिय कर दिया गया है। आप कोई भी फ़ील्ड और उसका विवरण बोल सकते हैं।',
      }));
      await speakText(msg, ttsLang);
      return;
    }

    if (
      lower.includes('switch to navigation mode') ||
      lower.includes('navigation mode on') ||
      lower.includes('switch to nav mode') ||
      lower.includes('nav mode') ||
      lower.includes('नेविगेशन मोड') ||
      lower.includes('पेज खोलो')
    ) {
      setVoiceMode('NAVIGATION');
      const msg = pickResponse(
        detectedLang,
        'Navigation mode activated. Where would you like to go?',
        'नेविगेशन मोड सक्रिय कर दिया गया है। आप किस पृष्ठ पर जाना चाहते हैं?',
        'Navigation mode active ho gaya hai. Aap kaun se page par jana chahte hain?'
      );
      setState((prev) => ({
        ...prev,
        isProcessing: false,
        actionStatus: 'SUCCESS',
        activeIntent: 'SWITCH_MODE',
        voiceMode: 'NAVIGATION',
        assistantReplyEnglish: 'Navigation mode activated. Where would you like to go?',
        assistantReplyHindi: 'नेविगेशन मोड सक्रिय कर दिया गया है। आप किस पृष्ठ पर जाना चाहते हैं?',
      }));
      await speakText(msg, ttsLang);
      return;
    }

    // 3. CHECK FOR TARGETED SINGLE-FIELD DICTATION
    if (activeFocusedField) {
      const targetFieldId = activeFocusedField;
      setActiveFocusedField(null);
      const formResult: FormActionResult = FormInteractionEngine.executeFormCommand(trimmed, targetFieldId);

      const replyToSpeak = pickResponse(
        detectedLang,
        formResult.messageEn,
        formResult.messageHi,
        formResult.messageHinglish
      );

      setState((prev) => ({
        ...prev,
        isProcessing: false,
        actionStatus: formResult.status,
        activeIntent: 'FORM_ACTION',
        activeFocusedField: null,
        assistantReplyEnglish: formResult.messageEn,
        assistantReplyHindi: formResult.messageHi,
      }));

      if (formResult.status === 'SUCCESS' && formResult.fieldId && formResult.updatedValue !== undefined) {
        const slotPayload: Record<string, any> = { [formResult.fieldId]: formResult.updatedValue };
        slotListenersRef.current.forEach((cb) => cb(slotPayload));
      }

      await speakText(replyToSpeak, ttsLang);
      return formResult;
    }

    // 4. CHECK VISIBLE FORM FIELDS & PRIORITIZE FORM INTERACTION
    const visibleFields = FormInteractionEngine.getVisibleFields();
    // Only dedicated application form pages are treated as form filling contexts (/all-services is a catalog directory)
    const isFormPage =
      currentPath !== '/all-services' &&
      !currentPath.startsWith('/all-services') &&
      (currentPath.startsWith('/services/revenue/') ||
       currentPath.startsWith('/services/panchayati-raj/') ||
       currentPath.startsWith('/forms/'));

    const isExplicitNavigation =
      voiceMode === 'NAVIGATION' ||
      lower.startsWith('go to ') ||
      lower.startsWith('go ') ||
      lower.startsWith('open ') ||
      lower.startsWith('take me to ') ||
      lower.startsWith('navigate to ') ||
      lower.startsWith('return to ') ||
      lower.startsWith('i want to go to ') ||
      lower.startsWith('i want to open ') ||
      lower.startsWith('i want to see ') ||
      lower.startsWith('i want to ') ||
      lower.startsWith('show me ') ||
      lower.startsWith('show ') ||
      lower.startsWith('search for ') ||
      lower.startsWith('search ') ||
      lower.startsWith('apply for ') ||
      lower.startsWith('wapas ') ||
      lower.startsWith('mujhe ') ||
      lower.startsWith('kripya ') ||
      lower.startsWith('hume ') ||
      lower.startsWith('humko ') ||
      lower.startsWith('main ') ||
      lower.startsWith('कृपया ') ||
      lower.startsWith('मुझे ') ||
      lower.startsWith('हमे ') ||
      lower.startsWith('हमको ') ||
      lower.startsWith('मैं ') ||
      lower.endsWith(' kholo') ||
      lower.endsWith(' jao') ||
      lower.endsWith(' dikhao') ||
      lower.endsWith(' le chalo') ||
      lower.endsWith(' jana hai') ||
      lower.endsWith(' chahiye') ||
      lower.endsWith(' kholein') ||
      lower.endsWith(' dikhaiye') ||
      lower.endsWith(' खोलो') ||
      lower.endsWith(' खोलें') ||
      lower.endsWith(' खोलिए') ||
      lower.endsWith(' जाओ') ||
      lower.endsWith(' दिखाओ') ||
      lower.endsWith(' दिखाइए') ||
      lower.endsWith(' ले चलो') ||
      lower.endsWith(' जाना है') ||
      lower.endsWith(' चाहिए') ||
      lower.includes(' par jana hai') ||
      lower.includes(' ke page par') ||
      lower.includes(' ke page') ||
      lower.includes(' के पेज पर') ||
      lower.includes(' के पेज') ||
      lower.includes(' पेज पर') ||
      lower.includes(' पेज खोलो') ||
      lower.includes(' पृष्ठ पर') ||
      lower.includes(' पृष्ठ') ||
      lower === 'back' ||
      lower === 'वापस' ||
      lower === 'peeche' ||
      lower === 'dashboard' ||
      lower === 'डैशबोर्ड' ||
      lower === 'home' ||
      lower === 'होम';

    const shouldPrioritizeForm =
      voiceMode === 'FORM' || (voiceMode === 'AUTO' && isFormPage && !isExplicitNavigation);

    if (shouldPrioritizeForm && visibleFields.length > 0) {
      const formResult: FormActionResult = FormInteractionEngine.executeFormCommand(trimmed);

      if (
        formResult.status === 'SUCCESS' ||
        formResult.status === 'AMBIGUOUS' ||
        formResult.status === 'NEEDS_CONFIRMATION'
      ) {
        const replyToSpeak = pickResponse(
          detectedLang,
          formResult.messageEn,
          formResult.messageHi,
          formResult.messageHinglish
        );

        setState((prev) => ({
          ...prev,
          isProcessing: false,
          actionStatus: formResult.status,
          activeIntent: 'FORM_ACTION',
          assistantReplyEnglish: formResult.messageEn,
          assistantReplyHindi: formResult.messageHi,
        }));

        if (formResult.status === 'SUCCESS' && formResult.fieldId && formResult.updatedValue !== undefined) {
          const slotPayload: Record<string, any> = { [formResult.fieldId]: formResult.updatedValue };
          slotListenersRef.current.forEach((cb) => cb(slotPayload));
        }

        await speakText(replyToSpeak, ttsLang);
        return formResult;
      }
    }

    // 5. CENTRALIZED ROUTE RESOLUTION
    const routeRes: RouteResolution = RouteRegistry.resolve(trimmed);

    // If ambiguous navigation intent
    if (routeRes.status === 'AMBIGUOUS') {
      const replyToSpeak = pickResponse(
        detectedLang,
        routeRes.spokenResponseEnglish,
        routeRes.spokenResponseHindi,
        routeRes.spokenResponseHinglish
      );

      setState((prev) => ({
        ...prev,
        isProcessing: false,
        actionStatus: 'AMBIGUOUS',
        activeIntent: 'AMBIGUOUS_ROUTE',
        assistantReplyEnglish: routeRes.spokenResponseEnglish,
        assistantReplyHindi: routeRes.spokenResponseHindi,
      }));

      await speakText(replyToSpeak, ttsLang);
      return routeRes;
    }

    // If valid route found in registry
    if (routeRes.status === 'FOUND' && routeRes.targetRoute) {
      const targetRoute = routeRes.targetRoute;

      // Handle Back Navigation
      if (targetRoute === '__BACK__') {
        window.history.back();
        const replyToSpeak = pickResponse(
          detectedLang,
          routeRes.spokenResponseEnglish,
          routeRes.spokenResponseHindi,
          routeRes.spokenResponseHinglish
        );

        setState((prev) => ({
          ...prev,
          isProcessing: false,
          actionStatus: 'SUCCESS',
          activeIntent: 'NAVIGATE',
          lastTargetRoute: currentPath,
          assistantReplyEnglish: routeRes.spokenResponseEnglish,
          assistantReplyHindi: routeRes.spokenResponseHindi,
        }));

        await speakText(replyToSpeak, ttsLang);
        return routeRes;
      }

      // Check if user is already on the requested route
      if (currentPath === targetRoute) {
        const alreadyThereEn = `You are already on the ${routeRes.routeDefinition?.titleEn || 'requested'} page.`;
        const alreadyThereHi = `आप पहले से ही ${routeRes.routeDefinition?.titleHi || 'इस'} पेज पर हैं।`;
        const alreadyThereHinglish = `Aap pehle se hi ${routeRes.routeDefinition?.titleEn || 'is'} page par hain.`;

        const replyToSpeak = pickResponse(detectedLang, alreadyThereEn, alreadyThereHi, alreadyThereHinglish);

        setState((prev) => ({
          ...prev,
          isProcessing: false,
          actionStatus: 'SUCCESS',
          activeIntent: 'NAVIGATE',
          lastTargetRoute: targetRoute,
          assistantReplyEnglish: alreadyThereEn,
          assistantReplyHindi: alreadyThereHi,
        }));

        await speakText(replyToSpeak, ttsLang);
        return routeRes;
      }

      // Execute Navigation Handler
      const navHandler = navHandlerRef.current;
      if (navHandler) {
        navHandler(targetRoute);

        // If navigating to service directory with specific service filter, dispatch event for immediate in-page UI update
        if (targetRoute.includes('/all-services')) {
          const queryPart = targetRoute.split('?')[1] || '';
          const params = new URLSearchParams(queryPart);
          const searchQ = params.get('search');
          const serviceId = params.get('service');
          if (searchQ || serviceId) {
            window.dispatchEvent(
              new CustomEvent('voice-service-select', {
                detail: { search: searchQ, serviceId },
              })
            );
          }
        }

        // ACTION RESULT VERIFICATION: Verify that router state actually updated
        await new Promise((r) => setTimeout(r, 150));
        const newPath = window.location.pathname;
        const verified = newPath === targetRoute || currentPath !== targetRoute || targetRoute.includes('/all-services');

        if (verified) {
          const successEn = routeRes.spokenResponseEnglish || `Navigated to ${routeRes.routeDefinition?.titleEn || 'requested page'}.`;
          const successHi = routeRes.spokenResponseHindi || `${routeRes.routeDefinition?.titleHi || 'पेज'} खोला गया।`;
          const successHinglish = routeRes.spokenResponseHinglish || `${routeRes.routeDefinition?.titleEn || 'Page'} khol diya gaya hai.`;

          const replyToSpeak = pickResponse(detectedLang, successEn, successHi, successHinglish);

          setState((prev) => ({
            ...prev,
            isProcessing: false,
            actionStatus: 'SUCCESS',
            activeIntent: 'NAVIGATE',
            lastTargetRoute: targetRoute,
            assistantReplyEnglish: successEn,
            assistantReplyHindi: successHi,
          }));

          await speakText(replyToSpeak, ttsLang);
          return routeRes;
        } else {
          const failEn = `Could not navigate to ${routeRes.routeDefinition?.titleEn || 'page'}. Please try again.`;
          const failHi = `पेज खोलने में त्रुटि हुई। कृपया पुनः प्रयास करें।`;
          const failHinglish = `Navigation fail ho gaya. Kripya dobara koshish karein.`;

          const replyToSpeak = pickResponse(detectedLang, failEn, failHi, failHinglish);

          setState((prev) => ({
            ...prev,
            isProcessing: false,
            actionStatus: 'FAILED',
            activeIntent: 'NAVIGATE',
            assistantReplyEnglish: failEn,
            assistantReplyHindi: failHi,
          }));

          await speakText(replyToSpeak, ttsLang);
          return { status: 'FAILED' };
        }
      }
    }

    // 4. BACKEND INTENT ROUTER AS HYBRID FALLBACK
    // Used for conversational slot extraction, service catalog querying, and helpline routing
    try {
      const response = await fetch('/api/voice/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: trimmed,
          currentRoute: currentPath,
        }),
      });

      if (!response.ok) {
        throw new Error(`Intent router error: ${response.status}`);
      }

      const data = await response.json();
      const replyHindi = data.spokenResponseHindi;
      const replyEnglish = data.spokenResponseEnglish;

      // If slots are extracted, dispatch to form listeners AND try DOM auto-fill
      if (data.extractedSlots && Object.keys(data.extractedSlots).length > 0) {
        slotListenersRef.current.forEach((listener) => listener(data.extractedSlots));

        // Auto-fill visible DOM controls
        for (const [key, val] of Object.entries(data.extractedSlots)) {
          const match = FormInteractionEngine.matchField(key, visibleFields);
          if (match.status === 'EXACT' && match.field) {
            FormInteractionEngine.setFieldValue(match.field.element, val);
          }
        }
      }

      // If navigation is requested by backend
      if (data.intent === 'NAVIGATE' && data.targetRoute) {
        const targetRoute = data.targetRoute;

        if (currentPath === targetRoute) {
          const alreadyThereEn = `You are already on this page.`;
          const alreadyThereHi = `आप पहले से ही इस पेज पर हैं।`;
          const replyToSpeak = pickResponse(detectedLang, alreadyThereEn, alreadyThereHi);

          setState((prev) => ({
            ...prev,
            isProcessing: false,
            actionStatus: 'SUCCESS',
            activeIntent: data.intent,
            lastTargetRoute: targetRoute,
            assistantReplyHindi: replyHindi,
            assistantReplyEnglish: replyEnglish,
          }));

          await speakText(replyToSpeak, ttsLang);
          return data;
        }

        const navHandler = navHandlerRef.current;
        if (navHandler) {
          navHandler(targetRoute);
          await new Promise((r) => setTimeout(r, 150));
        }
      }

      let finalReplyHindi = replyHindi;
      let finalReplyEnglish = replyEnglish;

      const looksLikeNavigationAttempt =
        isExplicitNavigation ||
        lower.includes('page') ||
        lower.includes('पेज') ||
        lower.includes('पृष्ठ') ||
        lower.includes('जाना') ||
        lower.includes('खोलो') ||
        lower.includes('खोल') ||
        lower.includes('ले चल') ||
        lower.includes('dikhao') ||
        lower.includes('दिखा');

      if (
        isFormPage &&
        !looksLikeNavigationAttempt &&
        (!data.extractedSlots || Object.keys(data.extractedSlots).length === 0) &&
        (replyEnglish?.includes('could not find a matching page') || replyHindi?.includes('कोई पेज या सेवा नहीं मिली'))
      ) {
        finalReplyEnglish = `I could not identify which form field to fill for "${trimmed}". You can say something like "Father Name Indra Singh" or ask "What information do you need next?".`;
        finalReplyHindi = `"${trimmed}" के लिए फॉर्म में कोई फ़ील्ड नहीं मिली। आप "पिता का नाम इन्द्र सिंह" बोल सकते हैं या "अगली जानकारी क्या चाहिए" पूछ सकते हैं।`;
      }

      const replyToSpeak = pickResponse(detectedLang, finalReplyEnglish, finalReplyHindi);

      setState((prev) => ({
        ...prev,
        isProcessing: false,
        actionStatus: data.intent === 'GENERAL_QUERY' && isFormPage ? 'NOT_FOUND' : 'SUCCESS',
        activeIntent: data.intent,
        lastTargetRoute: data.targetRoute,
        assistantReplyHindi: finalReplyHindi,
        assistantReplyEnglish: finalReplyEnglish,
      }));

      await speakText(replyToSpeak, ttsLang);
      return data;
    } catch (err: any) {
      console.error('[VoiceContext] Error executing voice command:', err);
      const errorEn = `Could not process your voice command. Please try again.`;
      const errorHi = `कमांड प्रोसेस नहीं हो सका। कृपया पुनः बोलें।`;
      const replyToSpeak = pickResponse(detectedLang, errorEn, errorHi);

      setState((prev) => ({
        ...prev,
        isProcessing: false,
        actionStatus: 'FAILED',
        error: err.message,
        assistantReplyEnglish: errorEn,
        assistantReplyHindi: errorHi,
      }));

      await speakText(replyToSpeak, ttsLang);
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
    navHandlerRef.current = handler;
  };

  const startFieldDictation = (fieldId: string, promptText?: string) => {
    setActiveFocusedField(fieldId);
    setState((prev) => ({ ...prev, activeFocusedField: fieldId }));
    stopSpeaking();
    const promptMsg =
      uiLanguage === 'hi'
        ? `${promptText || 'फ़ील्ड'} का मान बोलें`
        : `Please speak value for ${promptText || 'field'}`;
    speakText(promptMsg, uiLanguage).then(() => {
      startListening();
    });
  };

  return (
    <VoiceContext.Provider
      value={{
        ...state,
        voiceMode,
        setVoiceMode,
        activeFocusedField,
        startFieldDictation,
        startListening,
        stopListening,
        toggleListening,
        speakText,
        stopSpeaking,
        executeVoiceCommand,
        registerSlotListener,
        navigationHandler,
        setNavigationHandler,
        recognitionLang,
        setRecognitionLang,
        activeFieldId,
        setActiveFieldId,
        formSlots,
        updateFormSlot,
        clearConversation,
        sessionId,
        setHandsFreeMode,
        toggleHandsFree,
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
