[![CodeGuide](/codeguide-backdrop.svg)](https://codeguide.dev)

# CodeGuide Expo Firebase Starter

A modern cross-platform mobile application starter template built with Expo and Firebase, featuring authentication and real-time database integration.

## Tech Stack

- **Framework:** [Expo](https://expo.dev/) (SDK 52)
- **Authentication:** [Firebase Authentication](https://firebase.google.com/products/auth)
- **Database:** [Firebase](https://firebase.google.com/)
- **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/)
- **UI Components:** [React Native](https://reactnative.dev/) with Expo's built-in components
- **Icons:** [@expo/vector-icons](https://docs.expo.dev/guides/icons/)
- **Animations:** [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

## Prerequisites

Before you begin, ensure you have the following:

- Node.js 18+ installed
- [Expo CLI](https://docs.expo.dev/get-started/installation/) installed globally
- A [Firebase](https://firebase.google.com/) project for authentication and backend services
- Generated project documents from [CodeGuide](https://codeguide.dev/) for best development experience
- (Optional) [Expo Go](https://expo.dev/client) app installed on your mobile device

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd codeguide-expo-firebase
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Variables Setup**
   - Copy the `.env.example` file to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Fill in the environment variables in `.env` (see Configuration section below)

4. **Start the development server**

   ```bash
   npx expo start
   ```

5. **Run the app:**
   - Scan the QR code with Expo Go (Android)
   - Scan the QR code with Camera app (iOS)
   - Press 'i' for iOS simulator
   - Press 'a' for Android emulator

## Configuration

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add an app to your project (iOS and Android)
4. Copy the Firebase configuration object
5. Set up the necessary Firebase services (Authentication, Firestore, etc.)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
```

## Features

- 🔐 Firebase Authentication
- 📦 Firebase Realtime Database/Firestore
- 📱 Cross-platform (iOS & Android)
- 🎨 Modern UI with native components
- 🚀 File-based routing with Expo Router
- 🔄 Real-time Updates
- 📱 Responsive Design
- 💫 Smooth animations with Reanimated

## Project Structure

```
astrophysicals/
├── app/                # Expo Router pages (file-based routing)
│   ├── (tabs)/        # Tab navigation group
│   ├── index.tsx      # Home screen
│   ├── pairing.tsx    # Re-exports from lib/screens
│   └── compatibility.tsx # Re-exports from lib/screens
├── components/         # Reusable React Native components
│   └── ui/            # UI design system components
├── lib/               # Business logic and utilities
│   ├── screens/       # Screen components (separated from routing)
│   ├── services/      # API and external service integrations
│   └── utils/         # Utility functions
├── config/            # Configuration files
│   └── firebase.ts    # Firebase setup
├── constants/         # App constants and configurations
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
├── assets/            # Static assets (images, fonts)
├── documentation/     # Project documentation
└── .tools/            # AI/Development tool configurations
    ├── .taskmaster/   # Task management system
    ├── .cursor/       # Cursor AI settings
    └── ...            # Other development tools
```

### Architectural Patterns

1. **Screen Organization**: Screens are implemented in `lib/screens/` for business logic separation, then re-exported in `app/` for Expo Router integration. This allows for better code organization and potential reuse.

2. **Environment Configuration**: Separate `.env.development` and `.env.production` files for different environments.

3. **Development Tools**: AI-assisted development tools are organized in `.tools/` directory to keep the root clean while maintaining functionality.

## Documentation Setup

The documentation folder contains all the generated markdown files from CodeGuide:

```bash
documentation/
├── project_requirements_document.md
├── app_flow_document.md
├── frontend_guideline_document.md
└── backend_structure_document.md
```

These documentation files serve as a reference for your project's features and implementation details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Learn More

To learn more about the technologies used in this project:

- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
