# IMP_v1: VaaniSetu (वाणी-सेतु) for Apuni Sarkar (e-Services Uttarakhand)
## Master Implementation Blueprint & Architecture Specification
**Platform Target:** https://eservices.uk.gov.in/ (ITDA, Government of Uttarakhand)  
**Reference DOM:** Extracted in `.refrences/` (homepage, sitemap, services list, faqs, about, etc.)  
**Target Code Directory:** `ApuniSarkar/`  
**Version:** 1.2.0 (Grounded Model Comprehension & Regional Dialect Engine)  
**Date:** November 2026  

---

## 1. Executive Summary & Core Requirements

The objective is to engineer a pixel-authentic clone of Uttarakhand's official citizen services portal **Apuni Sarkar (`eservices.uk.gov.in`)**, augmented with an **AI Voice Copilot & Accessibility Engine ("VaaniSetu")**.

### Key Architectural Pillars
1. **Pixel-Authentic Portal Clone (1:1 with Real DOM in `.refrences/`):**
   - Official Uttarakhand color tokens: `bg-navbar` (`#0e3d6e`), subfooter (`#0b1220`), primary Uttarakhand blue (`#135294`), accent saffron (`#f58220`), and custom card palette (`#FFE8D6`, `#DCEEDE`, `#DCE8F7`, `#F8EFD0`).
   - Exact accessibility bar (`A+`, `A=`, `A-`, language switcher, screen reader).
   - Exact header (Ashoka Lion Capital, Apuni Sarkar emblem, Digital India badge).
   - Global coverage: Homepage, Service Catalog (1100+ services), Department Grids, FAQs, About, Contact Us, Dashboard, Sitemap, Application Tracking, and Certificate Verification.
2. **How the AI Model Understands the Website & Form Data:**
   - **Static Knowledge Graph:** Extracted from `.refrences/services_list.html` and `sitemap.html`, indexing 20+ departments, 1100+ services, fees, RTS SLA timelines, and required documents.
   - **Live DOM Observer:** The voice engine inspects active routes, visible form fields (`id`, `name`, `type`, `label`, `placeholder`, `aria-label`), and real-time validation states so the agent always knows what is on screen.
   - **Two-Way Normalization Pipeline:** Allows citizens to speak in everyday conversational Hindi / Garhwali / Kumaoni / Hinglish, while the model automatically normalizes, formats, and transliterates the values into the formal English/Hindi required by official government form inputs.
3. **Global Site-Wide Voice Navigation & Narrator:**
   - Works across **every single page** of the portal (not just forms).
   - **Language Mirroring:** If the user speaks in Hindi/Hinglish, the assistant replies in Hindi; if the user speaks in English, it replies in English.
   - **Spoken Element Narrator ("Vachak" / वाचक):** Reads out links, buttons, service cards, and input requirements upon mouse hover or keyboard focus.
4. **Resilient ElevenLabs Key Pool Manager:**
   - Multi-account dynamic key rotation supporting ~20 accounts (~300 minutes / 200,000 characters total) configured via `.env`.
   - **Non-RAM Persistence:** Quota metrics, character counts, and key states are written directly to `data/keys_pool_state.json` with atomic file flushing to survive crashes, restarts, and updates.
   - **Automated SMTP Email Alerting:** Sends real-time email alerts via Nodemailer whenever an API key reaches its quota limit ($\ge 9,500$ chars) and switches to the next account.
   - **Audio Caching Layer:** Disk-based SHA-256 caching of common UI prompts to preserve quota.

---

## 2. System Architecture

