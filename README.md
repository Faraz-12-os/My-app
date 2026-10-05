# TempShield — Temporary Email & Virtual SMS Mobile & Web Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Capacitor](https://img.shields.io/badge/Capacitor-Mobile_Ready-119EFF.svg)](https://capacitorjs.com/)
[![PWA](https://img.shields.io/badge/PWA-Compliant-5A0FC8.svg)](https://web.dev/progressive-web-apps/)

**TempShield** is an enterprise-grade platform for self-destructing disposable email addresses and carrier virtual phone numbers for instant SMS / OTP verification. It features an integrated wallet system, transaction ledger, customer support ticketing, multi-gateway provider architecture, and a full administrative control panel.

Built as a cross-platform progressive mobile web application with **Capacitor** integration for building native **Android (APK / AAB)** and **iOS (IPA / App Store)** apps.

---

## Features

- **Disposable Temporary Email**:
  - Instant random address generation across selectable clean domains (`@tempinbox.net`, `@dispostar.io`, `@securemail.dev`, `@quickdrop.co`).
  - Custom prefix/handle support.
  - Live expiration timer countdown with single-click `+60m` retention extension.
  - Inbound email reader with rich HTML, plain text, and header inspection.
  - Automatic 4, 6, and 8-digit OTP extraction with 1-click clipboard copy.
  - Instant simulated test message triggers (GitHub, Netflix, OpenAI) for zero-latency testing.

- **Virtual Phone Numbers for SMS**:
  - 12+ national carrier line pools (United States, United Kingdom, Canada, Germany, France, Netherlands, Sweden, Spain, Poland, Brazil, India, Australia).
  - Target service selector (WhatsApp, Telegram, Google/Gmail, OpenAI/ChatGPT, Uber, Discord, Amazon, TikTok, Twitter/X, Steam).
  - Active line reservation with remaining rental countdown timer.
  - Auto-polling SMS feed with highlighted OTP extraction.
  - Built-in instant test OTP trigger for testing verification loops.

- **Credit Wallet & Payment Architecture**:
  - Pay-as-you-go credit model ($1 = 10 cr, $5 = 60 cr, $10 = 140 cr, $25 = 400 cr).
  - Secure checkout simulation (Stripe / Credit Card, PayPal, Crypto USDT) without storing card data.
  - Real-time immutable transaction ledger with credit/debit filters and balance-after tracking.

- **Mobile First & Native App Ready**:
  - Full PWA compliance with offline service worker, web app manifest, and install prompts.
  - Native mobile ergonomics: fixed bottom tab bar, compact top app bar, bottom action drawer, and safe-area insets (`pt-safe`, `pb-safe`).
  - Animated brand boot splash screen.
  - Capacitor integration for compiling native Android APK/AAB and iOS Xcode projects.

- **Admin Control Desk**:
  - Live analytics (active inboxes, rented numbers, revenue, SMS volume, open tickets).
  - User directory with 1-click suspension toggle and manual credit adjustments with audit notes.
  - Package pricing and credit tier manager.
  - Telecom gateway manager (SMS-Activate, 5SIM, Twilio, In-House Carrier Relays) with server-side API key encryption.
  - Country routes toggle and line cost configuration.
  - Support ticket resolution and immutable system audit logs.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Backend**: Node.js, Express, TypeScript (tsx runtime).
- **Mobile & PWA**: Capacitor (`@capacitor/core`, `@capacitor/cli`), `vite-plugin-pwa`, Workbox.
- **Security**: JWT authentication, bcryptjs password hashing, sliding rate-limiting middleware.
- **Data Persistence**: Relational schema store with disk persistence, ACID write serialization, and automatic default seeding.

---

## Getting Started

### 1. Prerequisites
- Node.js 20+ installed
- npm or bun

### 2. Clone and Install
```bash
# Clone the repository
git clone https://github.com/your-username/tempshield.git

# Navigate to the project folder
cd tempshield

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy the sample environment file:
```bash
cp .env.example .env
```
Open `.env` and set your preferred configuration values. (For local development, the defaults will run out of the box with zero external dependencies).

### 4. Run the Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000` with Vite middleware mounted automatically.

---

## Default Test Accounts

When the application boots for the first time, the database initializes with two pre-configured accounts:

| Role | Email | Password | Initial Balance |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@tempshield.io` | `Admin123!` | 1,000 Credits |
| **Demo User** | `demo@tempshield.io` | `Demo123!` | 100 Credits |

*New registrations automatically receive 15 free verification credits.*

---

## Mobile Builds (Android & iOS)

### Building Android APK / AAB
```bash
# 1. Install Android platform
npm install @capacitor/android

# 2. Add Android native project
npm run cap:add:android

# 3. Build production web bundle and sync native assets
npm run build:mobile

# 4. Open in Android Studio
npm run cap:open:android
```
Inside Android Studio, select **Build** → **Generate Signed Bundle / APK** to create your `.apk` or `.aab`.

### Building iOS (Xcode / TestFlight)
*Requires macOS with Xcode installed.*
```bash
# 1. Install iOS platform
npm install @capacitor/ios

# 2. Add iOS native project
npm run cap:add:ios

# 3. Build and sync
npm run build:mobile

# 4. Open in Xcode
npm run cap:open:ios
```
Inside Xcode, select your Signing Team and choose **Product** → **Archive**.

---

## Production Deployment

### Build the Web & Backend Bundle
```bash
npm run build
```

### Start Production Server
```bash
npm start
```
The application will serve static assets from `dist/` and handle all REST API endpoints under `/api/*`.

---

## Security & Sensitive Information
- Never commit `.env` or files containing secret keys to version control.
- Runtime database data is stored in `data/` and excluded via `.gitignore`.
- Provider API keys are configured securely from the admin panel and stored server-side.

---

## License
MIT License. See [LICENSE](LICENSE) for details.
