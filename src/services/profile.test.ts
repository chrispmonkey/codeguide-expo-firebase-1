import { ProfileService, BirthInformation, ProfileCreateData } from './profile.service';
import { User } from 'firebase/auth';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({ id: 'mock-doc-ref' })),
  setDoc: jest.fn().mockResolvedValue(undefined),
  getDoc: jest.fn(() => Promise.resolve({
    exists: () => true,
    data: () => ({
      id: 'profile_test-user-id',
      userId: 'test-user-id',
      displayName: 'Test User',
      email: 'test@example.com',
      encryptedBirthData: {
        data: 'mock-encrypted-data',
        iv: 'mock-iv',
        salt: 'mock-salt'
      },
      preferences: {
        notifications: true,
        shareProfile: false,
        showBirthTime: false
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    })
  })),
  updateDoc: jest.fn().mockResolvedValue(undefined),
  deleteDoc: jest.fn().mockResolvedValue(undefined),
  serverTimestamp: jest.fn(() => 'mock-timestamp'),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn()
}));

// Mock Firebase config
jest.mock('../config/firebase', () => ({
  db: 'mock-firestore-db'
}));

// Mock EncryptionService
jest.mock('./encryption.service', () => ({
  EncryptionService: {
    getInstance: jest.fn(() => ({
      encryptData: jest.fn().mockResolvedValue({
        success: true,
        encryptedData: {
          data: 'mock-encrypted-data',
          iv: 'mock-iv',
          salt: 'mock-salt'
        }
      }),
      decryptData: jest.fn().mockResolvedValue({
        success: true,
        data: {
          birthDate: '1990-05-15',
          birthTime: '14:30',
          birthCity: 'New York',
          birthCountry: 'USA',
          birthTimezone: 'America/New_York',
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        }
      })
    }))
  }
}));

