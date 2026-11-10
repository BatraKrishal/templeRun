import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { EmailAlertService } from './services/EmailAlertService.js';
import { AudioCacheService } from './services/AudioCacheService.js';
import { KeyPoolManager } from './services/KeyPoolManager.js';
import { ElevenLabsService } from './services/ElevenLabsService.js';
import { IntentRouterService } from './services/IntentRouterService.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize backend subsystems
const emailAlertService = new EmailAlertService();
const audioCacheService = new AudioCacheService();
const keyPoolManager = new KeyPoolManager(emailAlertService);
const elevenLabsService = new ElevenLabsService(keyPoolManager, audioCacheService);
const intentRouterService = new IntentRouterService();

// ==========================================
// VOICE & SPEECH ENDPOINTS
// ==========================================

/**
 * Text-to-Speech Endpoint
 * Synthesizes voice audio with multi-account dynamic rotation, disk persistence, and SHA-256 caching.
 */
app.post('/api/voice/speak', async (req, res) => {
  try {
    const { text, voiceId, language, forceRefresh } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text parameter is required' });
    }

    const result = await elevenLabsService.synthesizeSpeech(
      text,
      voiceId,
      language || 'hi',
      forceRefresh === true
    );

    res.set({
      'Content-Type': result.contentType,
      'Content-Length': result.audioBuffer.length,
      'X-Key-Used': result.keyUsed,
      'X-Cached': String(result.cached),
      'X-Chars-Count': String(result.charsCount),
      'Cache-Control': 'public, max-age=86400',
    });

    return res.send(result.audioBuffer);
  } catch (err: any) {
    console.error('Error in /api/voice/speak:', err);
    return res.status(500).json({ error: err.message || 'Speech synthesis failed' });
  }
});

/**
 * Intent & Natural Language Routing Endpoint
 * Maps citizen spoken Hindi/Garhwali/English utterances to portal navigation and form slot values.
 */
app.post('/api/voice/intent', (req, res) => {
  try {
    const { transcript, currentRoute, formContext, sessionId } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript parameter is required' });
    }

    const routingResult = intentRouterService.routeIntent({
      transcript,
      currentRoute,
      formContext,
      sessionId,
    });

    return res.json(routingResult);
  } catch (err: any) {
    console.error('Error in /api/voice/intent:', err);
    return res.status(500).json({ error: err.message || 'Intent routing failed' });
  }
});

// ==========================================
// KEY POOL & QUOTA TELEMETRY ENDPOINTS
// ==========================================

/**
 * Returns complete key pool telemetry, active account status, and persistent quota metrics.
 */
app.get('/api/keys/status', (req, res) => {
  try {
    const telemetry = keyPoolManager.getTelemetry();
    const cacheStats = audioCacheService.getStats();
    return res.json({
      ...telemetry,
      cacheStats,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Verification & Test Endpoint: Simulates quota limit exhaustion on the active key.
 * Used for hackathon live proof that automatic rotation and alert dispatching work 100% reliably.
 */
app.post('/api/keys/test-rotation', async (req, res) => {
  try {
    const { keyId } = req.body;
    const result = await keyPoolManager.simulateQuotaExhaustion(keyId);
    return res.json({
      message: 'Quota exhaustion simulated successfully. Key rotated and alert recorded.',
      result,
      telemetry: keyPoolManager.getTelemetry(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Resets an account status back to ACTIVE.
 */
app.post('/api/keys/reset', (req, res) => {
  try {
    const { keyId } = req.body;
    if (!keyId) return res.status(400).json({ error: 'keyId is required' });
    const updated = keyPoolManager.resetAccount(keyId);
    return res.json({
      message: `Account ${keyId} reset to ACTIVE`,
      account: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SERVICE CATALOG & HEALTH
// ==========================================

app.get('/api/catalog', (req, res) => {
  return res.json(intentRouterService.getCatalog());
});

app.get('/api/cache/stats', (req, res) => {
  return res.json(audioCacheService.getStats());
});

app.get('/api/health', (req, res) => {
  return res.json({
    status: 'online',
    portal: 'Apuni Sarkar (e-Services Uttarakhand)',
    engine: 'VaaniSetu Voice Engine',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Apuni Sarkar Backend Proxy running on port ${PORT}`);
  console.log(` http://localhost:${PORT}`);
  console.log(` Active ElevenLabs Account: ${keyPoolManager.getActiveKey()?.accountEmail}`);
  console.log(` Persistent Quota Store: ApuniSarkar/server/data/keys_pool_state.json`);
  console.log(`=======================================================`);
});

