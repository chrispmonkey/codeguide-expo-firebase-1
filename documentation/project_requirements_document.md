# Project Requirements Document (PRD)

## 1. Project Overview

Astrophysicals is a React Native mobile app that turns real-world meetups into instant astrological experiences and digital keepsakes. When two (or more) people physically tap phones (via NFC) or scan QR codes, the app computes a compatibility snapshot from their birth charts — complete with fun ice-breakers and a compatibility score — then mints a one-of-a-kind NFT on the Aptos blockchain. Each NFT captures the “stars aligning” at that moment (sun/moon signs, moon phase, timestamp, city) and lives in the users’ crypto wallets as both a sentimental souvenir and a tradeable digital asset.

We’re building Astrophysicals to:

1.  Deliver immediate value through a magical, astrology-driven readout at the speed of real-world connection.
2.  Drive long-term engagement via a “Connection Chronicle” timeline, in-app chat with astrology prompts, collectible badges, and premium NFT art styles.
3.  Spark organic growth by letting full-app users onboard friends instantly through App Clips (iOS) or Instant Apps (Android).

**Success criteria** for v1 include sub-5-second pairing → insight → NFT minting, seamless App Clip hand-off, a minimum viable chat and timeline experience, and an initial monetization model (free tier + premium subscription + in-app NFT style purchases).

## 2. In-Scope vs. Out-of-Scope

### In-Scope (v1)

- **Account & Wallet**
  - Sign In with Aptos (SIWA) → non-custodial wallet in secure enclave
  - Manual wallet creation + mnemonic backup fallback

- **Onboarding**
  - Birth date/time/place capture (encrypted client-side)
  - Profile stored in Firebase Firestore

- **Connection Flow**
  - QR code pairing (primary)
  - NFC tap (progressive enhancement)
  - App Clip/Instant App fallback with minimal info capture

- **Astrology Engine**
  - Third-party API for birth chart, synastry, transit data

- **Instant NFT Minting**
  - Aptos testnet → mainnet for production
  - Metadata/art hosted on IPFS + Firebase Storage CDN fallback
  - Local caching on device

- **Social Features**
  - Real-time chat: text, images, reactions, typing indicators
  - Astrology-driven chat prompts
  - Connection Chronicle timeline: events, media, NFTs, badges

- **Admin Portal**
  - Strapi on Google Cloud Run with roles (Admin, Moderator, Astrologer, Support)

- **Monetization**
  - Free tier (core social + basic NFT art)
  - Premium subscription (deep reports, premium art styles, downloadable journal)
  - In-app purchases for special NFT styles and badges

- **Push Notifications & Messaging**
  - Daily forecasts, transit nudges, chat alerts (via FCM)

- **Basic Security & Privacy**
  - Client-side encryption of birth data
  - City-level location only (opt-in)
  - GDPR-style opt-outs and data deletion

### Out-of-Scope (v1)

- Bluetooth-based pairing (future)
- Custom in-house astrology calculation engine
- Voice notes or video chat (stretch goals)
- Precise GPS coordinates or street-level location
- Token-gated features or internal crypto token economics
- High-volume event discovery (ambient friend-finding)
- Advanced blockchain logic beyond simple NFT mint

## 3. User Flow

**Sign-Up & Profile Setup:**\
A new user opens the app, sees a dark-mode splash with drifting constellations, and taps “Get Started.” They choose Sign In with Aptos (SIWA) via Google/Apple, which auto-generates a non-custodial Aptos wallet stored in the device’s secure enclave. Next, the user enters their birth date, time, and city (encrypted locally), and within seconds sees their Sun/Moon/Rising signs plus today’s cosmic snapshot on the Home screen.

**Making a Connection:**\
User A taps “Connect” to display a dynamic QR code (or chooses NFC tap). User B scans the QR or taps phones. If User B lacks the full app, an App Clip/Instant App launches, collects minimal birth details, then hands off to the main app. Both parties confirm pairing. Within five seconds, they see a playful synastry reading (e.g., “Fire Fire match – fiery chemistry ahead!”), a compatibility score, and an animated preview of their NFT. A tap on “Mint” triggers an Aptos blockchain transaction. The NFT lands in both wallets, and User B (if on App Clip) receives a prompt to install the full app—with all data carried over seamlessly.

## 4. Core Features

- **Authentication & Wallets**
  - SIWA non-custodial Aptos wallet, manual seed backup, future WalletConnect

