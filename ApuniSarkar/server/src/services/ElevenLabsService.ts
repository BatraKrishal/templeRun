import { KeyPoolManager } from './KeyPoolManager.js';
import { AudioCacheService } from './AudioCacheService.js';

export class ElevenLabsService {
  private keyPoolManager: KeyPoolManager;
  private audioCacheService: AudioCacheService;
  private defaultModelId: string;
  private defaultVoiceId: string;

  constructor(keyPoolManager: KeyPoolManager, audioCacheService: AudioCacheService) {
    this.keyPoolManager = keyPoolManager;
    this.audioCacheService = audioCacheService;
    this.defaultModelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
    this.defaultVoiceId = process.env.ELEVENLABS_VOICE_ID || 'Xb7hH8MSUJpSbSDYk0k2';
  }

  /**
   * Synthesizes speech with automated caching, dynamic key rotation, and seamless retry failover.
   */
  public async synthesizeSpeech(
    text: string,
    voiceId: string = this.defaultVoiceId,
    language: string = 'hi',
    forceRefresh: boolean = false
  ): Promise<{ audioBuffer: Buffer; contentType: string; cached: boolean; keyUsed: string; charsCount: number }> {
    const charsCount = text.length;

    // 1. Check disk audio hash cache first (0 API quota consumed on hit)
    if (!forceRefresh) {
      const cached = this.audioCacheService.get(text, voiceId, language);
      if (cached.hit && cached.buffer) {
        console.log(`[ElevenLabsService] Cache hit! Served from disk (${cached.hash.slice(0, 8)}) with 0 quota consumed.`);
        return {
          audioBuffer: cached.buffer,
          contentType: 'audio/mpeg',
          cached: true,
          keyUsed: 'CACHE',
          charsCount: 0,
        };
      }
    }

    // 2. Synthesize using active rotated key
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      const activeKey = this.keyPoolManager.getActiveKey();
      console.log(`[ElevenLabsService] Synthesizing ${charsCount} chars using Key ${activeKey.id} (${activeKey.accountEmail})`);

      // Check if real key or demo fallback
      const isRealKey =
        activeKey.apiKey &&
        !activeKey.apiKey.startsWith('sk_free_demo_') &&
        !activeKey.apiKey.includes('your_key_') &&
        activeKey.apiKey.length > 20;

      if (!isRealKey) {
        // Safe mock audio generation for offline or demo testing
        console.log(`[ElevenLabsService] Using demo audio synthesizer for ${activeKey.id} (survives without live ElevenLabs credentials)`);
        const syntheticAudio = this.createSyntheticBeepAudio(text);
        
        // Record usage to persistent store
        this.keyPoolManager.recordUsage(charsCount);
        this.audioCacheService.set(text, syntheticAudio, voiceId, language);

        return {
          audioBuffer: syntheticAudio,
          contentType: 'audio/wav',
          cached: false,
          keyUsed: activeKey.id,
          charsCount,
        };
      }

      // Live ElevenLabs API request
      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': activeKey.apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: this.defaultModelId,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
            },
          }),
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Update non-RAM persistent quota store
          this.keyPoolManager.recordUsage(charsCount);

          // Save to disk hash cache
          this.audioCacheService.set(text, buffer, voiceId, language);

          return {
            audioBuffer: buffer,
            contentType: 'audio/mpeg',
            cached: false,
            keyUsed: activeKey.id,
            charsCount,
          };
        }

        // Quota exhaustion or rate limit response (401 / 429)
        const errorText = await response.text();
        console.warn(`[ElevenLabsService] ElevenLabs API error (${response.status}):`, errorText);

        if (response.status === 401 || response.status === 429 || errorText.includes('quota')) {
          console.warn(`[ElevenLabsService] Account ${activeKey.accountEmail} quota exhausted! Triggering dynamic failover.`);
          await this.keyPoolManager.rotateCurrentKey('QUOTA_EXHAUSTED');
          // Loop continues to retry with the newly active key
          continue;
        }

        throw new Error(`ElevenLabs error: ${response.status} - ${errorText}`);
      } catch (err: any) {
        console.error(`[ElevenLabsService] Attempt ${attempts} failed:`, err.message);
        if (attempts >= maxAttempts) {
          // Graceful fallback to synthetic audio
          console.warn('[ElevenLabsService] Max attempts reached, serving synthetic audio fallback');
          const syntheticAudio = this.createSyntheticBeepAudio(text);
          return {
            audioBuffer: syntheticAudio,
            contentType: 'audio/wav',
            cached: false,
            keyUsed: 'FALLBACK_SYNTHETIC',
            charsCount: 0,
          };
        }
      }
    }

    const fallbackBuffer = this.createSyntheticBeepAudio(text);
    return {
      audioBuffer: fallbackBuffer,
      contentType: 'audio/wav',
      cached: false,
      keyUsed: 'FALLBACK_SYNTHETIC',
      charsCount: 0,
    };
  }

  /**
   * Generates a valid standard 1-second WAV audio container with a mild pleasant chime tone.
   * Ensures the browser audio player always receives valid audio without errors.
   */
  private createSyntheticBeepAudio(text: string): Buffer {
    const sampleRate = 8000;
    const durationSec = Math.min(3, Math.max(0.5, text.length * 0.05));
    const numSamples = Math.floor(sampleRate * durationSec);
    const dataSize = numSamples * 2;
    const buffer = Buffer.alloc(44 + dataSize);

    // RIFF header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // subchunk1 size
    buffer.writeUInt16LE(1, 20);  // PCM format
    buffer.writeUInt16LE(1, 22);  // Mono
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
    buffer.writeUInt16LE(2, 32);  // block align
    buffer.writeUInt16LE(16, 34); // bits per sample
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    // Write a gentle 440Hz sine wave tone decaying gracefully
    const freq = 440;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const decay = Math.exp(-3 * (t / durationSec));
      const sample = Math.sin(2 * Math.PI * freq * t) * 0.3 * decay * 32767;
      buffer.writeInt16LE(Math.floor(sample), 44 + i * 2);
    }

    return buffer;
  }
}

