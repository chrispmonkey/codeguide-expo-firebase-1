import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';

// Key storage configuration
const STORAGE_PREFIX = 'astrophysicals_secure_';
const KEYCHAIN_SERVICE = 'astrophysicals_keychain';

interface StorageOptions {
  requireAuthentication?: boolean;
  authenticationPrompt?: string;
  encrypt?: boolean;
}

interface StoredData {
  encryptedData?: string;
  data?: string;
  timestamp: string;
  version: string;
}

export class KeyStorageService {
  private static instance: KeyStorageService;
  private encryptionKey: string;

  private constructor() {
    // Generate a device-specific encryption key
    this.encryptionKey = this.generateEncryptionKey();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): KeyStorageService {
    if (!KeyStorageService.instance) {
      KeyStorageService.instance = new KeyStorageService();
    }
    return KeyStorageService.instance;
  }

  /**
   * Store sensitive data securely
   */
  async storeSecure(
    key: string, 
    value: string, 
    options: StorageOptions = {}
  ): Promise<void> {
    try {
      const {
        requireAuthentication = true,
        authenticationPrompt = 'Authenticate to access secure data',
        encrypt = true
      } = options;

      // Prepare data for storage
      const dataToStore: StoredData = {
        timestamp: new Date().toISOString(),
        version: '1.0'
      };

      if (encrypt) {
        // Encrypt the data before storing
        dataToStore.encryptedData = this.encrypt(value);
      } else {
        dataToStore.data = value;
      }

      const serializedData = JSON.stringify(dataToStore);
      const storageKey = `${STORAGE_PREFIX}${key}`;

      await SecureStore.setItemAsync(storageKey, serializedData, {
        keychainService: KEYCHAIN_SERVICE,
        requireAuthentication,
        authenticationPrompt
      });

    } catch (error) {
      console.error('Error storing secure data:', error);
      throw new Error(`Failed to store secure data for key: ${key}`);
    }
  }

  /**
   * Retrieve sensitive data securely
   */
  async retrieveSecure(key: string): Promise<string | null> {
    try {
      const storageKey = `${STORAGE_PREFIX}${key}`;
      const storedData = await SecureStore.getItemAsync(storageKey, {
        keychainService: KEYCHAIN_SERVICE
      });

      if (!storedData) {
        return null;
      }

      const parsedData: StoredData = JSON.parse(storedData);

      // Handle encrypted data
      if (parsedData.encryptedData) {
        return this.decrypt(parsedData.encryptedData);
      }

      // Handle unencrypted data (legacy or specific cases)
      return parsedData.data || null;

    } catch (error) {
      console.error('Error retrieving secure data:', error);
      throw new Error(`Failed to retrieve secure data for key: ${key}`);
    }
  }

  /**
   * Delete stored data
   */
  async deleteSecure(key: string): Promise<void> {
    try {
      const storageKey = `${STORAGE_PREFIX}${key}`;
      await SecureStore.deleteItemAsync(storageKey, {
        keychainService: KEYCHAIN_SERVICE
      });
    } catch (error) {
      console.error('Error deleting secure data:', error);
      throw new Error(`Failed to delete secure data for key: ${key}`);
    }
  }

  /**
   * Check if key exists in secure storage
   */
  async exists(key: string): Promise<boolean> {
    try {
      const storageKey = `${STORAGE_PREFIX}${key}`;
      const data = await SecureStore.getItemAsync(storageKey, {
        keychainService: KEYCHAIN_SERVICE
      });
      return data !== null;
    } catch (error) {
      console.error('Error checking key existence:', error);
      return false;
    }
  }

  /**
   * List all stored keys (for debugging/management)
   */
  async listKeys(): Promise<string[]> {
    try {
      // Note: SecureStore doesn't provide a direct way to list keys
      // This is a limitation we'll need to work around by maintaining a key registry
      console.warn('Key listing not directly supported by SecureStore');
      return [];
    } catch (error) {
      console.error('Error listing keys:', error);
      return [];
    }
  }

  /**
   * Clear all stored data (use with caution)
   */
  async clearAll(): Promise<void> {
    try {
      // Since we can't list keys, we'll need to track them separately
      // For now, log a warning about this limitation
      console.warn('Clear all operation requires manual key tracking');
      throw new Error('Clear all operation not implemented - requires key registry');
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  /**
   * Test storage functionality
   */
  async testStorage(): Promise<boolean> {
    try {
      const testKey = 'test_storage_key';
      const testValue = 'test_storage_value';

      // Test store and retrieve
      await this.storeSecure(testKey, testValue, { requireAuthentication: false });
      const retrievedValue = await this.retrieveSecure(testKey);
      
      // Clean up test data
      await this.deleteSecure(testKey);

      return retrievedValue === testValue;
    } catch (error) {
      console.error('Storage test failed:', error);
      return false;
    }
  }

  /**
   * Encrypt data using AES
   */
  private encrypt(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using AES
   */
  private decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Generate a device-specific encryption key
   */
  private generateEncryptionKey(): string {
    // In a real implementation, you'd want to derive this from device-specific data
    // For now, using a deterministic key based on app identifier
    const appIdentifier = 'astrophysicals_v1';
    return CryptoJS.SHA256(appIdentifier).toString();
  }
} 