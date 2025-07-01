# Implementation plan

## Phase 1: Environment Setup

1. **Prevalidation**: Check if current directory already contains a React Native project by running `ls package.json` or `ls app.json` (Project Overview: Section 1).
2. **Install Node.js v20.2.1 and Yarn** (Tech Stack: Core Tools).
3. **Validation**: Run `node -v` and `yarn -v` to confirm Node.js v20.2.1 and Yarn installation.
4. **Install Expo CLI v7.14.0 globally**: `npm install -g expo-cli@7.14.0` (Tech Stack: Frontend).
5. **Validation**: Run `expo --version` to confirm Expo CLI v7.14.0.
6. **Initialize React Native project** with Expo TypeScript template: `npx create-expo-app Astrophysicals --template expo-template-blank-typescript` (Tech Stack: Frontend).
7. **Validation**: Verify `app.json` and `tsconfig.json` exist in project root (confirmed creation) (Project Overview: Section 1).
8. **Navigate into project directory**: `cd Astrophysicals` (Project Overview: Section 1).
9. **Initialize Git repository**: `git init` and create an initial commit (Project Overview: Section 1).
10. **Create `cursor_metrics.md`** in project root: `touch cursor_metrics.md` and refer to `cursor_project_rules.mdc` for AI coding metrics guidance (Tech Stack: AI Coding Assist).

## Phase 2: Frontend Development

11. **Install React Navigation v6** and dependencies: `yarn add @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context` (Tech Stack: Frontend).
12. **Validation**: In `/App.tsx`, import and wrap `NavigationContainer` to ensure no compile errors.
13. **Install NFC and QR scanning libraries**: `yarn add react-native-nfc-manager react-native-qrcode-scanner` (Key Features: NFC/QR Connection & NFT Minting).
14. **Create `/src/screens/PairingScreen.tsx`** with UI for scanning QR or triggering NFC tap using design specs (Key Features: NFC/QR Connection & NFT Minting).
15. **Validation**: Run `expo start` and verify that `PairingScreen` loads without runtime errors when navigated to.
16. **Install astrology API client**: `yarn add axios` and create `/src/services/astrologyApi.ts` with functions to fetch synastry data from `AstrologyAPI.com` (Key Features: Astrological Insights & Compatibility).
17. **Create `/src/screens/CompatibilityScreen.tsx`** showing compatibility score, synastry reading, connection label, and cosmic snapshot using color palette (Key Features: Astrological Insights & Compatibility).
18. **Validation**: Mock API response in `CompatibilityScreen` and verify UI renders correct values.
19. **Install Aptos wallet SDK**: `yarn add aptos` (Key Features: NFT Minting).
20. **Create `/src/services/aptosService.ts`** to handle Testnet wallet sign-in with SIWA and NFT mint calls to Aptos testnet (User Accounts and Wallets).
21. **Add Firebase initial config**: Install Firebase SDK `yarn add firebase` and create `/src/config/firebase.ts` with placeholders for API key and project ID (Data Storage and Backend).

## Phase 3: Backend Development

22. **Install Firebase CLI**: `npm install -g firebase-tools` (Tech Stack: Backend).
23. **Validation**: Run `firebase --version` to confirm installation.
24. **Initialize Firebase in project**: run `firebase init` and select Firestore, Functions (Node.js 18), Auth, Storage (Data Storage and Backend).
25. **Validation**: Confirm `firebase.json`, `.firebaserc`, and `functions/package.json` exist (Data Storage and Backend).
26. **Define Firestore schema**: In `firestore.rules`, add collections `users`, `connections`, `nfts` with appropriate fields and security rules (Data Storage and Backend).
27. **Create Cloud Function `/functions/src/mintNft.ts`** to generate NFT metadata, upload to IPFS via `pinata-sdk`, and mint on Aptos using Aptos SDK (Key Features: Instant NFT Minting).
28. **Validation**: Deploy function locally with `firebase emulators:start --only functions` and invoke `mintNft` with sample payload, verifying correct IPFS CID in emulator logs.
29. **Create Cloud Function `/functions/src/astrology.ts`** to proxy calls to 3rd-party astrology API, sanitize and cache responses in Firestore (Key Features: Astrological Insights & Compatibility).
30. **Validation**: Invoke `astrology` emulator endpoint and verify cached document in Firestore emulator.
31. **Set up Firebase Authentication** in `/functions/src/auth.ts` to handle SIWA for Aptos and fallback wallet creation in Firestore (User Accounts and Wallets).
32. **Validation**: Register a test user via emulator Auth UI and confirm user doc in Firestore emulator.
33. **Configure Firebase Storage rules** in `storage.rules` for IPFS CDN fallback assets (Data Storage and Backend).
34. **Validation**: Attempt unauthorized file upload in emulator and confirm rejection per rules.
35. **Initialize Strapi admin interface** in `/admin` directory: `npx create-strapi-app admin --quickstart --no-run` (Admin Interface).
36. **Containerize Strapi**: Create `/admin/Dockerfile` with Node.js 18 base image and expose port 1337 (Admin Interface).

## Phase 4: Integration

37. **Connect Expo app to Firebase**: update `/src/config/firebase.ts` with actual API keys and initialize in `/App.tsx` (Data Storage and Backend).
38. **Validation**: Launch app and verify user sign-in via Aptos SIWA leads to Auth state in Firebase.
39. **Wire `PairingScreen` to Cloud Functions**: replace mock calls with `httpsCallable` calls to `astrology` and `mintNft` functions (User Flow: Section 1; Key Features: NFC/QR Connection & NFT Minting).
40. **Validation**: Perform end-to-end test in iOS Simulator/Android Emulator: scan dummy QR, view compatibility, and mint NFT on testnet.
41. **Configure FCM in app**: add `/src/services/pushNotifications.ts` to subscribe and handle messages, integrate into `/App.tsx` (Data Storage and Backend).
42. **Validation**: Send test notification via Firebase Console and verify reception in emulator.

## Phase 5: Deployment

43. **Deploy Firebase backend**: `firebase deploy --only functions,firestore,storage,auth` with project ID and region `us-central1` (Deployment).
44. **Validation**: Confirm functions are live in Firebase Console and Firestore collections exist.
45. **Build and push Strapi Docker image**: `docker build -t gcr.io/<PROJECT-ID>/astrophysicals-admin:latest ./admin` (Deployment).
46. **Deploy Strapi to Google Cloud Run**: create service `astrophysicals-admin` in `us-central1`, set environment variables for Firebase and Pinata, and allow unauthenticated invocation (Admin Interface).
47. **Validation**: Access Strapi admin at deployed URL and confirm secure (HTTPS) access.
48. **Configure GitHub Actions CI/CD**: create `/github/workflows/ci-cd.yml` to install dependencies, lint, test, and deploy to Expo Application Services (EAS) and Firebase on push to `main` (Deployment).
49. **Validation**: Push a commit to `main` and verify GitHub Actions completes successfully with Expo and Firebase deployments.
50. **Publish mobile apps**: use Expo EAS to build and submit App Clip for iOS and Instant App for Android and confirm availability in TestFlight/Test Lab via QR code (User Flow: Section 1; Tech Stack: Frontend).
