/**
 * LanguageDetector
 * High-precision multilingual classifier for detecting Devanagari Hindi ('hi'),
 * Romanized Hindi / Hinglish ('hinglish'), or English ('en').
 * Distinguishes English stopwords (e.g. 'to', 'for', 'in') from Hindi grammar.
 */

export type DetectedLanguage = 'hi' | 'hinglish' | 'en';

const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

// High-confidence Romanized Hindi grammatical words and verbs
const HINGLISH_GRAMMAR_WORDS = new Set([
  'mera', 'meri', 'mere', 'mujhe', 'mujhko', 'hum', 'humara', 'aap', 'aapka', 'aapki', 'aapke',
  'kholo', 'kholna', 'kholiye', 'jao', 'jana', 'chalo', 'chalna', 'le', 'lekar',
  'bharo', 'bharna', 'bariye', 'daalo', 'daalna', 'likho', 'likhna', 'karo', 'karna', 'kijiye',
  'chahiye', 'mangta', 'hai', 'hain', 'ho', 'hoon', 'tha', 'thi', 'the',
  'kaise', 'kya', 'kahan', 'kidhar', 'kab', 'kaun', 'kyun', 'kitna', 'kitne', 'kitni',
  'pichle', 'pichla', 'pichli', 'agle', 'agla', 'agli', 'aage', 'peeche', 'pehle', 'baad',
  'praman', 'patra', 'aay', 'niwas', 'sthayi', 'mul', 'parvatiya', 'pahadi', 'pariwar',
  'sarkar', 'apuni', 'seva', 'sevayein', 'shasanadesh', 'janm', 'jati', 'kutumb',
  'pitaji', 'patni', 'ling', 'purush', 'mahila',
  'haan', 'nahi', 'theek', 'sahi', 'galat', 'dhanyawad', 'shukriya', 'namaste', 'namaskar',
  'mein', 'par'
]);

const ENGLISH_DOMAIN_WORDS = new Set([
  'go', 'open', 'please', 'the', 'my', 'your', 'is', 'for', 'from', 'of', 'and', 'in', 'to',
  'field', 'fill', 'enter', 'select', 'choose', 'download', 'certificate', 'track', 'status',
  'application', 'income', 'name', 'father', 'mobile', 'annual', 'source', 'required', 'primary',
  'private', 'job', 'ration', 'card', 'scholarship', 'clear', 'next', 'previous', 'skip',
  'what', 'total', 'details', 'check', 'submit', 'dashboard', 'login', 'about', 'services', 'faq'
]);

export class LanguageDetector {
  /**
   * Detects the language of a spoken transcript.
   */
  public static detect(text: string): DetectedLanguage {
    if (!text || typeof text !== 'string') return 'en';
    const trimmed = text.trim();
    if (!trimmed) return 'en';

    // 1. Devanagari script is strictly Hindi
    if (DEVANAGARI_REGEX.test(trimmed)) {
      return 'hi';
    }

    const lower = trimmed.toLowerCase();

    // 2. Strong multi-word Hinglish phrasal markers
    const strongHinglishPhrases = [
      'le chalo', 'par jao', 'kholo', 'karna hai', 'bharo', 'bhejo', 'daal do',
      'check karna', 'chahiye', 'mera naam', 'meri aay', 'pita ka naam', 'pichle page',
      'agla page', 'karo please', 'bataiye', 'batayein', 'kya hai'
    ];

    for (const phrase of strongHinglishPhrases) {
      if (lower.includes(phrase)) {
        return 'hinglish';
      }
    }

    // 3. Token-based analysis
    const words = lower.split(/[\s,?.!;:_'"\-/\\]+/).filter(Boolean);
    let hinglishCount = 0;
    let englishCount = 0;

    for (const w of words) {
      if (HINGLISH_GRAMMAR_WORDS.has(w)) {
        hinglishCount++;
      }
      if (ENGLISH_DOMAIN_WORDS.has(w)) {
        englishCount++;
      }
    }

    // If English indicators dominate or no strong Hindi grammar is present -> English
    if (englishCount > hinglishCount) {
      return 'en';
    }

    if (hinglishCount >= 1 && hinglishCount >= englishCount) {
      return 'hinglish';
    }

    return 'en';
  }

  /**
   * Maps detected language to TTS audio language ('hi' or 'en')
   */
  public static toTtsLanguage(lang: DetectedLanguage): 'hi' | 'en' {
    return lang === 'en' ? 'en' : 'hi';
  }
}
