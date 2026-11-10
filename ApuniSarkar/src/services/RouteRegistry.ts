/**
 * RouteRegistry
 * Centralized registry of all valid application routes with aliases,
 * multilingual synonyms, ambiguity detection, and fuzzy matching.
 */

export interface RouteEntry {
  path: string;
  id: string;
  titleEn: string;
  titleHi: string;
  category: 'core' | 'service' | 'info';
  aliasesEn: string[];
  aliasesHi: string[];
  aliasesHinglish: string[];
  descriptionEn: string;
  descriptionHi: string;
}

export interface RouteResolution {
  status: 'FOUND' | 'AMBIGUOUS' | 'NOT_FOUND';
  targetRoute?: string;
  routeDefinition?: RouteEntry;
  candidates?: RouteEntry[];
  spokenResponseHindi: string;
  spokenResponseEnglish: string;
  spokenResponseHinglish: string;
}

export const APP_ROUTES: RouteEntry[] = [
  {
    path: '/',
    id: 'home',
    titleEn: 'Home',
    titleHi: 'मुख्य पृष्ठ',
    category: 'core',
    aliasesEn: ['home', 'homepage', 'main page', 'start page', 'portal home', 'return to home', 'go to home', 'home screen'],
    aliasesHi: ['होम', 'मुख्य पृष्ठ', 'होम पेज', 'होमपेज', 'शुरुआती पेज', 'मुखपृष्ठ'],
    aliasesHinglish: ['home page', 'homepage', 'mukhya prishth', 'home pe jao', 'home kholo', 'shuruati page'],
    descriptionEn: 'Official homepage of Apuni Sarkar citizen services portal.',
    descriptionHi: 'अपनी सरकार नागरिक सेवा पोर्टल का मुख्य पृष्ठ।',
  },
  {
    path: '/download-certificates',
    id: 'download-certificates',
    titleEn: 'Download Certificates',
    titleHi: 'प्रमाण पत्र डाउनलोड',
    category: 'core',
    aliasesEn: [
      'download certificate', 'download certificates', 'download my certificate',
      'download certificate page', 'open my certificates', 'my certificates',
      'i want to download my certificate', 'certificate download', 'get certificate',
      'issued certificates', 'download issued certificates'
    ],
    aliasesHi: [
      'प्रमाण पत्र डाउनलोड', 'सर्टिफिकेट डाउनलोड', 'डाउनलोड सर्टिफिकेट', 'डाउनलोड प्रमाण पत्र',
      'मेरा प्रमाण पत्र डाउनलोड', 'प्रमाण पत्र निकालें', 'जारी प्रमाण पत्र डाउनलोड'
    ],
    aliasesHinglish: [
      'download certificate', 'certificate download', 'praman patra download',
      'download certificate page', 'certificate download karo', 'mujhe certificate download karna hai',
      'mera certificate download karo', 'certificate nikalna hai'
    ],
    descriptionEn: 'Download verified digital citizen certificates using 16-digit Application ID or mobile OTP.',
    descriptionHi: '16-अंकीय आवेदन क्रमांक या मोबाइल ओटीपी द्वारा डिजिटल प्रमाण पत्र डाउनलोड करें।',
  },
  {
    path: '/track',
    id: 'track-application',
    titleEn: 'Track Application Status',
    titleHi: 'आवेदन की स्थिति जांचें',
    category: 'core',
    aliasesEn: [
      'track', 'track application', 'application status', 'check status', 'track my application',
      'take me to the application status', 'application tracking', 'status check', 'track status'
    ],
    aliasesHi: [
      'ट्रैक', 'आवेदन ट्रैक', 'स्थिति', 'आवेदन की स्थिति', 'स्थिति जांचें', 'आवेदन ट्रैक करें', 'स्टेटस चेक'
    ],
    aliasesHinglish: [
      'application track karo', 'application status', 'status check karo', 'track application',
      'aavedan ki sthiti', 'status dekhna hai', 'application kahan tak pahuchi'
    ],
    descriptionEn: 'Real-time 16-digit application lifecycle tracker across all Uttarakhand government departments.',
    descriptionHi: 'सभी विभागों के 16-अंकीय आवेदन पत्रों की वास्तविक स्थिति जांचें।',
  },
  {
    path: '/verify',
    id: 'verify-certificate',
    titleEn: 'Verify Certificate',
    titleHi: 'प्रमाण पत्र सत्यापन',
    category: 'core',
    aliasesEn: [
      'verify', 'verify certificate', 'certificate verification', 'verify my certificate',
      'check certificate validity', 'digital certificate verification', 'qr verification'
    ],
    aliasesHi: [
      'सत्यापन', 'प्रमाण पत्र सत्यापन', 'सर्टिफिकेट सत्यापन', 'सत्यापित करें', 'डिजिटल सत्यापन'
    ],
    aliasesHinglish: [
      'certificate verify karo', 'praman patra satyapan', 'verify certificate', 'check certificate'
    ],
    descriptionEn: 'Public digital certificate verification with QR Code or Certificate ID.',
    descriptionHi: 'क्यूआर कोड या प्रमाण पत्र क्रमांक द्वारा डिजिटल प्रमाण पत्र का सत्यापन।',
  },
  {
    path: '/all-services',
    id: 'all-services',
    titleEn: 'All Services Directory',
    titleHi: 'सभी सरकारी सेवाएं',
    category: 'core',
    aliasesEn: [
      'all services', 'services', 'services directory', 'service list', 'list of services',
      'catalogue', 'all government services', 'browse services', 'available services'
    ],
    aliasesHi: [
      'सभी सेवाएं', 'सेवाएं', 'सेवा सूची', 'सरकारी सेवाएं', 'विभाग और सेवाएं', 'नागरिक सेवाएं'
    ],
    aliasesHinglish: [
      'all services', 'sari sevayein', 'services list', 'services directory', 'sevayein dikhao'
    ],
    descriptionEn: 'Categorized directory of 1,159 citizen services and welfare schemes.',
    descriptionHi: '1,159 से अधिक नागरिक सेवाओं और कल्याणकारी योजनाओं की सूची।',
  },
  {
    path: '/dashboard',
    id: 'dashboard',
    titleEn: 'State Governance Dashboard',
    titleHi: 'राज्य सेवा डैशबोर्ड',
    category: 'core',
    aliasesEn: [
      'dashboard', 'governance dashboard', 'state dashboard', 'return to the dashboard',
      'open dashboard', 'metrics', 'analytics', 'statistics', 'portal statistics'
    ],
    aliasesHi: [
      'डैशबोर्ड', 'राज्य डैशबोर्ड', 'आंकड़े', 'प्रगति डैशबोर्ड', 'पोर्टल डैशबोर्ड'
    ],
    aliasesHinglish: [
      'dashboard', 'dashboard kholo', 'dashboard par le chalo', 'dashboard dikhao', 'state dashboard'
    ],
    descriptionEn: 'Real-time state service delivery statistics, district rankings, and SLAs.',
    descriptionHi: 'रियल-टाइम राज्य सेवा वितरण आंकड़े, जिला रैंकिंग और सेवा अधिकार अधिनियम समय सीमा।',
  },
  {
    path: '/services/revenue/income-certificate',
    id: 'income-certificate',
    titleEn: 'Income Certificate Form',
    titleHi: 'आय प्रमाण पत्र आवेदन',
    category: 'service',
    aliasesEn: [
      'income certificate', 'income form', 'aay praman patra', 'apply for income certificate',
      'income certificate application', 'income certificate form', 'salary certificate'
    ],
    aliasesHi: [
      'आय प्रमाण पत्र', 'आय प्रमाण पत्र आवेदन', 'आय का प्रमाण पत्र', 'आय प्रमाण पत्र फॉर्म', 'आमदनी प्रमाण पत्र'
    ],
    aliasesHinglish: [
      'income certificate', 'aay praman patra', 'income certificate ka form', 'income certificate kholo',
      'mujhe aay praman patra banwana hai', 'aay praman form'
    ],
    descriptionEn: 'Household annual income certificate issued by Tehsildar within 15 days.',
    descriptionHi: 'तहसीलदार द्वारा 15 दिनों में जारी किया जाने वाला वार्षिक आय प्रमाण पत्र।',
  },
  {
    path: '/services/revenue/domicile-certificate',
    id: 'domicile-certificate',
    titleEn: 'Permanent Residence (Domicile) Certificate Form',
    titleHi: 'स्थायी निवास (मूल निवास) प्रमाण पत्र आवेदन',
    category: 'service',
    aliasesEn: [
      'domicile certificate', 'permanent residence', 'domicile form', 'residence certificate',
      'permanent residence certificate', 'mool niwas', 'sthayi niwas'
    ],
    aliasesHi: [
      'स्थायी निवास प्रमाण पत्र', 'मूल निवास', 'मूल निवास प्रमाण पत्र', 'निवास प्रमाण पत्र', 'स्थायी निवास'
    ],
    aliasesHinglish: [
      'domicile certificate', 'sthayi niwas', 'mool niwas', 'niwas praman patra', 'domicile form kholo',
      'sthayi niwas form'
    ],
    descriptionEn: 'Official Uttarakhand domicile proof establishing 15+ years state residence.',
    descriptionHi: 'उत्तराखंड में 15 वर्ष या उससे अधिक समय से निवास का आधिकारिक स्थायी निवास प्रमाण।',
  },
  {
    path: '/services/revenue/hill-area-certificate',
    id: 'hill-area-certificate',
    titleEn: 'Hill Area Certificate Form',
    titleHi: 'पर्वतीय क्षेत्र प्रमाण पत्र आवेदन',
    category: 'service',
    aliasesEn: [
      'hill area certificate', 'hill certificate', 'parvatiya praman patra', 'hill area form',
      'parvatiya certificate', 'pahar certificate', 'mountain area certificate'
    ],
    aliasesHi: [
      'पर्वतीय प्रमाण पत्र', 'पर्वतीय क्षेत्र प्रमाण पत्र', 'पहाड़ी प्रमाण पत्र', 'पर्वतीय फॉर्म'
    ],
    aliasesHinglish: [
      'hill area certificate', 'parvatiya praman patra', 'pahadi certificate', 'hill certificate'
    ],
    descriptionEn: 'Certificate for citizens living in notified hill terrains for recruitment relaxation.',
    descriptionHi: 'अधिसूचित पर्वतीय क्षेत्रों में रहने वाले नागरिकों हेतु ऊंचाई/शारीरिक छूट प्रमाण पत्र।',
  },
  {
    path: '/services/panchayati-raj/pariwar-register',
    id: 'pariwar-register',
    titleEn: 'Copy of Pariwar Register',
    titleHi: 'परिवार रजिस्टर की नकल',
    category: 'service',
    aliasesEn: [
      'pariwar register', 'family register', 'copy of pariwar register', 'kutumb register',
      'panchayat family register', 'pariwar register nakal'
    ],
    aliasesHi: [
      'परिवार रजिस्टर', 'परिवार रजिस्टर की नकल', 'कुटुंब रजिस्टर', 'कुटुंब रजिस्टर नकल'
    ],
    aliasesHinglish: [
      'pariwar register', 'pariwar register ki nakal', 'family register', 'kutumb register'
    ],
    descriptionEn: 'Certified lineage record of household members from gram panchayat records within 7 days.',
    descriptionHi: 'ग्राम पंचायत कुटुंब रजिस्टर से परिवार के सदस्यों का 7 दिनों में प्रमाणित रिकॉर्ड।',
  },
  {
    path: '/important-gos',
    id: 'important-gos',
    titleEn: 'Important Government Orders',
    titleHi: 'महत्वपूर्ण शासनादेश (GOs)',
    category: 'info',
    aliasesEn: [
      'government orders', 'important gos', 'gos', 'orders', 'notifications', 'official orders',
      'government notifications', 'circulars'
    ],
    aliasesHi: [
      'शासनादेश', 'महत्वपूर्ण शासनादेश', 'सरकारी आदेश', 'अधिसूचनाएं', 'शासकीय आदेश'
    ],
    aliasesHinglish: [
      'important gos', 'shasanadesh', 'sarkari aadesh', 'government orders', 'gos page'
    ],
    descriptionEn: 'Official government gazettes, orders, and citizen service policy guidelines.',
    descriptionHi: 'आधिकारिक सरकारी राजपत्र, शासनादेश और नागरिक सेवा नीति निर्देश।',
  },
  {
    path: '/about',
    id: 'about-us',
    titleEn: 'About Apuni Sarkar & ITDA',
    titleHi: 'अपनी सरकार एवं आईटीडीए के बारे में',
    category: 'info',
    aliasesEn: ['about', 'about us', 'about apuni sarkar', 'itda', 'information technology development agency'],
    aliasesHi: ['हमारे बारे में', 'अपनी सरकार के बारे में', 'आईटीडीए', 'परिचय'],
    aliasesHinglish: ['about us', 'about page', 'apuni sarkar ke bare mein', 'itda uttarakhand'],
    descriptionEn: 'Background information on Uttarakhand citizen service initiative and ITDA.',
    descriptionHi: 'उत्तराखंड नागरिक सेवा पहल और आईटीडीए की पृष्ठभूमि और उद्देश्य।',
  },
  {
    path: '/faqs',
    id: 'faqs',
    titleEn: 'Frequently Asked Questions (FAQs)',
    titleHi: 'प्रायः पूछे जाने वाले प्रश्न (FAQs)',
    category: 'info',
    aliasesEn: ['faq', 'faqs', 'frequently asked questions', 'help questions', 'questions and answers', 'qna'],
    aliasesHi: ['एफएक्यू', 'प्रायः पूछे जाने वाले प्रश्न', 'सवाल जवाब', 'सामान्य प्रश्न', 'प्रश्नोत्तर'],
    aliasesHinglish: ['faqs', 'faq page', 'sawal jawab', 'questions', 'frequently asked questions'],
    descriptionEn: 'Comprehensive answers to common citizen inquiries on portal usage.',
    descriptionHi: 'पोर्टल उपयोग, शुल्क और दस्तावेज़ आवश्यकताओं पर सामान्य नागरिक प्रश्नों के उत्तर।',
  },
  {
    path: '/whats-new',
    id: 'whats-new',
    titleEn: "What's New & Updates",
    titleHi: 'नवीन अपडेट एवं घोषणाएं',
    category: 'info',
    aliasesEn: ["what's new", 'whats new', 'latest updates', 'news', 'announcements', 'new features'],
    aliasesHi: ['नया क्या है', 'नवीन अपडेट', 'ताज़ा समाचार', 'घोषणाएं'],
    aliasesHinglish: ['whats new', 'naya kya hai', 'latest news', 'updates'],
    descriptionEn: 'Latest news, newly launched departmental services, and citizen advisories.',
    descriptionHi: 'नवीनतम समाचार, नई जोड़ी गई विभागीय सेवाएं और नागरिक सूचनाएं।',
  },
  {
    path: '/contact-us',
    id: 'contact-us',
    titleEn: 'Contact Us & Helpline 1905',
    titleHi: 'संपर्क करें एवं हेल्पलाइन 1905',
    category: 'info',
    aliasesEn: [
      'contact', 'contact us', 'helpline', 'toll free', '1905', 'phone number', 'support',
      'customer care', 'help desk', 'toll free helpline number'
    ],
    aliasesHi: [
      'संपर्क', 'संपर्क करें', 'हेल्पलाइन', 'टोल फ्री', '1905', 'सहायता केंद्र', 'कस्टमर केयर'
    ],
    aliasesHinglish: [
      'contact us', 'sampark karein', 'helpline number', 'toll free 1905', 'support page'
    ],
    descriptionEn: 'Contact details of ITDA Uttarakhand and 24x7 CM Helpline 1905.',
    descriptionHi: 'आईटीडीए उत्तराखंड और 24x7 सीएम हेल्पलाइन 1905 संपर्क विवरण।',
  },
  {
    path: '/login',
    id: 'login',
    titleEn: 'Citizen Login / Sign In',
    titleHi: 'नागरिक लॉग इन / प्रवेश',
    category: 'core',
    aliasesEn: ['login', 'sign in', 'citizen login', 'user login', 'account login', 'officer login'],
    aliasesHi: ['लॉग इन', 'साइन इन', 'प्रवेश', 'खाता लॉग इन'],
    aliasesHinglish: ['login', 'login page', 'sign in', 'pravesh', 'login karo'],
    descriptionEn: 'Citizen and departmental officer authentication gateway.',
    descriptionHi: 'नागरिक और विभागीय अधिकारी प्रमाणीकरण पोर्टल।',
  },
  {
    path: '/sitemap',
    id: 'sitemap',
    titleEn: 'Portal Sitemap',
    titleHi: 'पोर्टल साइटमैप',
    category: 'info',
    aliasesEn: ['sitemap', 'site map', 'page directory', 'all pages'],
    aliasesHi: ['साइटमैप', 'साइट मैप', 'समस्त पृष्ठ सूची'],
    aliasesHinglish: ['sitemap', 'sitemap page', 'sitemap dikhao'],
    descriptionEn: 'Hierarchical structural index of all pages and services across the portal.',
    descriptionHi: 'पोर्टल के सभी पृष्ठों और सेवाओं की संपूर्ण संरचनात्मक अनुक्रमणिका।',
  },
];

