export class SlotNormalizerService {
  private static HINDI_NUMBER_WORDS: Record<string, number> = {
    'शून्य': 0, 'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पाँच': 5, 'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
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
  public normalizeSlots(spokenText: string): Record<string, any> {
    const slots: Record<string, any> = {};
    const lower = spokenText.toLowerCase().trim();

    // 1. Detect Annual Income (Numbers or Hindi currency words)
    const incomeMatch = this.extractAnnualIncome(spokenText);
    if (incomeMatch !== null) {
      slots.annual_income = incomeMatch;
    }

    // 2. Detect Uttarakhand District
    for (const district of SlotNormalizerService.UTTARAKHAND_DISTRICTS) {
      if (lower.includes(district.toLowerCase())) {
        slots.district = district;
        break;
      }
    }
    // Also check Hindi district transliterations
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
    }

    // 3. Detect Applicant Name patterns
    // e.g. "मेरा नाम कुलदीप सिंह नेगी है" or "My name is Ramesh Chand"
    const nameRegex = /(?:मेरा नाम|my name is|name is|आवेदक का नाम)\s+([a-zA-Z\u0900-\u097F\s]+?)(?:\s+है|\s+hai|\s*,|\s+और|\s+and|$)/i;
    const nameMatch = spokenText.match(nameRegex);
    if (nameMatch && nameMatch[1]) {
      const rawName = nameMatch[1].trim();
      slots.applicant_name = this.cleanName(rawName);
    }

    // 4. Detect Father/Husband Name patterns
    // e.g. "पिता जी का नाम खुशाल सिंह" or "Father's name is Mohan Singh"
    const fatherRegex = /(?:पिता(?: जी)? का नाम|father(?:'?s)? name is|पति का नाम)\s+([a-zA-Z\u0900-\u097F\s]+?)(?:\s+है|\s+hai|\s*,|\s+और|\s+and|$)/i;
    const fatherMatch = spokenText.match(fatherRegex);
    if (fatherMatch && fatherMatch[1]) {
      const rawFather = fatherMatch[1].trim();
      slots.father_husband_name = this.cleanName(rawFather);
    }

    // 5. Detect Tracking ID (UK-REV-XXXX-XXXX or 16-digit ID)
    const trackingMatch = spokenText.match(/UK-[A-Z0-9]+-[0-9]+-[0-9]+/i) || spokenText.match(/\b\d{16}\b/);
    if (trackingMatch) {
      slots.tracking_id = trackingMatch[0].toUpperCase();
    }

    // 6. Detect Mobile Number
    const phoneMatch = spokenText.match(/(?:मोबाइल|phone|mobile|number)?\s*([6-9]\d{9})/);
    if (phoneMatch) {
      slots.mobile_number = phoneMatch[1];
    }

    return slots;
  }

  private cleanName(name: string): string {
    return name
      .replace(/^(श्री|श्रीमती|shri|mr|mrs|dr)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractAnnualIncome(text: string): number | null {
    // Direct numeric match e.g. "60000" or "60,000"
    const numMatch = text.match(/(?:income|आय|कमाई|रुपये|rs\.?|₹)?\s*([0-9]{1,2},?[0-9]{2,3},?[0-9]{3})/i);
    if (numMatch) {
      return parseInt(numMatch[1].replace(/,/g, ''), 10);
    }

    // Hindi currency phrase detection e.g. "साठ हज़ार" or "एक लाख"
    if (text.includes('साठ हज़ार') || text.includes('साठ हजार')) return 60000;
    if (text.includes('पचास हज़ार') || text.includes('पचास हजार')) return 50000;
    if (text.includes('सत्तर हज़ार') || text.includes('सत्तर हजार')) return 70000;
    if (text.includes('अस्सी हज़ार') || text.includes('अस्सी हजार')) return 80000;
    if (text.includes('एक लाख')) return 100000;
    if (text.includes('डेढ़ लाख')) return 150000;
    if (text.includes('दो लाख')) return 200000;
    if (text.includes('तीस हज़ार')) return 30000;
    if (text.includes('चालीस हज़ार')) return 40000;

    return null;
  }
}

