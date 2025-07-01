[![CodeGuide](/codeguide-backdrop.svg)](https://codeguide.dev)

# Astrophysicals

A React Native mobile app that turns real-world meetups into instant astrological experiences and digital keepsakes. When two (or more) people physically tap phones (via NFC) or scan QR codes, the app computes a compatibility snapshot from their birth charts — complete with fun ice-breakers and a compatibility score — then mints a one-of-a-kind NFT on the Aptos blockchain.

## 🌟 Features

- **Instant Connections**: NFC tap or QR code scanning for quick pairing
- **Astrological Insights**: Real-time compatibility analysis and synastry readings
- **NFT Minting**: Blockchain-backed digital keepsakes on Aptos
- **Social Features**: Real-time chat with astrology prompts
- **Connection Chronicle**: Timeline of connections and shared memories
- **App Clips/Instant Apps**: Seamless onboarding for new users

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js v20.2.1+** - [Download from nodejs.org](https://nodejs.org/)
- **Yarn** - Package manager (`npm install -g yarn`)
- **Expo CLI** - Latest version (`npm install -g @expo/cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/astrophysicals.git
   cd astrophysicals
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # iOS Simulator
   npm run ios
   
   # Android Emulator
   npm run android
   
   # Web browser
   npm run web
   ```

## 📱 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm run web` | Run in web browser |
| `npm test` | Run Jest tests in watch mode |
| `npm run lint` | Run ESLint checks |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run type-check` | Run TypeScript checks |
| `npm run code-quality` | Run all quality checks |

### Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── navigation/     # Navigation configuration
├── services/       # API services and external integrations
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
├── config/         # Configuration files
└── App.tsx         # Main application component

documentation/      # Project documentation
assets/            # Images, fonts, and other static assets
.taskmaster/       # Task management files
```

### Technology Stack

- **Frontend**: React Native, Expo, TypeScript
- **Navigation**: Expo Router
- **Backend**: Firebase (Firestore, Auth, Functions, Storage)
- **Blockchain**: Aptos blockchain for NFT minting
- **Storage**: IPFS (Pinata) with Firebase CDN fallback
- **APIs**: AstrologyAPI.com for birth charts and synastry
- **Development**: ESLint, Prettier, Jest

### Code Quality

This project maintains high code quality through:

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for consistent formatting
- **Jest** for testing
- **Pre-commit hooks** for automated checks

Run all quality checks:
```bash
npm run code-quality
```

## 🔧 Configuration

### Environment Variables

Create `.env` files for different environments:

```bash
# .env.development
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_ENVIRONMENT=development

# .env.production
EXPO_PUBLIC_API_URL=https://api.astrophysicals.com
EXPO_PUBLIC_ENVIRONMENT=production
```

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication, Firestore, Functions, and Storage
3. Add your configuration to `src/config/firebase.ts`

### Aptos Blockchain

1. Set up Aptos wallet integration
2. Configure testnet/mainnet endpoints
3. Set up IPFS storage with Pinata

## 📋 Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Development**
   - Write code following TypeScript best practices
   - Add tests for new functionality
   - Update documentation as needed

3. **Quality Checks**
   ```bash
   npm run code-quality
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🧪 Testing

Run tests with:
```bash
npm test
```

Test structure:
- Unit tests for components and utilities
- Integration tests for services
- E2E tests for critical user flows

## 📦 Building & Deployment

### Development Build
```bash
npx expo build:android --type apk
npx expo build:ios --type simulator
```

### Production Build
```bash
npx expo build:android --type app-bundle
npx expo build:ios --type archive
```

### EAS Build (Recommended)
```bash
npx eas build --platform all
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run quality checks
6. Submit a pull request

### Coding Standards

- Use TypeScript for all new code
- Follow the existing code style (enforced by Prettier)
- Write meaningful commit messages
- Add JSDoc comments for public APIs
- Update tests and documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/astrophysicals/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/astrophysicals/discussions)
- **Documentation**: [Wiki](https://github.com/your-username/astrophysicals/wiki)

## 🌟 Acknowledgments

- Expo team for the excellent React Native framework
- Firebase for backend services
- Aptos blockchain for NFT infrastructure
- AstrologyAPI.com for astrological calculations

---

Made with ❤️ and ✨ by the Astrophysicals team
