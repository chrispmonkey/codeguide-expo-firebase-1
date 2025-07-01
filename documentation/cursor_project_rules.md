## Project Overview

- **Type:** React Native Mobile App
- **Description:** Astrophysicals is a React Native mobile app that aims to create unique experiences by combining in-person connections with astrology. When two users meet, the app will create a digital memento (NFT) on the Aptos blockchain representing the connection.
- **Primary Goal:** Create digital astrology-based NFTs to commemorate in-person connections and foster long-term social engagement.

## Project Structure

### Framework-Specific Routing

- **Directory Rules:**
  - React Native (Expo) & React Navigation v6: Use `src/navigation/` for navigators and define screens in `src/screens/[ScreenName].tsx`.
  - Example 1: `src/navigation/AppNavigator.tsx` with `createNativeStackNavigator`.
  - Example 2: `src/screens/HomeScreen.tsx` → route name `Home`.
  - Example 3: `src/screens/ConnectionScreen.tsx` → route name `Connection`.

### Core Directories

- **Versioned Structure:**
  - `src/screens`: React Native screen components.
  - `src/components`: Reusable UI components in TypeScript.
  - `src/navigation`: Navigation definitions using React Navigation v6.
  - `src/assets`: Static assets like images, fonts.
  - `src/services`: API and blockchain interaction modules.
  - `src/hooks`: Custom React hooks.
  - `src/store`: Global state management (e.g., Recoil, Context API).
  - `src/utils`: Utility functions and helpers.
  - `src/config`: Environment-specific configurations.

### Key Files

- **Stack-Versioned Patterns:**
  - `App.tsx`: Entry point of the Expo-managed React Native app.
  - `src/navigation/AppNavigator.tsx`: Stack and tab navigator definitions (React Navigation v6).
  - `src/services/aptosClient.ts`: Aptos blockchain SDK initialization.
  - `src/services/astrologyAPI.ts`: Phase 1 HTTP adapter for AstrologyAPI.com.
  - `src/services/stableDiffusion.ts`: AI art generation logic with Stable Diffusion API.
  - `src/config/firebaseConfig.ts`: Firebase modular SDK setup and initialization.

## Tech Stack Rules

- **Version Enforcement:**
  - expo@49: Use managed workflow, no custom native modules; align with Expo Go.
  - react-native@0.72: Functional components with hooks; avoid class components.
  - firebase@10: Import SDK using `import { getFirestore } from 'firebase/firestore'`.
  - @aptos-labs/aptos@1.x: Use Aptos SDK v1 with offline signing; configure testnet/mainnet via environment.
  - pinata-sdk@2.x or nft.storage@5.x: Use for IPFS pinning; handle TTL and retries.
  - @react-navigation/native@6: Use native-stack navigator; configure linking for deep links.
  - strapi@4.x: Headless CMS with role-based access; deploy on Google Cloud Run.

## PRD Compliance

- **Non-Negotiable:**
  - "QR codes are prioritized for universal compatibility. NFC is a secondary progressive enhancement.": Implement QR code scanning first; NFC optional fallback.
  - "Mint a unique NFT on the Aptos blockchain upon connection.": NFT minting must occur serverlessly via Cloud Functions or on-device signing.
  - "City-level location data (opt-in), not precise GPS coordinates.": Collect only city-level location.

## App Flow Integration

- **Stack-Aligned Flow:**
  - Connection Flow → `src/screens/ConnectionScreen.tsx` uses QR code scan first, then NFC fallback, and triggers `services/aptosClient.mintConnectionNFT()`.
  - Authentication Flow → `App.tsx` uses Sign In with Aptos (Google/Apple SIWA) with on-device wallet generation.
  - Chat Flow → `src/screens/ChatScreen.tsx` connects to Firestore real-time listeners in `services/chatService.ts`.
  - Admin Interface → Deployed Strapi on Cloud Run; Admin client UI in `src/screens/AdminScreen.tsx` communicates via REST.

## Best Practices

- react-native:
  - Use functional components and React hooks in TypeScript.
  - Optimize renders with `React.memo`, `useCallback`, and `useMemo`.
  - Leverage Expo asset bundling and caching.
  - Structure styles with StyleSheet and avoid inline styles.

- expo:
  - Keep `app.json` configurations minimal; use OTA updates.
  - Use Expo Constants for environment variables.
  - Test on Expo Go before building native binaries.

- firebase:
  - Use Firestore offline persistence for immediate UX.
  - Batch writes for NFT metadata and connection logs.
  - Use Cloud Functions for NFT mint triggers and secure operations.

- aptos-sdk:
  - Manage network configs via environment; support testnet and mainnet.
  - Use offline signing tooling; never expose private keys in code.
  - Handle transaction retry and error mapping.

- ipfs (pinata/nft.storage):
  - Pin and verify JSON metadata; fallback to public gateway.
  - Add retry logic and TTL awareness.

- stable-diffusion-api:
  - Sanitize and validate prompts.
  - Implement rate limiting and exponential backoff.

- strapi:
  - Define roles (Admin, Moderator, Astrologer, Support Agent).
  - Secure endpoints with JWT and RBAC.

- google-cloud-run:
  - Containerize Strapi and Cloud Functions; use env vars for secrets.
  - Enable autoscaling and health checks.

## Rules

- Derive folder/file patterns **directly** from techStackDoc versions.
- Use React Navigation v6 convention: `src/navigation` and `src/screens`.
- Never mix web routing patterns (`pages/` or `app/`) in the React Native project.
- Implement QR-first connection, then NFC fallback.
- Store and cache NFT metadata off-chain on IPFS with Firebase CDN.
- Encrypt birth data client-side before Firestore writes.

## Rules Metrics

Before starting the project development, create a metrics file in the root of the project called `cursor_metrics.md`.

### Instructions:

- Each time a cursor rule is used as context, update `cursor_metrics.md`.
- Use the following format for `cursor_metrics.md`:

# Rules Metrics

## Usage

The number of times rules is used as context

- react-native-rule.mdc: 0
- expo-rule.mdc: 0
- firebase-rule.mdc: 0
- aptos-rule.mdc: 0
