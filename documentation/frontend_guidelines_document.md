# Frontend Guideline Document

This document outlines the frontend setup for the Astrophysicals mobile app. It covers architecture, design principles, styling, component structure, state management, navigation, performance, testing, and more. Anyone reading this—technical or not—should come away with a clear picture of how the frontend is built and why.

## 1. Frontend Architecture

### Overview

- We use **React Native** with **Expo** to build one codebase that runs on iOS and Android. Expo simplifies native setup, over-the-air updates, and asset management.

- Core libraries:
  - **React Navigation** for in-app screens and deep linking
  - **Redux Toolkit** for global state management
  - **Styled-Components** for styling and theming
  - **React Query** (optional) for data fetching and caching of async calls (e.g., Firestore, NFT metadata)

### Scalability and Maintainability

- **Modular structure**: Features are organized into folders (e.g., `auth/`, `connections/`, `nft/`, `chat/`, `timeline/`). Each folder contains its own screens, components, styles, and tests.
- **Component-based**: We break UI into reusable pieces (atoms, molecules, organisms) to avoid duplication.
- **Theming**: A central theme file holds colors, fonts, and spacing so any change propagates app-wide.
- **Configuration management**: API endpoints, blockchain network settings, and feature flags live in environment files (`.env`) and are loaded at runtime.

### Performance

- **Hermes engine** (Android) reduces app size and improves JS performance.
- **Asset bundling & caching** via Expo’s asset system.
- **Lazy loading** of non-critical screens (e.g., settings, admin tools) so initial load is fast.

## 2. Design Principles

1.  **Usability**: Simple, step-by-step flows. Clear buttons and prompts for NFC/QR pairing and NFT minting.
2.  **Accessibility**: All tappable elements meet touch-target guidelines. We use accessible labels for screen readers and maintain good color contrast.
3.  **Responsiveness**: The app adapts to various screen sizes and orientations. Key layouts use Flexbox and percentage-based dimensions.
4.  **Consistency**: UI elements follow a unified style—buttons, form inputs, cards, and modals share spacing, corner radius, and typography.
5.  **Delight**: Subtle animations (e.g., bubble effect on phone bump, NFT reveal animation) to reinforce the magical, celestial brand.

These principles guide every design decision, whether it’s the size of a button or the wording of an error message.

## 3. Styling and Theming

### Styling Approach

- We use **Styled-Components** for React Native to keep styles close to components and enable dynamic theming.
- Adopts a lightweight **BEM-inspired** naming convention in styled files (`<StyledButton />`, `<StyledHeader />`).
- Global styles (e.g., safe-area insets, default font families) are defined in a `GlobalStyles` file and injected at app root.

### Theming

- A single **ThemeProvider** wraps the app, supplying:
  - Color palette
  - Font sizes and families
  - Spacing scale (4–32px)
  - Border radii and shadow presets

- If we add light/dark mode in the future, we simply extend the theme object with alternate values.

### Visual Style

- **Glassmorphism** with frosted cards and translucent overlays. Background layers show a blurred cosmic pattern.
- Elements float on top of a dark, starry backdrop.

### Color Palette