```mermaid
flowchart TD
    subgraph Client["ApuniSarkar Frontend (React 18 + Vite + Tailwind CSS)"]
        UI["Apuni Sarkar UI Clone\n(Accessibility Bar, Header, Service Catalog, Forms)"]
        DOMObserver["Live DOM & Route Observer\n(Extracts active inputs, IDs, labels, errors)"]
        VoiceDock["VaaniSetu Global Voice Copilot\n(Floating Mic Dock, Live Audio Waveform)"]
        Narrator["Spoken Element Narrator ('Vachak')\n(Hover & Focus Audio Reader)"]
        FormFiller["Voice Slot-Filling & Normalizer\n(DOM Highlighting, Auto-fill, [VOICE_AI] Badge)"]
        WebSpeechFallback["Web Speech API Fallback\n(Zero-quota Fail-safe)"]
    end

    subgraph Server["ApuniSarkar Backend Proxy (Node.js + Express)"]
        API["/api/voice/speak & /api/voice/intent"]
        KnowledgeGraph["Static Service Knowledge Graph\n(uk_services_catalog.json - 1100+ services)"]
        SlotExtractor["Entity Normalizer & Transliteration\n(Conversational Dialect → Official Schema)"]
        AudioCache["Disk Audio Cache\n(data/audio_cache/<hash>.mp3)"]
        KeyPoolMgr["KeyPoolManager\n(Health Check, Dynamic Rotation, Quota Tracker)"]
        EmailNotifier["Email Alert Worker\n(Nodemailer SMTP Dispatcher)"]
    end

    subgraph Storage["Durable Persistence Layer (Survives Crashes & Restarts)"]
        DiskDB[("Persistent Quota Store\n(data/keys_pool_state.json)")]
    end

    subgraph External["External Cloud & Services"]
        ElevenLabs["ElevenLabs Text-to-Speech API\n(Multilingual v2 / Flash v2.5)"]
        SMTPServer["Configured SMTP Server\n(Alerts on Quota Limit)"]
    end

    %% Interactions
    DOMObserver -->|Active Screen State| VoiceDock
    VoiceDock -->|Spoken Utterance + DOM Context| API
    Narrator -->|Hover/Focus Text| API
    API -->|Query Catalog| KnowledgeGraph
    API -->|Extract & Transliterate| SlotExtractor
    SlotExtractor -->|Normalized Values| FormFiller
    FormFiller -->|Physical DOM Mutation| UI
    
    API -->|1. Check Hash Cache| AudioCache
    AudioCache -->|Cache Hit (0 Quota)| API
    AudioCache -->|Cache Miss| KeyPoolMgr
    
    KeyPoolMgr -->|2. Read Active Key & Quota| DiskDB
    KeyPoolMgr -->|3. Invoke TTS with Key[i]| ElevenLabs
    ElevenLabs -->|Response Audio Stream| API
    
    KeyPoolMgr -->|4. Atomically Write Usage| DiskDB
    KeyPoolMgr -->|5. Quota >= 9,500 chars| EmailNotifier
    EmailNotifier -->|Send Alert Mail| SMTPServer
    KeyPoolMgr -->|6. Auto-Switch to Key[i+1]| DiskDB
    
    API -->|Audio Stream| VoiceDock
    ElevenLabs -.->|On Cloud Outage / Exhaustion| WebSpeechFallback
```

---

## 3. How the Model Understands the Website & Form Data

The AI assistant connects to the portal via a **3-tier grounding architecture**:

### Tier 1: Pre-computed Service Knowledge Graph (Semantic Index)
* Extracted directly from `.refrences/services_list.html` and `sitemap.html`:
  * All 1,159 services indexed with: Department Name, Service Title, Category (Service / Scheme), CSC/EDC Fee, Mandated SLA, and Eligibility requirements.
  * When a citizen speaks colloquially (*"मुझे राशन कार्ड में नाम जुड़वाना है"* or *"खेती की जमीन की नकल चाहिए"*), the intent engine matches against the Knowledge Graph and finds the exact departmental service:
    - *"खेती की जमीन की नकल"* $\to$ Revenue Department $\to$ *Khatauni / Parivar Register Nakal*.
    - *"बिजली का मीटर खराब है"* $\to$ Department of Energy (UPCL) $\to$ *Problem in Grid / Transformer*.

