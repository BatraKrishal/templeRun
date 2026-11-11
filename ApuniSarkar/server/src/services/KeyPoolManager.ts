import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { KeyRecord, KeyStatus, PoolState } from '../types/index.js';
import { EmailAlertService } from './EmailAlertService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const STATE_FILE_PATH = path.join(DATA_DIR, 'keys_pool_state.json');

export class KeyPoolManager {
  private state: PoolState;
  private rotationThresholdChars: number;
  private emailAlertService: EmailAlertService;

  constructor(emailAlertService: EmailAlertService) {
    this.emailAlertService = emailAlertService;
    this.rotationThresholdChars = Number(process.env.KEY_ROTATION_THRESHOLD_CHARS) || 9500;
    this.ensureDataDir();
    this.state = this.loadOrInitializeState();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  /**
   * Loads state from persistent disk storage, reconciling with current .env configuration.
   * Survives process crashes, server restarts, and environment updates.
   */
  private loadOrInitializeState(): PoolState {
    this.ensureDataDir();
    const envKeys = this.parseEnvKeys();

    let diskState: PoolState | null = null;
    if (fs.existsSync(STATE_FILE_PATH)) {
      try {
        const raw = fs.readFileSync(STATE_FILE_PATH, 'utf8');
        diskState = JSON.parse(raw);
        console.log(`[KeyPoolManager] Loaded persistent state from disk (${diskState?.keys?.length} keys registered)`);
      } catch (err) {
        console.error('[KeyPoolManager] Error reading keys_pool_state.json from disk, creating clean state:', err);
      }
    }

    // Reconcile env keys with disk records
    const reconciledKeys: KeyRecord[] = envKeys.map((envKey, index) => {
      const existing = diskState?.keys?.find((k) => k.apiKey === envKey.apiKey || k.accountEmail === envKey.accountEmail);
      if (existing) {
        // Retain persistent usage metrics from disk
        return {
          ...existing,
          id: existing.id || `key_${String(index + 1).padStart(2, '0')}`,
          label: envKey.label || existing.label,
          accountEmail: envKey.accountEmail || existing.accountEmail,
          apiKey: envKey.apiKey,
          apiKeyMasked: this.maskApiKey(envKey.apiKey),
        };
      }

      // New key discovered in .env
      return {
        id: `key_${String(index + 1).padStart(2, '0')}`,
        label: envKey.label || `Account ${index + 1}`,
        accountEmail: envKey.accountEmail,
        apiKey: envKey.apiKey,
        apiKeyMasked: this.maskApiKey(envKey.apiKey),
        characterLimit: 10000,
        charactersUsed: 0,
        minutesEstimated: 0,
        status: 'ACTIVE' as KeyStatus,
        lastUsedAt: null,
        exhaustedAt: null,
        alertSent: false,
        failureCount: 0,
      };
    });

    // Determine initial active index
    let activeIdx = diskState?.activeKeyIndex ?? 0;
    if (activeIdx >= reconciledKeys.length || reconciledKeys[activeIdx]?.status !== 'ACTIVE') {
      const firstActive = reconciledKeys.findIndex((k) => k.status === 'ACTIVE' && k.charactersUsed < this.rotationThresholdChars);
      activeIdx = firstActive !== -1 ? firstActive : 0;
    }

    const totalChars = reconciledKeys.reduce((acc, k) => acc + (k.charactersUsed || 0), 0);
    const totalMinutes = reconciledKeys.reduce((acc, k) => acc + (k.minutesEstimated || 0), 0);
    const capacity = reconciledKeys.reduce((acc, k) => acc + (k.characterLimit || 10000), 0);

    const newState: PoolState = {
      version: '1.2.0',
      activeKeyIndex: activeIdx,
      lastUpdated: new Date().toISOString(),
      totalCharactersConsumed: totalChars,
      totalMinutesEstimated: Number(totalMinutes.toFixed(1)),
      totalPoolCapacityChars: capacity,
      keys: reconciledKeys,
      history: diskState?.history || [
        {
          timestamp: new Date().toISOString(),
          event: 'KEY_RESTORED',
          details: `Pool initialized with ${reconciledKeys.length} accounts. Active: Key #${activeIdx + 1}`,
        },
      ],
    };

    this.persistStateSync(newState);
    return newState;
  }

  /**
   * Parses ElevenLabs API keys from .env.
   * Supports multiple formats:
   * 1. Numbered environment variables: ELEVENLABS_API_KEY_1, ELEVENLABS_API_KEY_2, ... ELEVENLABS_API_KEY_9 (with optional ELEVENLABS_EMAIL_1, etc.)
   * 2. Comma-separated pairs: ELEVENLABS_KEYS="key1:email1,key2:email2,..."
   * 3. Comma-separated keys: ELEVENLABS_API_KEYS="key1,key2,key3,..."
   * 4. Single key: ELEVENLABS_API_KEY="key"
   */
  private parseEnvKeys(): Array<{ apiKey: string; accountEmail: string; label?: string }> {
    const collected: Array<{ apiKey: string; accountEmail: string; label?: string }> = [];

    // Format 1: Numbered keys (ELEVENLABS_API_KEY_1 .. ELEVENLABS_API_KEY_20)
    for (let i = 1; i <= 20; i++) {
      const keyVal = process.env[`ELEVENLABS_API_KEY_${i}`];
      if (keyVal && keyVal.trim()) {
        const emailVal = process.env[`ELEVENLABS_EMAIL_${i}`] || `account${i}@elevenlabs`;
        const labelVal = process.env[`ELEVENLABS_LABEL_${i}`] || `Account ${i}`;
        collected.push({
          apiKey: keyVal.trim(),
          accountEmail: emailVal.trim(),
          label: labelVal.trim(),
        });
      }
    }

    // Format 2: Key-Email pairs (ELEVENLABS_KEYS="key1:email1,key2:email2,...")
    const rawPairs = process.env.ELEVENLABS_KEYS || '';
    if (rawPairs.trim()) {
      const pairs = rawPairs.split(',').map((p) => p.trim()).filter(Boolean);
      for (const pair of pairs) {
        const [key, email] = pair.split(':');
        if (key && key.trim() && !collected.some((c) => c.apiKey === key.trim())) {
          const idx = collected.length + 1;
          collected.push({
            apiKey: key.trim(),
            accountEmail: email?.trim() || `account${idx}@elevenlabs`,
            label: `Account ${idx}`,
          });
        }
      }
    }

    // Format 3: Comma-separated list (ELEVENLABS_API_KEYS="key1,key2,key3,...")
    const rawList = process.env.ELEVENLABS_API_KEYS || '';
    if (rawList.trim()) {
      const list = rawList.split(',').map((k) => k.trim()).filter(Boolean);
      for (const k of list) {
        if (k && !collected.some((c) => c.apiKey === k)) {
          const idx = collected.length + 1;
          collected.push({
            apiKey: k,
            accountEmail: `account${idx}@elevenlabs`,
            label: `Account ${idx}`,
          });
        }
      }
    }

    // Format 4: Standalone single key (ELEVENLABS_API_KEY)
    const singleKey = process.env.ELEVENLABS_API_KEY || '';
    if (singleKey.trim() && !collected.some((c) => c.apiKey === singleKey.trim())) {
      const singleEmail = process.env.ELEVENLABS_ACCOUNT_EMAIL || 'primary@elevenlabs';
      collected.unshift({
        apiKey: singleKey.trim(),
        accountEmail: singleEmail.trim(),
        label: 'Account 1',
      });
    }

    if (collected.length > 0) {
      console.log(`[KeyPoolManager] Discovered ${collected.length} ElevenLabs accounts from .env`);
      return collected;
    }

    // Default fallback pool of 20 simulated accounts for hackathon demo resilience
    return Array.from({ length: 20 }, (_, i) => ({
      apiKey: `sk_free_demo_key_${String(i + 1).padStart(2, '0')}`,
      accountEmail: `uk.citizen.dev${i + 1}@gmail.com`,
      label: `Account ${i + 1}`,
    }));
  }

  private maskApiKey(key: string): string {
    if (!key || key.length < 8) return '****';
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  }

  /**
   * Atomically flushes pool state to disk using a temporary file.
   * Prevents file corruption during unexpected crashes or restarts.
   */
  private persistStateSync(stateToPersist: PoolState = this.state) {
    this.ensureDataDir();
    stateToPersist.lastUpdated = new Date().toISOString();
    const tempFile = `${STATE_FILE_PATH}.tmp`;
    try {
      fs.writeFileSync(tempFile, JSON.stringify(stateToPersist, null, 2), 'utf8');
      fs.renameSync(tempFile, STATE_FILE_PATH);
    } catch (err) {
      console.error('[KeyPoolManager] Atomic persistState failed:', err);
      try {
        fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(stateToPersist, null, 2), 'utf8');
      } catch (directErr) {
        console.error('[KeyPoolManager] Direct write fallback also failed:', directErr);
      }
    }
  }

