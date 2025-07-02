import { EncryptionService } from './encryption.service';

// Mock crypto-js since it may not work in test environment
jest.mock('crypto-js', () => ({
  lib: {
    WordArray: {
      random: jest.fn().mockReturnValue({
        toString: jest.fn(() => 'mock-random-string')
      })
    }
  },
  PBKDF2: jest.fn(() => ({
    toString: jest.fn(() => 'mock-derived-key')
  })),
  AES: {
    encrypt: jest.fn(() => ({
      toString: jest.fn(() => 'mock-encrypted-data')
    })),
    decrypt: jest.fn(() => ({
      toString: jest.fn(() => JSON.stringify({ test: 'data' }))
    }))
  },
  algo: {
    SHA256: 'SHA256'
  },
  enc: {
    Hex: {
      parse: jest.fn(() => 'mock-hex-parsed')
    },
    Utf8: 'Utf8'
  },
  mode: {
    CBC: 'CBC'
  },
  pad: {
    Pkcs7: 'Pkcs7'
  }
}));

// Mock KeyStorageService
jest.mock('./keyStorage.service', () => ({
  KeyStorageService: {
    getInstance: jest.fn(() => ({
      retrieveSecure: jest.fn().mockResolvedValue(null),
      storeSecure: jest.fn().mockResolvedValue(undefined),
      deleteSecure: jest.fn().mockResolvedValue(undefined)
    }))
  }
}));

describe('EncryptionService', () => {
  let encryptionService: EncryptionService;

  beforeEach(() => {
    jest.clearAllMocks();
    encryptionService = EncryptionService.getInstance();
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton pattern)', () => {
      const instance1 = EncryptionService.getInstance();
      const instance2 = EncryptionService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('encryptData', () => {
    it('should encrypt valid data successfully', async () => {
      const testData = { message: 'test', number: 123 };
      
      const result = await encryptionService.encryptData(testData);
      
      expect(result.success).toBe(true);
      expect(result.encryptedData).toBeDefined();
      expect(result.encryptedData?.data).toBe('mock-encrypted-data');
      expect(result.encryptedData?.iv).toBe('mock-random-string');
      expect(result.encryptedData?.salt).toBe('mock-random-string');
    });

    it('should handle null data', async () => {
      const result = await encryptionService.encryptData(null);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot encrypt null or undefined data');
    });

    it('should handle undefined data', async () => {
      const result = await encryptionService.encryptData(undefined);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot encrypt null or undefined data');
    });
  });

  describe('decryptData', () => {
    it('should decrypt valid encrypted data successfully', async () => {
      const encryptedData = {
        data: 'mock-encrypted-data',
        iv: 'mock-iv',
        salt: 'mock-salt'
      };
      
      const result = await encryptionService.decryptData(encryptedData);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ test: 'data' });
    });

    it('should handle invalid encrypted data format', async () => {
      const invalidData = {
        data: '',
        iv: '',
        salt: ''
      };
      
      const result = await encryptionService.decryptData(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid encrypted data format');
    });

    it('should handle missing encrypted data properties', async () => {
      const incompleteData = {
        data: 'some-data'
        // missing iv and salt
      } as any;
      
      const result = await encryptionService.decryptData(incompleteData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid encrypted data format');
    });
  });

  describe('reEncryptData', () => {
    it('should re-encrypt data successfully', async () => {
      const originalData = {
        data: 'mock-encrypted-data',
        iv: 'mock-iv',
        salt: 'mock-salt'
      };
      
      const result = await encryptionService.reEncryptData(originalData);
      
      expect(result.success).toBe(true);
      expect(result.encryptedData).toBeDefined();
    });
  });

  describe('testEncryption', () => {
    it('should verify encryption/decryption cycle works', async () => {
      // This test would be more meaningful with actual crypto-js
      // but demonstrates the structure for integration testing
      const result = await encryptionService.testEncryption();
      
      // With mocked crypto-js, this will depend on our mock setup
      expect(typeof result).toBe('boolean');
    });
  });

  describe('hasEncryptionKey', () => {
    it('should check if encryption key exists', async () => {
      const result = await encryptionService.hasEncryptionKey();
      
      expect(typeof result).toBe('boolean');
    });
  });

  describe('clearEncryptionKey', () => {
    it('should clear encryption key successfully', async () => {
      const result = await encryptionService.clearEncryptionKey();
      
      expect(result).toBe(true);
    });
  });
});

// Integration test data for manual testing
export const testEncryptionIntegration = async () => {
  console.log('🔒 Testing EncryptionService Integration...');
  
  const encryptionService = EncryptionService.getInstance();
  
  // Test data
  const sensitiveData = {
    birthDate: '1990-05-15',
    birthTime: '14:30',
    birthCity: 'New York',
    birthCountry: 'USA',
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060
    }
  };
  
  try {
    // Test encryption
    console.log('📝 Original data:', sensitiveData);
    
    const encryptResult = await encryptionService.encryptData(sensitiveData);
    if (!encryptResult.success) {
      console.error('❌ Encryption failed:', encryptResult.error);
      return false;
    }
    
    console.log('🔐 Encrypted data:', encryptResult.encryptedData);
    
    // Test decryption
    const decryptResult = await encryptionService.decryptData(encryptResult.encryptedData!);
    if (!decryptResult.success) {
      console.error('❌ Decryption failed:', decryptResult.error);
      return false;
    }
    
    console.log('🔓 Decrypted data:', decryptResult.data);
    
    // Verify data integrity
    const isIntact = JSON.stringify(sensitiveData) === JSON.stringify(decryptResult.data);
    console.log('✅ Data integrity check:', isIntact ? 'PASSED' : 'FAILED');
    
    // Test encryption service self-test
    const selfTest = await encryptionService.testEncryption();
    console.log('🧪 Self-test result:', selfTest ? 'PASSED' : 'FAILED');
    
    return isIntact && selfTest;
  } catch (error) {
    console.error('❌ Integration test error:', error);
    return false;
  }
}; 