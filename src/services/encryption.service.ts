import * as CryptoJS from 'crypto-js';
import { KeyStorageService } from './keyStorage.service';

export interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
}

export interface DecryptionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface EncryptionResult {
  success: boolean;
  encryptedData?: EncryptedData;
  error?: string;
}

/**
 * EncryptionService provides client-side encryption/decryption functionality
 * for sensitive user data using AES encryption with secure key management.
 */
export class EncryptionService {
  private static instance: EncryptionService;
  private keyStorage: KeyStorageService;
  private readonly ENCRYPTION_KEY_ID = 'user_data_encryption_key';
  private readonly KEY_SIZE = 256; // 256-bit key
  private readonly ITERATION_COUNT = 10000; // PBKDF2 iterations

  private constructor() {
    this.keyStorage = KeyStorageService.getInstance();
  }

  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Generate or retrieve the master encryption key
   * @private
   */
  private async getOrCreateMasterKey(): Promise<string> {
    try {
      // Try to retrieve existing key
      const existingKey = await this.keyStorage.retrieveSecure(this.ENCRYPTION_KEY_ID);
      
      if (existingKey) {
        return existingKey;
      }

      // Generate new master key if none exists
      const masterKey = CryptoJS.lib.WordArray.random(this.KEY_SIZE / 8).toString();
      
      // Store the master key securely
      await this.keyStorage.storeSecure(
        this.ENCRYPTION_KEY_ID,
        masterKey,
        {
          requireAuthentication: true, // Require biometric/PIN for access
          encrypt: false, // Don't double-encrypt the master key
        }
      );

      return masterKey;
    } catch (error) {
      throw new Error(`Failed to generate/retrieve encryption key: ${error}`);
    }
  }

  /**
   * Derive an encryption key from the master key using PBKDF2
   * @private
   */
  private deriveKey(masterKey: string, salt: string): string {
    return CryptoJS.PBKDF2(masterKey, salt, {
      keySize: this.KEY_SIZE / 32, // Convert bits to words (32 bits per word)
      iterations: this.ITERATION_COUNT,
      hasher: CryptoJS.algo.SHA256
    }).toString();
  }

  /**
   * Encrypt sensitive data using AES encryption
   * @param data - The data to encrypt (will be JSON stringified)
   * @returns Promise<EncryptionResult> - The encryption result with encrypted data or error
   */
  async encryptData(data: any): Promise<EncryptionResult> {
    try {
      if (data === null || data === undefined) {
        return {
          success: false,
          error: 'Cannot encrypt null or undefined data'
        };
      }

      // Get master key
      const masterKey = await this.getOrCreateMasterKey();

      // Generate random salt and IV for this encryption
      const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
      const iv = CryptoJS.lib.WordArray.random(128 / 8).toString();

      // Derive encryption key from master key + salt
      const derivedKey = this.deriveKey(masterKey, salt);

      // Convert data to JSON string
      const jsonData = JSON.stringify(data);

      // Encrypt the data
      const encrypted = CryptoJS.AES.encrypt(jsonData, derivedKey, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return {
        success: true,
        encryptedData: {
          data: encrypted.toString(),
          iv: iv,
          salt: salt
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Encryption failed: ${error}`
      };
    }
  }

  /**
   * Decrypt previously encrypted data
   * @param encryptedData - The encrypted data object
   * @returns Promise<DecryptionResult<T>> - The decryption result with original data or error
   */
  async decryptData<T = any>(encryptedData: EncryptedData): Promise<DecryptionResult<T>> {
    try {
      if (!encryptedData || !encryptedData.data || !encryptedData.iv || !encryptedData.salt) {
        return {
          success: false,
          error: 'Invalid encrypted data format'
        };
      }

      // Get master key
      const masterKey = await this.getOrCreateMasterKey();

      // Derive the same encryption key using the stored salt
      const derivedKey = this.deriveKey(masterKey, encryptedData.salt);

      // Decrypt the data
      const decrypted = CryptoJS.AES.decrypt(encryptedData.data, derivedKey, {
        iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      // Convert back to UTF-8 string
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedString) {
        return {
          success: false,
          error: 'Decryption failed - invalid key or corrupted data'
        };
      }

      // Parse JSON back to original object
      const originalData = JSON.parse(decryptedString) as T;

      return {
        success: true,
        data: originalData
      };
    } catch (error) {
      return {
        success: false,
        error: `Decryption failed: ${error}`
      };
    }
  }

  /**
   * Re-encrypt data with a new key (useful for key rotation)
   * @param encryptedData - The data to re-encrypt
   * @returns Promise<EncryptionResult> - New encrypted data or error
   */
  async reEncryptData(encryptedData: EncryptedData): Promise<EncryptionResult> {
    try {
      // First decrypt with old key
      const decryptResult = await this.decryptData(encryptedData);
      
      if (!decryptResult.success) {
        return {
          success: false,
          error: `Re-encryption failed during decryption: ${decryptResult.error}`
        };
      }

      // Re-encrypt with new key/salt/iv
      return await this.encryptData(decryptResult.data);
    } catch (error) {
      return {
        success: false,
        error: `Re-encryption failed: ${error}`
      };
    }
  }

  /**
   * Verify that encryption/decryption is working correctly
   * @returns Promise<boolean> - True if encryption is working properly
   */
  async testEncryption(): Promise<boolean> {
    try {
      const testData = {
        message: 'test_encryption_' + Date.now(),
        number: Math.random(),
        nested: { value: 'nested_test' }
      };

      // Encrypt test data
      const encryptResult = await this.encryptData(testData);
      if (!encryptResult.success || !encryptResult.encryptedData) {
        console.error('Encryption test failed:', encryptResult.error);
        return false;
      }

      // Decrypt test data
      const decryptResult = await this.decryptData(encryptResult.encryptedData);
      if (!decryptResult.success) {
        console.error('Decryption test failed:', decryptResult.error);
        return false;
      }

      // Verify data integrity
      const isValid = JSON.stringify(testData) === JSON.stringify(decryptResult.data);
      if (!isValid) {
        console.error('Encryption test failed: Data integrity check failed');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Encryption test error:', error);
      return false;
    }
  }

  /**
   * Clear the master encryption key (use with caution - will make encrypted data unrecoverable)
   * @returns Promise<boolean> - True if key was successfully cleared
   */
  async clearEncryptionKey(): Promise<boolean> {
    try {
      await this.keyStorage.deleteSecure(this.ENCRYPTION_KEY_ID);
      return true;
    } catch (error) {
      console.error('Failed to clear encryption key:', error);
      return false;
    }
  }

  /**
   * Check if encryption key exists
   * @returns Promise<boolean> - True if encryption key exists
   */
  async hasEncryptionKey(): Promise<boolean> {
    try {
      const key = await this.keyStorage.retrieveSecure(this.ENCRYPTION_KEY_ID);
      return !!key;
    } catch (error) {
      return false;
    }
  }
} 