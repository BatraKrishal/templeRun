export type KeyStatus = 'ACTIVE' | 'EXHAUSTED' | 'RATE_LIMITED' | 'INVALID' | 'DISABLED';

export interface KeyRecord {
  id: string;
  label: string;
  accountEmail: string;
  apiKey: string;
  apiKeyMasked: string;
  characterLimit: number;
  charactersUsed: number;
  minutesEstimated: number;
  status: KeyStatus;
  lastUsedAt: string | null;
  exhaustedAt: string | null;
  alertSent: boolean;
  failureCount: number;
}

export interface PoolState {
  version: string;
  activeKeyIndex: number;
  lastUpdated: string;
  totalCharactersConsumed: number;
  totalMinutesEstimated: number;
  totalPoolCapacityChars: number;
  keys: KeyRecord[];
  history: Array<{
    timestamp: string;
    event: 'KEY_ROTATED' | 'QUOTA_EXHAUSTED' | 'ALERT_SENT' | 'CACHE_HIT' | 'KEY_RESTORED';
    details: string;
  }>;
}

export interface VoiceSpeakRequest {
  text: string;
  voiceId?: string;
  language?: 'hi' | 'en' | 'gar' | 'kum';
  forceRefresh?: boolean;
}

export interface IntentRequest {
  transcript: string;
  sessionId?: string;
  currentRoute?: string;
  formContext?: {
    formId: string;
    activeFieldId?: string;
    filledFields?: Record<string, any>;
  };
}

export interface IntentResponse {
  intent: 'NAVIGATE' | 'FILL_FIELD' | 'READ_SUMMARY' | 'TRACK_STATUS' | 'VERIFY_CERTIFICATE' | 'EXPLAIN_ELEMENT' | 'GENERAL_QUERY' | 'CONFIRM_SUBMIT' | 'FORM_SUBMITTED';
  targetRoute?: string;
  serviceId?: string;
  extractedSlots?: Record<string, string | number>;
  spokenResponseHindi: string;
  spokenResponseEnglish: string;
  confidence: number;
  suggestedAction?: string;
  nextFieldPrompt?: string;
  activeFieldId?: string;
  isConfirmationPending?: boolean;
  isFormCompleted?: boolean;
  isFormSubmitted?: boolean;
  submissionId?: string;
  shouldAutoListen?: boolean;
}

export interface ServiceRecord {
  id: string;
  title: string;
  titleHindi: string;
  department: string;
  category: 'Service' | 'Scheme';
  fee: number;
  slaDays: number;
  description: string;
  keywords: string[];
  formRoute?: string;
}

