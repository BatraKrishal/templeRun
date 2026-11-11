export class SlotNormalizerService {
  private static HINDI_NUMBER_WORDS: Record<string, number> = {
    'शून्य': 0, 'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5, 'पाँच': 5, 'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
    'बीस': 20, 'तीस': 30, 'चालीस': 40, 'पचास': 50, 'साठ': 60, 'सत्तर': 70, 'अस्सी': 80, 'नब्बे': 90,
    'सौ': 100, 'हज़ार': 1000, 'हजार': 1000, 'लाख': 100000, 'करोड़': 10000000,
  };

  private static UTTARAKHAND_DISTRICTS = [
    'Dehradun',
    'Haridwar',
    'Nainital',
    'Pauri Garhwal',
    'Tehri Garhwal',
    'Almora',
    'Chamoli',
    'Rudraprayag',
    'Uttarkashi',
    'Pithoragarh',
    'Bageshwar',
    'Champawat',
    'Udham Singh Nagar',
  ];

  /**
   * Identifies whether a spoken phrase contains domain control, field or portal keywords,
   * making it impossible to be a valid person's name.
   */
  public static isNonNameText(text: string): boolean {
    const lower = text.toLowerCase().trim();
    const domainTerms = [
      'income', 'source', 'private', 'job', 'salaried', 'salary', 'annual', 'agriculture', 'farming', 'farmer',
      'labour', 'business', 'shop', 'pension', 'pensioner', 'male', 'female', 'gender', 'ration', 'card',
      'scholarship', 'admission', 'scheme', 'mobile', 'phone', 'district', 'tehsil', 'circle', 'village',
      'ward', 'block', 'panchayat', 'aadhaar', 'uid', 'application', 'certificate', 'download', 'track',
      'status', 'verify', 'dashboard', 'page', 'form', 'select', 'choose', 'enter', 'clear', 'submit',
      'service', 'kholo', 'jao', 'chalo', 'dikhao', 'primary',
      // Hindi & Devanagari terms
      'आय', 'साधन', 'स्रोत', 'प्राइवेट', 'जॉब', 'नौकरी', 'वेतनभोगी', 'कृषि', 'बागवानी', 'किसान', 'खेती',
      'मजदूरी', 'दिहाड़ी', 'मजदूर', 'श्रमिक', 'व्यापार', 'दुकान', 'पेंशन', 'पेंशनर', 'राशन', 'कार्ड',
      'छात्रवृत्ति', 'वजीफा', 'प्रवेश', 'दाखिला', 'स्कूल', 'कॉलेज', 'योजना', 'लिंग', 'पुरुष', 'महिला',
      'मोबाइल', 'फोन', 'नंबर', 'जनपद', 'जिला', 'तहसील', 'पटवारी', 'लेखपाल', 'गाँव', 'गांव', 'वार्ड',
      'ब्लॉक', 'पंचायत', 'आधार', 'आवेदन', 'प्रमाण पत्र', 'सर्टिफिकेट', 'पेज', 'खोलो', 'जाओ', 'चलो',
      'डैशबोर्ड', 'स्थिति', 'ट्रैक', 'जमा', 'चयन', 'प्राइमरी'
    ];
    return domainTerms.some((term) => lower.includes(term));
  }

  /**
   * Normalizes spoken input text into structured form slot values.
   */
  public normalizeSlots(spokenText: string, activeFieldId?: string): Record<string, any> {
    const slots: Record<string, any> = {};
    const lower = spokenText.toLowerCase().trim();

    // 1. Detect Annual Income (Numbers or Hindi currency words)
    const incomeMatch = this.extractAnnualIncome(spokenText);
    if (incomeMatch !== null) {
      slots.annual_income = incomeMatch;
    }

    // 2. Detect Income Source (Salaried, Agriculture, Business, Labour, Pension)
    // Check both English/Romanized and Devanagari Hindi variants
    if (
      lower.includes('private job') ||
      lower.includes('private service') ||
      lower.includes('salaried') ||
      lower.includes('वेतनभोगी') ||
      lower.includes('प्राइवेट नौकरी') ||
      lower.includes('प्राइवेट जॉब') ||
      lower.includes('प्राइवेट सर्विस') ||
      lower.includes('प्राइवेट') ||
      lower.includes('नौकरीपेशा') ||
      (lower.includes('income source') && lower.includes('job')) ||
      (lower.includes('आय का') && lower.includes('नौकरी'))
    ) {
      slots.income_source = 'SALARIED';
    } else if (
      lower.includes('agriculture') ||
      lower.includes('farming') ||
      lower.includes('farmer') ||
      lower.includes('kheti') ||
      lower.includes('kisan') ||
      lower.includes('कृषि') ||
      lower.includes('बागवानी') ||
      lower.includes('किसान') ||
      lower.includes('खेती') ||
      lower.includes('काश्तकार')
    ) {
      slots.income_source = 'AGRICULTURE';
    } else if (
      lower.includes('labour') ||
      lower.includes('daily labour') ||
      lower.includes('majdoor') ||
      lower.includes('majdoori') ||
      lower.includes('मजदूरी') ||
      lower.includes('दिहाड़ी') ||
      lower.includes('मजदूर') ||
      lower.includes('दैनिक मजदूरी') ||
      lower.includes('श्रमिक')
    ) {
      slots.income_source = 'LABOUR';
    } else if (
      lower.includes('business') ||
      lower.includes('shop') ||
      lower.includes('shopkeeper') ||
      lower.includes('vyapar') ||
      lower.includes('dukan') ||
      lower.includes('व्यापार') ||
      lower.includes('दुकान') ||
      lower.includes('व्यवसाय') ||
      lower.includes('कारोबार') ||
      lower.includes('स्वरोजगार')
    ) {
      slots.income_source = 'BUSINESS';
    } else if (
      lower.includes('pension') ||
      lower.includes('pensioner') ||
      lower.includes('retire') ||
      lower.includes('पेंशन') ||
      lower.includes('पेंशनर') ||
      lower.includes('सेवानिवृत्त')
    ) {
      slots.income_source = 'PENSION';
    }

    // 3. Detect Certificate Purpose
    if (
      lower.includes('ration card') ||
      lower.includes('राशन कार्ड') ||
      lower.includes('राशन') ||
      lower.includes('खाद्य सुरक्षा')
    ) {
      slots.purpose = 'RATION_CARD';
    } else if (
      lower.includes('scholarship') ||
      lower.includes('छात्रवृत्ति') ||
      lower.includes('वजीफा') ||
      lower.includes('स्कॉलरशिप') ||
      lower.includes('chhatravritti')
    ) {
      slots.purpose = 'SCHOLARSHIP';
    } else if (
      lower.includes('admission') ||
      lower.includes('प्रवेश') ||
      lower.includes('दाखिला') ||
      lower.includes('school') ||
      lower.includes('college') ||
      lower.includes('स्कूल') ||
      lower.includes('कॉलेज') ||
      lower.includes('shiksha') ||
      lower.includes('शिक्षा')
    ) {
      slots.purpose = 'ADMISSION';
    } else if (
      lower.includes('scheme') ||
      lower.includes('योजना') ||
      lower.includes('सरकारी योजना') ||
      lower.includes('welfare') ||
      lower.includes('yojana')
    ) {
      slots.purpose = 'SCHEME';
    }

    // 4. Detect Gender
    if (
      lower.includes('select male') ||
      lower.includes('पुरुष') ||
      lower.includes('gender male') ||
      lower.includes('purush') ||
      lower.includes('आदमी') ||
      lower === 'male' ||
      lower === 'पुरुष'
    ) {
      slots.gender = 'MALE';
    } else if (
      lower.includes('select female') ||
      lower.includes('महिला') ||
      lower.includes('gender female') ||
      lower.includes('mahila') ||
      lower.includes('औरत') ||
      lower === 'female' ||
      lower === 'महिला'
    ) {
      slots.gender = 'FEMALE';
    }

    // 5. Detect Uttarakhand District or State
    for (const district of SlotNormalizerService.UTTARAKHAND_DISTRICTS) {
      if (lower.includes(district.toLowerCase())) {
        slots.district = district;
        break;
      }
    }
    if (!slots.district) {
      if (lower.includes('देहरादून') || lower.includes('dehradun')) slots.district = 'Dehradun';
      else if (lower.includes('हरिद्वार') || lower.includes('haridwar')) slots.district = 'Haridwar';
      else if (lower.includes('नैनीताल') || lower.includes('nainital')) slots.district = 'Nainital';
      else if (lower.includes('पौड़ी') || lower.includes('pauri')) slots.district = 'Pauri Garhwal';
      else if (lower.includes('टिहरी') || lower.includes('tehri')) slots.district = 'Tehri Garhwal';
      else if (lower.includes('अल्मोड़ा') || lower.includes('almora')) slots.district = 'Almora';
      else if (lower.includes('चमोली') || lower.includes('chamoli')) slots.district = 'Chamoli';
      else if (lower.includes('उत्तरकाशी') || lower.includes('uttarkashi')) slots.district = 'Uttarkashi';
      else if (lower.includes('पिथौरागढ़') || lower.includes('pithoragarh')) slots.district = 'Pithoragarh';
      else if (lower.includes('रुद्रप्रयाग') || lower.includes('rudraprayag')) slots.district = 'Rudraprayag';
      else if (lower.includes('चंपावत') || lower.includes('champawat')) slots.district = 'Champawat';
      else if (lower.includes('बागेश्वर') || lower.includes('bageshwar')) slots.district = 'Bageshwar';
      else if (lower.includes('उधम सिंह') || lower.includes('udham singh') || lower.includes('ऊधम सिंह') || lower.includes('रुद्रपुर')) slots.district = 'Udham Singh Nagar';
    }

    // State detection
    const stateMatch = lower.match(/(?:state|राज्य)?\s*(?:is|as)?\s*(uttar pradesh|uttarakhand|delhi|haryana|himachal pradesh)/i);
    if (stateMatch) {
      slots.state = stateMatch[1].trim();
    }

    // 6. Detect Mobile Number (supporting spaces/pauses in spoken digits e.g. "911 9066 06", "98765 43210")
    const cleanDigits = spokenText.replace(/(?<=\d)[\s\-]+(?=\d)/g, '');
    const phoneMatch = cleanDigits.match(/(?:मोबाइल(?:\s*नंबर)?|phone(?:\s*number)?|mobile(?:\s*number)?|number)?\s*([6-9]\d{9})\b/i);
    if (phoneMatch) {
      slots.mobile_number = phoneMatch[1];
    }

    // 7. Detect Date of Birth (DOB)
    const dobRegex = /(?:date of birth|dob|birth date|जन्म तिथि|janm tithi)(?:\s+is|\s+hai|\s*[:=])?\s*([0-9]{1,2}(?:st|nd|rd|th)?\s+[a-zA-Z\u0900-\u097F]+\s+[0-9]{4}|[0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{4})/i;
    const dobMatch = spokenText.match(dobRegex);
    if (dobMatch && dobMatch[1]) {
      slots.date_of_birth = dobMatch[1].trim();
    }

    // 8. Detect Tracking ID
    const trackingMatch = spokenText.match(/UK-[A-Z0-9]+-[0-9]+-[0-9]+/i) || spokenText.match(/\b\d{16}\b/) || spokenText.match(/UK\d{2}[A-Z]{2}\d{12}/i);
    if (trackingMatch) {
      slots.tracking_id = trackingMatch[0].toUpperCase();
    }

    // 9. Detect Aadhaar Number (12 digits, often spoken with spaces or dashes)
    const aadhaarMatch = spokenText.match(/(?:aadhaar|आधार|uid|adhar|uidai)?\s*([0-9]{4})[\s-]?([0-9]{4})[\s-]?([0-9]{4})/i);
    if (aadhaarMatch && aadhaarMatch[1] && aadhaarMatch[2] && aadhaarMatch[3]) {
      const lastFour = aadhaarMatch[3];
      slots.aadhaar_last_four = lastFour;
      slots.aadhaar_number = `XXXX-XXXX-${lastFour}`;
    }

    // 10. Detect Email Address
    const emailMatch = spokenText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      slots.email = emailMatch[1].trim();
    }

    // 11. Explicit Applicant Name patterns
    // e.g. "मेरा नाम कुलदीप सिंह नेगी है", "My name is Vimal", "Enter Vimal in the name field", "applicant name Vimal"
    const enterNameMatch = lower.match(/(?:enter|type|put|write|likho|daalo|दर्ज करो)\s+([a-zA-Z\u0900-\u097F\s]+?)\s+(?:in|into|as|mein|के रूप में)?\s*(?:the\s+)?(?:name|applicant|naam|नाम)(?:\s+field|\s+mein|$)/i);
    if (enterNameMatch && enterNameMatch[1]) {
      const candidate = this.cleanName(enterNameMatch[1]);
      if (!SlotNormalizerService.isNonNameText(candidate)) {
        slots.applicant_name = candidate;
      }
    } else {
      const nameRegex = /(?:मेरा नाम|म्यरु नौ|म्यर नौ|मेरो नौ|my name(?:\s+is)?|name(?:\s+is)?|applicant\s*name(?:\s+is)?|आवेदक(?:\s*का)?\s*नाम|आवेदक|पूरा नाम|mera naam)\s*[:=\-]?\s*([a-zA-Z\u0900-\u097F\s]+?)(?:\s+है|\s+hai|\s*,|\s+और|\s+and|\s+बल|\s+bal|$)/i;
      const nameMatch = spokenText.match(nameRegex);
      if (nameMatch && nameMatch[1]) {
        const rawName = nameMatch[1].trim();
        const candidate = this.cleanName(rawName);
        if (!SlotNormalizerService.isNonNameText(candidate)) {
          slots.applicant_name = candidate;
        }
      }
    }

    // 12. Explicit Father/Husband Name patterns (comprehensive honorifics & kinship support)
    const fatherRegex = /(?:पिता(?:श्री| जी|जी)?(?:\s*का\s*नाम)?|पिताश्री|बाबूजी(?:\s*का\s*नाम|\s*को\s*नौ)?|बाबूजी|पापा(?:\s*का\s*नाम)?|पापा|बौजी(?:\s*को\s*नौ)?|बौजी|father(?:'s|s)?\s*name(?:\s+is)?|father(?:\s+name)?|पति(?:देव| जी)?(?:\s*का\s*नाम)?|पतिदेव|पति|husband(?:'s|s)?\s*name|husband|pita(?:ji|shri|shree)?\s*ka\s*naam|pitashri|pitashree|pitaji|bauji|papa)\s*[:=\-]?\s*([a-zA-Z\u0900-\u097F\s]+?)(?:\s+है|\s+hai|\s*,|\s+और|\s+and|\s+बल|\s+bal|$)/i;
    const fatherMatch = spokenText.match(fatherRegex);
    if (fatherMatch && fatherMatch[1]) {
      const rawFather = fatherMatch[1].trim();
      const candidate = this.cleanName(rawFather);
      if (!SlotNormalizerService.isNonNameText(candidate)) {
        slots.father_husband_name = candidate;
      }
    }

    // 13. Detect Head of Family Name (Pariwar Register)
    const headMatch = spokenText.match(/(?:head of family|मुखिया का नाम|family head|मुखिया)\s*[:=\-]?\s*([a-zA-Z\u0900-\u097F\s]+?)(?:\s+है|\s+hai|\s*,|\s+और|\s+and|$)/i);
    if (headMatch && headMatch[1]) {
      const candidate = this.cleanName(headMatch[1]);
      if (!SlotNormalizerService.isNonNameText(candidate)) {
        slots.head_of_family_name = candidate;
        slots.head_name = candidate;
      }
    }

    // 14. Detect Development Block & Gram Panchayat
    const blockMatch = spokenText.match(/(?:development block|block|विकास खंड|विकास खण्ड|ब्लॉक)\s*[:=\-]?\s*([a-zA-Z\u0900-\u097F\s]+?)(?:\s+है|\s+hai|\s*,|\s+और|\s+and|$)/i);
    if (blockMatch && blockMatch[1]) {
      const cleanBlock = this.cleanName(blockMatch[1]);
      slots.development_block = cleanBlock;
      slots.block = cleanBlock;
    }
    const panchayatMatch = spokenText.match(/(?:gram panchayat|panchayat|ग्राम पंचायत|पंचायत)\s*[:=\-]?\s*([a-zA-Z\u0900-\u097F\s]+?)(?:\s+है|\s+hai|\s*,|\s+और|\s+and|$)/i);
    if (panchayatMatch && panchayatMatch[1]) {
      slots.gram_panchayat = this.cleanName(panchayatMatch[1]);
    }

    // 15. Detect Domicile & Hill Area Specific Slots
    const yearsMatch = lower.match(/(?:living\s+in\s+uk|living\s+for|residence\s+years|निवास\s*वर्ष|साल\s*से|वर्ष\s*से)?\s*([0-9]{1,2})\s*(?:years|saal|sal|वर्ष|साल)/i) ||
      lower.match(/(?:उत्तराखंड\s*में\s*निवास\s*वर्ष|years\s*in\s*uttarakhand)\s*[:=\-]?\s*([0-9]{1,2})/i);
    if (yearsMatch && yearsMatch[1]) {
      slots.years_living_in_uk = yearsMatch[1].trim();
    }

    const villageMatch = spokenText.match(/(?:ancestral\s*village|मूल\s*पैतृक\s*गांव|पैतृक\s*गांव|मूल\s*गांव|पैतृक\s*गाँव)\s*[:=\-]?\s*([a-zA-Z\u0900-\u097F\s]+?)(?:\s+है|\s+hai|\s*,|\s+और|$)/i);
    if (villageMatch && villageMatch[1]) {
      slots.ancestral_village = this.cleanName(villageMatch[1]);
    }

    if (lower.includes('domicile') || lower.includes('निवास') || lower.includes('स्थायी')) {
      if (lower.includes('job') || lower.includes('service') || lower.includes('नौकरी') || lower.includes('रोजगार')) {
        slots.reason_for_domicile = 'EMPLOYMENT';
      } else if (lower.includes('education') || lower.includes('study') || lower.includes('शिक्षा') || lower.includes('दाखिला')) {
        slots.reason_for_domicile = 'EDUCATION';
      } else if (lower.includes('land') || lower.includes('registry') || lower.includes('जमीन') || lower.includes('भूमि')) {
        slots.reason_for_domicile = 'LAND';
      }
    }

    // 16. SAFE ACTIVE-FIELD FALLBACK (Runs ONLY if no other slot was matched and text is genuinely a name)
    if (Object.keys(slots).length === 0 && !SlotNormalizerService.isNonNameText(spokenText)) {
      const wordCount = spokenText.trim().split(/\s+/).length;
      const hasDigits = /\d/.test(spokenText);

      if (wordCount <= 4 && !hasDigits) {
        if (activeFieldId === 'applicant_name') {
          slots.applicant_name = this.cleanName(spokenText);
        } else if (activeFieldId === 'father_husband_name') {
          slots.father_husband_name = this.cleanName(spokenText);
        } else if (activeFieldId === 'head_of_family_name' || activeFieldId === 'head_name') {
          const cleanHead = this.cleanName(spokenText);
          slots.head_of_family_name = cleanHead;
          slots.head_name = cleanHead;
        }
      }
    }

    return slots;
  }

  private cleanName(name: string): string {
    return name
      .replace(/^(?:टाइप\s*करो|टाइप\s*कीजिए|टाइप|लिखो|लिखिए|डालो|भरो|दर्ज\s*करो|दर्ज|type|write|enter|fill|put)\s+/i, '')
      .replace(/^(?:श्रीमान|श्रीयुत|स्वर्गीय|श्री|श्रीमती|shri|shree|mr|mrs|smt|dr|late|swargiya)\s+/i, '')
      .replace(/\s+(?:टाइप\s*करो|टाइप\s*कीजिए|टाइप|लिखो|लिखिए|डालो|भरो|दर्ज\s*करो|दर्ज|करो|type|likho|daalo|bharo|karo|field|hai|hain|है|हैं|था|tha|थी|thi|ji|जी|साहब|sahab|बल|bal)$/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractAnnualIncome(text: string): number | null {
    // Crores match e.g. "2 crore", "2.5 crore", "२ करोड़"
    const croreMatch = text.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:crore|cr|करोड़)/i);
    if (croreMatch) {
      return Math.round(parseFloat(croreMatch[1]) * 10000000);
    }
    if (text.includes('एक करोड़') || text.includes('one crore')) return 10000000;
    if (text.includes('दो करोड़') || text.includes('two crore')) return 20000000;

    // Lakhs match e.g. "5 lakh", "1.5 lakh"
    const lakhMatch = text.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:lakh|lac|लाख)/i);
    if (lakhMatch) {
      return Math.round(parseFloat(lakhMatch[1]) * 100000);
    }

    // Direct numeric match e.g. "60000", "60,000", "annual income 60000"
    const numMatch = text.match(/(?:annual\s*income|income|वार्षिक\s*आय|आय|कमाई|रुपये|rs\.?|₹)?\s*([0-9]{4,9}|[0-9]{1,3}(?:,[0-9]{2,3})+)/i);
    if (numMatch) {
      const clean = numMatch[1].replace(/,/g, '');
      const parsed = parseInt(clean, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }

    // Conversational Hindi Number Word Matching: e.g. "साठ हज़ार", "अस्सी हजार", "एक लाख"
    let total = 0;
    let currentMultiplier = 0;

    const words = text.split(/[\s,]+/);
    for (const w of words) {
      const val = SlotNormalizerService.HINDI_NUMBER_WORDS[w];
      if (val !== undefined) {
        if (val >= 1000) {
          total += (currentMultiplier || 1) * val;
          currentMultiplier = 0;
        } else if (val === 100) {
          currentMultiplier = (currentMultiplier || 1) * 100;
        } else {
          currentMultiplier += val;
        }
      }
    }
    total += currentMultiplier;

    return total > 0 ? total : null;
  }
}
