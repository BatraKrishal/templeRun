import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { IntentRequest, IntentResponse, ServiceRecord } from '../types/index.js';
import { SlotNormalizerService } from './SlotNormalizerService.js';

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

  public routeIntent(request: IntentRequest): IntentResponse {
    const text = request.transcript.trim();
    const lower = text.toLowerCase();
    const currentRoute = request.currentRoute || '/';

    // 1. Extract structured entity slots
    const extractedSlots = this.slotNormalizer.normalizeSlots(text);
    const hasExtractedSlots = Object.keys(extractedSlots).length > 0;

    // 2. Check if user is currently filling an active form and provided slot values
    if (currentRoute.includes('/services/') && hasExtractedSlots) {
      const fieldNames = Object.keys(extractedSlots).join(', ');
      return {
        intent: 'FILL_FIELD',
        targetRoute: currentRoute,
        extractedSlots,
        confidence: 0.95,
        spokenResponseHindi: `मैंने ${this.formatSlotsHindi(extractedSlots)} दर्ज कर दिया है। क्या विवरण सही हैं?`,
        spokenResponseEnglish: `I have entered your ${fieldNames}. Are these details correct?`,
      };
    }

    // 3. Navigation intents
    // Income Certificate
    if (lower.includes('आय') || lower.includes('income') || lower.includes('aay praman')) {
      return {
        intent: 'NAVIGATE',
        targetRoute: '/services/revenue/income-certificate',
        serviceId: 'uk-rev-income',
        confidence: 0.98,
        extractedSlots,
        spokenResponseHindi: 'आय प्रमाण पत्र आवेदन पृष्ठ खोला जा रहा है। राजस्व विभाग के अनुसार यह 15 दिनों में जारी होता है।',
        spokenResponseEnglish: 'Opening Income Certificate application form. Processed within 15 days under Right to Service Act.',
      };
    }

    // Domicile / Permanent Residence Certificate
    if (lower.includes('स्थायी निवास') || lower.includes('मूल निवास') || lower.includes('domicile') || lower.includes('niwas') || lower.includes('residence')) {
      return {
        intent: 'NAVIGATE',
        targetRoute: '/services/revenue/domicile-certificate',
        serviceId: 'uk-rev-domicile',
        confidence: 0.98,
        extractedSlots,
        spokenResponseHindi: 'स्थायी निवास प्रमाण पत्र पृष्ठ खोला जा रहा है। कृपया अपना 15 वर्ष का निवास विवरण तैयार रखें।',
        spokenResponseEnglish: 'Navigating to Permanent Residence (Domicile) Certificate form.',
      };
    }

    // Hill Area Certificate
    if (lower.includes('पर्वतीय') || lower.includes('hill') || lower.includes('पहाड़ी') || lower.includes('parvatiya')) {
      return {
        intent: 'NAVIGATE',
        targetRoute: '/services/revenue/hill-area-certificate',
        serviceId: 'uk-rev-hill',
        confidence: 0.97,
        extractedSlots,
        spokenResponseHindi: 'पर्वतीय क्षेत्र प्रमाण पत्र आवेदन पृष्ठ खोला जा रहा है।',
        spokenResponseEnglish: 'Navigating to Hill Area Certificate application form.',
      };
    }

    // Pariwar Register Copy
    if (lower.includes('परिवार') || lower.includes('register') || lower.includes('pariwar') || lower.includes('कुटुंब') || lower.includes('nakal')) {
      return {
        intent: 'NAVIGATE',
        targetRoute: '/services/panchayati-raj/pariwar-register',
        serviceId: 'uk-panch-pariwar',
        confidence: 0.97,
        extractedSlots,
        spokenResponseHindi: 'पंचायती राज परिवार रजिस्टर की नकल पृष्ठ खोला जा रहा है।',
        spokenResponseEnglish: 'Opening Copy of Pariwar Register search and download portal.',
      };
    }

    // Application Tracking
    if (lower.includes('track') || lower.includes('ट्रैक') || lower.includes('स्थिति') || lower.includes('status')) {
      return {
        intent: 'TRACK_STATUS',
        targetRoute: '/track',
        extractedSlots,
        confidence: 0.95,
        spokenResponseHindi: extractedSlots.tracking_id 
          ? `आवेदन संख्या ${extractedSlots.tracking_id} की स्थिति जांची जा रही है।`
          : 'आवेदन ट्रैकिंग पृष्ठ खोला जा रहा है। कृपया अपना 16-अंकों का आवेदन क्रमांक बताएं।',
        spokenResponseEnglish: extractedSlots.tracking_id
          ? `Tracking status for application ${extractedSlots.tracking_id}.`
          : 'Opening application tracking portal. Please enter or speak your 16-digit Application ID.',
      };
    }

    // Certificate Verification
    if (lower.includes('verify') || lower.includes('सत्यापित') || lower.includes('प्रमाणित') || lower.includes('verification')) {
      return {
        intent: 'VERIFY_CERTIFICATE',
        targetRoute: '/verify',
        confidence: 0.94,
        spokenResponseHindi: 'डिजिटल प्रमाणपत्र सत्यापन पृष्ठ खोला जा रहा है। यहां आप क्यूआर कोड या आईडी से जांच कर सकते हैं।',
        spokenResponseEnglish: 'Opening digital certificate verification portal. Authenticate online with Certificate ID or QR code.',
      };
    }

    // Toll Free Helpline 1905
    if (lower.includes('helpline') || lower.includes('हेल्पलाइन') || lower.includes('toll free') || lower.includes('1905') || lower.includes('नंबर')) {
      return {
        intent: 'GENERAL_QUERY',
        targetRoute: '/contact-us',
        confidence: 0.99,
        spokenResponseHindi: 'उत्तराखंड अपनी सरकार और सीएम हेल्पलाइन का टोल फ्री नंबर 1905 है। आप किसी भी समय कॉल कर सकते हैं।',
        spokenResponseEnglish: 'Uttarakhand Apuni Sarkar & CM Helpline toll-free number is 1905. Available 24x7 for citizen assistance.',
      };
    }

    // List of Services
    if (lower.includes('services') || lower.includes('सेवाएं') || lower.includes('list') || lower.includes('कैटलॉग')) {
      return {
        intent: 'NAVIGATE',
        targetRoute: '/all-services',
        confidence: 0.95,
        spokenResponseHindi: 'सभी 1100 से अधिक सरकारी सेवाओं की सूची खोली जा रही है। आप विभाग या नाम से खोज सकते हैं।',
        spokenResponseEnglish: 'Opening directory of over 1100 citizen services across all departments.',
      };
    }

    // FAQs
    if (lower.includes('faq') || lower.includes('प्रश्न') || lower.includes('सवाल')) {
      return {
        intent: 'NAVIGATE',
        targetRoute: '/faqs',
        confidence: 0.96,
        spokenResponseHindi: 'प्रायः पूछे जाने वाले प्रश्नों (FAQs) का पृष्ठ खोला जा रहा है।',
        spokenResponseEnglish: 'Opening Frequently Asked Questions (FAQs) portal.',
      };
    }

    // About Us
    if (lower.includes('about') || lower.includes('अपनी सरकार के बारे में') || lower.includes('itda')) {
      return {
        intent: 'NAVIGATE',
        targetRoute: '/about',
        confidence: 0.95,
        spokenResponseHindi: 'अपनी सरकार और आईटीडीए उत्तराखंड के बारे में जानकारी खोली जा रही है।',
        spokenResponseEnglish: 'Opening About Apuni Sarkar and ITDA Uttarakhand overview page.',
      };
    }

    // Sitemap
    if (lower.includes('sitemap') || lower.includes('साइटमैप')) {
      return {
        intent: 'NAVIGATE',
        targetRoute: '/sitemap',
        confidence: 0.98,
        spokenResponseHindi: 'पोर्टल का संपूर्ण साइटमैप खोला जा रहा है।',
        spokenResponseEnglish: 'Opening complete portal sitemap.',
      };
    }

    // Dashboard
    if (lower.includes('dashboard') || lower.includes('डैशबोर्ड') || lower.includes('आंकड़े')) {
      return {
        intent: 'NAVIGATE',
        targetRoute: '/dashboard',
        confidence: 0.96,
        spokenResponseHindi: 'राज्य सेवा डैशबोर्ड खोला जा रहा है।',
        spokenResponseEnglish: 'Opening State Governance Real-time Dashboard.',
      };
    }

    // Default Fallback
    return {
      intent: 'GENERAL_QUERY',
      confidence: 0.7,
      spokenResponseHindi: `मैंने सुना: "${text}". आप किसी भी सेवा के लिए कह सकते हैं, जैसे "आय प्रमाण पत्र", "स्थिति जांचें", या "हेल्पलाइन नंबर"।`,
      spokenResponseEnglish: `I heard: "${text}". You can ask to open any service like "Income Certificate", "Track Application", or "Helpline 1905".`,
    };
  }

  private formatSlotsHindi(slots: Record<string, any>): string {
    const parts: string[] = [];
    if (slots.applicant_name) parts.push(`आवेदक का नाम ${slots.applicant_name}`);
    if (slots.father_husband_name) parts.push(`पिता का नाम ${slots.father_husband_name}`);
    if (slots.annual_income) parts.push(`वार्षिक आय ₹${slots.annual_income}`);
    if (slots.district) parts.push(`ज़िला ${slots.district}`);
    return parts.join(', ');
  }

  public getCatalog(): ServiceRecord[] {
    return this.servicesCatalog;
  }
}

