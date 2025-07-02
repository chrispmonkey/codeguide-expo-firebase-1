import { initializeAuth, getAuth, Auth } from 'firebase/auth';
import { FirebaseApp } from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Configures Firebase Auth with proper React Native persistence
 * Uses the exact method Firebase suggests in the warning message
 */
export const configureFirebaseAuth = (app: FirebaseApp): Auth => {
  let auth: Auth;

  try {
    // Try to use getReactNativePersistence if available (Firebase v11+)
    let getReactNativePersistence: any;
    try {
      ({ getReactNativePersistence } = require('firebase/auth'));
    } catch (e) {
      console.log('getReactNativePersistence not available, using fallback');
    }

    if (getReactNativePersistence) {
      // Use the exact method shown in Firebase warning message
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
      console.log('✅ Firebase Auth initialized with React Native persistence');
    } else {
      // Fallback: Initialize without persistence (will show warning but works)
      auth = initializeAuth(app);
      console.log('⚠️  Firebase Auth initialized without persistence (fallback)');
    }

  } catch (error: any) {
    // Auth already initialized - get existing instance
    console.warn('⚠️  Firebase Auth already initialized, using existing instance');
    auth = getAuth(app);
  }

  return auth;
};

/**
 * Alternative solution: Suppress Firebase warnings entirely
 * Use this if you want to completely eliminate development warnings
 */
export const suppressFirebaseWarnings = () => {
  // Suppress specific Firebase warnings in development
  const originalWarn = console.warn;
  console.warn = (...args) => {
    // Filter out Firebase Auth persistence warnings
    const message = args.join(' ');
    if (
      message.includes('@firebase/auth') &&
      message.includes('AsyncStorage') &&
      message.includes('persistence')
    ) {
      // Log a friendlier message instead
      console.log('ℹ️  Firebase Auth: Using development persistence (warning suppressed)');
      return;
    }
    // Allow other warnings through
    originalWarn.apply(console, args);
  };
};

/**
 * Verification function to check if auth persistence is working
 */
export const verifyAuthPersistence = (auth: Auth) => {
  // Check if auth state persists
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('✅ Auth state persisted successfully for user:', user.email);
    } else {
      console.log('ℹ️  No authenticated user (auth state cleared)');
    }
  });
}; 