### Tier 2: Real-Time DOM & Screen Observer (`DOMObserver`)
* Whenever the user navigates to any page or opens a form:
  * The `DOMObserver` automatically scans the visible DOM:
    ```json
    {
      "route": "/services/revenue/income-certificate",
      "pageTitle": "Application for Income Certificate (आय प्रमाण पत्र)",
      "department": "Revenue Department",
      "activeStep": 1,
      "fields": [
        { "id": "applicant_name", "label": "Applicant Name (आवेदक का नाम)", "type": "text", "required": true, "currentValue": "" },
        { "id": "father_husband_name", "label": "Father / Husband Name (पिता / पति का नाम)", "type": "text", "required": true, "currentValue": "" },
        { "id": "annual_income", "label": "Total Family Annual Income (वार्षिक आय ₹)", "type": "number", "required": true, "currentValue": "" },
        { "id": "district", "label": "District (ज़िला)", "type": "select", "options": ["Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Almora", "..."], "currentValue": "" }
      ]
    }
    ```
  * This live DOM context is sent with the citizen's speech so the AI knows precisely:
    1. Which field is currently focused or missing.
    2. What valid options exist in dropdowns (e.g. Tehsil, District, Sub-category).
    3. What validation errors have fired.

### Tier 3: Dialect-to-Formal Normalization & Transliteration Pipeline
* **Spoken Input:** A citizen speaking naturally in Hindi, Garhwali, or Hinglish:
  * *"मेरा नाम कुलदीप सिंह नेगी है, पिता जी का नाम खुशाल सिंह, और साल की कमाई साठ हज़ार है"*
* **Entity Extraction & Transliteration:**
  * The model extracts slot values and converts them to formal government form standards:
    - `applicant_name`: `"Kuldeep Singh Negi"` (English alphabet transliteration as required by government databases).
    - `father_husband_name`: `"Khushal Singh"`.
    - `annual_income`: `60000` (numeric value).
    - `currency`: `"INR"`.
* **Spoken Response (Language Mirroring):**
  * The voice assistant speaks back in polite, respectful Hindi:
    - *"धन्यवाद कुलदीप जी, आपका नाम, पिता का नाम और ₹60,000 वार्षिक आय दर्ज कर दी गई है। कृपया अपना ज़िला और तहसील बताएं।"*

---

## 4. Multi-Account ElevenLabs Key Rotation & Email Alerting

### 4.1 Environment Configuration (`.env`)
The API keys are configured via standard `.env` variables:
```env
# ElevenLabs API Keys Pool (20 Accounts)
ELEVENLABS_KEYS="sk_live_key1:user1@domain.com,sk_live_key2:user2@domain.com,sk_live_key3:user3@domain.com,..."

# Alert Email Recipient
ALERT_RECIPIENT_EMAIL="admin@hackathon.org"

# SMTP Alert Dispatcher Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="alerts@hackathon.org"
SMTP_PASS="app_specific_password_here"

# Default Voice Models
ELEVENLABS_MODEL_ID="eleven_multilingual_v2"
ELEVENLABS_VOICE_ID="21m00Tcm4TlvDq8ikWAM"
```

### 4.2 Durable Non-RAM Persistence (`keys_pool_state.json`)
* Stored in `ApuniSarkar/server/data/keys_pool_state.json`.
* Every character used is incremented and flushed to disk using atomic temporary file renaming (`keys_pool_state.json.tmp` $\to$ `keys_pool_state.json`), ensuring that if the process terminates, crashes, or is redeployed, usage numbers are never lost.
* Proactive rotation threshold: $\ge 9,500$ characters consumed triggers automatic failover to the next key.

