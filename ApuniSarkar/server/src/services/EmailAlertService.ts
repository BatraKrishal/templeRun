import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { KeyRecord } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ALERTS_LOG_PATH = path.resolve(__dirname, '../../data/alerts.log');

export class EmailAlertService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;
  private recipientEmail: string;

  constructor() {
    this.recipientEmail = process.env.ALERT_RECIPIENT_EMAIL || 'admin@apunisarkar-dev.gov.in';
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = process.env.SMTP_SECURE === 'true';

    if (host && user && pass && pass !== 'app_specific_password_here') {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
        });
        this.isConfigured = true;
        console.log(`[EmailAlertService] SMTP transporter configured for ${host}:${port}`);
      } catch (err) {
        console.warn('[EmailAlertService] Failed to initialize SMTP transporter:', err);
        this.isConfigured = false;
      }
    } else {
      console.log('[EmailAlertService] Real SMTP credentials not provided. Using persistent file logger fallback.');
      this.isConfigured = false;
    }
  }

  public async sendQuotaExhaustionAlert(
    exhaustedKey: KeyRecord,
    nextKey: KeyRecord | null,
    poolHealth: { activeCount: number; totalCount: number }
  ): Promise<{ success: boolean; mode: 'smtp' | 'log'; message: string }> {
    const timestamp = new Date().toISOString();
    const subject = `[CRITICAL ALERT] ApuniSarkar ElevenLabs Key Quota Reached (${exhaustedKey.label})`;
    
    const textBody = `
=====================================================
UTTARAKHAND APUNI SARKAR - ELEVENLABS QUOTA ALERT
=====================================================
Timestamp: ${timestamp}
Event: ElevenLabs API Key Quota Exhaustion / Rotation

Exhausted Account:
- Key ID: ${exhaustedKey.id} (${exhaustedKey.label})
- Associated Email: ${exhaustedKey.accountEmail}
- Characters Consumed: ${exhaustedKey.charactersUsed} / ${exhaustedKey.characterLimit}
- Audio Playback Estimated: ${exhaustedKey.minutesEstimated.toFixed(1)} mins
- Status: EXHAUSTED

Failover Status:
${nextKey ? `- Next Active Key: ${nextKey.id} (${nextKey.accountEmail})\n- Characters Remaining: ${nextKey.characterLimit - nextKey.charactersUsed}` : '- WARNING: NO HEALTHY KEYS REMAINING IN POOL! Falling back to Web Speech API.'}

Pool Health:
- Active Healthy Accounts: ${poolHealth.activeCount} / ${poolHealth.totalCount}

Action Recommended:
Please log in to ElevenLabs for account "${exhaustedKey.accountEmail}" to verify quota or replace the key in ApuniSarkar/.env.
=====================================================
`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0e3d6e; color: #ffffff; padding: 18px 24px;">
          <h2 style="margin: 0; font-size: 20px;">Apuni Sarkar (e-Services Uttarakhand)</h2>
          <p style="margin: 4px 0 0; font-size: 13px; color: #cbd5e1;">VaaniSetu Voice Engine - Automated Quota Alert</p>
        </div>
        <div style="padding: 24px; background-color: #ffffff;">
          <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
            <strong style="color: #991b1b; font-size: 15px;">⚠️ ElevenLabs API Key Quota Limit Reached</strong>
            <p style="margin: 4px 0 0; color: #7f1d1d; font-size: 13px;">The active voice synthesis key has reached its 9,500+ character threshold and has been rotated automatically.</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; color: #64748b; font-weight: bold; width: 40%;">Exhausted Account:</td>
              <td style="padding: 8px 0; color: #0f172a;">${exhaustedKey.accountEmail} (${exhaustedKey.label})</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Characters Used:</td>
              <td style="padding: 8px 0; color: #b91c1c; font-weight: bold;">${exhaustedKey.charactersUsed.toLocaleString()} / ${exhaustedKey.characterLimit.toLocaleString()}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Estimated Audio Time:</td>
              <td style="padding: 8px 0; color: #0f172a;">${exhaustedKey.minutesEstimated.toFixed(1)} minutes</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">New Active Account:</td>
              <td style="padding: 8px 0; color: #15803d; font-weight: bold;">${nextKey ? `${nextKey.accountEmail} (${nextKey.label})` : 'NONE (Using Web Speech Fallback)'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Pool Health:</td>
              <td style="padding: 8px 0; color: #0f172a;">${poolHealth.activeCount} of ${poolHealth.totalCount} accounts active</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Timestamp:</td>
              <td style="padding: 8px 0; color: #0f172a;">${timestamp}</td>
            </tr>
          </table>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-size: 13px; color: #334155;">
            <strong>System Safeguard Status:</strong> Persistent disk state updated in <code>keys_pool_state.json</code>. Zero user downtime occurred during key rotation.
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 12px 24px; font-size: 12px; color: #64748b; text-align: center;">
          ITDA Uttarakhand &bull; VaaniSetu Hackathon Engine &bull; Confidential Alert
        </div>
      </div>
    `;

    // Always log to persistent disk alerts file
    try {
      fs.mkdirSync(path.dirname(ALERTS_LOG_PATH), { recursive: true });
      fs.appendFileSync(ALERTS_LOG_PATH, `[${timestamp}] ${subject}\n${textBody}\n\n`, 'utf8');
      console.log(`[EmailAlertService] Alert logged to disk at: ${ALERTS_LOG_PATH}`);
    } catch (logErr) {
      console.error('[EmailAlertService] Failed to write to alerts.log:', logErr);
    }

    // If SMTP is active, dispatch via email
    if (this.isConfigured && this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"ApuniSarkar Alerts" <${process.env.SMTP_USER}>`,
          to: this.recipientEmail,
          subject,
          text: textBody,
          html: htmlBody,
        });
        console.log(`[EmailAlertService] Alert email successfully delivered to ${this.recipientEmail}`);
        return { success: true, mode: 'smtp', message: `Email delivered to ${this.recipientEmail}` };
      } catch (err: any) {
        console.error('[EmailAlertService] SMTP sendMail failed:', err.message);
        return { success: true, mode: 'log', message: `SMTP failed (${err.message}); logged to alerts.log` };
      }
    }

    return { success: true, mode: 'log', message: `Alert logged to ${ALERTS_LOG_PATH} (SMTP not configured)` };
  }
}