- **Midnight Indigo** (#1A1B3A)
- **Celestial Lavender** (#B8A1E5)
- **Gold Accent** (#F2C94C)
- **Nebula Teal** (#1ABC9C)
- **Pure White** (#FFFFFF)

### Typography

- Headings: **Playfair Display**, serif, for a touch of magic.
- Body & UI: **Poppins**, sans-serif, for readability.
- Sizes: H1–H4 scale from 32px down to 18px; body text 14–16px; captions 12px.

## 4. Component Structure

We follow an **atomic design** approach:

1.  **Atoms**: Basic building blocks—buttons, text labels, icons, inputs.
2.  **Molecules**: Combinations of atoms—form fields (label + input + error text), navigation tabs.
3.  **Organisms**: Full sections—header with back button + title + avatar, compatibility card showing zodiac info.
4.  **Screens**: Complete views—PairingScreen, MintNFTScreen, ChatScreen, TimelineScreen.

### Folder Layout Example

`src/ components/ atoms/ molecules/ organisms/ screens/ navigation/ store/ services/ assets/ theme/ utils/`

This keeps things predictable and makes it easy to find, update, or reuse components.

## 5. State Management

### Global State with Redux Toolkit

- **Slices** for each domain: `authSlice`, `connectionSlice`, `nftSlice`, `chatSlice`, `timelineSlice`.
- We use **Redux Persist** (backed by AsyncStorage) to cache critical state like the user’s wallet address, theme preference, and pending NFTs.

### Async Data with React Query (Optional)

- Fetch data from Firestore (user profile, chat history), blockchain (transaction status), IPFS (NFT metadata) and cache it intelligently.
- Handles background refetching and stale data policies.

### Local UI State

- Component-level state for transient UI (e.g., form inputs, local toggles) uses React’s `useState` or `useReducer`.

Sharing state across components ensures a smooth user experience—once you sign in, your profile is available everywhere without extra network calls.

## 6. Routing and Navigation

### React Navigation Setup

- **Stack Navigator** for core flows: Onboarding → Pairing → Compatibility → Mint → Home.
- **Bottom Tab Navigator** for main app sections: Chat, Timeline, Profile, Settings.
- **Modal Stack** for full-screen overlays: Astrology details, subscription upsell, admin tools.

### Deep Linking & QR Handling

- App registers a custom URI scheme and supports universal links for QR codes.
- Scanning a QR opens the app directly to the pairing screen with embedded session info.

### Navigation Patterns

- **Guarded routes**: Redirect to Sign-In if no wallet is connected.
- **Fallback screens**: If a session expires or blockchain call fails, we show a retry screen with clear instructions.

## 7. Performance Optimization

1.  **Lazy Loading**: Non-critical screens and components are dynamically imported with `React.lazy`/`Suspense` or Expo’s built-in support.

2.  **Code Splitting**: We split large modules (e.g., astrology charts, Stable Diffusion viewer) into separate bundles.

3.  **Image & Asset Optimization**:
    - Use `react-native-fast-image` for caching remote NFT images and art.
    - Preload and cache cosmic background layers via Expo’s Asset API.

4.  **Memoization**:
    - Use `React.memo` for functional components and `useCallback`/`useMemo` for handlers and derived data.

5.  **Network Efficiency**:
    - Batch Firestore reads with grouped queries.
    - Use WebP format for images when supported.

6.  **Hermes Engine** on Android reduces startup time and memory usage.

These steps keep the app feeling snappy, even as the codebase grows.

## 8. Testing and Quality Assurance

### Unit Testing

- **Jest** for pure logic tests (e.g., astrology calculations, Redux reducers).
- **React Native Testing Library** for component rendering and user interaction.

### Integration Testing

- Test combined flows: pairing + astrological snapshot + NFT creation.
- Use mocks for blockchain calls and Firestore.

### End-to-End Testing

- **Detox** for automated UI tests on iOS and Android simulators. Key flows tested:
  - New user onboarding
  - NFC/QR pairing and compatibility view
  - NFT minting and gallery
  - Chat and timeline interactions

### Continuous Integration

- GitHub Actions triggers on every PR:
  - Linting with ESLint
  - Type checking with TypeScript
  - Run Jest and Detox suites

Adhering to these testing strategies ensures reliability and catches regressions early.

## 9. Conclusion and Overall Frontend Summary

The Astrophysicals frontend is a React Native/Expo application built for performance, maintainability, and a delightful user experience. Key pillars:

- A **modular, component-driven** architecture that scales as features grow.
- **Design principles** focusing on usability, accessibility, and a magical, celestial brand.
- A **rich yet consistent styling** approach using glassmorphism, a clear color palette, and strong typography.
- **Robust state management** via Redux Toolkit and optional React Query for data caching.
- **Smooth navigation** with React Navigation and deep linking for QR flows.
- **Performance optimizations** like lazy loading, Hermes, and asset caching.
- A thorough **testing strategy** leveraging Jest, React Native Testing Library, and Detox.

Together, these guidelines ensure that any developer joining the project can understand, maintain, and extend the frontend with confidence. Enjoy building under the stars!
