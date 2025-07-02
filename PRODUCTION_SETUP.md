# 🚀 Production Setup Guide

This guide outlines the steps to make Astrophysicals production-ready after addressing critical startup issues.

## ✅ Fixed Issues

### 1. **Firebase Authentication Persistence**
- **Problem**: Auth state not persisting between sessions
- **Solution**: Configured Firebase Auth with proper React Native persistence
- **Status**: ✅ Fixed

### 2. **Crypto Polyfills for React Native**
- **Problem**: `Buffer` and crypto errors in React Native
- **Solution**: Added `react-native-get-random-values` polyfill
- **Status**: ✅ Fixed

### 3. **BIP39 Mnemonic Generation**
- **Problem**: Node.js `bip39` library not compatible with React Native
- **Solution**: Replaced with `@scure/bip39` library (React Native compatible)
- **Status**: ✅ Fixed

### 4. **Navigation Structure**
- **Problem**: Navigation errors due to missing screens
- **Solution**: Fixed import paths and navigation structure
- **Status**: ✅ Fixed

### 5. **Session Persistence**
- **Problem**: Encryption failures during session storage
- **Solution**: Temporarily disabled encryption for session data
- **Status**: ✅ Fixed (temporary)

### 6. **AsyncStorage Version Compatibility**
- **Problem**: Version mismatch with Expo requirements
- **Solution**: Downgraded to AsyncStorage@2.1.2 as expected by Expo
- **Status**: ✅ Fixed

### 7. **Missing Adaptive Icon**
- **Problem**: Android adaptive icon not found in expected location
- **Solution**: Copied adaptive-icon.png to assets/images/ directory
- **Status**: ✅ Fixed

## 🔧 Production Requirements

### 1. **Environment Setup**

```bash
# Install required dependencies
npm install @react-native-async-storage/async-storage@2.1.2
npm install react-native-get-random-values
npm install expo-crypto
npm install @scure/bip39 @scure/bip32
```

### 2. **Firebase Configuration**

#### Enable Required Services:
```bash
# Authenticate with Firebase
firebase login

# Enable Authentication
firebase use your-project-id
firebase deploy --only firestore:rules
```

#### Required Environment Variables:
```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Aptos Network
EXPO_PUBLIC_APTOS_NETWORK=testnet
```

### 3. **Security Considerations**

#### Current Security Status:
- ✅ Firebase Auth configured
- ✅ Firestore security rules in place
- ⚠️ Wallet encryption temporarily disabled
- ⚠️ Session encryption temporarily disabled

#### Production Security Tasks:
1. **Re-enable Encryption**: Fix crypto implementation for wallet storage
2. **Backend Integration**: Implement server-side custom token generation for SIWA
3. **API Security**: Add rate limiting and request validation
4. **Audit**: Conduct security audit before mainnet deployment

### 4. **Performance Optimizations**

#### Implemented:
- ✅ Singleton pattern for services
- ✅ Efficient state management
- ✅ Optimized navigation structure

#### Recommended:
- [ ] Implement image caching for astrology assets
- [ ] Add error boundaries for crash recovery
- [ ] Implement analytics and monitoring

### 5. **Testing Requirements**

#### Current Test Coverage:
- ✅ Encryption service tests
- ✅ Astrology service tests
- ✅ Wallet service tests
- ✅ Profile service tests

#### Production Testing:
```bash
# Run all tests
npm test

# Run specific test suites
npm test -- --testPathPattern=services
npm test -- --testPathPattern=utils
```

## 🚨 Critical Production Tasks

### 1. **Backend Security Implementation**
```typescript
// TODO: Implement server-side custom token generation
// Current SIWA implementation is client-side only
// Move to Firebase Cloud Functions or dedicated backend
```

### 2. **Encryption Recovery**
```typescript
// TODO: Fix crypto implementation with proper polyfills
// Re-enable wallet and session encryption
// Test on actual devices, not just simulators
```

### 3. **Error Monitoring**
```typescript
// TODO: Implement Sentry or similar for production error tracking
// Add comprehensive error boundaries
// Implement graceful degradation for offline scenarios
```

### 4. **API Integration**
```typescript
// TODO: Configure production astrology API endpoints
// Implement proper API key management
// Add caching and retry logic
```

## 📱 Deployment Checklist

### Pre-Deployment:
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance testing on real devices
- [ ] End-to-end testing on TestNet
- [ ] Error monitoring configured

### Firebase Deployment:
- [ ] Firestore security rules deployed
- [ ] Authentication methods enabled
- [ ] Storage rules configured
- [ ] Cloud Functions deployed (when implemented)

### App Store Preparation:
- [ ] App icons and splash screens
- [ ] Privacy policy and terms of service
- [ ] App store metadata and screenshots
- [ ] Beta testing with TestFlight/Play Console

### Mainnet Readiness:
- [ ] Smart contract audit
- [ ] Aptos mainnet configuration
- [ ] Production API endpoints
- [ ] Monitoring and alerting

## 🔍 Monitoring & Maintenance

### Health Checks:
- Firebase connection status
- Aptos network connectivity
- API response times
- User authentication flow
- Wallet creation/recovery

### Key Metrics:
- User onboarding completion rate
- Authentication success rate
- Wallet creation success rate
- Connection/NFT minting success
- App crash rate and error frequency

## 🆘 Emergency Procedures

### Service Outages:
1. **Firebase Down**: Implement offline mode
2. **Aptos Network Issues**: Show network status
3. **Astrology API Down**: Use cached data
4. **Critical Bug**: Remote config feature flags

### Contact Information:
- Development Team: [team@example.com]
- Firebase Support: [firebase-support]
- Aptos Support: [aptos-support]

---

## 📝 Next Steps

1. **Immediate**: Test app startup and basic flows
2. **Short-term**: Re-implement encryption with proper crypto
3. **Medium-term**: Implement backend SIWA authentication
4. **Long-term**: Production deployment and monitoring

## 🎯 Success Criteria

The app is production-ready when:
- ✅ No startup errors or crashes
- ✅ All authentication flows work
- ✅ Wallet creation/recovery functional
- ✅ Navigation smooth and responsive
- ✅ Data encryption re-enabled
- ✅ Backend security implemented
- ✅ Comprehensive monitoring in place 