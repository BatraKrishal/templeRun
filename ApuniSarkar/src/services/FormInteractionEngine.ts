/**
 * FormInteractionEngine
 * Reusable, robust browser form interaction layer that discovers visible DOM fields,
 * resolves natural-language field targets, handles diverse input types (text, number,
 * date, select, radio, checkbox, textarea), dispatches React-compatible events,
 * and verifies state synchronization.
 */

import { LanguageDetector } from './LanguageDetector';

export interface DiscoveredField {
  element: HTMLElement;
  id: string;
  name: string;
  type: string;
  label: string;
  placeholder: string;
  ariaLabel: string;
  currentValue: any;
  options?: Array<{ text: string; value: string; index: number }>;
  required: boolean;
  disabled: boolean;
}

export interface FormActionResult {
  status: 'SUCCESS' | 'FAILED' | 'AMBIGUOUS' | 'NOT_FOUND' | 'NEEDS_CONFIRMATION';
  fieldId?: string;
  fieldName?: string;
  updatedValue?: any;
  messageEn: string;
  messageHi: string;
  messageHinglish: string;
  candidates?: string[];
  requiresConfirmation?: boolean;
}

export class FormInteractionEngine {
  private static lastFocusedField: HTMLElement | null = null;

  /**
   * Tracks currently focused element on the page
   */
  public static initFocusTracker(): void {
    if (typeof window === 'undefined') return;
    document.addEventListener(
      'focusin',
      (e) => {
        const target = e.target as HTMLElement;
        if (
          target &&
          (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')
        ) {
          FormInteractionEngine.lastFocusedField = target;
        }
      },
      true
    );
  }

  /**
   * Discovers all visible, enabled, and editable form controls on the active page.
   */
  public static getVisibleFields(): DiscoveredField[] {
    if (typeof document === 'undefined') return [];

    const selector = 'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])';
    const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));

    const discovered: DiscoveredField[] = [];

    for (const el of elements) {
      // Check visibility
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        continue;
      }
      if (el.offsetParent === null && el.offsetWidth === 0 && el.offsetHeight === 0) {
        continue;
      }

      const id = el.id || '';
      const name = (el as HTMLInputElement).name || '';
      const type = (el as HTMLInputElement).type || el.tagName.toLowerCase();
      const placeholder = (el as HTMLInputElement).placeholder || '';
      const ariaLabel = el.getAttribute('aria-label') || '';

      // Find label
      let labelText = '';
      if (id) {
        const labelEl = document.querySelector(`label[for="${id}"]`);
        if (labelEl) labelText = labelEl.textContent?.trim() || '';
      }
      if (!labelText) {
        const parentLabel = el.closest('label');
        if (parentLabel) {
          labelText = parentLabel.textContent?.replace(el.textContent || '', '').trim() || '';
        }
      }
      if (!labelText && ariaLabel) {
        labelText = ariaLabel;
      }

      // Collect select options
      let options: Array<{ text: string; value: string; index: number }> | undefined;
      if (el.tagName === 'SELECT') {
        const select = el as HTMLSelectElement;
        options = Array.from(select.options).map((opt, index) => ({
          text: opt.text.trim(),
          value: opt.value,
          index,
        }));
      }

      let currentValue: any = (el as HTMLInputElement).value;
      if (type === 'checkbox' || type === 'radio') {
        currentValue = (el as HTMLInputElement).checked;
      }

