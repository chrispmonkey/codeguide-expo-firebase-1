Here’s a set of follow-up questions and deeper dives that will help us nail down the implementation plan and surface any lurking security, privacy or UX considerations before we start building.

## 1. Authentication, Wallet & Key Management

- For **Sign-In With Aptos (SIWA)**:
  - Do we have a preferred JS/TS SDK or library for SIWA integration in React Native?
  - How should we handle key escrow or recovery if a user loses their device?
  - Do we require optional MFA (e.g. email or TOTP) in addition to on-device wallet security?

- For **manual wallet creation**:
  - What’s our UX flow for seed‐phrase backup and recovery, and do we need in-app reminders or verifiable backups?
  - Should we enforce hardware-secure modules (Secure Enclave / Android Keystore) for storing derived keys?

## 2. NFT Minting & Blockchain Logic

- **Mint trigger**: Will minting happen client-side (with user wallet) or via a backend service (e.g. Cloud Function) that interacts with Aptos on behalf of the user?
- **Gas fees & paymasters**: Who pays the transaction fee—end user or the app?
- **Metadata signing**: Do we need to cryptographically sign metadata before pinning to IPFS for on-chain verifiability?

## 3. IPFS & Storage Strategy

- **Pinning service**: Do we have a preferred IPFS pinning provider (Pinata, Infura) or will we self-host an IPFS node?
- **Cache invalidation**: How long should we cache NFT images/metadata in Firebase CDN, and what is our TTL strategy?
- **Data sensitivity**: Any PII or user location baked into metadata that must be redacted or hashed?

## 4. Proximity Pairing (QR/NFC/Bluetooth)

- **App Clips vs Instant Apps**:
  - Will the App Clip/Instant App generate on-the-fly bundles or rely on a preconfigured minimal installation?
  - How do we handle analytics or privacy disclaimers within the clip before asking for location/NFC permissions?

- **Bluetooth fallback**:
  - Which Bluetooth library (e.g. react-native-ble-manager) and scanning schema do we prefer?
  - Do we need user-level consent prompts for continuous background scanning?

## 5. Firestore Data Modeling & Security Rules

- **Data structure**:
  - What’s the shape of the “connections” collection (fields, subcollections)?
  - How do we store chat messages, and do we need per-message encryption or end-to-end encryption?

- **Security rules**:
  - Who can read/write each collection?
  - What granular RBAC roles do we enforce (Admin, Moderator, Astrologer, Support Agent)?
  - Should we implement custom Firebase Claims for subscription tiers (free vs premium)?

## 6. Strapi CMS & Admin Workflows

- **Hosted setup**:
  - Are we on Google Cloud Run with HTTPS only and no public endpoints except authenticated?
  - Do we need to integrate Cloud Armor or an API gateway for rate-limiting and IP allow-lists?

- **Content workflows**:
  - What approval flows are required for astrologer content and premium IAP items?
  - Do we need audit logs for moderator actions?

## 7. API & Third-Party Integrations

- **Astrology API**:
  - Are there rate limits or SLAs we need to design around?
  - Will we cache ephemeris data on our side (e.g. Redis) to minimize external calls?

- **Stable Diffusion**:
  - How do we securely manage and rotate API keys?
  - What’s the size and resolution of AI-generated art, and do we run generation on a private GPU cluster or 3rd-party?

## 8. Privacy, Compliance & Data Retention

- **Location data**:
  - You mentioned city-level only—do we hash or generalize coordinates before storage?
  - How long do we retain location and PII to comply with GDPR/CCPA deletion requests?

- **User data**:
  - Do we need age gating or COPPA compliance for under-age users?
  - What’s our policy for data export (allow users to download their connection history)?

## 9. Monetization & Subscription Management

- **IAP flows**:
  - Do we manage subscriptions via App Store / Play Store straight, or via a 3rd-party backend for cross-platform consistency?
  - How do we handle failed renewals and downgrade grace periods?

## 10. Offline & Caching Behavior

- **Offline mode**:
  - Which features must work offline (cached chat history, NFT gallery)?
  - Do we need synchronizing queues for connection events that happen without network?

---

Answering these will let us create a precise, secure architecture blueprint, align on data flows, and design robust security controls (authentication, encryption, RBAC, rate-limits, audit trails) before writing code. Let me know which topics you’d like to tackle first!