export class RouteRegistry {
  /**
   * Resolves a natural-language voice query into a valid route,
   * detecting ambiguity, synonyms, or non-existent routes.
   */
  public static resolve(rawQuery: string): RouteResolution {
    if (!rawQuery || typeof rawQuery !== 'string') {
      return {
        status: 'NOT_FOUND',
        spokenResponseEnglish: 'Please specify where you would like to navigate.',
        spokenResponseHindi: 'कृपया बताएं कि आप किस पेज पर जाना चाहते हैं।',
        spokenResponseHinglish: 'Kripya batayein aap kis page par jana chahte hain.',
      };
    }

    const cleaned = rawQuery.trim();
    const lower = cleaned.toLowerCase();

    // 1. Check for History Navigation: "go back" / "previous page"
    if (
      lower.includes('go back') ||
      lower.includes('previous page') ||
      lower.includes('back page') ||
      lower.includes('peeche jao') ||
      lower.includes('pichle page') ||
      lower.includes('pichhla page') ||
      lower.includes('पीछे जाओ') ||
      lower.includes('पिछले पेज') ||
      lower.includes('वापस जाओ') ||
      lower === 'back'
    ) {
      return {
        status: 'FOUND',
        targetRoute: '__BACK__',
        spokenResponseEnglish: 'Returning to the previous page.',
        spokenResponseHindi: 'पिछले पेज पर वापस जाया जा रहा है।',
        spokenResponseHinglish: 'Pichle page par wapas ja rahe hain.',
      };
    }

    // 2. Strip conversational navigation filler phrases
    const stripped = lower
      .replace(/^(please\s+)?(go\s+to(\s+the)?|take\s+me\s+to(\s+the)?|open(\s+the)?|navigate\s+to(\s+the)?|show\s+me(\s+the)?|i\s+want\s+to\s+go\s+to(\s+the)?|i\s+want\s+to(\s+open)?)\s+/i, '')
      .replace(/^(mujhe\s+)?(par\s+le\s+chalo|pe\s+le\s+chalo|kholo|par\s+jao|pe\s+jao|dikhao|le\s+chalo)\s+/i, '')
      .replace(/\s+(page|portal|screen|par\s+le\s+chalo|pe\s+le\s+chalo|kholo|par\s+jao|pe\s+jao|dikhao|le\s+chalo|chahiye|karna\s+hai|karein|karo)$/i, '')
      .trim();

    // 3. Exact alias and title matching
    for (const route of APP_ROUTES) {
      const allAliases = [
        route.titleEn.toLowerCase(),
        route.titleHi.toLowerCase(),
        ...route.aliasesEn.map((a) => a.toLowerCase()),
        ...route.aliasesHi.map((a) => a.toLowerCase()),
        ...route.aliasesHinglish.map((a) => a.toLowerCase()),
      ];

      if (allAliases.includes(lower) || allAliases.includes(stripped)) {
        return {
          status: 'FOUND',
          targetRoute: route.path,
          routeDefinition: route,
          spokenResponseEnglish: `Navigating to ${route.titleEn}.`,
          spokenResponseHindi: `${route.titleHi} खोला जा रहा है।`,
          spokenResponseHinglish: `${route.titleEn} page khola ja raha hai.`,
        };
      }
    }

    // 4. Ambiguity Detection: If user specifies an ambiguous generic term
    // E.g. "certificates" / "certificate" / "प्रमाण पत्र" alone
    if (
      stripped === 'certificate' ||
      stripped === 'certificates' ||
      stripped === 'praman patra' ||
      stripped === 'प्रमाण पत्र' ||
      stripped === 'सर्टिफिकेट'
    ) {
      const certificateRoutes = APP_ROUTES.filter((r) =>
        r.path.includes('certificate') || r.path.includes('download')
      );
      return {
        status: 'AMBIGUOUS',
        candidates: certificateRoutes,
        spokenResponseEnglish: 'Which certificate page would you like to open? Download Certificates, Income Certificate, Domicile Certificate, or Hill Area Certificate?',
        spokenResponseHindi: 'आप कौन सा प्रमाण पत्र पेज खोलना चाहते हैं? डाउनलोड प्रमाण पत्र, आय प्रमाण पत्र, मूल निवास, या पर्वतीय प्रमाण पत्र?',
        spokenResponseHinglish: 'Aap kaunsa certificate page kholna chahte hain? Download Certificates, Income, Domicile, ya Hill Area Certificate?',
      };
    }

    // 5. Semantic / Substring / Fuzzy match
    const matches: Array<{ route: RouteEntry; score: number }> = [];

    for (const route of APP_ROUTES) {
      let score = 0;
      const allAliases = [
        route.titleEn.toLowerCase(),
        route.titleHi.toLowerCase(),
        ...route.aliasesEn.map((a) => a.toLowerCase()),
        ...route.aliasesHi.map((a) => a.toLowerCase()),
        ...route.aliasesHinglish.map((a) => a.toLowerCase()),
      ];

      for (const alias of allAliases) {
        if (stripped === alias) {
          score = Math.max(score, 100 + alias.length);
        } else if (alias.length >= 6 || alias.includes(' ')) {
          if (lower.includes(alias)) {
            score = Math.max(score, 50 + alias.length);
          }
        } else if (alias.length >= 3) {
          const wordRegex = new RegExp(`(^|\\s)${alias}($|\\s)`, 'i');
          if (wordRegex.test(stripped) || wordRegex.test(lower)) {
            score = Math.max(score, 20 + alias.length);
          }
        }
      }

      if (score > 0) {
        matches.push({ route, score });
      }
    }

    if (matches.length > 0) {
      // Sort by best match score
      matches.sort((a, b) => b.score - a.score);

      // If top match is significantly better than second match, pick it
      if (matches.length === 1 || matches[0].score > matches[1].score * 1.3) {
        const best = matches[0].route;
        return {
          status: 'FOUND',
          targetRoute: best.path,
          routeDefinition: best,
          spokenResponseEnglish: `Opening ${best.titleEn}.`,
          spokenResponseHindi: `${best.titleHi} खोला जा रहा है।`,
          spokenResponseHinglish: `${best.titleEn} page khola ja raha hai.`,
        };
      }

      // If multiple candidates are similarly scored, treat as ambiguous
      return {
        status: 'AMBIGUOUS',
        candidates: matches.slice(0, 3).map((m) => m.route),
        spokenResponseEnglish: `Did you mean ${matches[0].route.titleEn} or ${matches[1].route.titleEn}? Please clarify.`,
        spokenResponseHindi: `क्या आप ${matches[0].route.titleHi} या ${matches[1].route.titleHi} खोलना चाहते हैं? कृपया स्पष्ट करें।`,
        spokenResponseHinglish: `Kya aap ${matches[0].route.titleEn} ya ${matches[1].route.titleEn} kholna chahte hain?`,
      };
    }

    // 6. Explicit NOT_FOUND: Explain that page was not found, offer valid suggestions
    return {
      status: 'NOT_FOUND',
      spokenResponseEnglish: `Sorry, I could not find a page matching "${rawQuery}". You can say Home, Download Certificates, Services, Track Status, or Dashboard.`,
      spokenResponseHindi: `माफ़ कीजिये, "${rawQuery}" से संबंधित कोई पेज नहीं मिला। आप होम, प्रमाण पत्र डाउनलोड, सेवाएं, या डैशबोर्ड के लिए कह सकते हैं।`,
      spokenResponseHinglish: `Maaf kijiye, "${rawQuery}" page nahi mila. Aap Home, Download Certificates, Services, ya Dashboard par ja sakte hain.`,
    };
  }
}
