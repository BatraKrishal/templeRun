import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { IntentRequest, IntentResponse, ServiceRecord } from '../types/index.js';
import { SlotNormalizerService } from './SlotNormalizerService.js';
import { RouteRegistry, RouteResolution } from './RouteRegistry.js';
import { LanguageDetector, DetectedLanguage } from './LanguageDetector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CATALOG_PATH = path.resolve(__dirname, '../data/uk_services_catalog.json');

export class IntentRouterService {
  private servicesCatalog: ServiceRecord[] = [];
  private slotNormalizer: SlotNormalizerService;

  constructor() {
    this.slotNormalizer = new SlotNormalizerService();
    this.loadCatalog();
  }

  private loadCatalog() {
    try {
      if (fs.existsSync(CATALOG_PATH)) {
        const raw = fs.readFileSync(CATALOG_PATH, 'utf8');
        this.servicesCatalog = JSON.parse(raw);
        console.log(`[IntentRouterService] Loaded ${this.servicesCatalog.length} services into knowledge graph`);
      }
    } catch (err) {
      console.warn('[IntentRouterService] Error loading services catalog:', err);
    }
  }

  public getCatalog(): ServiceRecord[] {
    return this.servicesCatalog;
  }

  public routeIntent(request: IntentRequest): IntentResponse {
    const text = request.transcript.trim();
    const lower = text.toLowerCase();
    const currentRoute = request.currentRoute || '/';

    // 1. Detect language immediately
    const detectedLang: DetectedLanguage = LanguageDetector.detect(text);

    // 2. Extract structured entity slots
    const extractedSlots = this.slotNormalizer.normalizeSlots(text);
    const hasExtractedSlots = Object.keys(extractedSlots).length > 0;

    // 3. Tracking Intent
    if (
      lower.includes('track') ||
      lower.includes('ट्रैक') ||
      lower.includes('स्थिति') ||
      lower.includes('status') ||
      extractedSlots.tracking_id
    ) {
      const trackingId = extractedSlots.tracking_id;
      return {
        intent: 'TRACK_STATUS',
        targetRoute: '/track',
        extractedSlots,
        confidence: 0.95,
        spokenResponseHindi: trackingId
          ? `आवेदन संख्या ${trackingId} की स्थिति जांची जा रही है।`
          : 'आवेदन ट्रैकिंग पृष्ठ खोला जा रहा है। कृपया अपना 16-अंकों का आवेदन क्रमांक बताएं।',
        spokenResponseEnglish: trackingId
          ? `Tracking status for application ${trackingId}.`
          : 'Opening application tracking portal. Please enter or speak your 16-digit Application ID.',
      };
    }

    // 4. Form Field Filling Check: If user is on a dedicated form route and gives slot values or field directives
    if (
      currentRoute !== '/all-services' &&
      !currentRoute.startsWith('/all-services') &&
      (currentRoute.includes('/services/revenue/') || currentRoute.includes('/services/panchayati-raj/') || currentRoute.includes('/forms/')) &&
      (hasExtractedSlots || lower.includes('enter') || lower.includes('select') || lower.includes('field') || lower.includes('दर्ज') || lower.includes('भरो'))
    ) {
      const fieldNames = Object.keys(extractedSlots).join(', ');
      return {
        intent: 'FILL_FIELD',
        targetRoute: currentRoute,
        extractedSlots,
        confidence: 0.95,
        spokenResponseHindi: hasExtractedSlots
          ? `मैंने ${this.formatSlotsHindi(extractedSlots)} दर्ज कर दिया है। क्या विवरण सही हैं?`
          : 'फ़ील्ड विवरण दर्ज किया जा रहा है।',
        spokenResponseEnglish: hasExtractedSlots
          ? `I have entered your ${fieldNames || 'details'}. Are these details correct?`
          : 'Entering field details on form.',
      };
    }

    // 5. Centralized Route Registry Resolution
    const routeRes: RouteResolution = RouteRegistry.resolve(text);

    if (routeRes.status === 'FOUND' && routeRes.targetRoute) {
      return {
        intent: 'NAVIGATE',
        targetRoute: routeRes.targetRoute,
        serviceId: routeRes.routeDefinition?.id,
        extractedSlots,
        confidence: 0.98,
        spokenResponseHindi: routeRes.spokenResponseHindi,
        spokenResponseEnglish: routeRes.spokenResponseEnglish,
      };
    }

    if (routeRes.status === 'AMBIGUOUS') {
      return {
        intent: 'GENERAL_QUERY',
        confidence: 0.85,
        spokenResponseHindi: routeRes.spokenResponseHindi,
        spokenResponseEnglish: routeRes.spokenResponseEnglish,
      };
    }

    // 6. Toll Free Helpline Query
    if (
      lower.includes('helpline') ||
      lower.includes('हेल्पलाइन') ||
      lower.includes('toll free') ||
      lower.includes('1905') ||
      lower.includes('टोल फ्री')
    ) {
      return {
        intent: 'GENERAL_QUERY',
        targetRoute: '/contact-us',
        confidence: 0.99,
        spokenResponseHindi: 'उत्तराखंड अपनी सरकार और सीएम हेल्पलाइन का टोल फ्री नंबर 1905 है। आप किसी भी समय कॉल कर सकते हैं।',
        spokenResponseEnglish: 'Uttarakhand Apuni Sarkar & CM Helpline toll-free number is 1905. Available 24x7 for citizen assistance.',
      };
    }

    // 7. Fallback when not found
    return {
      intent: 'GENERAL_QUERY',
      confidence: 0.7,
      spokenResponseHindi: `माफ़ कीजिये, "${text}" के लिए कोई पेज या सेवा नहीं मिली। आप "आय प्रमाण पत्र", "प्रमाण पत्र डाउनलोड", "आवेदन ट्रैक", या "हेल्पलाइन" कह सकते हैं।`,
      spokenResponseEnglish: `I could not find a matching page for "${text}". You can ask to open "Income Certificate", "Download Certificates", "Track Application", or "Helpline 1905".`,
    };
  }

  private formatSlotsHindi(slots: Record<string, any>): string {
    const parts: string[] = [];
    if (slots.applicant_name) parts.push(`आवेदक का नाम ${slots.applicant_name}`);
    if (slots.father_husband_name) parts.push(`पिता का नाम ${slots.father_husband_name}`);
    if (slots.annual_income) parts.push(`वार्षिक आय ₹${slots.annual_income}`);
    if (slots.district) parts.push(`जनपद ${slots.district}`);
    if (slots.mobile_number) parts.push(`मोबाइल ${slots.mobile_number}`);
    return parts.join(', ') || 'विवरण';
  }
}