  /**
   * Returns the currently active ElevenLabs API key and record.
   */
  public getActiveKey(): KeyRecord {
    const active = this.state.keys[this.state.activeKeyIndex];
    if (active && active.status === 'ACTIVE' && active.charactersUsed < this.rotationThresholdChars) {
      return active;
    }

    // Current key exhausted or not active, find next
    const nextIdx = this.findNextAvailableKeyIndex();
    if (nextIdx !== -1) {
      this.state.activeKeyIndex = nextIdx;
      this.persistStateSync();
      return this.state.keys[nextIdx];
    }

    // If all keys exhausted, return current with exhausted flag
    return active || this.state.keys[0];
  }

  private findNextAvailableKeyIndex(): number {
    return this.state.keys.findIndex(
      (k) => k.status === 'ACTIVE' && k.charactersUsed < this.rotationThresholdChars
    );
  }

  /**
   * Records character consumption from TTS playback directly to disk.
   */
  public recordUsage(charactersUsed: number) {
    const active = this.getActiveKey();
    if (!active) return;

    active.charactersUsed += charactersUsed;
    // ~1,000 characters ≈ 1.5 minutes audio
    active.minutesEstimated = Number((active.charactersUsed / 666.6).toFixed(1));
    active.lastUsedAt = new Date().toISOString();

    this.state.totalCharactersConsumed += charactersUsed;
    this.state.totalMinutesEstimated = Number((this.state.totalCharactersConsumed / 666.6).toFixed(1));

    console.log(
      `[KeyPoolManager] ${charactersUsed} chars used on ${active.id} (${active.accountEmail}). Total: ${active.charactersUsed}/${active.characterLimit}`
    );

    // Check if key reached proactive threshold
    if (active.charactersUsed >= this.rotationThresholdChars) {
      console.warn(`[KeyPoolManager] Proactive rotation: ${active.id} reached ${active.charactersUsed} chars threshold!`);
      this.rotateCurrentKey('QUOTA_EXHAUSTED');
    } else {
      this.persistStateSync();
    }
  }