      discovered.push({
        element: el,
        id,
        name,
        type,
        label: labelText,
        placeholder,
        ariaLabel,
        currentValue,
        options,
        required: el.hasAttribute('required'),
        disabled: el.hasAttribute('disabled'),
      });
    }

    return discovered;
  }

  /**
   * Matches a field description from speech against discovered DOM fields.
   */
  public static matchField(
    queryField: string,
    fields: DiscoveredField[]
  ): { status: 'EXACT' | 'AMBIGUOUS' | 'NOT_FOUND'; field?: DiscoveredField; candidates?: DiscoveredField[] } {
    if (!fields || fields.length === 0) {
      return { status: 'NOT_FOUND' };
    }

    const q = queryField.toLowerCase().trim();

    // 1. Contextual matching: "this field" / "current field"
    if (q.includes('this field') || q.includes('current field') || q.includes('इस फील्ड') || q.includes('ye field')) {
      const active = document.activeElement as HTMLElement;
      const target = fields.find((f) => f.element === active || f.element === FormInteractionEngine.lastFocusedField);
      if (target) return { status: 'EXACT', field: target };
      if (fields.length > 0) return { status: 'EXACT', field: fields[0] };
    }

    // 2. Contextual matching: "next field"
    if (q.includes('next field') || q.includes('next') || q.includes('अगला फील्ड') || q.includes('agla field')) {
      const active = (document.activeElement as HTMLElement) || FormInteractionEngine.lastFocusedField;
      const activeIdx = fields.findIndex((f) => f.element === active);
      const nextIdx = activeIdx >= 0 && activeIdx < fields.length - 1 ? activeIdx + 1 : 0;
      return { status: 'EXACT', field: fields[nextIdx] };
    }

    // 3. Contextual matching: "previous field"
    if (q.includes('previous field') || q.includes('पिछला फील्ड') || q.includes('pichla field')) {
      const active = (document.activeElement as HTMLElement) || FormInteractionEngine.lastFocusedField;
      const activeIdx = fields.findIndex((f) => f.element === active);
      const prevIdx = activeIdx > 0 ? activeIdx - 1 : 0;
      return { status: 'EXACT', field: fields[prevIdx] };
    }

    // Normalized alias map for common government portal fields
    const aliasMap: Record<string, string[]> = {
      applicant_name: [
        'applicant name', 'full name', 'citizen name', 'your name', 'name',
        'नाम', 'आवेदक का नाम', 'पूरा नाम', 'आवेदक का पूरा नाम', 'naam', 'applicant_name', 'myaaru nau', 'myero nau'
      ],
      father_husband_name: [
        'father name', 'father husband name', 'husband name', "father's name", 'father',
        'पिता का नाम', 'पिता अथवा पति का नाम', 'पति का नाम', 'पिताजी का नाम', 'पिताजी', 'पिता', 'पति', 'बाबूजी', 'बौजी',
        'pita ka naam', 'pita', 'pitaji', 'bauji', 'father_husband_name'
      ],
      mobile_number: [
        'mobile number', 'phone number', 'contact number', 'mobile', 'phone',
        'मोबाइल नंबर', 'मोबाइल', 'फोन नंबर', 'फोन', 'mobile_number', 'phone'
      ],
      annual_income: [
        'total annual income', 'total annual family income', 'annual family income', 'annual income', 'total income',
        'yearly income', 'salary', 'household income', 'income',
        'कुल वार्षिक आय', 'वार्षिक आय', 'पारिवारिक आय', 'सालाना आय', 'आय', 'कमाई', 'आमदनी', 'पईसा', 'annual_income'
      ],
      income_source: [
        'primary income source', 'primary income', 'income source', 'source of income', 'income type',
        'primary source', 'occupation', 'profession', 'job type', 'work',
        'आय का मुख्य साधन', 'आय का साधन', 'कमाई का साधन', 'आय का स्रोत', 'मुख्य साधन', 'कमाई का जरिया',
        'प्राइमरी इनकम सोर्स', 'प्राइमरी इनकम', 'इनकम सोर्स', 'इनकम टाइप', 'रोजगार', 'पेशा', 'व्यवसाय',
        'aay ka mukhya sadhan', 'aay ka sadhan', 'kamai ka sadhan', 'income_source'
      ],
      purpose: [
        'certificate required for', 'purpose', 'required for', 'certificate purpose', 'reason',
        'प्रमाण पत्र का प्रयोजन', 'प्रमाण पत्र का उद्देश्य', 'प्रयोजन', 'हेतु', 'उद्देश्य', 'किसलिए चाहिए',
        'pramaan patra ka prayojan', 'prayojan', 'purpose'
      ],
      date_of_birth: [
        'date of birth', 'birth date', 'birthday', 'dob',
        'जन्म तिथि', 'जन्म तारीख', 'janm tithi', 'date_of_birth', 'dob'
      ],
      gender: [
        'gender', 'sex', 'लिंग', 'ling', 'gender'
      ],
      district: [
        'district name', 'state district', 'home district', 'district',
        'जिला', 'जनपद', 'गृह जनपद', 'jila', 'janpad', 'district'
      ],
      tehsil: [
        'tehsil', 'तहसील', 'tahsil'
      ],
      patwari_circle: [
        'patwari circle', 'patwari lekhpal circle', 'lekhpal circle', 'patwari', 'lekhpal',
        'पटवारी', 'लेखपाल चौकी', 'पटवारी चौकी', 'patwari_circle'
      ],
      village_ward: [
        'village ward', 'village', 'ward', 'गाँव', 'गांव', 'वार्ड', 'gram panchayat', 'gram', 'ग्राम'
      ],
      email: [
        'email address', 'email', 'mail', 'ईमेल', 'ईमेल पता', 'email'
      ],
      aadhaar_last_four: [
        'aadhaar last 4', 'aadhaar card', 'aadhaar number', 'aadhaar', 'uid', 'आधार', 'aadhaar_last_four'
      ],
    };

    // Candidate scoring
    const scored: Array<{ field: DiscoveredField; score: number }> = [];

    for (const f of fields) {
      let score = 0;
      const targetStrings = [
        f.id.toLowerCase(),
        f.name.toLowerCase(),
        f.label.toLowerCase(),
        f.placeholder.toLowerCase(),
        f.ariaLabel.toLowerCase(),
      ].filter(Boolean);

      // Check alias map
      for (const [canonical, aliases] of Object.entries(aliasMap)) {
        const matchesCanonical = targetStrings.some((s) => s.includes(canonical));
        const queryMatchesAlias = aliases.some((a) => q.includes(a) || a.includes(q));

        if (matchesCanonical && queryMatchesAlias) {
          score += 50;
        }
      }

      // Direct string matching
      for (const s of targetStrings) {
        if (s === q) score += 40;
        else if (s.includes(q)) score += 20;
        else if (q.includes(s) && s.length > 2) score += 15;
      }

      if (score > 0) {
        scored.push({ field: f, score });
      }
    }

    if (scored.length === 0) {
      return { status: 'NOT_FOUND' };
    }

    scored.sort((a, b) => b.score - a.score);

    // If strong match
    if (scored.length === 1 || scored[0].score >= scored[1].score + 15) {
      return { status: 'EXACT', field: scored[0].field };
    }

    return {
      status: 'AMBIGUOUS',
      candidates: scored.slice(0, 3).map((s) => s.field),
    };
  }

  /**
   * Sets value on a DOM element using React-compatible synthetic event triggers.
   */
  public static setFieldValue(element: HTMLElement, rawValue: any): boolean {
    if (!element) return false;

    // Focus & scroll into view with visual cue
    element.focus();
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    FormInteractionEngine.lastFocusedField = element;

    const tagName = element.tagName.toUpperCase();

    if (tagName === 'SELECT') {
      const select = element as HTMLSelectElement;
      const valStr = String(rawValue).toLowerCase().trim();

      let matchedIndex = -1;

      // Handle ordinal choices: "first option", "second option", "दूसरा विकल्प"
      if (valStr.includes('first') || valStr.includes('पहला') || valStr === '1') {
        matchedIndex = select.options.length > 1 ? 1 : 0;
      } else if (valStr.includes('second') || valStr.includes('दूसरा') || valStr === '2') {
        matchedIndex = select.options.length > 2 ? 2 : 1;
      } else if (valStr.includes('third') || valStr.includes('तीसरा') || valStr === '3') {
        matchedIndex = select.options.length > 3 ? 3 : 2;
      } else {
        const synonyms: Record<string, string[]> = {
          'SALARIED': [
            'private job', 'job', 'private service', 'service', 'salaried',
            'वेतनभोगी', 'नौकरी', 'प्राइवेट नौकरी', 'प्राइवेट जॉब', 'प्राइवेट सर्विस', 'प्राइवेट',
            'नौकरीपेशा', 'कंपनी जॉब', 'सर्विस'
          ],
          'AGRICULTURE': [
            'agriculture', 'farming', 'farmer', 'kheti', 'kisan',
            'कृषि', 'बागवानी', 'किसान', 'खेती', 'काश्तकार', 'कृषक'
          ],
          'LABOUR': [
            'labour', 'daily labour', 'majdoor', 'majdoori', 'worker',
            'मजदूरी', 'दिहाड़ी', 'मजदूर', 'दैनिक मजदूरी', 'श्रमिक', 'श्रम'
          ],
          'BUSINESS': [
            'business', 'shop', 'shopkeeper', 'vyapar', 'dukan',
            'व्यापार', 'दुकान', 'व्यवसाय', 'दुकानदार', 'कारोबार', 'स्वरोजगार'
          ],
          'PENSION': [
            'pension', 'pensioner', 'retire', 'retired',
            'पेंशन', 'पेंशनर', 'सेवानिवृत्त'
          ],
          'SCHOLARSHIP': [
            'scholarship', 'chhatravritti', 'stipend',
            'छात्रवृत्ति', 'वजीफा', 'स्कॉलरशिप'
          ],
          'RATION_CARD': [
            'ration card', 'ration', 'food security',
            'राशन कार्ड', 'राशन', 'खाद्य सुरक्षा'
          ],
          'ADMISSION': [
            'admission', 'school', 'college', 'shiksha', 'university', 'study',
            'शिक्षा', 'दाखिला', 'प्रवेश', 'स्कूल', 'कॉलेज', 'यूनिवर्सिटी'
          ],
          'SCHEME': [
            'scheme', 'yojana', 'welfare', 'govt scheme',
            'योजना', 'सरकारी योजना', 'कल्याणकारी योजना'
          ],
          'MALE': [
            'male', 'purush', 'man', 'boy',
            'पुरुष', 'आदमी', 'लड़का'
          ],
          'FEMALE': [
            'female', 'mahila', 'woman', 'girl',
            'महिला', 'औरत', 'लड़की', 'स्त्री'
          ],
          'OTHER': [
            'other', 'anya', 'transgender',
            'अन्य', 'किन्नर'
          ],
          'EMPLOYMENT': ['employment', 'job', 'service', 'नौकरी', 'रोजगार'],
          'EDUCATION': ['education', 'study', 'padhai', 'शिक्षा', 'पढ़ाई'],
          'LAND': ['land', 'bhumi', 'jamin', 'भूमि', 'जमीन'],
        };

        let bestScore = 0;

        for (let i = 0; i < select.options.length; i++) {
          const opt = select.options[i];
          if (!opt.value) continue; // Skip default placeholder "-- कृपया चयन करें --"

          const optText = opt.text.toLowerCase();
          const optVal = opt.value.toLowerCase();
          let score = 0;

          if (optVal === valStr || optText === valStr) {
            score = 100;
          } else if (optText.includes(valStr) || valStr.includes(optVal)) {
            score = 80;
          } else if (valStr.includes(optText)) {
            score = 70;
          }

          // Synonym dictionary lookup
          const synList = synonyms[opt.value.toUpperCase()];
          if (synList) {
            for (const s of synList) {
              if (valStr.includes(s) || s.includes(valStr)) {
                score = Math.max(score, 90);
                break;
              }
            }
          }

          // Individual token overlap
          const tokens = valStr.split(/\s+/).filter((t) => t.length > 2);
          for (const token of tokens) {
            if (optText.includes(token) || optVal.includes(token)) {
              score += 25;
            }
          }

          if (score > bestScore) {
            bestScore = score;
            matchedIndex = i;
          }
        }
      }

      if (matchedIndex >= 0) {
        const matchedOpt = select.options[matchedIndex];
        select.selectedIndex = matchedIndex;

        // Use native property descriptor setter so React controlled component onChange fires
        const nativeSetter =
          Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set ||
          Object.getOwnPropertyDescriptor(element.constructor.prototype, 'value')?.set;

        if (nativeSetter) {
          nativeSetter.call(select, matchedOpt.value);
        } else {
          select.value = matchedOpt.value;
        }

        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));

        // Stash resolved canonical value and display label on the element
        (element as any)._resolvedValue = matchedOpt.value;
        (element as any)._resolvedLabel = matchedOpt.text;

        return true;
      }

      return false;
    }

    if (tagName === 'INPUT') {
      const input = element as HTMLInputElement;
      const type = input.type.toLowerCase();

      if (type === 'radio' || type === 'checkbox') {
        const boolVal =
          rawValue === true ||
          rawValue === 'true' ||
          rawValue === 'yes' ||
          rawValue === 'हाँ' ||
          rawValue === 'check' ||
          rawValue === 'select';

        input.checked = type === 'checkbox' && rawValue === 'toggle' ? !input.checked : boolVal;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }

      // Date normalization: "15 August 2005" -> "2005-08-15"
      let finalValue = rawValue;
      if (type === 'date' || input.id.includes('date') || input.id.includes('dob')) {
        const parsedDate = FormInteractionEngine.parseDate(rawValue);
        if (parsedDate) finalValue = parsedDate;
      }

      // React controlled input setter trick:
      // In React, setting input.value directly doesn't trigger the onChange state handler
      // because React overrides the property descriptor. We call the original native setter!
      const nativeSetter =
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set ||
        Object.getOwnPropertyDescriptor(element.constructor.prototype, 'value')?.set;

      if (nativeSetter) {
        nativeSetter.call(input, finalValue);
      } else {
        input.value = finalValue;
      }

      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));

      return input.value == finalValue;
    }

    if (tagName === 'TEXTAREA') {
      const textarea = element as HTMLTextAreaElement;
      const nativeSetter =
        Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set ||
        Object.getOwnPropertyDescriptor(element.constructor.prototype, 'value')?.set;

      if (nativeSetter) {
        nativeSetter.call(textarea, rawValue);
      } else {
        textarea.value = rawValue;
      }

      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
      return textarea.value == rawValue;
    }

    return false;
  }

  /**
   * Executes voice form command (Enter, Select, Clear, Move, or direct Key-Value input).
   * Supports dedicated single-field dictation via focusedFieldId.
   */
  public static executeFormCommand(transcript: string, focusedFieldId?: string): FormActionResult {
    const fields = FormInteractionEngine.getVisibleFields();
    if (fields.length === 0) {
      return {
        status: 'NOT_FOUND',
        messageEn: 'No editable form fields found on the current page.',
        messageHi: 'वर्तमान पृष्ठ पर कोई संपादन योग्य फ़ील्ड नहीं मिला।',
        messageHinglish: 'Current page par koi editable form field nahi mila.',
      };
    }

    const t = transcript.trim();
    const lower = t.toLowerCase();

    // 0. Dedicated focused-field dictation (single-field mic click)
    if (focusedFieldId) {
      const targetField = fields.find(
        (f) =>
          f.id.toLowerCase() === focusedFieldId.toLowerCase() ||
          f.name.toLowerCase() === focusedFieldId.toLowerCase()
      );
      if (targetField) {
        let valToEnter: any = t;
        valToEnter = valToEnter.replace(/^(my|mera|meri|the|this|ye|it is|is|hai)\s+/i, '').trim();

        if (targetField.type === 'number' || targetField.id.includes('income')) {
          const num = FormInteractionEngine.parseSpokenNumber(valToEnter);
          if (num !== null) valToEnter = num;
        }

        const ok = FormInteractionEngine.setFieldValue(targetField.element, valToEnter);
        if (ok) {
          const canonicalVal = (targetField.element as any)._resolvedValue ?? valToEnter;
          const displayVal = (targetField.element as any)._resolvedLabel ?? valToEnter;

          return {
            status: 'SUCCESS',
            fieldId: targetField.id,
            fieldName: targetField.label || targetField.name,
            updatedValue: canonicalVal,
            messageEn: targetField.type === 'select'
              ? `Selected "${displayVal}" for ${targetField.label || targetField.name}.`
              : `Entered "${valToEnter}" in ${targetField.label || targetField.name}.`,
            messageHi: targetField.type === 'select'
              ? `${targetField.label || 'फ़ील्ड'} के लिए "${displayVal}" चुना गया।`
              : `${targetField.label || 'फ़ील्ड'} में "${valToEnter}" दर्ज कर दिया है।`,
            messageHinglish: targetField.type === 'select'
              ? `${targetField.label || 'Field'} ke liye "${displayVal}" select kar diya.`
              : `${targetField.label || 'Field'} mein "${valToEnter}" enter kar diya hai.`,
          };
        }
      }
    }

    // 0b. Guided form workflow commands: "What do you need next?", "Skip this field", "Fill remaining fields"
    if (
      lower.includes('what do you need next') ||
      lower.includes('what information do you need') ||
      lower.includes('अगली जानकारी क्या चाहिए') ||
      lower.includes('अगला क्या चाहिए') ||
      lower.includes('next info') ||
      lower.includes('fill remaining') ||
      lower.includes('बाकी विवरण')
    ) {
      const emptyReq = fields.find((f) => f.required && (!f.currentValue || f.currentValue === ''));
      if (emptyReq) {
        emptyReq.element.focus();
        emptyReq.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return {
          status: 'SUCCESS',
          fieldId: emptyReq.id,
          fieldName: emptyReq.label || emptyReq.name,
          messageEn: `Please provide ${emptyReq.label || emptyReq.name}.`,
          messageHi: `कृपया ${emptyReq.label || 'अगला विवरण'} बताएं।`,
          messageHinglish: `Kripya ${emptyReq.label || 'agla field'} batayein.`,
        };
      } else {
        return {
          status: 'SUCCESS',
          messageEn: 'All required fields are already filled! You can say "Review form" or "Submit form".',
          messageHi: 'सभी अनिवार्य फ़ील्ड भर चुके हैं! आप "फॉर्म जांचें" या "फॉर्म जमा करें" कह सकते हैं।',
          messageHinglish: 'Sabhi required fields bhar chuke hain! Aap "Review form" ya "Submit form" bol sakte hain.',
        };
      }
    }

    if (lower.includes('skip this field') || lower.includes('skip') || lower.includes('छोड़ दो')) {
      const active = (document.activeElement as HTMLElement) || FormInteractionEngine.lastFocusedField;
      const activeIdx = fields.findIndex((f) => f.element === active);
      const nextIdx = activeIdx >= 0 && activeIdx < fields.length - 1 ? activeIdx + 1 : 0;
      fields[nextIdx].element.focus();
      fields[nextIdx].element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return {
        status: 'SUCCESS',
        fieldId: fields[nextIdx].id,
        fieldName: fields[nextIdx].label || fields[nextIdx].name,
        messageEn: `Skipped. Focused on ${fields[nextIdx].label || 'next field'}.`,
        messageHi: `फ़ील्ड छोड़ दिया गया। अब ${fields[nextIdx].label || 'अगले फ़ील्ड'} पर हैं।`,
        messageHinglish: `Skip kar diya. Ab ${fields[nextIdx].label || 'agle field'} par hain.`,
      };
    }

    // 1. Clear command: "Clear this field" / "Clear name field"
    if (lower.startsWith('clear') || lower.includes('saaf karo') || lower.includes('hatao') || lower.includes('साफ करो')) {
      let targetQuery = lower.replace(/^(clear|saaf karo|hatao|साफ करो)\s*/i, '').trim();
      if (!targetQuery) targetQuery = 'this field';

      const match = FormInteractionEngine.matchField(targetQuery, fields);
      if (match.status === 'EXACT' && match.field) {
        FormInteractionEngine.setFieldValue(match.field.element, '');
        return {
          status: 'SUCCESS',
          fieldId: match.field.id,
          fieldName: match.field.label || match.field.name,
          updatedValue: '',
          messageEn: `Cleared ${match.field.label || match.field.name || 'field'}.`,
          messageHi: `${match.field.label || 'फ़ील्ड'} को साफ़ कर दिया गया है।`,
          messageHinglish: `${match.field.label || 'Field'} clear kar diya gaya hai.`,
        };
      }
    }

    // 2. Navigation between fields: "Move to the next field"
    if (lower.includes('next field') || lower.includes('अगले फील्ड') || lower.includes('agla field')) {
      const match = FormInteractionEngine.matchField('next field', fields);
      if (match.status === 'EXACT' && match.field) {
        match.field.element.focus();
        match.field.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return {
          status: 'SUCCESS',
          fieldId: match.field.id,
          fieldName: match.field.label || match.field.name,
          messageEn: `Focused on ${match.field.label || 'next field'}.`,
          messageHi: `अगले फ़ील्ड ${match.field.label || ''} पर पहुंच गए हैं।`,
          messageHinglish: `Agle field ${match.field.label || ''} par focus ho gaya hai.`,
        };
      }
    }

    // 3. Selection commands: "Select male", "Choose Uttar Pradesh as my state", "Select the second option"
    const selectMatch =
      lower.match(/(?:select|choose|pick|chuno|चुनें)\s+(.+?)(?:\s+(?:as|in|for|mein|field)?\s+(.+))?$/i);
    if (selectMatch) {
      const optionVal = selectMatch[1].trim();
      const fieldTarget = selectMatch[2]?.trim() || '';

      let targetField: DiscoveredField | undefined;
      if (fieldTarget) {
        const m = FormInteractionEngine.matchField(fieldTarget, fields);
        if (m.status === 'EXACT') targetField = m.field;
      } else {
        // Find select or radio field that matches option
        targetField = fields.find((f) => {
          if (f.type === 'select' && f.options) {
            return f.options.some((o) => o.text.toLowerCase().includes(optionVal));
          }
          if (f.type === 'radio' && f.label.toLowerCase().includes(optionVal)) {
            return true;
          }
          return false;
        });
      }

      if (targetField) {
        const ok = FormInteractionEngine.setFieldValue(targetField.element, optionVal);
        if (ok) {
          return {
            status: 'SUCCESS',
            fieldId: targetField.id,
            fieldName: targetField.label || targetField.name,
            updatedValue: optionVal,
            messageEn: `Selected ${optionVal} for ${targetField.label || targetField.name}.`,
            messageHi: `${targetField.label || 'फ़ील्ड'} के लिए ${optionVal} चुना गया।`,
            messageHinglish: `${targetField.label || 'Field'} ke liye ${optionVal} select kar diya.`,
          };
        }
      }
    }

    // 4. Enter / Input commands with explicit verbs:
    // e.g. "Enter Vimal in the name field"
    // "My date of birth is 15 August 2005"
    // "Change my phone number to 9876543210"
    // "Mera naam Vimal hai, name field mein enter karo"
    const enterMatch =
      lower.match(/(?:enter|put|write|type|fill|daalo|likho|bharo|दर्ज करो|लिखो)\s+([a-zA-Z0-9\u0900-\u097F\s@.]+?)\s+(?:in|into|as|mein|के रूप में)?\s*(?:the\s+)?(.+?)(?:\s+field|\s+mein|$)/i) ||
      lower.match(/(?:my|mera|meri)\s+(.+?)\s+(?:is|hai|hain)\s+([a-zA-Z0-9\u0900-\u097F\s@.]+)/i);

    if (enterMatch) {
      let fieldTarget = '';
      let valToEnter = '';

      if (enterMatch[0].startsWith('my') || enterMatch[0].startsWith('mera') || enterMatch[0].startsWith('meri')) {
        fieldTarget = enterMatch[1].trim();
        valToEnter = enterMatch[2].trim();
      } else {
        valToEnter = enterMatch[1].trim();
        fieldTarget = enterMatch[2].trim();
      }

      const match = FormInteractionEngine.matchField(fieldTarget, fields);
      if (match.status === 'EXACT' && match.field) {
        let finalVal: any = valToEnter;
        if (match.field.type === 'number' || match.field.id.includes('income')) {
          const num = FormInteractionEngine.parseSpokenNumber(valToEnter);
          if (num !== null) finalVal = num;
        }

        const ok = FormInteractionEngine.setFieldValue(match.field.element, finalVal);
        if (ok) {
          return {
            status: 'SUCCESS',
            fieldId: match.field.id,
            fieldName: match.field.label || match.field.name,
            updatedValue: finalVal,
            messageEn: `Entered "${finalVal}" in ${match.field.label || match.field.name}.`,
            messageHi: `${match.field.label || 'फ़ील्ड'} में "${finalVal}" दर्ज कर दिया है।`,
            messageHinglish: `${match.field.label || 'Field'} mein "${finalVal}" enter kar diya hai.`,
          };
        }
      } else if (match.status === 'AMBIGUOUS' && match.candidates) {
        const candidateNames = match.candidates.map((c) => c.label || c.name).join(' or ');
        return {
          status: 'AMBIGUOUS',
          messageEn: `Did you mean ${candidateNames}? Please clarify.`,
          messageHi: `क्या आपका मतलब ${candidateNames} से है? कृपया स्पष्ट करें।`,
          messageHinglish: `Kya aapka matlab ${candidateNames} se hai? Kripya clear karein.`,
          candidates: match.candidates.map((c) => c.id),
        };
      }
    }

    // 5. Direct Key-Value matching without requiring "enter"
    // e.g. "father name Indra Singh Bisht", "applicant name Vimal Bisht", "annual income 60000", "mobile 9876543210"
    // "पिता का नाम इन्द्र सिंह बिष्ट", "आवेदक का नाम विमल बिष्ट", "gender male"
    const directResult = FormInteractionEngine.matchDirectKeyValue(t, fields);
    if (directResult) {
      return directResult;
    }

    // 5b. Standalone Option / Value matching (e.g. citizen just says "private job", "प्राइवेट जॉब", "राशन कार्ड", "male", "female")
    const optionResult = FormInteractionEngine.matchStandaloneOption(t, fields);
    if (optionResult) {
      return optionResult;
    }

    // 6. Submit Form Request
    if (lower.includes('submit form') || lower.includes('जमा करो') || lower.includes('submit application') || lower.includes('form submit')) {
      const summary = FormInteractionEngine.summarizeForm(fields);
      return {
        status: 'NEEDS_CONFIRMATION',
        requiresConfirmation: true,
        messageEn: `Before submitting, please review your details: ${summary}. Do you confirm submission?`,
        messageHi: `फॉर्म जमा करने से पहले, कृपया अपने विवरण की पुष्टि करें: ${summary}। क्या आप जमा करना चाहते हैं?`,
        messageHinglish: `Form submit karne se pehle kripya details check karein: ${summary}. Kya aap submit karna chahte hain?`,
      };
    }

    return {
      status: 'NOT_FOUND',
      messageEn: `Could not identify which form field to update. Please specify the field name.`,
      messageHi: `फ़ील्ड की पहचान नहीं हो सकी। कृपया फ़ील्ड का नाम स्पष्ट बताएं।`,
      messageHinglish: `Field pehchan nahi paye. Kripya field ka naam batayein.`,
    };
  }

  /**
   * Matches direct key-value utterances like "father name Indra Singh Bisht" or "annual income 60000"
   */
  public static matchDirectKeyValue(transcript: string, fields: DiscoveredField[]): FormActionResult | null {
    const t = transcript.trim();
    const lower = t.toLowerCase();

    // Support stripping leading conversational filler prefixes: "my primary income source is...", "mera naam..."
    let cleanLower = lower;
    let cleanRaw = t;
    const fillerPrefixMatch = lower.match(/^(?:my|mera|meri|the|hamara|aapka|apna|apni|ye|yeh)\s+/i);
    if (fillerPrefixMatch) {
      cleanLower = lower.slice(fillerPrefixMatch[0].length).trim();
      cleanRaw = t.slice(fillerPrefixMatch[0].length).trim();
    }

    const aliasMap: Record<string, string[]> = {
      applicant_name: [
        'applicant name', 'full name', 'citizen name', 'your name', 'name',
        'नाम', 'आवेदक का नाम', 'पूरा नाम', 'आवेदक का पूरा नाम', 'naam', 'applicant_name', 'myaaru nau', 'myero nau'
      ],
      father_husband_name: [
        'father name', 'father husband name', 'husband name', "father's name", 'father',
        'पिता का नाम', 'पिता अथवा पति का नाम', 'पति का नाम', 'पिताजी का नाम', 'पिताजी', 'पिता', 'पति', 'बाबूजी', 'बौजी',
        'pita ka naam', 'pita', 'pitaji', 'bauji', 'father_husband_name'
      ],
      mobile_number: [
        'mobile number', 'phone number', 'contact number', 'mobile', 'phone',
        'मोबाइल नंबर', 'मोबाइल', 'फोन नंबर', 'फोन', 'mobile_number', 'phone'
      ],
      annual_income: [
        'total annual income', 'total annual family income', 'annual family income', 'annual income', 'total income',
        'yearly income', 'salary', 'household income', 'income',
        'कुल वार्षिक आय', 'वार्षिक आय', 'पारिवारिक आय', 'सालाना आय', 'आय', 'कमाई', 'आमदनी', 'पईसा', 'annual_income'
      ],
      income_source: [
        'primary income source', 'primary income', 'income source', 'source of income', 'income type',
        'primary source', 'occupation', 'profession', 'job type', 'work',
        'आय का मुख्य साधन', 'आय का साधन', 'कमाई का साधन', 'आय का स्रोत', 'मुख्य साधन', 'कमाई का जरिया',
        'प्राइमरी इनकम सोर्स', 'प्राइमरी इनकम', 'इनकम सोर्स', 'इनकम टाइप', 'रोजगार', 'पेशा', 'व्यवसाय',
        'aay ka mukhya sadhan', 'aay ka sadhan', 'kamai ka sadhan', 'income_source'
      ],
      purpose: [
        'certificate required for', 'purpose', 'required for', 'certificate purpose', 'reason',
        'प्रमाण पत्र का प्रयोजन', 'प्रमाण पत्र का उद्देश्य', 'प्रयोजन', 'हेतु', 'उद्देश्य', 'किसलिए चाहिए',
        'pramaan patra ka prayojan', 'prayojan', 'purpose'
      ],
      date_of_birth: [
        'date of birth', 'birth date', 'birthday', 'dob',
        'जन्म तिथि', 'जन्म तारीख', 'janm tithi', 'date_of_birth', 'dob'
      ],
      gender: [
        'gender', 'sex', 'लिंग', 'ling', 'gender'
      ],
      district: [
        'district name', 'state district', 'home district', 'district',
        'जिला', 'जनपद', 'गृह जनपद', 'jila', 'janpad', 'district'
      ],
      tehsil: [
        'tehsil', 'तहसील', 'tahsil'
      ],
      patwari_circle: [
        'patwari circle', 'patwari lekhpal circle', 'lekhpal circle', 'patwari', 'lekhpal',
        'पटवारी', 'लेखपाल चौकी', 'पटवारी चौकी', 'patwari_circle'
      ],
      village_ward: [
        'village ward', 'village', 'ward', 'गाँव', 'गांव', 'वार्ड', 'gram panchayat', 'gram', 'ग्राम'
      ],
      email: [
        'email address', 'email', 'mail', 'ईमेल', 'ईमेल पता', 'email'
      ],
      aadhaar_last_four: [
        'aadhaar last 4', 'aadhaar card', 'aadhaar number', 'aadhaar', 'uid', 'आधार', 'aadhaar_last_four'
      ],
    };

    interface KeyCandidate {
      key: string;
      field: DiscoveredField;
      priority: number;
    }

    const candidates: KeyCandidate[] = [];

    for (const f of fields) {
      const canonicalKey = Object.keys(aliasMap).find(
        (k) => f.id.toLowerCase().includes(k) || f.name.toLowerCase().includes(k)
      );
      if (canonicalKey && aliasMap[canonicalKey]) {
        for (const alias of aliasMap[canonicalKey]) {
          candidates.push({ key: alias.toLowerCase(), field: f, priority: alias.includes(' ') ? 50 : 20 });
        }
      }

      if (f.label) {
        const cleanLabel = f.label.replace(/\*|\([^)]*\)/g, '').trim().toLowerCase();
        if (cleanLabel.length > 2) {
          candidates.push({ key: cleanLabel, field: f, priority: 40 });
        }
      }
      if (f.id && f.id.length > 2) {
        candidates.push({ key: f.id.replace(/_/g, ' ').toLowerCase(), field: f, priority: 30 });
      }
    }

    // Sort by key length descending (longer phrases checked first)
    candidates.sort((a, b) => b.key.length - a.key.length || b.priority - a.priority);

    // 1. Direct prefix match: "father name Indra Singh Bisht", "total annual income 2 crore"
    for (const cand of candidates) {
      const matchedPrefix = lower.startsWith(cand.key)
        ? { text: t, lowerText: lower }
        : cleanLower.startsWith(cand.key)
        ? { text: cleanRaw, lowerText: cleanLower }
        : null;

      if (matchedPrefix) {
        const nextChar = matchedPrefix.lowerText[cand.key.length];
        if (!nextChar || /\s|[:=\-–,]/.test(nextChar)) {
          let remainder = matchedPrefix.text.slice(cand.key.length).trim();
          remainder = remainder
            .replace(/^[:=\-–,]\s*/, '')
            .replace(/^(is|are|hai|hain|ko|mein|set to|bharo|likho|दर्ज करो|रखो|हो)\s+/i, '')
            .replace(/^[:=\-–,]\s*/, '')
            .trim();
          remainder = remainder
            .replace(/\s+(?:hai|hain|है|हैं|करो|field|दर्ज करो)$/i, '')
            .trim();

          if (remainder.length > 0) {
            let valToSet: any = remainder;
            if (cand.field.type === 'number' || cand.field.id.includes('income')) {
              const num = FormInteractionEngine.parseSpokenNumber(remainder);
              if (num !== null) valToSet = num;
            }

            const ok = FormInteractionEngine.setFieldValue(cand.field.element, valToSet);
            if (ok) {
              const canonicalValue = (cand.field.element as any)._resolvedValue ?? valToSet;
              const displayLabel = (cand.field.element as any)._resolvedLabel ?? valToSet;

              return {
                status: 'SUCCESS',
                fieldId: cand.field.id,
                fieldName: cand.field.label || cand.field.name,
                updatedValue: canonicalValue,
                messageEn: cand.field.type === 'select'
                  ? `Selected "${displayLabel}" for ${cand.field.label || cand.field.name}.`
                  : `Entered "${valToSet}" in ${cand.field.label || cand.field.name}.`,
                messageHi: cand.field.type === 'select'
                  ? `${cand.field.label || 'फ़ील्ड'} के लिए "${displayLabel}" चुना गया।`
                  : `${cand.field.label || 'फ़ील्ड'} में "${valToSet}" दर्ज कर दिया है।`,
                messageHinglish: cand.field.type === 'select'
                  ? `${cand.field.label || 'Field'} ke liye "${displayLabel}" select kar diya.`
                  : `${cand.field.label || 'Field'} mein "${valToSet}" enter kar diya hai.`,
              };
            } else if (cand.field.type === 'select') {
              const validOpts = cand.field.options
                ?.filter((o) => o.value)
                .map((o) => o.text.split('(')[0].trim())
                .slice(0, 5)
                .join(', ') || '';

              return {
                status: 'AMBIGUOUS',
                fieldId: cand.field.id,
                fieldName: cand.field.label || cand.field.name,
                messageEn: `Could not match "${remainder}". Available options for ${cand.field.label || cand.field.name} are: ${validOpts}.`,
                messageHi: `"${remainder}" का मिलान नहीं हुआ। ${cand.field.label || 'फ़ील्ड'} के विकल्प हैं: ${validOpts}।`,
                messageHinglish: `"${remainder}" match nahi hua. Options: ${validOpts}.`,
                candidates: cand.field.options?.map((o) => o.value) || [],
              };
            }
          }
        }
      }
    }

    // 2. Reverse pattern match: "<value> in <field>" or "<value> <field> mein"
    const reverseMatch = lower.match(/(.+?)\s+(?:in|into|as|mein|में|के लिए)\s+(?:the\s+)?(.+)/i);
    if (reverseMatch) {
      const valStr = t.slice(0, reverseMatch[1].length).trim();
      const fieldTargetStr = reverseMatch[2].trim();
      const match = FormInteractionEngine.matchField(fieldTargetStr, fields);
      if (match.status === 'EXACT' && match.field && valStr) {
        let valToSet: any = valStr;
        if (match.field.type === 'number' || match.field.id.includes('income')) {
          const num = FormInteractionEngine.parseSpokenNumber(valStr);
          if (num !== null) valToSet = num;
        }
        const ok = FormInteractionEngine.setFieldValue(match.field.element, valToSet);
        if (ok) {
          const canonicalValue = (match.field.element as any)._resolvedValue ?? valToSet;
          const displayLabel = (match.field.element as any)._resolvedLabel ?? valToSet;

          return {
            status: 'SUCCESS',
            fieldId: match.field.id,
            fieldName: match.field.label || match.field.name,
            updatedValue: canonicalValue,
            messageEn: match.field.type === 'select'
              ? `Selected "${displayLabel}" for ${match.field.label || match.field.name}.`
              : `Entered "${valToSet}" in ${match.field.label || match.field.name}.`,
            messageHi: match.field.type === 'select'
              ? `${match.field.label || 'फ़ील्ड'} के लिए "${displayLabel}" चुना गया।`
              : `${match.field.label || 'फ़ील्ड'} में "${valToSet}" दर्ज कर दिया है।`,
            messageHinglish: match.field.type === 'select'
              ? `${match.field.label || 'Field'} ke liye "${displayLabel}" select kar diya.`
              : `${match.field.label || 'Field'} mein "${valToSet}" enter kar diya hai.`,
          };
        }
      }
    }

    return null;
  }

  /**
   * Matches when a citizen directly utters an option value without repeating the field name
   * e.g. "private job", "प्राइवेट जॉब", "वेतनभोगी", "राशन कार्ड", "male", "पुरुष", "देहरादून"
   */
  public static matchStandaloneOption(transcript: string, fields: DiscoveredField[]): FormActionResult | null {
    const t = transcript.trim();
    if (!t || t.length < 2) return null;
    const lower = t.toLowerCase();

    // Do not match long sentences or questions
    if (lower.split(/\s+/).length > 5) return null;

    const selectFields = fields.filter((f) => f.type === 'select' && f.element);

    for (const f of selectFields) {
      const ok = FormInteractionEngine.setFieldValue(f.element, t);
      if (ok) {
        const canonicalValue = (f.element as any)._resolvedValue ?? t;
        const displayLabel = (f.element as any)._resolvedLabel ?? t;

        return {
          status: 'SUCCESS',
          fieldId: f.id,
          fieldName: f.label || f.name,
          updatedValue: canonicalValue,
          messageEn: `Selected "${displayLabel}" for ${f.label || f.name}.`,
          messageHi: `${f.label || 'फ़ील्ड'} के लिए "${displayLabel}" चुना गया।`,
          messageHinglish: `${f.label || 'Field'} ke liye "${displayLabel}" select kar diya.`,
        };
      }
    }

    return null;
  }

  /**
   * Parses spoken or text numbers, including Indian currency notations (crore, lakh, hazaar, k)
   * e.g. "2 crore" -> 20000000, "5 lakh" -> 500000, "60k" -> 60000, "साठ हज़ार" -> 60000
   */
  public static parseSpokenNumber(text: string): number | null {
    if (!text) return null;
    const lower = text.toLowerCase().trim();

    // 1. Crores match (e.g. "2 crore", "2.5 crore", "२ करोड़", "दो करोड़")
    const croreMatch = lower.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:crore|cr|करोड़)/i);
    if (croreMatch) {
      return Math.round(parseFloat(croreMatch[1]) * 10000000);
    }
    if (lower.includes('एक करोड़') || lower.includes('one crore')) return 10000000;
    if (lower.includes('दो करोड़') || lower.includes('two crore')) return 20000000;
    if (lower.includes('तीन करोड़') || lower.includes('three crore')) return 30000000;
    if (lower.includes('पांच करोड़') || lower.includes('पाँच करोड़') || lower.includes('five crore')) return 50000000;

    // 2. Lakhs match (e.g. "5 lakh", "1.5 lakh", "डेढ़ लाख", "ढाई लाख")
    const lakhMatch = lower.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:lakh|lac|लाख)/i);
    if (lakhMatch) {
      return Math.round(parseFloat(lakhMatch[1]) * 100000);
    }
    if (lower.includes('डेढ़ लाख') || lower.includes('one and half lakh')) return 150000;
    if (lower.includes('ढाई लाख') || lower.includes('two and half lakh')) return 250000;
    if (lower.includes('एक लाख') || lower.includes('one lakh')) return 100000;
    if (lower.includes('दो लाख') || lower.includes('two lakh')) return 200000;
    if (lower.includes('तीन लाख') || lower.includes('three lakh')) return 300000;
    if (lower.includes('चार लाख') || lower.includes('four lakh')) return 400000;
    if (lower.includes('पांच लाख') || lower.includes('पाँच लाख') || lower.includes('five lakh')) return 500000;

    // 3. Thousands / k match (e.g. "60k", "60 thousand", "साठ हज़ार")
    const kMatch = lower.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:k|thousand|हज़ार|हजार)/i);
    if (kMatch) {
      return Math.round(parseFloat(kMatch[1]) * 1000);
    }
    if (lower.includes('साठ हज़ार') || lower.includes('साठ हजार') || lower.includes('sixty thousand')) return 60000;
    if (lower.includes('पचास हज़ार') || lower.includes('पचास हजार') || lower.includes('fifty thousand')) return 50000;
    if (lower.includes('सत्तर हज़ार') || lower.includes('सत्तर हजार') || lower.includes('seventy thousand')) return 70000;
    if (lower.includes('अस्सी हज़ार') || lower.includes('अस्सी हजार') || lower.includes('eighty thousand')) return 80000;
    if (lower.includes('नब्बे हज़ार') || lower.includes('नब्बे हजार') || lower.includes('ninety thousand')) return 90000;
    if (lower.includes('तीस हज़ार') || lower.includes('तीस हजार') || lower.includes('thirty thousand')) return 30000;
    if (lower.includes('चालीस हज़ार') || lower.includes('forty thousand') || lower.includes('chaalis hazaar')) return 40000;
    if (lower.includes('बीस हज़ार') || lower.includes('twenty thousand')) return 20000;
    if (lower.includes('दस हज़ार') || lower.includes('ten thousand')) return 10000;

    // 4. Plain numeric string (e.g. "60000", "60,000", "₹50000")
    const clean = lower.replace(/[,₹rs\.inr\s]/gi, '');
    const num = parseFloat(clean);
    if (!isNaN(num)) return num;

    return null;
  }

  /**
   * Generates a spoken summary of filled form fields for user review before submission.
   */
  public static summarizeForm(fields?: DiscoveredField[]): string {
    const list = fields || FormInteractionEngine.getVisibleFields();
    const filled = list.filter((f) => f.currentValue !== '' && f.currentValue !== false && f.currentValue !== undefined);

    if (filled.length === 0) return 'No fields filled yet.';

    return filled
      .map((f) => `${f.label || f.name}: ${f.currentValue}`)
      .slice(0, 4)
      .join(', ');
  }

  /**
   * Converts diverse date strings (e.g. "15 August 2005" or "15/08/2005") to ISO "YYYY-MM-DD"
   */
  public static parseDate(dateStr: string): string | null {
    if (!dateStr) return null;
    const clean = dateStr.trim();

    // Check ISO format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;

    // e.g. "15 August 2005"
    const months: Record<string, string> = {
      january: '01', feb: '02', february: '02', mar: '03', march: '03', apr: '04', april: '04',
      may: '05', jun: '06', june: '06', jul: '07', july: '07', aug: '08', august: '08',
      sep: '09', september: '09', oct: '10', october: '10', nov: '11', november: '11', dec: '12', december: '12',
      जनवरी: '01', फरवरी: '02', मार्च: '03', अप्रैल: '04', मई: '05', जून: '06',
      जुलाई: '07', अगस्त: '08', सितंबर: '09', अक्टूबर: '10', नवंबर: '11', दिसंबर: '12'
    };

    const textMatch = clean.match(/(\d{1,2})\s+([a-zA-Z\u0900-\u097F]+)\s+(\d{4})/);
    if (textMatch) {
      const day = textMatch[1].padStart(2, '0');
      const monthName = textMatch[2].toLowerCase();
      const year = textMatch[3];
      const month = months[monthName];
      if (month) return `${year}-${month}-${day}`;
    }

    // e.g. "15/08/2005" or "15-08-2005"
    const numMatch = clean.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (numMatch) {
      const day = numMatch[1].padStart(2, '0');
      const month = numMatch[2].padStart(2, '0');
      const year = numMatch[3];
      return `${year}-${month}-${day}`;
    }

    return null;
  }
}

