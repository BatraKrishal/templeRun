export type Language = 'en' | 'hi';
export type TextScale = 'sm' | 'base' | 'lg';

export interface AccessibilitySettings {
  language: Language;
  textScale: TextScale;
  highContrast: boolean;
  saralMode: boolean; // Rural/Senior Citizen simplified oversized wizard mode
  narratorActive: boolean; // Hover/focus spoken screen reader ("Vachak")
}

export interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  assistantReplyHindi: string;
  assistantReplyEnglish: string;
  detectedLanguage?: 'hi' | 'hinglish' | 'en';
  actionStatus?: 'SUCCESS' | 'FAILED' | 'AMBIGUOUS' | 'NOT_FOUND' | 'NEEDS_CONFIRMATION';
  activeIntent?: string;
  lastTargetRoute?: string;
  voiceMode?: 'AUTO' | 'FORM' | 'NAVIGATION';
  activeFocusedField?: string | null;
  recognitionLang?: 'en-IN' | 'hi-IN';
  error?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  titleHindi: string;
  department: string;
  departmentHindi?: string;
  category: 'Service' | 'Scheme';
  fee: number;
  slaDays: number;
  description: string;
  keywords: string[];
  formRoute?: string;
}

export interface KeyPoolTelemetry {
  activeKey: {
    id: string;
    label: string;
    accountEmail: string;
    charactersUsed: number;
    characterLimit: number;
    status: string;
    index: number;
  };
  poolSummary: {
    totalAccounts: number;
    activeAccounts: number;
    exhaustedAccounts: number;
    totalCapacityMinutes: number;
    remainingMinutes: number;
    totalCharactersConsumed: number;
    totalPoolCapacityChars: number;
    rotationThresholdChars: number;
    lastUpdated: string;
  };
  keys: Array<{
    id: string;
    label: string;
    accountEmail: string;
    apiKeyMasked: string;
    charactersUsed: number;
    characterLimit: number;
    minutesEstimated: number;
    status: string;
    alertSent: boolean;
    lastUsedAt: string | null;
    exhaustedAt: string | null;
  }>;
  recentEvents: Array<{
    timestamp: string;
    event: string;
    details: string;
  }>;
  cacheStats?: {
    cachedAudiosCount: number;
    totalSizeKB: number;
    cacheHits: number;
    cacheMisses: number;
    ratio: string;
  };
}

