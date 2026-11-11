import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { IntentRequest, IntentResponse, ServiceRecord } from '../types/index.js';
import { SlotNormalizerService } from './SlotNormalizerService.js';
import { RouteRegistry, RouteResolution } from './RouteRegistry.js';
import { LanguageDetector, DetectedLanguage } from './LanguageDetector.js';
import { SessionService } from './SessionService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolveCatalogPath = (): string => {
  const candidates = [
    path.resolve(__dirname, '../data/uk_services_catalog.json'),
    path.resolve(__dirname, '../../data/uk_services_catalog.json'),
    path.resolve(__dirname, '../../src/data/uk_services_catalog.json'),
    path.resolve(__dirname, '../../../server/src/data/uk_services_catalog.json'),
    path.resolve(process.cwd(), 'server/src/data/uk_services_catalog.json'),
    path.resolve(process.cwd(), 'server/data/uk_services_catalog.json'),
    path.resolve(process.cwd(), 'server/dist/data/uk_services_catalog.json'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
};

const CATALOG_PATH = resolveCatalogPath();

export class IntentRouterService {
  private servicesCatalog: ServiceRecord[] = [];
  private slotNormalizer: SlotNormalizerService;
  private sessionService: SessionService;

  private static FORM_SCHEMAS: Record<string, Array<{ id: string; labelHi: string; labelEn: string }>> = {
    '/services/revenue/income-certificate': [
      { id: 'applicant_name', labelHi: 'आवेदक का नाम', labelEn: 'applicant name' },
      { id: 'father_husband_name', labelHi: 'पिता या पति का नाम', labelEn: 'father or husband name' },
      { id: 'annual_income', labelHi: 'वार्षिक पारिवारिक आय', labelEn: 'annual family income' },
      { id: 'district', labelHi: 'जनपद', labelEn: 'district' },
      { id: 'mobile_number', labelHi: 'मोबाइल नंबर', labelEn: 'mobile number' },
    ],
    '/services/revenue/domicile-certificate': [
      { id: 'applicant_name', labelHi: 'आवेदक का नाम', labelEn: 'applicant name' },
      { id: 'father_husband_name', labelHi: 'पिता या पति का नाम', labelEn: 'father or husband name' },
      { id: 'district', labelHi: 'जनपद', labelEn: 'district' },
      { id: 'mobile_number', labelHi: 'मोबाइल नंबर', labelEn: 'mobile number' },
    ],
    '/pariwar-register': [
      { id: 'district', labelHi: 'जनपद', labelEn: 'district' },
      { id: 'development_block', labelHi: 'विकास खंड', labelEn: 'development block' },
      { id: 'gram_panchayat', labelHi: 'ग्राम पंचायत', labelEn: 'gram panchayat' },
      { id: 'head_of_family_name', labelHi: 'मुखिया का नाम', labelEn: 'head of family name' },
    ],
  };

  constructor(sessionService?: SessionService) {
    this.slotNormalizer = new SlotNormalizerService();
    this.sessionService = sessionService || new SessionService();
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
    const sessionId = request.sessionId || 'default_session';
    const session = this.sessionService.getOrCreateSession(sessionId, currentRoute);

    // 0. Check Confirmation / Submission Flow
    if (session.isConfirmationPending) {
      const isAffirmative =
        lower.includes('yes') ||
        lower.includes('submit') ||
        lower.includes('haan') ||
        lower.includes('हाँ') ||
        lower.includes('कर दो') ||
        lower.includes('जमा करो') ||
        lower.includes('theek hai') ||
        lower.includes('ठीक है');

      const isNegative =
        lower.includes('no') ||
        lower.includes('nahi') ||
        lower.includes('नहीं') ||
        lower.includes('cancel') ||
        lower.includes('बदलो') ||
        lower.includes('change');

      if (isAffirmative) {
        const subId = `UK-APP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        this.sessionService.updateSession(sessionId, {
          isSubmitted: true,
          isConfirmationPending: false,
          submissionId: subId,
        });
        return {
          intent: 'FORM_SUBMITTED',
          status: 'SUCCESS',
          submissionId: subId,
          isFormSubmitted: true,
          confidence: 0.99,
          spokenResponseHindi: `आपका आवेदन सफलतापूर्वक जमा कर दिया गया है। आपका आवेदन क्रमांक ${subId} है। आप इसे कभी भी ट्रैक कर सकते हैं।`,
          spokenResponseEnglish: `Your application has been successfully submitted! Your application ID is ${subId}. You can track its status anytime.`,
        };
      }

      if (isNegative) {
        this.sessionService.updateSession(sessionId, { isConfirmationPending: false });
        return {
          intent: 'GENERAL_QUERY',
          confidence: 0.95,
          spokenResponseHindi: 'आवेदन अभी जमा नहीं किया गया है। आप किस फ़ील्ड को बदलना चाहते हैं?',
          spokenResponseEnglish: 'Submission paused. Which field would you like to update or change?',
        };
      }
    }

    // 1. Detect language immediately
    const detectedLang: DetectedLanguage = LanguageDetector.detect(text);

    // 2. Extract structured entity slots with active field context from session
    const activeFieldId = request.formContext?.activeFieldId || session.activeFieldId;
    const extractedSlots = this.slotNormalizer.normalizeSlots(text, activeFieldId);
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
      (currentRoute.includes('/services/revenue/') || currentRoute.includes('/services/panchayati-raj/') || currentRoute.includes('/forms/') || currentRoute.includes('/pariwar-register')) &&
      (hasExtractedSlots || lower.includes('enter') || lower.includes('select') || lower.includes('field') || lower.includes('दर्ज') || lower.includes('भरो'))
    ) {
      // Accumulate in session
      const currentFilled = { ...session.collectedSlots, ...request.formContext?.filledFields, ...extractedSlots };
      this.sessionService.updateSession(sessionId, { collectedSlots: currentFilled });

      const schema = IntentRouterService.FORM_SCHEMAS[currentRoute];
      let nextFieldPrompt = '';
      let nextActiveFieldId = '';
      let isFormCompleted = false;

      if (schema) {
        const missing = schema.find((f) => !currentFilled[f.id]);
        if (missing) {
          nextFieldPrompt = missing.labelHi;
          nextActiveFieldId = missing.id;
          this.sessionService.updateSession(sessionId, { activeFieldId: missing.id });
        } else {
          isFormCompleted = true;
          this.sessionService.updateSession(sessionId, { isConfirmationPending: true });
        }
      }

      const fieldNames = Object.keys(extractedSlots).join(', ');
      const formattedHindi = this.formatSlotsHindi(extractedSlots);

      let spokenResponseHindi = `मैंने ${formattedHindi} दर्ज कर दिया है।`;
      let spokenResponseEnglish = `I have entered your ${fieldNames || 'details'}.`;

      if (isFormCompleted) {
        spokenResponseHindi += ' फॉर्म के सभी आवश्यक विवरण भर दिए गए हैं। क्या आप फॉर्म जमा करना चाहते हैं?';
        spokenResponseEnglish += ' All required details have been filled. Would you like to submit the application?';
      } else if (nextActiveFieldId && schema) {
        const missingItem = schema.find((f) => f.id === nextActiveFieldId);
        if (missingItem) {
          spokenResponseHindi += ` कृपया ${missingItem.labelHi} बताएं।`;
          spokenResponseEnglish += ` Please provide your ${missingItem.labelEn} next.`;
        }
      }

      return {
        intent: 'FILL_FIELD',
        targetRoute: currentRoute,
        extractedSlots,
        confidence: 0.95,
        activeFieldId: nextActiveFieldId || undefined,
        nextFieldPrompt: nextFieldPrompt || undefined,
        isConfirmationPending: isFormCompleted,
        isFormCompleted,
        spokenResponseHindi,
        spokenResponseEnglish,
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
