# Apuni Sarkar (VaaniSetu) - Deployment Guide

This guide explains how to deploy **Apuni Sarkar (VaaniSetu)** with its **8–9 ElevenLabs API Key Pool**, automated failover, and voice engine to **Render.com** (Recommended) or via **Docker / Railway**.

---

## Why Render.com is Recommended

1. **Persistent Node.js Runtime**: Keeps `keys_pool_state.json` intact, eliminating container cold starts that cause speech delay.
2. **Unified Deployment**: The Express server automatically serves the built React Vite frontend (`/dist`) and API endpoints on the same port—**no CORS issues or dual-server configuration**.
3. **Automatic HTTPS / SSL**: Required by Google Chrome and Microsoft Edge to allow microphone access (`webkitSpeechRecognition`).

---

## Method 1: Deploying to Render.com via Blueprint (One-Click)

The repository includes a ready-to-use [`render.yaml`](file:///c:/Users/Gues/Desktop/templeRun/render.yaml) blueprint.

### Step-by-Step Instructions:

1. **Push your code to GitHub**:
   Ensure your latest code is pushed to your GitHub repository:
   ```bash
   git push origin main
   ```

2. **Sign in to Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com/) and log in with your GitHub account.

3. **Create a New Blueprint Instance**:
   - Click **New +** in the top right.
   - Select **Blueprint**.
   - Connect your GitHub repository (`templeRun`).
   - Render will detect [`render.yaml`](file:///c:/Users/Gues/Desktop/templeRun/render.yaml) automatically.

4. **Set Your Environment Variables**:
   In the Render dashboard, supply your 8–9 ElevenLabs API keys:
   - `ELEVENLABS_API_KEY_1`: `sk_...`
   - `ELEVENLABS_EMAIL_1`: `account1@gmail.com`
   - `ELEVENLABS_API_KEY_2`: `sk_...`
   - `ELEVENLABS_EMAIL_2`: `account2@gmail.com`
   - *(Repeat for Keys 3 through 9)*
   - `GEMINI_API_KEY`: *(Optional, for natural language intent routing)*

5. **Click "Apply" / "Deploy"**:
   - Render will run `npm install && npm run build:client` and launch `npx tsx server/src/index.ts`.
   - Your live URL will be created: `https://apuni-sarkar-vaanisetu.onrender.com`.

---

## Method 2: Manual Web Service Setup on Render.com

If you prefer to configure it manually without Blueprint:

1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the following fields:
   - **Name**: `apuni-sarkar-vaanisetu`
   - **Region**: `Singapore` (or Frankfurt)
   - **Root Directory**: `ApuniSarkar`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build:client`
   - **Start Command**: `npx tsx server/src/index.ts`
   - **Plan**: `Free`
4. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `ELEVENLABS_API_KEY_1`..`9` and `ELEVENLABS_EMAIL_1`..`9`
5. Click **Create Web Service**.

---

## Method 3: Deploying with Docker (Railway / Koyeb / Cloud Run)

The repository includes a production multi-stage [`Dockerfile`](file:///c:/Users/Gues/Desktop/templeRun/ApuniSarkar/Dockerfile).

To test locally or deploy via Docker:

```bash
# Build the image inside ApuniSarkar directory
cd ApuniSarkar
docker build -t apuni-sarkar:latest .

# Run container on port 5000
docker run -p 5000:5000 \
  -e ELEVENLABS_API_KEY_1="sk_your_key_here" \
  -e ELEVENLABS_EMAIL_1="account1@gmail.com" \
  apuni-sarkar:latest
```

---

## Post-Deployment Checklist

After deployment finishes:
1. Open the live `https://...` URL in Google Chrome.
2. Click the **Microphone** button and click **Allow** on the browser permission prompt.
3. Speak: *"I want to go to registration in class D"* or *"आय प्रमाण पत्र खोलो"* to test navigation.
4. Visit `https://your-app.onrender.com/admin/keys` to view the live 8–9 Key Pool Telemetry dashboard and test key rotation.

