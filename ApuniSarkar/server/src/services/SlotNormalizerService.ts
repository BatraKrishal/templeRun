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

    // 2. Detect Uttarakhand District or State
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
      else if (lower.includes('उधम सिंह') || lower.includes('udham singh')) slots.district = 'Udham Singh Nagar';
    }

    // State detection
    const stateMatch = lower.match(/(?:state|राज्य)?\s*(?:is|as)?\s*(uttar pradesh|uttarakhand|delhi|haryana|himachal pradesh)/i);
    if (stateMatch) {
      slots.state = stateMatch[1].trim();
    }

    // 3. Detect Applicant Name patterns
    // e.g. "मेरा नाम कुलदीप सिंह नेगी है", "My name is Vimal", "Enter Vimal in the name field", "applicant name Vimal"
    const enterNameMatch = lower.match(/(?:enter|type|put|write|likho|daalo|दर्ज करो)\s+([a-zA-Z\u0900-\u097F\s]+?)\s+(?:in|into|as|mein|के रूप में)?\s*(?:the\s+)?(?:name|applicant|naam|नाम)(?:\s+field|\s+mein|$)/i);
    if (enterNameMatch && enterNameMatch[1]) {
      slots.applicant_name = this.cleanName(enterNameMatch[1]);
    } else {
      const nameRegex = /(?:मेरा नाम|my name(?:\s+is)?|name(?:\s+is)?|applicant\s*name(?:\s+is)?|आवेदक का नाम|mera naam)\s*[:=\-]?\s*([a-zA-Z\u0900-\u097F\s]+?)(?:\s+है|\s+hai|\s*,|\s+और|\s+and|$)/i;
      const nameMatch = spokenText.match(nameRegex);
      if (nameMatch && nameMatch[1]) {
        const rawName = nameMatch[1].trim();
        slots.applicant_name = this.cleanName(rawName);
      } else if (activeFieldId === 'applicant_name' && !slots.annual_income && !slots.district) {
        slots.applicant_name = this.cleanName(spokenText);
      }
    }

    // 4. Detect Father/Husband Name patterns
    // e.g. "father name Indra Singh Bisht", "father's name Indra Singh Bisht", "पिता का नाम इन्द्र सिंह बिष्ट"
    const fatherRegex = /(?:पिता(?: जी)? का नाम|father(?:'s|s)?\s*name(?:\s+is)?|father(?:\s+name)?|पति का नाम|pita(?:ji)?\s*ka\s*naam)\s*[:=\-]?\s*([a-zA-Z\u0900-\u097F\s]+?)(?:\s+है|\s+hai|\s*,|\s+और|\s+and|$)/i;
    const fatherMatch = spokenText.match(fatherRegex);
    if (fatherMatch && fatherMatch[1]) {
      const rawFather = fatherMatch[1].trim();
      slots.father_husband_name = this.cleanName(rawFather);
    } else if (activeFieldId === 'father_husband_name' && !slots.applicant_name && !slots.annual_income && !slots.district) {
      slots.father_husband_name = this.cleanName(spokenText);
    }

    // 5. Detect Date of Birth (DOB)
    // e.g. "My date of birth is 15 August 2005" or "15/08/2005"
    const dobRegex = /(?:date of birth|dob|birth date|जन्म तिथि|janm tithi)(?:\s+is|\s+hai|\s*[:=])?\s*([0-9]{1,2}(?:st|nd|rd|th)?\s+[a-zA-Z\u0900-\u097F]+\s+[0-9]{4}|[0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{4})/i;
    const dobMatch = spokenText.match(dobRegex);
    if (dobMatch && dobMatch[1]) {
      slots.date_of_birth = dobMatch[1].trim();
    }

    // 6. Detect Email Address
    const emailMatch = spokenText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      slots.email = emailMatch[1].trim();
    }

    // 7. Detect Gender
    if (lower.includes('select male') || lower.includes('पुरुष') || lower.includes('gender male') || lower.includes('purush')) {
      slots.gender = 'MALE';
    } else if (lower.includes('select female') || lower.includes('महिला') || lower.includes('gender female') || lower.includes('mahila')) {
      slots.gender = 'FEMALE';
    }

    // 8. Detect Tracking ID (UK-REV-XXXX-XXXX or 16-digit ID)
    const trackingMatch = spokenText.match(/UK-[A-Z0-9]+-[0-9]+-[0-9]+/i) || spokenText.match(/\b\d{16}\b/) || spokenText.match(/UK\d{2}[A-Z]{2}\d{12}/i);
    if (trackingMatch) {
      slots.tracking_id = trackingMatch[0].toUpperCase();
    }

    // 9. Detect Mobile Number
    const phoneMatch = spokenText.match(/(?:मोबाइल|phone|mobile|number)?\s*([6-9]\d{9})/);
    if (phoneMatch) {
      slots.mobile_number = phoneMatch[1];
    }

    // 10. Detect Income Source
    if (lower.includes('private job') || lower.includes('private service') || lower.includes('salaried') || lower.includes('वेतनभोगी')) {
      slots.income_source = 'SALARIED';
    } else if (lower.includes('agriculture') || lower.includes('farming') || lower.includes('कृषि')) {
      slots.income_source = 'AGRICULTURE';
    } else if (lower.includes('labour') || lower.includes('मजदूरी') || lower.includes('दिहाड़ी')) {
      slots.income_source = 'LABOUR';
    } else if (lower.includes('business') || lower.includes('व्यापार') || lower.includes('दुकान')) {
      slots.income_source = 'BUSINESS';
    } else if (lower.includes('pension') || lower.includes('पेंशन')) {
      slots.income_source = 'PENSION';
    }

    // 11. Detect Certificate Purpose
    if (lower.includes('ration card') || lower.includes('राशन कार्ड')) {
      slots.purpose = 'RATION_CARD';
    } else if (lower.includes('scholarship') || lower.includes('छात्रवृत्ति')) {
      slots.purpose = 'SCHOLARSHIP';
    } else if (lower.includes('admission') || lower.includes('प्रवेश') || lower.includes('school') || lower.includes('college')) {
      slots.purpose = 'ADMISSION';
    } else if (lower.includes('scheme') || lower.includes('योजना')) {
      slots.purpose = 'SCHEME';
    }

    return slots;
  }

  private cleanName(name: string): string {
    return name
      .replace(/^(श्री|श्रीमती|shri|mr|mrs|dr)\s+/i, '')
      .replace(/(?:है|hai|था|tha|ji|जी)$/i, '')
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
