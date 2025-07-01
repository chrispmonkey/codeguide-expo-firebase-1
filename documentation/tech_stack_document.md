# Tech Stack Document for Astrophysicals

This document explains the technology choices behind Astrophysicals in everyday language. It covers how we build the app you see on your phone, the servers and services working behind the scenes, and the tools that help us deliver a fast, reliable, and secure experience.

---

## 1. Frontend Technologies

This is everything that runs on your phone when you use Astrophysicals.

### Mobile Frameworks

- **React Native**: Lets us write one codebase in JavaScript that runs on both iOS and Android, giving users a native-feeling app without building two separate apps.
- **Expo**: An easy-to-use toolkit on top of React Native. It handles things like building the app, access to camera/NFC, and over-the-air updates so you always have the latest version.

### User Interface & Styling

- **React Navigation**: Provides the buttons, tabs, and screens you tap through.
- **StyleSheet / Styled Components**: Let us define our dark-mode color palette, fonts, and layout in a clear, maintainable way.
- **Lottie & React Native SVG**: Power the animated constellations, zodiac glyphs, and other magical effects you see floating in the background.

### Device Features

- **Expo QR Scanner & Camera**: To scan QR codes and launch connections instantly, even via an App Clip or Instant App.
- **Expo NFC (Near-Field Communication)**: For the seamless “tap-to-connect” experience when both phones support it.

### Local Data & Caching

- **AsyncStorage (or SQLite)**: Keeps a local copy of your NFTs, timeline events, and chat history so the app loads instantly and works offline.

---

## 2. Backend Technologies

These are the servers, databases, and APIs that power your data and make features like NFT minting possible.

### Primary Data & Auth

- **Firebase Firestore**: A flexible cloud database that stores user profiles, birth data, connection records, and chat messages in real time.
- **Firebase Authentication**: Manages user sign-in via “Sign In with Aptos” (SIWA) or common fallbacks like Google/Apple, ensuring only you can access your data.

### Serverless Logic & Notifications

- **Firebase Cloud Functions**: Run small bits of code (like minting NFTs, fetching astrology data, or sending notifications) without managing servers.
- **Firebase Cloud Messaging**: Sends you daily horoscopes, compatibility alerts, and chat notifications reliably.

### NFT & Blockchain Services

- **Aptos Blockchain (Testnet & Mainnet)**: Where we mint and record your connection NFTs. Testnet lets us develop for free; mainnet gives real ownership.
- **IPFS (InterPlanetary File System)**: A decentralized way to store NFT artwork and metadata. Each token points to an IPFS link so your digital memento is permanent.
- **Firebase Storage (CDN-backed)**: Mirrors the same images and metadata from IPFS for lightning-fast delivery worldwide.

### Admin & Content Management

- **Strapi (Headless CMS)**: A friendly admin dashboard for our team to manage astrology readings, chat moderation, NFT art templates, and user reports.
- **Google Cloud Run & Google Cloud Storage**: Host Strapi and store its uploaded files, scaling automatically as we grow.

---

## 3. Infrastructure and Deployment

A quick look at where everything lives and how we keep it running smoothly.

### Version Control & CI/CD

- **Git & GitHub**: All code is stored in GitHub, letting our team collaborate, review changes, and roll back safely if needed.
- **GitHub Actions**: Automatically builds new versions of the mobile app and Strapi admin interface whenever we push updates.

### Hosting & Scaling

- **Expo Application Services**: Builds and distributes the iOS and Android apps, plus over-the-air updates for fast fixes.
- **Firebase**: Manages real-time databases, serverless functions, and push notifications — no separate server maintenance required.
- **Google Cloud Run**: Hosts Strapi in containers, scaling from zero to many instances based on demand.
- **Google Cloud Storage**: Stores any large files (like admin-uploaded art assets) behind the scenes.

---

## 4. Third-Party Integrations

Services we plug into to make astrology, art generation, and location features happen.

- **Astrology API or Swiss Ephemeris**: Calculates birth charts, planetary positions, and compatibility reports so we don’t have to build all the astronomy math ourselves.
- **Stable Diffusion API**: Generates your one-of-a-kind NFT art on the fly based on your zodiac data and meeting moment.
- **Google Maps or Mapbox Reverse Geocoding**: Turns optional GPS data into city names for your NFT without storing your exact coordinates.
- **WalletConnect (Future)**: Will let power users link external Aptos wallets like Petra or Martian.

---

## 5. Security and Performance Considerations

How we keep your data safe and the app fast.

### Security Measures

- **Non-custodial Wallets**: Your private keys never leave your device’s secure storage (Keychain on iOS, Keystore on Android). We don’t store them on our servers.
- **Encrypted Birth Data**: Personal birth details are encrypted in your phone before syncing to Firestore.
- **Firebase Security Rules**: Ensure users only read and write their own data. Admin actions are logged for auditing.
- **Strapi Access Control**: Only approved admins, moderators, and astrologers see sensitive content in our CMS.

### Performance Optimizations

- **Local Caching**: NFTs, timeline entries, and chat threads load instantly from on-device storage.
- **CDN-backed Storage**: Firebase Storage serves images and metadata worldwide in milliseconds.
- **Serverless Scalability**: Cloud Functions and Cloud Run spin up only when needed, keeping costs low and latency minimal.

---

## 6. Conclusion and Overall Tech Stack Summary

Astrophysicals brings together mobile, cloud, blockchain, and AI technologies to deliver a magical in-person connection experience:

- On the **frontend**, React Native & Expo create a smooth, animation-rich app on both iOS and Android.
- On the **backend**, Firebase handles real-time data, authentication, and serverless logic, while Strapi manages admin content.
- For **NFTs**, we mint on Aptos and store artwork/metadata on IPFS with a CDN fallback.
- We integrate proven APIs for astrology calculations, AI art generation, and geocoding to deliver instant insights and keepsakes.
- Our **infrastructure** uses GitHub, GitHub Actions, Cloud Run, and Firebase to scale automatically.
- **Security** is baked in with encrypted birth data, non-custodial wallets, and strict access controls.

Together, these choices ensure Astrophysicals is reliable, scalable, and joyful to use—turning every face-to-face meeting into a cosmic memory you can keep forever.

Happy stargazing—and connecting—under one shared sky!