describe('ProfileService', () => {
  let profileService: ProfileService;
  let mockUser: User;

  beforeEach(() => {
    jest.clearAllMocks();
    profileService = ProfileService.getInstance();
    
    // Mock Firebase User object
    mockUser = {
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
      isAnonymous: false,
      metadata: {} as any,
      providerData: [],
      refreshToken: 'mock-refresh-token',
      tenantId: null,
      delete: jest.fn(),
      getIdToken: jest.fn(),
      getIdTokenResult: jest.fn(),
      reload: jest.fn(),
      toJSON: jest.fn(),
      phoneNumber: null,
      photoURL: null,
      providerId: 'firebase'
    };
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton pattern)', () => {
      const instance1 = ProfileService.getInstance();
      const instance2 = ProfileService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('createProfile', () => {
    const mockProfileData: ProfileCreateData = {
      birthInformation: {
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthCity: 'New York',
        birthCountry: 'USA',
        birthTimezone: 'America/New_York',
        coordinates: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      },
      displayName: 'Test User',
      preferences: {
        notifications: false
      }
    };

    it('should create a profile successfully', async () => {
      const result = await profileService.createProfile(mockUser, mockProfileData);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.userId).toBe(mockUser.uid);
      expect(result.data?.displayName).toBe(mockProfileData.displayName);
    });

    it('should handle missing user authentication', async () => {
      const result = await profileService.createProfile(null as any, mockProfileData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('User authentication required');
    });

    it('should validate birth information', async () => {
      const invalidData = {
        ...mockProfileData,
        birthInformation: {
          ...mockProfileData.birthInformation,
          birthDate: '' // Invalid empty date
        }
      };

      const result = await profileService.createProfile(mockUser, invalidData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Birth date is required');
    });
  });

  describe('getProfile', () => {
    it('should retrieve profile successfully', async () => {
      const result = await profileService.getProfile(mockUser);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.userId).toBe(mockUser.uid);
    });

    it('should handle missing user authentication', async () => {
      const result = await profileService.getProfile(null as any);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('User authentication required');
    });
  });

  describe('getDecryptedBirthData', () => {
    it('should decrypt birth data successfully', async () => {
      const result = await profileService.getDecryptedBirthData(mockUser);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.birthDate).toBe('1990-05-15');
      expect(result.data?.birthCity).toBe('New York');
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const updateData = {
        displayName: 'Updated Name',
        preferences: {
          notifications: true
        }
      };

      const result = await profileService.updateProfile(mockUser, updateData);
      
      expect(result.success).toBe(true);
    });
  });

  describe('hasProfile', () => {
    it('should check if user has profile', async () => {
      const hasProfile = await profileService.hasProfile(mockUser);
      
      expect(typeof hasProfile).toBe('boolean');
      expect(hasProfile).toBe(true);
    });

    it('should return false for missing user', async () => {
      const hasProfile = await profileService.hasProfile(null as any);
      
      expect(hasProfile).toBe(false);
    });
  });

  describe('deleteProfile', () => {
    it('should delete profile successfully', async () => {
      const result = await profileService.deleteProfile(mockUser);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });
  });

  describe('validateBirthInformation', () => {
    const validBirthInfo: BirthInformation = {
      birthDate: '1990-05-15',
      birthTime: '14:30',
      birthCity: 'New York',
      birthCountry: 'USA',
      birthTimezone: 'America/New_York',
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    };

    it('should validate valid birth information', async () => {
      // We'll test this indirectly through createProfile
      const profileData: ProfileCreateData = {
        birthInformation: validBirthInfo
      };

      const result = await profileService.createProfile(mockUser, profileData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', async () => {
      const invalidData: ProfileCreateData = {
        birthInformation: {
          ...validBirthInfo,
          birthDate: '15/05/1990' // Wrong format
        }
      };

      const result = await profileService.createProfile(mockUser, invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('YYYY-MM-DD format');
    });

    it('should reject invalid time format', async () => {
      const invalidData: ProfileCreateData = {
        birthInformation: {
          ...validBirthInfo,
          birthTime: '25:00' // Invalid hour
        }
      };

      const result = await profileService.createProfile(mockUser, invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('HH:MM format');
    });

    it('should reject invalid coordinates', async () => {
      const invalidData: ProfileCreateData = {
        birthInformation: {
          ...validBirthInfo,
          coordinates: {
            latitude: 100, // Invalid latitude
            longitude: -74.0060
          }
        }
      };

      const result = await profileService.createProfile(mockUser, invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Latitude must be between -90 and 90');
    });
  });
});

// Integration test helper for manual testing
export const testProfileIntegration = async () => {
  console.log('🔐 Testing ProfileService Integration...');
  
  const profileService = ProfileService.getInstance();
  
  // Mock user for testing
  const testUser = {
    uid: 'test-integration-user',
    email: 'integration@test.com',
    displayName: 'Integration Test User'
  } as User;

  const testBirthData: BirthInformation = {
    birthDate: '1990-05-15',
    birthTime: '14:30',
    birthCity: 'New York',
    birthCountry: 'USA',
    birthTimezone: 'America/New_York',
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060
    }
  };

  try {
    // Test profile creation
    console.log('📝 Creating profile...');
    const createResult = await profileService.createProfile(testUser, {
      birthInformation: testBirthData,
      displayName: 'Integration Test User'
    });

    if (!createResult.success) {
      console.error('❌ Profile creation failed:', createResult.error);
      return false;
    }

    console.log('✅ Profile created successfully');

    // Test profile retrieval
    console.log('📖 Retrieving profile...');
    const getResult = await profileService.getProfile(testUser);
    
    if (!getResult.success) {
      console.error('❌ Profile retrieval failed:', getResult.error);
      return false;
    }

    console.log('✅ Profile retrieved successfully');

    // Test birth data decryption
    console.log('🔓 Decrypting birth data...');
    const decryptResult = await profileService.getDecryptedBirthData(testUser);
    
    if (!decryptResult.success) {
      console.error('❌ Birth data decryption failed:', decryptResult.error);
      return false;
    }

    console.log('✅ Birth data decrypted successfully');
    console.log('🎉 All ProfileService integration tests passed!');
    
    return true;
  } catch (error) {
    console.error('❌ Integration test error:', error);
    return false;
  }
}; 