- **Onboarding & Profile**
  - Birth data capture, client-side encryption, Firestore storage

- **Pairing Mechanisms**
  - QR code scan (universal), NFC tap (if supported), App Clip/Instant App fallback

- **Astrological Insights**
  - Third-party API (birth charts, synastry, transits), instant compatibility labels, today’s cosmic snapshot

- **NFT Minting**
  - Aptos testnet/mainnet, metadata JSON + AI-generated art on IPFS + Firebase CDN, local cache

- **In-App Chat**
  - Real-time messaging, image sharing, typing/read indicators, zodiac stickers, astrology-driven prompts

- **Connection Chronicle Timeline**
  - Event logs, media attachments, NFT embeds, milestone badges, astro overlays

- **Admin & Moderation**
  - Strapi CMS with RBAC, report queues, content curation, audit logs

- **Notifications**
  - Daily horoscopes, transit alerts, connection re-engagement via Firebase Cloud Messaging

- **Monetization**
  - Free tier, subscription ($4.99–$9.99/mo), micro-transactions for premium NFT styles/badges

## 5. Tech Stack & Tools

- **Frontend**
  - React Native + Expo (mobile), App Clips (iOS), Instant Apps (Android)

- **Backend & Cloud**
  - Firebase Firestore, Authentication, Cloud Functions, Cloud Messaging, Storage
  - Strapi (headless CMS) on Google Cloud Run + Google Cloud Storage

- **Blockchain & NFT**
  - Aptos (testnet → mainnet), IPFS (Pinata/NFT.storage), Firebase CDN fallback

- **Astrology Engine**
  - Third-party API (AstrologyAPI.com, Swiss Ephemeris wrappers) for charts & synastry

- **AI Art Generation**
  - Stable Diffusion API or custom model via Cloud Functions

- **AI Coding Assist**
  - Cursor, VS Code extensions, Claude 3.7 Sonnet, GPT-4 O1, Gemini 2.5

- **Dev Tools**
  - Git, GitHub Actions, ESLint/Prettier

## 6. Non-Functional Requirements

- **Performance**
  - Pairing → insight → NFT mint complete in ≤5 seconds
  - UI response <200 ms for core screens
  - Chat latency <1 s

- **Security & Privacy**
  - Client-side encryption of birth data
  - Secure enclave for private keys (Keychain/Keystore)
  - Firebase rules enforce ownership and RBAC in Strapi
  - Audit logs for admin actions
  - GDPR-style opt-ins/outs, no raw personal data in NFTs

- **Reliability & Scalability**
  - Autoscaling Cloud Run / Firebase Functions
  - CDN caching of metadata/art
  - Offline caching for NFT gallery and timeline

- **Usability**
  - Dark-mode default, intuitive flows, clear permission prompts
  - Fallbacks for unsupported features (no NFC, no network)

- **Compliance**
  - App Store / Play Store guidelines for App Clips & Instant Apps
  - Data privacy regulations (GDPR, CCPA)

## 7. Constraints & Assumptions

- **Blockchain**: Aptos availability; free testnet minting
- **Astrology API**: uptime and rate-limit constraints; need caching & backoff
- **Device Support**: NFC on iOS 11+ & Android 10+; camera for QR scanning
- **Network**: basic connectivity assumed; offline queues required for NFT mint requests
- **Location**: city-level only; user opt-in for reverse geocoding
- **App Clips/Instant Apps**: device compatibility and store restrictions
- **Seed Phrase**: users manage their own backup; no custodial storage

## 8. Known Issues & Potential Pitfalls

- **NFC Variance**: not all devices support NFC — ensure seamless QR fallback
- **Astrology API Limits**: implement result caching, retry with exponential backoff
- **IPFS Performance**: use Firebase CDN as primary fetch layer, fallback to IPFS
- **Wallet Loss**: educate users on seed backup; no account recovery
- **Blockchain Latency**: display clear progress states, queue mint requests if offline
- **App Clip Limitations**: small binary size, limited API surface; test thoroughly on devices
- **Push Notification Fragmentation**: handle iOS/Android differences in FCM delivery
- **Admin Security**: secure Strapi behind OAuth + firewall; audit all content changes

This PRD should serve as the single source of truth for all subsequent technical documents—including detailed tech stack specs, frontend guidelines, backend architecture, file structures, and IDE configurations—ensuring clear, unambiguous implementation of Astrophysicals’ v1 vision.
