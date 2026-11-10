import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
    const data = await res.json();
    assert(res.ok && data.status === 'online', 'Health Check endpoint returns online');
  } catch (err: any) {
    assert(false, 'Health Check endpoint failed', err.message);
  }

  // 2. Service Catalog
  try {
    const res = await fetch('http://localhost:5000/api/catalog');
    const catalog = await res.json();
    assert(Array.isArray(catalog) && catalog.length >= 8, `Service catalog contains ${catalog.length} services`);
  } catch (err: any) {
    assert(false, 'Catalog fetch failed', err.message);
  }

  // 3. Natural Language Intent Router (Hindi)
  try {
    const res = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'मुझे अपनी आय का प्रमाण पत्र बनवाना है', sessionId: 'test_session_income' }),
    });
    const intentData = await res.json();
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
      body: JSON.stringify({ transcript: 'स्थायी निवास प्रमाण पत्र फॉर्म खोलो', sessionId: 'test_session_domicile' }),
    });
    const intentData = await res.json();
    assert(
      intentData.intent === 'NAVIGATE' && intentData.targetRoute === '/services/revenue/domicile-certificate',
      'Hindi speech "स्थायी निवास प्रमाण पत्र खोलो" routes to /services/revenue/domicile-certificate',
      intentData
    );
  } catch (err: any) {
    assert(false, 'Domicile intent router failed', err.message);
  }

  // 5. Conversational Form Slot Extraction & Hindi Number Normalization
  try {
    const res = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'मेरा नाम कुलदीप सिंह नेगी है, पिता जी का नाम खुशाल सिंह, और कमाई साठ हज़ार है',
        currentRoute: '/services/revenue/income-certificate',
        sessionId: 'test_session_slots',
      }),
    });
    const data = await res.json();
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

  // 6. Application ID Tracking Intent
  try {
    const res = await fetch('http://localhost:5000/api/voice/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'आवेदन ट्रैक करें UK-REV-2026-9812', sessionId: 'test_session_track' }),
    });
    const data = await res.json();
    assert(
      data.intent === 'TRACK_STATUS' && data.extractedSlots?.tracking_id === 'UK-REV-2026-9812',
      'Voice tracking intent extracts UK-REV-2026-9812 Application ID',
      data
    );
  } catch (err: any) {
    assert(false, 'Tracking intent failed', err.message);
  }

  // 7. TTS Synthesis & Key Pool Dynamic Selection
  try {
    const phrase = 'नमस्ते, अपनी सरकार उत्तराखंड में आपका स्वागत है।';
    const res1 = await fetch('http://localhost:5000/api/voice/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: phrase }),
    });
    const buf1 = await res1.arrayBuffer();
    const keyUsed1 = res1.headers.get('x-key-used');
    const cached1 = res1.headers.get('x-cached');

    assert(res1.ok && buf1.byteLength > 1000, `First TTS call generates valid audio (${buf1.byteLength} bytes)`);

    // 8. Disk Audio Hash Caching (0 API Quota Consumed)
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

  // 9. Key Rotation & Quota Exhaustion Simulation
  try {
    const rotateRes = await fetch('http://localhost:5000/api/keys/test-rotation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const rotData = await rotateRes.json();
    assert(
      rotateRes.ok && rotData.result.exhausted.status === 'EXHAUSTED',
      `Key rotation shifts account ${rotData.result.exhausted.id} to EXHAUSTED status`
    );

    // 10. Non-RAM Disk Persistence Verification
    const diskRaw = fs.readFileSync(STATE_PATH, 'utf8');
    const diskState = JSON.parse(diskRaw);
    const diskExhaustedKey = diskState.keys.find((k: any) => k.id === rotData.result.exhausted.id);

    assert(
      diskExhaustedKey?.status === 'EXHAUSTED' && diskExhaustedKey?.alertSent === true,
      'Quota exhaustion and character usage confirmed written directly to persistent disk store (keys_pool_state.json)'
    );

    // 11. Automated Email Alert Notification Verification
    const alertLogs = fs.readFileSync(ALERTS_LOG_PATH, 'utf8');
    assert(
      alertLogs.includes('CRITICAL ALERT') && alertLogs.includes(rotData.result.exhausted.accountEmail),
      'Automated email notification confirmed logged with timestamp and account identity in alerts.log'
    );
  } catch (err: any) {
    assert(false, 'Key rotation & alert persistence test failed', err.message);
  }

  console.log('================================================================');
  console.log(` VERIFICATION COMPLETE: ${passedTests} / ${totalTests} CHECKS PASSED`);
  console.log('================================================================');
}

runEndToEndVerification();

