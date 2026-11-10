import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LanguageDetector } from '../services/LanguageDetector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATE_PATH = path.resolve(__dirname, '../../data/keys_pool_state.json');
const ALERTS_LOG_PATH = path.resolve(__dirname, '../../data/alerts.log');

async function runEndToEndVerification() {
  console.log('================================================================');
  console.log(' APUNI SARKAR (VAANI-SETU) - RIGOROUS END-TO-END VERIFICATION');
  console.log('================================================================');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`, details || '');
      process.exitCode = 1;
    }
  }

  // 1. Health check
  try {
    const res = await fetch('http://localhost:5000/api/health');
    const data: any = await res.json();
    assert(res.ok && data.status === 'online', 'Health Check endpoint returns online');
  } catch (err: any) {
    assert(false, 'Health Check endpoint failed', err.message);
  }

  // 2. Service Catalog
  try {
    const res = await fetch('http://localhost:5000/api/catalog');
    const catalog: any = await res.json();
    assert(Array.isArray(catalog) && catalog.length >= 8, `Service catalog contains ${catalog.length} services`);
  } catch (err: any) {
    assert(false, 'Catalog fetch failed', err.message);
  }

  // 3. Natural Language Intent Router (Hindi)
  try {
    const res = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'मुझे अपनी आय का प्रमाण पत्र बनवाना है' }),
    });
    const intentData: any = await res.json();
    assert(
      intentData.intent === 'NAVIGATE' && intentData.targetRoute === '/services/revenue/income-certificate',
      'Hindi speech "आय प्रमाण पत्र बनवाना है" routes to /services/revenue/income-certificate',
      intentData
    );
  } catch (err: any) {
    assert(false, 'Income intent router failed', err.message);
  }

  // 4. Natural Language Intent Router (Permanent Residence / Domicile)
  try {
    const res = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'स्थायी निवास प्रमाण पत्र फॉर्म खोलो' }),
    });
    const intentData: any = await res.json();
    assert(
      intentData.intent === 'NAVIGATE' && intentData.targetRoute === '/services/revenue/domicile-certificate',
      'Hindi speech "स्थायी निवास प्रमाण पत्र खोलो" routes to /services/revenue/domicile-certificate',
      intentData
    );
  } catch (err: any) {
    assert(false, 'Domicile intent router failed', err.message);
  }

  // 5. English Exact Page Navigation: Download Certificate
  try {
    const res = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'Go to the Download Certificate page.' }),
    });
    const data: any = await res.json();
    assert(
      data.intent === 'NAVIGATE' && data.targetRoute === '/download-certificates',
      'English "Go to the Download Certificate page." routes to /download-certificates',
      data
    );
  } catch (err: any) {
    assert(false, 'Download Certificate navigation failed', err.message);
  }

  // 6. Hinglish Navigation: "Mujhe Download Certificate page par le chalo"
  try {
    const res = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'Mujhe Download Certificate page par le chalo' }),
    });
    const data: any = await res.json();
    assert(
      data.intent === 'NAVIGATE' && data.targetRoute === '/download-certificates',
      'Hinglish "Mujhe Download Certificate page par le chalo" routes to /download-certificates',
      data
    );
  } catch (err: any) {
    assert(false, 'Hinglish download certificate navigation failed', err.message);
  }

  // 7. Synonym & Alternative Navigation: "Open my certificates"
  try {
    const res = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'Open my certificates' }),
    });
    const data: any = await res.json();
    assert(
      data.intent === 'NAVIGATE' && data.targetRoute === '/download-certificates',
      'Synonym "Open my certificates" routes to /download-certificates',
      data
    );
  } catch (err: any) {
    assert(false, 'Synonym certificate navigation failed', err.message);
  }

  // 8. Navigation to Dashboard: "Return to the dashboard"
  try {
    const res = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'Return to the dashboard' }),
    });
    const data: any = await res.json();
    assert(
      data.intent === 'NAVIGATE' && data.targetRoute === '/dashboard',
      'Command "Return to the dashboard" routes to /dashboard',
      data
    );
  } catch (err: any) {
    assert(false, 'Dashboard navigation failed', err.message);
  }

  // 9. History Navigation: "Go back to the previous page"
  try {
    const res = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'Go back to the previous page' }),
    });
    const data: any = await res.json();
    assert(
      data.intent === 'NAVIGATE' && data.targetRoute === '__BACK__',
      'History command "Go back to the previous page" resolves to __BACK__',
      data
    );
  } catch (err: any) {
    assert(false, 'History back navigation failed', err.message);
  }

  // 10. Ambiguity Detection: generic "certificates"
  try {
    const res = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'certificates' }),
    });
    const data: any = await res.json();
    assert(
      data.intent === 'GENERAL_QUERY' &&
      (data.spokenResponseEnglish.includes('Which certificate') || data.spokenResponseHindi.includes('कौन सा प्रमाण पत्र')),
      'Ambiguous command "certificates" prompts user clarification rather than blind navigation',
      data
    );
  } catch (err: any) {
    assert(false, 'Ambiguity test failed', err.message);
  }

  // 11. Non-existent Route Handling: "Go to moon landing page"
  try {
    const res = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'Go to moon landing page' }),
    });
    const data: any = await res.json();
    assert(
      data.intent === 'GENERAL_QUERY' &&
      (data.spokenResponseEnglish.includes('could not find') || data.spokenResponseHindi.includes('नहीं मिला')),
      'Nonexistent page request safely reports page not found without faking success',
      data
    );
  } catch (err: any) {
    assert(false, 'Nonexistent page test failed', err.message);
  }

  // 12. Conversational Form Slot Extraction & Hindi Number Normalization
  try {
    const res = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'मेरा नाम कुलदीप सिंह नेगी है, पिता जी का नाम खुशाल सिंह, और कमाई साठ हज़ार है',
        currentRoute: '/services/revenue/income-certificate',
      }),
    });
    const data: any = await res.json();
    const slots = data.extractedSlots || {};
    assert(
      slots.applicant_name?.includes('कुलदीप') &&
      slots.father_husband_name?.includes('खुशाल') &&
      slots.annual_income === 60000,
      'Conversational slot extraction converts "साठ हज़ार" to 60000 and captures applicant & father names',
      slots
    );
  } catch (err: any) {
    assert(false, 'Slot extraction failed', err.message);
  }

  // 13. Dynamic Natural Language Form Command: "Enter Vimal in the name field"
  try {
    const res = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'Enter Vimal in the name field',
        currentRoute: '/services/revenue/income-certificate',
      }),
    });
    const data: any = await res.json();
    assert(
      data.extractedSlots?.applicant_name?.toLowerCase() === 'vimal',
      'Command "Enter Vimal in the name field" extracts applicant_name: Vimal',
      data
    );
  } catch (err: any) {
    assert(false, 'Enter name slot failed', err.message);
  }

  // 14. Date of Birth Slot Extraction
  try {
    const res = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'My date of birth is 15 August 2005',
        currentRoute: '/services/revenue/income-certificate',
      }),
    });
    const data: any = await res.json();
    assert(
      data.extractedSlots?.date_of_birth?.includes('15 August 2005'),
      'Command "My date of birth is 15 August 2005" extracts date_of_birth slot',
      data
    );
  } catch (err: any) {
    assert(false, 'Date of birth slot extraction failed', err.message);
  }

  // 15. Dropdown / Gender Slot Extraction: "Select male"
  try {
    const res = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'Select male',
        currentRoute: '/services/revenue/income-certificate',
      }),
    });
    const data: any = await res.json();
    assert(
      data.extractedSlots?.gender === 'MALE',
      'Command "Select male" extracts gender: MALE',
      data
    );
  } catch (err: any) {
    assert(false, 'Select male test failed', err.message);
  }

  // 15b. Natural Key-Value Form Filling: "father name Indra Singh Bisht"
  try {
    const res = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'father name Indra Singh Bisht',
        currentRoute: '/services/revenue/income-certificate',
      }),
    });
    const data: any = await res.json();
    assert(
      data.intent === 'FILL_FIELD' && data.extractedSlots?.father_husband_name === 'Indra Singh Bisht',
      'Natural key-value "father name Indra Singh Bisht" fills father_husband_name on form route',
      data
    );
  } catch (err: any) {
    assert(false, 'Father name natural input test failed', err.message);
  }

  // 15c. Natural Key-Value Form Filling: "annual income 60000"
  try {
    const res = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'annual income 60000',
        currentRoute: '/services/revenue/income-certificate',
      }),
    });
    const data: any = await res.json();
    assert(
      data.intent === 'FILL_FIELD' && data.extractedSlots?.annual_income === 60000,
      'Natural key-value "annual income 60000" fills annual_income: 60000 on form route',
      data
    );
  } catch (err: any) {
    assert(false, 'Annual income natural input test failed', err.message);
  }

  // 15d. Multi-Crore Indian Currency Normalization: "total annual income 2 crore"
  try {
    const res = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'total annual income 2 crore',
        currentRoute: '/services/revenue/income-certificate',
      }),
    });
    const data: any = await res.json();
    assert(
      data.intent === 'FILL_FIELD' && data.extractedSlots?.annual_income === 20000000,
      'Spoken multi-crore "total annual income 2 crore" normalizes to 20000000 (₹2,00,00,000)',
      data
    );
  } catch (err: any) {
    assert(false, 'Crore normalization test failed', err.message);
  }

  // 15e. Select Dropdown Matching: "primary income source private job" -> SALARIED
  try {
    const res = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'primary income source private job',
        currentRoute: '/services/revenue/income-certificate',
      }),
    });
    const data: any = await res.json();
    assert(
      data.intent === 'FILL_FIELD' && data.extractedSlots?.income_source === 'SALARIED',
      'Select dropdown synonym "primary income source private job" maps to enum SALARIED',
      data
    );
  } catch (err: any) {
    assert(false, 'Income source dropdown synonym test failed', err.message);
  }

  // 15f. Select Dropdown Matching: "certificate required for ration card" -> RATION_CARD
  try {
    const res = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'certificate required for ration card',
        currentRoute: '/services/revenue/income-certificate',
      }),
    });
    const data: any = await res.json();
    assert(
      data.intent === 'FILL_FIELD' && data.extractedSlots?.purpose === 'RATION_CARD',
      'Select dropdown synonym "certificate required for ration card" maps to enum RATION_CARD',
      data
    );
  } catch (err: any) {
    assert(false, 'Certificate purpose dropdown synonym test failed', err.message);
  }

  // 16. Application ID Tracking Intent
  try {
    const res = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'आवेदन ट्रैक करें UK-REV-2026-9812' }),
    });
    const data: any = await res.json();
    assert(
      data.intent === 'TRACK_STATUS' && data.extractedSlots?.tracking_id === 'UK-REV-2026-9812',
      'Voice tracking intent extracts UK-REV-2026-9812 Application ID',
      data
    );
  } catch (err: any) {
    assert(false, 'Tracking intent failed', err.message);
  }

  // 17. TTS Synthesis & Key Pool Dynamic Selection
  try {
    const phrase = 'नमस्ते, अपनी सरकार उत्तराखंड में आपका स्वागत है।';
    const res1 = await fetch('http://localhost:5000/api/voice/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: phrase }),
    });
    const buf1 = await res1.arrayBuffer();

    assert(res1.ok && buf1.byteLength > 1000, `First TTS call generates valid audio (${buf1.byteLength} bytes)`);

    // 18. Disk Audio Hash Caching (0 API Quota Consumed)
    const res2 = await fetch('http://localhost:5000/api/voice/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: phrase }),
    });
    const cached2 = res2.headers.get('x-cached');
    const keyUsed2 = res2.headers.get('x-key-used');

    assert(
      res2.ok && cached2 === 'true' && keyUsed2 === 'CACHE',
      'Second TTS call hits disk audio cache (Key-Used: CACHE, 0 quota consumed)'
    );
  } catch (err: any) {
    assert(false, 'TTS synthesis & caching test failed', err.message);
  }

  // 19. Key Rotation & Quota Exhaustion Simulation
  try {
    const rotateRes = await fetch('http://localhost:5000/api/keys/test-rotation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const rotData: any = await rotateRes.json();
    assert(
      rotateRes.ok && rotData.result.exhausted.status === 'EXHAUSTED',
      `Key rotation shifts account ${rotData.result.exhausted.id} to EXHAUSTED status`
    );

    // 20. Non-RAM Disk Persistence Verification
    const diskRaw = fs.readFileSync(STATE_PATH, 'utf8');
    const diskState = JSON.parse(diskRaw);
    const diskExhaustedKey = diskState.keys.find((k: any) => k.id === rotData.result.exhausted.id);

    assert(
      diskExhaustedKey?.status === 'EXHAUSTED' && diskExhaustedKey?.alertSent === true,
      'Quota exhaustion and character usage confirmed written directly to persistent disk store (keys_pool_state.json)'
    );

    // 21. Automated Email Alert Notification Verification
    const alertLogs = fs.readFileSync(ALERTS_LOG_PATH, 'utf8');
    assert(
      alertLogs.includes('CRITICAL ALERT') && alertLogs.includes(rotData.result.exhausted.accountEmail),
      'Automated email notification confirmed logged with timestamp and account identity in alerts.log'
    );
  } catch (err: any) {
    assert(false, 'Key rotation & alert persistence test failed', err.message);
  }

  // 22. Multilingual Language Detection Precision
  try {
    const langEn1 = LanguageDetector.detect('Go to the Download Certificate page.');
    const langEn2 = LanguageDetector.detect('Return to the dashboard');
    const langEn3 = LanguageDetector.detect('Enter Vimal in the name field');
    const langHi1 = LanguageDetector.detect('मेरा नाम कुलदीप सिंह नेगी है');
    const langHinglish1 = LanguageDetector.detect('Mera naam Vimal hai');
    const langHinglish2 = LanguageDetector.detect('Download certificate page kholo');

    assert(
      langEn1 === 'en' && langEn2 === 'en' && langEn3 === 'en',
      'English commands containing "to" or "in" correctly classify as English (not Hinglish)',
      { langEn1, langEn2, langEn3 }
    );
    assert(
      langHi1 === 'hi',
      'Devanagari Hindi input correctly classifies as "hi"',
      { langHi1 }
    );
    assert(
      langHinglish1 === 'hinglish' && langHinglish2 === 'hinglish',
      'Romanized Hindi / Hinglish phrases classify as "hinglish"',
      { langHinglish1, langHinglish2 }
    );
  } catch (err: any) {
    assert(false, 'Language detection tests failed', err.message);
  }

  // 23. Catalog Services Deep Voice Navigation (e.g. "Registration in Class D")
  try {
    const res1 = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'I want to go to registration in class D',
        currentRoute: '/all-services',
      }),
    });
    const data1: any = await res1.json();
    assert(
      data1.intent === 'NAVIGATE' &&
      data1.targetRoute?.includes('/all-services') &&
      data1.targetRoute?.includes('Class%20D'),
      'Catalog query "I want to go to registration in class D" navigates to Registration in Class D filter',
      data1
    );

    const res2 = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'go registration in class D',
        currentRoute: '/all-services',
      }),
    });
    const data2: any = await res2.json();
    assert(
      data2.intent === 'NAVIGATE' && data2.targetRoute?.includes('Class%20D'),
      'Shorthand query "go registration in class D" navigates to Registration in Class D',
      data2
    );
  } catch (err: any) {
    assert(false, 'Catalog voice navigation test failed', err.message);
  }

  console.log('================================================================');
  console.log(` VERIFICATION COMPLETE: ${passedTests} / ${totalTests} CHECKS PASSED`);
  console.log('================================================================');

  // Restore key back to ACTIVE after tests so dev server remains operational
  try {
    await fetch('http://localhost:5000/api/keys/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyId: 'key_01' }),
    });
  } catch (e) {}
}

runEndToEndVerification();