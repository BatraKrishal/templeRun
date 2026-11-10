import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { IntentRequest, IntentResponse, ServiceRecord } from '../types/index.js';
import { SlotNormalizerService } from './SlotNormalizerService.js';
import { SessionService } from './SessionService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CATALOG_PATH = path.resolve(__dirname, '../data/uk_services_catalog.json');

export class IntentRouterService {
  private servicesCatalog: ServiceRecord[] = [];
  private slotNormalizer: SlotNormalizerService;
  private sessionService: SessionService;

  constructor() {
    this.slotNormalizer = new SlotNormalizerService();
    this.sessionService = new SessionService();
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
    const sessionId = request.sessionId || 'default_session';

    // Retrieve or initialize stateful session across conversational turns
    const session = this.sessionService.getOrCreateSession(sessionId, currentRoute);
    this.sessionService.recordHistory(sessionId, 'user', text);

    // 1. Check for Stop / Silence / Exit phrases
    if (
      lower === 'stop' ||
      lower === 'रुको' ||
      lower === 'रुकिए' ||
      lower === 'शांत' ||
      lower === 'bye' ||
      lower === 'अलविदा' ||
      lower === 'exit'
    ) {
      this.sessionService.recordHistory(sessionId, 'assistant', 'Standing by.');
      return {
        intent: 'GENERAL_QUERY',
        confidence: 0.99,
        shouldAutoListen: false,
        spokenResponseHindi: 'जी हाँ, मैं रुक गया हूँ। जब भी सहायता चाहिए, मुझे बुलाइएगा।',
        spokenResponseEnglish: 'Standing by. Feel free to call me whenever you need assistance.',
      };
    }

    // 2. Check for Greetings / Jarvis Wake words
    if (
      lower.includes('hello') ||
      lower.includes('hi') ||
      lower.includes('hey') ||
      lower.includes('jarvis') ||
      lower.includes('जार्विस') ||
      lower.includes('नमस्ते') ||
      lower.includes('नमस्कार') ||
      lower.includes('प्रणाम') ||
      lower.includes('वाणी')
    ) {
      const replyHi =
        'नमस्ते! मैं अपनी सरकार का AI सहायक वाणी-सेतु हूँ। बोलिए, मैं क्या सहायता करूँ? आप कह सकते हैं "आय प्रमाण पत्र", "आवेदन ट्रैक करें", या "हेल्पलाइन नंबर"।';
      const replyEn =
        'Hello! I am Vaani-Jarvis, your conversational assistant for Apuni Sarkar. How may I assist you? You can say "Apply for Income Certificate", "Track Application", or "What is the helpline number".';
      this.sessionService.recordHistory(sessionId, 'assistant', replyHi);
      return {
        intent: 'GENERAL_QUERY',
        confidence: 0.98,
        shouldAutoListen: true,
        spokenResponseHindi: replyHi,
        spokenResponseEnglish: replyEn,
      };
    }

    // 3. Extract structured entity slots from current user utterance
    const newlyExtractedSlots = this.slotNormalizer.normalizeSlots(text);

    // 4. Global Navigation & Query Commands (Take Priority)

    // Domicile / Permanent Residence Certificate Navigation
    if (
      lower.includes('स्थायी निवास') ||
      lower.includes('मूल निवास') ||
      lower.includes('domicile') ||
      lower.includes('niwas') ||
      lower.includes('residence')
    ) {
      this.sessionService.updateSession(sessionId, {
        activeServiceId: 'uk-rev-domicile',
        activeRoute: '/services/revenue/domicile-certificate',
        activeFieldId: 'applicant_name',
        collectedSlots: {},
        isConfirmationPending: false,
      });

      const replyHi =
        'स्थायी (मूल) निवास प्रमाण पत्र आवेदन खोला जा रहा है। सेवा का अधिकार के तहत यह 15 दिनों में बनता है। कृपया आवेदक का पूरा नाम बताएं?';
      const replyEn =
        'Opening Permanent Residence (Domicile) Certificate portal. Processed within 15 days. Please tell me the applicant\'s full name?';
      this.sessionService.recordHistory(sessionId, 'assistant', replyHi);

      return {
        intent: 'NAVIGATE',
        targetRoute: '/services/revenue/domicile-certificate',
        serviceId: 'uk-rev-domicile',
        confidence: 0.98,
        extractedSlots: newlyExtractedSlots,
        activeFieldId: 'applicant_name',
        shouldAutoListen: true,
        spokenResponseHindi: replyHi,
        spokenResponseEnglish: replyEn,
      };
    }

    // Application Tracking
    if (lower.includes('track') || lower.includes('ट्रैक') || lower.includes('स्थिति') || lower.includes('status')) {
      const trackingId = newlyExtractedSlots.tracking_id;
      return {
        intent: 'TRACK_STATUS',
        targetRoute: '/track',
        extractedSlots: newlyExtractedSlots,
        confidence: 0.96,
        shouldAutoListen: !trackingId,
        spokenResponseHindi: trackingId
          ? `आवेदन क्रमांक ${trackingId} की स्थिति जांची जा रही है। वर्तमान में यह तहसीलदार स्तर पर सत्यापन में है।`
          : 'आवेदन ट्रैकिंग पृष्ठ खोला जा रहा है। कृपया अपना 16-अंकों का आवेदन क्रमांक बताएं?',
        spokenResponseEnglish: trackingId
          ? `Checking status for application ${trackingId}. Currently under Tehsildar verification.`
          : 'Opening application tracking portal. Please enter or speak your 16-digit Application ID.',
      };
    }

    // Toll Free Helpline 1905
    if (
      lower.includes('helpline') ||
      lower.includes('हेल्पलाइन') ||
      lower.includes('toll free') ||
      lower.includes('1905') ||
      lower.includes('help desk')
    ) {
      return {
        intent: 'GENERAL_QUERY',
        targetRoute: '/contact-us',
        confidence: 0.99,
        shouldAutoListen: false,
        spokenResponseHindi: 'उत्तराखंड अपनी सरकार और सीएम हेल्पलाइन का टोल फ्री नंबर 1905 है। यह 24 घंटे नागरिकों की सहायता हेतु उपलब्ध है।',
        spokenResponseEnglish: 'Uttarakhand Apuni Sarkar & CM Helpline toll-free number is 1905. Available 24x7 for citizen assistance.',
      };
    }

    // List of Services
    if (lower.includes('services') || lower.includes('सेवाएं') || lower.includes('list') || lower.includes('कैटलॉग')) {
      return {
        intent: 'NAVIGATE',
        targetRoute: '/all-services',
        confidence: 0.95,
        shouldAutoListen: true,
        spokenResponseHindi: 'सभी 1100 से अधिक सरकारी सेवाओं की सूची खोली जा रही है। आप किसी भी सेवा का नाम बोलकर सीधे आवेदन कर सकते हैं।',
        spokenResponseEnglish: 'Opening directory of over 1100 citizen services across Uttarakhand. You can speak any service name to apply directly.',
      };
    }

    // Dashboard
    if (lower.includes('dashboard') || lower.includes('डैशबोर्ड') || lower.includes('आंकड़े') || lower.includes('analytics')) {
      return {
        intent: 'NAVIGATE',
        targetRoute: '/dashboard',
        confidence: 0.97,
        shouldAutoListen: false,
        spokenResponseHindi: 'राज्य सेवा डैशबोर्ड खोला जा रहा है। अब तक 1.44 करोड़ आवेदन प्राप्त हुए हैं और औसत निस्तारण समय 8 दिन है।',
        spokenResponseEnglish: 'Opening State Real-time Dashboard. Over 1.44 crore applications processed with 8-day average resolution.',
      };
    }

    // Important GOs
    if (lower.includes('goverment order') || lower.includes('go') || lower.includes('शासनादेश')) {
      return {
        intent: 'NAVIGATE',
        targetRoute: '/important-gos',
        confidence: 0.96,
        shouldAutoListen: false,
        spokenResponseHindi: 'महत्वपूर्ण शासनादेश (Government Orders) का पृष्ठ खोला जा रहा है। यहां से आप आधिकारिक पीडीएफ डाउनलोड कर सकते हैं।',
        spokenResponseEnglish: 'Opening Important Government Orders page. You can view and download official gazette PDFs here.',
      };
    }

    // Income Certificate Navigation (If intent is specifically asking to apply / open income certificate)
    if (
      (lower.includes('आय') || lower.includes('income') || lower.includes('aay praman')) &&
      (lower.includes('खोलो') || lower.includes('open') || lower.includes('बनवाना') || lower.includes('apply') || !currentRoute.includes('income-certificate'))
    ) {
      this.sessionService.updateSession(sessionId, {
        activeServiceId: 'uk-rev-income',
        activeRoute: '/services/revenue/income-certificate',
        activeFieldId: 'applicant_name',
        collectedSlots: {},
        isConfirmationPending: false,
      });

      const replyHi =
        'आय प्रमाण पत्र आवेदन पृष्ठ खोला जा रहा है। शुरू करने के लिए, कृपया आवेदक का पूरा नाम बताएं?';
      const replyEn =
        'Opening Income Certificate portal. To get started, please tell me the applicant\'s full name?';
      this.sessionService.recordHistory(sessionId, 'assistant', replyHi);

      return {
        intent: 'NAVIGATE',
        targetRoute: '/services/revenue/income-certificate',
        serviceId: 'uk-rev-income',
        confidence: 0.98,
        extractedSlots: newlyExtractedSlots,
        activeFieldId: 'applicant_name',
        shouldAutoListen: true,
        spokenResponseHindi: replyHi,
        spokenResponseEnglish: replyEn,
      };
    }

    // 5. Form Confirmation Check (ONLY if confirmation was actually pending!)
    const isAffirmative =
      lower.includes('yes') ||
      lower.includes('submit') ||
      lower.includes('haan') ||
      lower.includes('हाँ') ||
      lower.includes('हाँजी') ||
      lower.includes('कर दो') ||
      lower.includes('सबमिट') ||
      lower.includes('जमा कर दो') ||
      lower.includes('proceed') ||
      lower.includes('agree') ||
      lower.includes('सही है');

    const isExplicitNegative =
      lower === 'no' ||
      lower === 'nahin' ||
      lower === 'नहीं' ||
      lower === 'रुक जाओ' ||
      lower === 'मत करो' ||
      lower === 'cancel';

    if (session.isConfirmationPending) {
      if (isAffirmative) {
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const subId = `UK-REV-2026-${randomNum}`;
        this.sessionService.updateSession(sessionId, {
          isConfirmationPending: false,
          isSubmitted: true,
          submissionId: subId,
        });
        const replyHi = `आपका आवेदन राजस्व विभाग में सफलता पूर्वक जमा हो गया है! आपकी आवेदन संख्या है ${subId}। सेवा का अधिकार (RTS) के तहत यह 15 दिनों में जारी होगा।`;
        const replyEn = `Your application has been successfully submitted to the Revenue Department! Your tracking number is ${subId}. Under RTS Act, it will be issued within 15 days.`;
        this.sessionService.recordHistory(sessionId, 'assistant', replyHi);
        return {
          intent: 'FORM_SUBMITTED',
          confidence: 0.99,
          submissionId: subId,
          isFormSubmitted: true,
          shouldAutoListen: false,
          spokenResponseHindi: replyHi,
          spokenResponseEnglish: replyEn,
        };
      }

      if (isExplicitNegative) {
        this.sessionService.updateSession(sessionId, { isConfirmationPending: false });
        const replyHi = 'ठीक है, आवेदन जमा नहीं किया गया है। आप कौन सा विवरण बदलना चाहते हैं?';
        const replyEn = 'Understood, submission paused. Which details would you like to edit?';
        this.sessionService.recordHistory(sessionId, 'assistant', replyHi);
        return {
          intent: 'GENERAL_QUERY',
          confidence: 0.95,
          shouldAutoListen: true,
          spokenResponseHindi: replyHi,
          spokenResponseEnglish: replyEn,
        };
      }
    }

    // 6. Active Form Sequential Turn-Taking (Only when on a form page)
    const isFormRoute = currentRoute.includes('/services/');

    if (isFormRoute) {
      // Document inquiry
      if (
        lower.includes('document') ||
        lower.includes('दस्तावेज') ||
        lower.includes('कागजात') ||
        lower.includes('chahiye') ||
        lower.includes('चाहिए')
      ) {
        const replyHi =
          'इस प्रमाण पत्र हेतु आवश्यक दस्तावेज़ हैं: राशन कार्ड या परिवार रजिस्टर की नकल, आय का स्व-घोषणा पत्र या वेतन पर्ची, और आधार कार्ड। क्या हम फॉर्म भरना जारी रखें?';
        const replyEn =
          'Required documents are: Parivar Register or Ration card copy, income self-declaration or salary slip, and Aadhaar card. Shall we continue filling your form?';
        this.sessionService.recordHistory(sessionId, 'assistant', replyHi);
        return {
          intent: 'EXPLAIN_ELEMENT',
          confidence: 0.96,
          shouldAutoListen: true,
          spokenResponseHindi: replyHi,
          spokenResponseEnglish: replyEn,
        };
      }

      return this.handleFormInterviewTurn(sessionId, text, newlyExtractedSlots);
    }

    // Default Fallback
    return {
      intent: 'GENERAL_QUERY',
      confidence: 0.7,
      shouldAutoListen: true,
      spokenResponseHindi: `मैंने सुना: "${text}"। आप कह सकते हैं "आय प्रमाण पत्र", "मूल निवास", "आवेदन ट्रैक करें", या "हेल्पलाइन नंबर"।`,
      spokenResponseEnglish: `I heard: "${text}". You can ask to open any service like "Income Certificate", "Domicile Form", "Track Status", or "Helpline 1905".`,
    };
  }