### 4.3 Automated SMTP Email Alert Dispatcher
* When an account breaches 9,500 characters or encounters a 429 quota exhaustion:
  1. The key is marked as `EXHAUSTED` in the persistent JSON store.
  2. Switchover to key `i + 1` happens instantaneously.
  3. `EmailAlertService` sends an email:
     - **Subject:** `[CRITICAL ALERT] ApuniSarkar ElevenLabs Key #${index} Quota Reached`
     - **Body:**
       - Account Email: `userX@domain.com`
       - Total Characters Used: `9,840 / 10,000`
       - Switchover Timestamp: `2026-11-10T11:45:00Z`
       - Next Active Account: `userY@domain.com`
       - Remaining Healthy Keys: `17 / 20`
  4. Flag `alertSent: true` is persisted so no duplicate emails are sent for the same key.

---

## 5. Site-Wide Global Voice Navigation & Element Narrator

### 5.1 Global Intent Routing
The voice engine is always active on every page:
* *"About us page खोलो"* $\to$ Navigates to `/about`
* *"What's new me kya hai?"* $\to$ Navigates to `/whats-new`
* *"Helpline number kya hai?"* $\to$ Highlights 1905 card and reads: *"उत्तराखंड टोल फ्री हेल्पलाइन नंबर 1905 है।"*
* *"Track status UK-REV-2026-9812"* $\to$ Navigates to `/user/public/application/status/` and inputs the tracking ID.
* *"Sitemap dikhao"* $\to$ Navigates to `/sitemap`.

### 5.2 Spoken Element Narrator ("Vachak" / वाचक)
* When enabled via the header toggle:
  - **Mouse Hover:** Hovering over any card, button, or link speaks a clear 1-sentence description in the active language.
  - **Keyboard Tab Focus:** Tabbing through the site speaks the element name and keyboard command (e.g. *"लास्ट सर्विसेज बटन - दबाने के लिए एंटर करें"*).
  - **Field Explainer:** Focusing an input explains what document is needed to find the number (e.g. *"वार्षिक आय दर्ज करें - यह आपके परिवार रजिस्टर या पटवारी रिपोर्ट में लिखी होती है"*).

---

## 6. Directory Structure (`ApuniSarkar/`)

