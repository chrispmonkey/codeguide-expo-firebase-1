/**
 * Firebase Configuration Test
 * This file tests the Firebase initialization and configuration
 */

import { db, auth, storage, functions } from './firebase';

// Test Firebase initialization
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test Firestore
    if (db) {
      console.log('✅ Firestore initialized successfully');
    } else {
      throw new Error('Firestore initialization failed');
    }
    
    // Test Auth
    if (auth) {
      console.log('✅ Authentication initialized successfully');
    } else {
      throw new Error('Authentication initialization failed');
    }
    
    // Test Storage
    if (storage) {
      console.log('✅ Storage initialized successfully');
    } else {
      throw new Error('Storage initialization failed');
    }
    
    // Test Functions
    if (functions) {
      console.log('✅ Functions initialized successfully');
    } else {
      throw new Error('Functions initialization failed');
    }
    
    console.log('🎉 All Firebase services initialized successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
};

// Export for use in app
export default testFirebaseConnection; 