# VaaniSetu (वाणी-सेतु) for Apuni Sarkar (e-Services Uttarakhand)
## AI-Assisted Multimodal Voice Navigation & Form Filling System
**Target Portal:** https://eservices.uk.gov.in/ (ITDA, Government of Uttarakhand)  
**Engineering Spec & Blueprint:** `.plans/IMP_v1.md`  

---

## 🌟 Overview
**ApuniSarkar** is a pixel-authentic clone of Uttarakhand's official citizen services portal (`eservices.uk.gov.in`), augmented with **VaaniSetu**, an agentic voice copilot and screen narrator. Designed specifically for rural, senior, and low-literacy citizens across the 13 hill and plain districts of Uttarakhand, the system enables users to speak naturally in **Hindi, Hinglish, English, or regional dialect vocabulary (Garhwali/Kumaoni)** to navigate departmental services, check application status, and fill complex e-District forms.

---

## 🚀 Key Features

### 1. Pixel-Authentic Portal UI (1:1 with Real Government Portal)
* **Official Color Tokens:** `bg-navbar` (`#0e3d6e`), subfooter (`#0b1220`), primary Uttarakhand blue (`#135294`), accent saffron (`#f58220`), and custom card palette (`#FFE8D6`, `#DCEEDE`, `#DCE8F7`, `#F8EFD0`).
* **Official Header & Branding:** Ashoka Lion Capital crest, Apuni Sarkar logo, Digital India badge, and sticky navigation bar.
* **Accessibility Top Bar:** Text resizing (`A+`, `A=`, `A-`), English/हिन्दी switcher, High Contrast Mode, and **"Saral Mode" (सरल मोड)** for senior citizens.
* **4 Core Action Cards:** Track Application, Download Certificates, Verify Certificate, and Citizen Survey.
* **Comprehensive Service Catalog:** Categorized directory of 1,159 services across 20+ departments (Revenue, Panchayati Raj, Energy, Social Welfare, etc.).
* **4 Live Vertical Slice Forms:**
  - *Income Certificate (Aay Praman Patra)*
  - *Permanent Residence / Domicile Certificate (Niwas Praman Patra)*
  - *Hill Area Certificate (Parvatiya Praman Patra)*
  - *Copy of Pariwar Register (Parivar Register Nakal)*

### 2. Multi-Account ElevenLabs API Key Rotation Manager
* **Capacity Aggregation:** Combines ~20 free-tier accounts (~15 mins each = ~300 minutes / 200,000 characters total).
* **Strict Non-RAM Persistence:** Quota metrics, character counters, and key statuses are written directly to disk at `server/data/keys_pool_state.json` via atomic temporary file renaming. Survives process crashes, server restarts, and updates.
* **Proactive & Reactive Failover:** Auto-rotates to the next key when character usage reaches $\ge 9,500$ chars or upon receiving an HTTP 429 quota exhaustion code.
* **Automated SMTP Email Alerting:** Automatically dispatches email notifications via Nodemailer whenever a key reaches quota exhaustion, logging to `server/data/alerts.log`.
* **Disk Audio Hash Cache:** Pre-hashes static phrases (`SHA-256(text + voiceId + lang)`) to `server/data/audio_cache/<hash>.mp3`, consuming **0 API quota** on repeat calls.
* **Fail-Safe Web Speech API Fallback:** Seamlessly shifts to browser-native `speechSynthesis` if cloud credentials run out.

### 3. Voice Navigation & Element Narrator ("Vachak" / वाचक)
* **Site-Wide Intent Router:** Citizen voice commands work globally across all pages (*"आय प्रमाण पत्र खोलो"*, *"हेल्पलाइन नंबर क्या है"*, *"आवेदन ट्रैक करें UK-REV-2026-9812"*).
* **Language Mirroring:** Responds in polite spoken Hindi or English depending on user input.
* **Conversational Form Filling:** Sequential slot-filling agent scrolls into view, applies a glowing halo, auto-types speech into inputs, and marks fields with `[VOICE_AI]`.
* **Citizen Spoken Summary Read-Back:** Mandatory audio confirmation modal before official application submission.

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env`)
Edit `ApuniSarkar/.env`:
```env
PORT=5000

# Provide your ElevenLabs API keys (format: "key1:email1,key2:email2,...")
ELEVENLABS_KEYS="sk_live_key1:user1@gmail.com,sk_live_key2:user2@gmail.com,..."

# Automated Quota Email Alerts
ALERT_RECIPIENT_EMAIL="your_email@gmail.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_gmail_app_password"
```

### 3. Run Development Servers
```bash
# Starts both Express backend (port 5000) and Vite frontend (port 5173) concurrently:
npm run dev
```

* **Frontend Portal:** http://localhost:5173
* **Backend API & Telemetry:** http://localhost:5000
* **Key Pool Evaluator Dashboard:** http://localhost:5173/admin/pool

---

## 🧪 Rigorous Automated Verification (11/11 Passed)

To run the automated end-to-end verification suite:
```bash
npm test
# or
npm run verify
```

### Verification Checks:
1. `GET /api/health` returns status online.
2. `GET /api/catalog` returns full Uttarakhand services catalog.
3. Natural Language Hindi intent routing (*"आय प्रमाण पत्र"* $\to$ `/services/revenue/income-certificate`).
4. Domicile navigation routing (*"स्थायी निवास"* $\to$ `/services/revenue/domicile-certificate`).
5. Conversational Hindi number normalization (*"साठ हज़ार"* $\to$ `60000`).
6. Application Tracking ID extraction (`UK-REV-2026-9812`).
7. ElevenLabs TTS speech synthesis.
8. Disk audio hash caching verification (`Key-Used: CACHE`, 0 quota used).
9. Key rotation failover simulation (`ACTIVE` $\to$ `EXHAUSTED`).
10. Non-RAM disk persistence verification (`keys_pool_state.json`).
11. Email notification dispatching and logging (`alerts.log`).