  /**
   * Stateful Interview Engine: Retains context across turns and sequentially fills missing form fields
   */
  private handleFormInterviewTurn(
    sessionId: string,
    text: string,
    newSlots: Record<string, any>
  ): IntentResponse {
    const session = this.sessionService.getOrCreateSession(sessionId);
    const slots = { ...session.collectedSlots, ...newSlots };
    const currentActive = session.activeFieldId;

    // Direct answer attribution: If user spoke an answer to the currently highlighted question
    if (currentActive && !newSlots[currentActive] && text.trim().length > 1) {
      if (currentActive === 'applicant_name') {
        slots.applicant_name = text.trim();
      } else if (currentActive === 'father_husband_name') {
        slots.father_husband_name = text.trim();
      } else if (currentActive === 'annual_income') {
        const parsed = this.slotNormalizer.normalizeSlots(text).annual_income;
        if (parsed) slots.annual_income = parsed;
        else {
          const numMatch = text.match(/\d+/);
          if (numMatch) slots.annual_income = parseInt(numMatch[0], 10);
        }
      } else if (currentActive === 'district') {
        slots.district = text.trim();
      }
    }

    // Persist slots to stateful session
    this.sessionService.updateSession(sessionId, { collectedSlots: slots });

    // Step 1: Check Applicant Name
    if (!slots.applicant_name) {
      this.sessionService.updateSession(sessionId, { activeFieldId: 'applicant_name' });
      const replyHi = 'आय प्रमाण पत्र के लिए, कृपया आवेदक का पूरा नाम बताएं?';
      const replyEn = 'For your Income Certificate, please state the applicant\'s full name?';
      this.sessionService.recordHistory(sessionId, 'assistant', replyHi);
      return {
        intent: 'FILL_FIELD',
        targetRoute: '/services/revenue/income-certificate',
        extractedSlots: slots,
        activeFieldId: 'applicant_name',
        shouldAutoListen: true,
        spokenResponseHindi: replyHi,
        spokenResponseEnglish: replyEn,
        confidence: 0.95,
      };
    }

    // Step 2: Check Father / Husband Name
    if (!slots.father_husband_name) {
      this.sessionService.updateSession(sessionId, { activeFieldId: 'father_husband_name' });
      const replyHi = `आवेदक का नाम ${slots.applicant_name} दर्ज हो गया। आपके पिता या पति का नाम क्या है?`;
      const replyEn = `Recorded applicant as ${slots.applicant_name}. What is your father's or husband's name?`;
      this.sessionService.recordHistory(sessionId, 'assistant', replyHi);
      return {
        intent: 'FILL_FIELD',
        targetRoute: '/services/revenue/income-certificate',
        extractedSlots: slots,
        activeFieldId: 'father_husband_name',
        shouldAutoListen: true,
        spokenResponseHindi: replyHi,
        spokenResponseEnglish: replyEn,
        confidence: 0.95,
      };
    }

    // Step 3: Check Annual Income
    if (!slots.annual_income) {
      this.sessionService.updateSession(sessionId, { activeFieldId: 'annual_income' });
      const replyHi = `पिता का नाम ${slots.father_husband_name} दर्ज हो गया। आपकी कुल वार्षिक पारिवारिक आय कितनी है? (जैसे: साठ हज़ार या 60000)`;
      const replyEn = `Recorded father's name as ${slots.father_husband_name}. What is your total annual family income in rupees?`;
      this.sessionService.recordHistory(sessionId, 'assistant', replyHi);
      return {
        intent: 'FILL_FIELD',
        targetRoute: '/services/revenue/income-certificate',
        extractedSlots: slots,
        activeFieldId: 'annual_income',
        shouldAutoListen: true,
        spokenResponseHindi: replyHi,
        spokenResponseEnglish: replyEn,
        confidence: 0.95,
      };
    }

    // Step 4: Check District
    if (!slots.district) {
      this.sessionService.updateSession(sessionId, { activeFieldId: 'district' });
      const replyHi = `वार्षिक आय ₹${Number(slots.annual_income).toLocaleString('en-IN')} दर्ज हो गई। आप उत्तराखंड के किस ज़िले में रहते हैं? (उदा. देहरादून, हरिद्वार, नैनीताल)`;
      const replyEn = `Recorded annual income ₹${Number(slots.annual_income).toLocaleString('en-IN')}. In which district of Uttarakhand do you reside?`;
      this.sessionService.recordHistory(sessionId, 'assistant', replyHi);
      return {
        intent: 'FILL_FIELD',
        targetRoute: '/services/revenue/income-certificate',
        extractedSlots: slots,
        activeFieldId: 'district',
        shouldAutoListen: true,
        spokenResponseHindi: replyHi,
        spokenResponseEnglish: replyEn,
        confidence: 0.95,
      };
    }

    // Step 5: All Required Fields Ready -> Citizen Confirmation Turn
    this.sessionService.updateSession(sessionId, { isConfirmationPending: true, activeFieldId: undefined });
    const replyHi = `आय प्रमाण पत्र के सभी मुख्य विवरण तैयार हैं: आवेदक ${slots.applicant_name}, पिता ${slots.father_husband_name}, ज़िला ${slots.district}, वार्षिक आय ₹${Number(slots.annual_income).toLocaleString('en-IN')}। क्या मैं यह आवेदन अभी जमा (सबमिट) कर दूँ?`;
    const replyEn = `All primary details are ready: Applicant ${slots.applicant_name}, Father ${slots.father_husband_name}, District ${slots.district}, Annual Income ₹${Number(slots.annual_income).toLocaleString('en-IN')}. Shall I submit your application now?`;
    this.sessionService.recordHistory(sessionId, 'assistant', replyHi);

    return {
      intent: 'CONFIRM_SUBMIT',
      targetRoute: '/services/revenue/income-certificate',
      extractedSlots: slots,
      isConfirmationPending: true,
      shouldAutoListen: true,
      spokenResponseHindi: replyHi,
      spokenResponseEnglish: replyEn,
      confidence: 0.98,
    };
  }

  public getCatalog(): ServiceRecord[] {
    return this.servicesCatalog;
  }
}
