export type Language = 'en' | 'hi';
export type TextScale = 'sm' | 'base' | 'lg';

export interface AccessibilitySettings {
  language: Language;
  textScale: TextScale;
  highContrast: boolean;
  saralMode: boolean; // Rural/Senior Citizen simplified oversized wizard mode
  narratorActive: boolean; // Hover/focus spoken screen reader ("Vachak")
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'jarvis';
  text: string;
  time: string;
  intent?: string;
  slots?: Record<string, any>;
}

export interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  handsFreeMode: boolean;
  dialogueState: 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING';
  transcript: string;
  assistantReplyHindi: string;
  assistantReplyEnglish: string;
  activeIntent?: string;
  lastTargetRoute?: string;
  activeFieldId?: string;
  isConfirmationPending?: boolean;
  submissionId?: string;
  conversationHistory: ChatMessage[];
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