  /**
   * Rotates the current key, marks it EXHAUSTED, and triggers email alert.
   */
  public async rotateCurrentKey(reason: 'QUOTA_EXHAUSTED' | 'RATE_LIMITED' | 'KEY_ROTATED' = 'QUOTA_EXHAUSTED') {
    const current = this.state.keys[this.state.activeKeyIndex];
    if (!current) return;

    current.status = reason === 'RATE_LIMITED' ? 'RATE_LIMITED' : 'EXHAUSTED';
    current.exhaustedAt = new Date().toISOString();

    const nextIndex = this.findNextAvailableKeyIndex();
    const nextKey = nextIndex !== -1 ? this.state.keys[nextIndex] : null;

    if (nextIndex !== -1) {
      this.state.activeKeyIndex = nextIndex;
    }

    this.state.history.unshift({
      timestamp: new Date().toISOString(),
      event: reason,
      details: `Key ${current.id} (${current.accountEmail}) exhausted at ${current.charactersUsed} chars. Switched to ${nextKey ? nextKey.id : 'NONE'}.`,
    });

    // Prevent log growing indefinitely
    if (this.state.history.length > 50) {
      this.state.history = this.state.history.slice(0, 50);
    }

    this.persistStateSync();

    // Trigger email alert if not already sent
    if (!current.alertSent) {
      current.alertSent = true;
      this.persistStateSync();

      const activeCount = this.state.keys.filter((k) => k.status === 'ACTIVE').length;
      await this.emailAlertService.sendQuotaExhaustionAlert(current, nextKey, {
        activeCount,
        totalCount: this.state.keys.length,
      });
    }

    console.log(
      `[KeyPoolManager] Key rotation complete. New active: ${nextKey ? `${nextKey.id} (${nextKey.accountEmail})` : 'NONE'}`
    );
  }