```
ApuniSarkar/
├── .env.example                          # Environment template (Email SMTP, Keys list)
├── package.json                          # Monorepo / Root scripts
├── server/                               # Node.js Express Backend Service
│   ├── package.json
│   ├── src/
│   │   ├── index.ts                      # Server bootstrap & API routing
│   │   ├── services/
│   │   │   ├── KeyPoolManager.ts         # Persistent rotation & quota tracker
│   │   │   ├── ElevenLabsService.ts      # ElevenLabs TTS & STT proxy
│   │   │   ├── AudioCacheService.ts      # Disk-based SHA-256 audio cache
│   │   │   ├── EmailAlertService.ts      # Nodemailer SMTP alert dispatcher
│   │   │   ├── IntentRouterService.ts    # Intent classification for voice commands
│   │   │   └── SlotNormalizerService.ts  # Dialect-to-formal transliteration engine
│   │   └── routes/
│   │       ├── voiceRoutes.ts            # /api/voice/speak, /api/voice/intent
│   │       └── poolRoutes.ts             # /api/keys/status, /api/keys/refresh
│   └── data/
│       ├── keys_pool_state.json          # PERSISTENT QUOTA STORAGE
│       ├── uk_services_catalog.json      # Pre-indexed 1159 services & departments
│       └── audio_cache/                  # Cached MP3 audio files
└── client/                               # React 18 + Vite Frontend Application
    ├── package.json
    ├── index.html
    ├── tailwind.config.js
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx                       # Main router & layout
    │   ├── assets/                       # Government crests & logos
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── AccessibilityBar.tsx  # Font sizing, contrast, language
    │   │   │   ├── OfficialHeader.tsx    # Ashoka Lion crest, Apuni Sarkar logo
    │   │   │   └── OfficialFooter.tsx    # Govt links, RTS Act, 1905 Helpline
    │   │   ├── voice/
    │   │   │   ├── VoiceCopilotDock.tsx  # Floating mic dock & audio visualizer
    │   │   │   ├── NarratorToggle.tsx    # Spoken Narrator ("Vachak") control
    │   │   │   └── KeyPoolStatusBadge.tsx# Telemetry showing remaining audio mins
    │   │   ├── forms/
    │   │   │   ├── FormFieldWithVoice.tsx# DOM wrapper with voice highlight & badge
    │   │   │   └── CitizenSignOffModal.tsx# Summary audio read-back before submission
    │   │   └── certificates/
    │   │       └── CertificateViewer.tsx # QR-coded downloadable certificate
    │   ├── pages/
    │   │   ├── HomePage.tsx              # Authentic portal clone landing page
    │   │   ├── AboutPage.tsx             # About Apuni Sarkar & ITDA
    │   │   ├── ServicesDirectoryPage.tsx # List of all 1100+ services by department
    │   │   ├── FAQsPage.tsx              # Portal FAQs
    │   │   ├── WhatsNewPage.tsx          # Government updates
    │   │   ├── ContactUsPage.tsx         # ITDA Dehradun contact & helpline
    │   │   ├── DashboardPage.tsx         # Real-time state statistics
    │   │   ├── SitemapPage.tsx           # Complete portal sitemap
    │   │   ├── TrackApplicationPage.tsx  # Real-time status tracker
    │   │   ├── VerifyCertificatePage.tsx # Document validation portal
    │   │   ├── forms/
    │   │   │   ├── IncomeCertificatePage.tsx
    │   │   │   ├── DomicileCertificatePage.tsx
    │   │   │   ├── HillAreaCertificatePage.tsx
    │   │   │   └── ParivarRegisterPage.tsx
    │   │   └── AdminPoolDashboardPage.tsx# Evaluator view of all 20 API keys & quota
    │   ├── context/
    │   │   ├── VoiceContext.tsx          # Global voice state & active audio player
    │   │   └── AccessibilityContext.tsx  # High-contrast, Saral Mode, font scale
    │   └── services/
    │       ├── voiceClient.ts            # Frontend client for backend voice endpoints
    │       ├── domObserver.ts            # Real-time DOM context extractor
    │       └── browserSpeechFallback.ts  # Web Speech API safety net
```

---

## 7. Phased Implementation Roadmap

1. **Phase 1: Project Scaffolding:** Create `ApuniSarkar/` with `client` (React + TypeScript + Tailwind) and `server` (Express + TypeScript).
2. **Phase 2: Authentic Portal UI Clone:** Build pixel-accurate top bar, header, hero, search, quick cards, and service directories using CSS and DOM tokens extracted in `.refrences/`.
3. **Phase 3: Interactive Government Forms:** Build Income, Domicile, Hill Area, and Parivar Register forms with realistic validations and RTS SLA timers.
4. **Phase 4: Persistent Key Pool Manager:** Implement `KeyPoolManager` with non-RAM JSON persistence (`keys_pool_state.json`) and failover logic.
5. **Phase 5: Audio Cache & Email Alerting:** Implement disk-based audio hashing and Nodemailer SMTP notifications.
6. **Phase 6: Voice Copilot & Narrator Engine:** Connect microphone input, intent routing, element hover reader, and voice slot-filling.
7. **Phase 7: Citizen Sign-Off & Evaluator Dashboard:** Audio summary playback and live telemetry dashboard showing key pool health.
8. **Phase 8: 1:1 Subpage Fidelity & In-Browser Verification (Complete):**
   - Extracted live DOM structures from `https://eservices.uk.gov.in/` using Chrome MCP.
   - Built pixel-perfect replicas of `List of Services`, `Important GOs`, `Public Dashboard`, `Know Application Status`, `View Certificate`, `Download Certificates`, `Login & SSO`, `Sitemap`, `About`, `FAQs`, `What's New`, and `Contact Us`.
   - Verified via in-browser DevTools viewport captures and passed 11/11 end-to-end backend tests.

---
*End of Blueprint IMP_v1 (Version 1.3.0).*
