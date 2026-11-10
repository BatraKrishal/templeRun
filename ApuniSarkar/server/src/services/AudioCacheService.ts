import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUDIO_CACHE_DIR = path.resolve(__dirname, '../../data/audio_cache');

export class AudioCacheService {
  private cacheHits: number = 0;
  private cacheMisses: number = 0;

  constructor() {
    this.ensureCacheDir();
  }

  private ensureCacheDir() {
    if (!fs.existsSync(AUDIO_CACHE_DIR)) {
      fs.mkdirSync(AUDIO_CACHE_DIR, { recursive: true });
    }
  }

  public getHash(text: string, voiceId: string = 'default', language: string = 'hi'): string {
    const normalized = text.trim().toLowerCase();
    return crypto.createHash('sha256').update(`${language}:${voiceId}:${normalized}`).digest('hex');
  }

  public get(text: string, voiceId?: string, language?: string): { hit: boolean; buffer?: Buffer; hash: string } {
    this.ensureCacheDir();
    const hash = this.getHash(text, voiceId, language);
    const filePath = path.join(AUDIO_CACHE_DIR, `${hash}.mp3`);

    if (fs.existsSync(filePath)) {
      try {
        const buffer = fs.readFileSync(filePath);
        this.cacheHits++;
        return { hit: true, buffer, hash };
      } catch (err) {
        console.warn(`[AudioCacheService] Error reading cache file ${hash}:`, err);
      }
    }

    this.cacheMisses++;
    return { hit: false, hash };
  }

  public set(text: string, audioBuffer: Buffer, voiceId?: string, language?: string): string {
    this.ensureCacheDir();
    const hash = this.getHash(text, voiceId, language);
    const filePath = path.join(AUDIO_CACHE_DIR, `${hash}.mp3`);
    try {
      fs.writeFileSync(filePath, audioBuffer);
    } catch (err) {
      console.warn(`[AudioCacheService] Error writing cache file ${hash}:`, err);
    }
    return hash;
  }

  public getStats() {
    this.ensureCacheDir();
    try {
      const files = fs.readdirSync(AUDIO_CACHE_DIR).filter((f) => f.endsWith('.mp3'));
      let totalBytes = 0;
      for (const file of files) {
        const stat = fs.statSync(path.join(AUDIO_CACHE_DIR, file));
        totalBytes += stat.size;
      }
      return {
        cachedAudiosCount: files.length,
        totalSizeBytes: totalBytes,
        totalSizeKB: Math.round(totalBytes / 1024),
        cacheHits: this.cacheHits,
        cacheMisses: this.cacheMisses,
        ratio: this.cacheHits + this.cacheMisses > 0 
          ? ((this.cacheHits / (this.cacheHits + this.cacheMisses)) * 100).toFixed(1) + '%' 
          : '0%',
      };
    } catch (err) {
      return {
        cachedAudiosCount: 0,
        totalSizeBytes: 0,
        totalSizeKB: 0,
        cacheHits: this.cacheHits,
        cacheMisses: this.cacheMisses,
        ratio: '0%',
      };
    }
  }
}