  /**
   * For automated verification or demo simulation: forces a rotation on demand.
   */
  public async simulateQuotaExhaustion(keyId?: string): Promise<{ success: boolean; exhausted: KeyRecord; nextActive: KeyRecord | null }> {
    const targetIdx = keyId ? this.state.keys.findIndex((k) => k.id === keyId) : this.state.activeKeyIndex;
    if (targetIdx === -1) {
      throw new Error(`Key ${keyId} not found`);
    }

    this.state.activeKeyIndex = targetIdx;
    const targetKey = this.state.keys[targetIdx];
    targetKey.charactersUsed = this.rotationThresholdChars + 50;
    targetKey.minutesEstimated = 14.8;

    await this.rotateCurrentKey('QUOTA_EXHAUSTED');

    const next = this.state.activeKeyIndex !== targetIdx ? this.state.keys[this.state.activeKeyIndex] : null;
    return {
      success: true,
      exhausted: targetKey,
      nextActive: next,
    };
  }

  /**
   * Resets an account back to ACTIVE with 0 used characters.
   */
  public resetAccount(keyId: string): KeyRecord {
    const key = this.state.keys.find((k) => k.id === keyId);
    if (!key) throw new Error(`Key with ID ${keyId} not found`);

    key.status = 'ACTIVE';
    key.charactersUsed = 0;
    key.minutesEstimated = 0;
    key.exhaustedAt = null;
    key.alertSent = false;
    key.failureCount = 0;

    this.state.history.unshift({
      timestamp: new Date().toISOString(),
      event: 'KEY_RESTORED',
      details: `Key ${key.id} (${key.accountEmail}) manually reset to ACTIVE.`,
    });

    this.persistStateSync();
    return key;
  }

  /**
   * Manually switches the active key in the pool (by keyId e.g. "key_03" or by index e.g. 2).
   */
  public switchActiveKey(keyIdentifier: string | number): KeyRecord {
    let targetIdx = -1;
    if (typeof keyIdentifier === 'number') {
      targetIdx = keyIdentifier;
    } else {
      targetIdx = this.state.keys.findIndex(
        (k) => k.id === keyIdentifier || k.accountEmail === keyIdentifier
      );
    }

    if (targetIdx < 0 || targetIdx >= this.state.keys.length) {
      throw new Error(`Invalid key identifier: ${keyIdentifier}`);
    }

    const targetKey = this.state.keys[targetIdx];
    this.state.activeKeyIndex = targetIdx;

    this.state.history.unshift({
      timestamp: new Date().toISOString(),
      event: 'KEY_ROTATED',
      details: `Active key manually switched to ${targetKey.id} (${targetKey.accountEmail}).`,
    });

    if (this.state.history.length > 50) {
      this.state.history = this.state.history.slice(0, 50);
    }

    this.persistStateSync();
    console.log(`[KeyPoolManager] Active key manually switched to ${targetKey.id} (${targetKey.accountEmail})`);
    return targetKey;
  }

  public getTelemetry() {
    const active = this.getActiveKey();
    const activeAccountsCount = this.state.keys.filter((k) => k.status === 'ACTIVE' && k.charactersUsed < this.rotationThresholdChars).length;
    const remainingChars = Math.max(0, this.state.totalPoolCapacityChars - this.state.totalCharactersConsumed);
    const remainingMinutes = Number((remainingChars / 666.6).toFixed(1));

    return {
      activeKey: {
        id: active?.id,
        label: active?.label,
        accountEmail: active?.accountEmail,
        charactersUsed: active?.charactersUsed || 0,
        characterLimit: active?.characterLimit || 10000,
        status: active?.status,
        index: this.state.activeKeyIndex,
      },
      poolSummary: {
        totalAccounts: this.state.keys.length,
        activeAccounts: activeAccountsCount,
        exhaustedAccounts: this.state.keys.filter((k) => k.status === 'EXHAUSTED').length,
        totalCapacityMinutes: Math.round(this.state.totalPoolCapacityChars / 666.6),
        remainingMinutes,
        totalCharactersConsumed: this.state.totalCharactersConsumed,
        totalPoolCapacityChars: this.state.totalPoolCapacityChars,
        rotationThresholdChars: this.rotationThresholdChars,
        lastUpdated: this.state.lastUpdated,
      },
      keys: this.state.keys.map((k) => ({
        id: k.id,
        label: k.label,
        accountEmail: k.accountEmail,
        apiKeyMasked: k.apiKeyMasked,
        charactersUsed: k.charactersUsed,
        characterLimit: k.characterLimit,
        minutesEstimated: k.minutesEstimated,
        status: k.status,
        alertSent: k.alertSent,
        lastUsedAt: k.lastUsedAt,
        exhaustedAt: k.exhaustedAt,
      })),
      recentEvents: this.state.history.slice(0, 10),
    };
  }
}

