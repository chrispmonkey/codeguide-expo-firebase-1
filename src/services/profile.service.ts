import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  DocumentReference,
  DocumentSnapshot,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../config/firebase';
import { EncryptionService, EncryptedData } from './encryption.service';

export interface BirthInformation {
  birthDate: string; // ISO date string
  birthTime: string; // HH:MM format
  birthCity: string;
  birthCountry: string;
  birthTimezone: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface AstrologicalProfile {
  sun: {
    sign: string;
    degree: number;
    house: number;
  };
  moon: {
    sign: string;
    degree: number;
    house: number;
  };
  rising: {
    sign: string;
    degree: number;
  };
  planets?: {
    [planet: string]: {
      sign: string;
      degree: number;
      house: number;
    };
  };
  houses?: {
    [house: number]: {
      sign: string;
      degree: number;
    };
  };
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName?: string;
  email?: string;
  profileImageUrl?: string;
  encryptedBirthData: EncryptedData; // Encrypted birth information
  astrologicalProfile?: AstrologicalProfile;
  preferences: {
    notifications: boolean;
    shareProfile: boolean;
    showBirthTime: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  version: number; // For data migration/compatibility
}

export interface ProfileCreateData {
  birthInformation: BirthInformation;
  displayName?: string;
  preferences?: Partial<UserProfile['preferences']>;
}

export interface ProfileUpdateData {
  displayName?: string;
  profileImageUrl?: string;
  astrologicalProfile?: AstrologicalProfile;
  preferences?: Partial<UserProfile['preferences']>;
}

export interface ProfileResult<T = UserProfile> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * ProfileService manages secure storage and retrieval of user profiles
 * with encrypted birth data in Firestore
 */
export class ProfileService {
  private static instance: ProfileService;
  private encryptionService: EncryptionService;
  private readonly COLLECTION_NAME = 'userProfiles';
  private readonly CURRENT_VERSION = 1;

  private constructor() {
    this.encryptionService = EncryptionService.getInstance();
  }

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  /**
   * Create a new user profile with encrypted birth data
   */
  async createProfile(
    user: User,
    profileData: ProfileCreateData
  ): Promise<ProfileResult> {
    try {
      if (!user || !user.uid) {
        return {
          success: false,
          error: 'User authentication required'
        };
      }

      // Validate birth information
      const validation = this.validateBirthInformation(profileData.birthInformation);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Encrypt birth data
      const encryptResult = await this.encryptionService.encryptData(profileData.birthInformation);
      if (!encryptResult.success || !encryptResult.encryptedData) {
        return {
          success: false,
          error: `Failed to encrypt birth data: ${encryptResult.error}`
        };
      }

      // Create profile document
      const profileId = `profile_${user.uid}`;
      const profileRef = doc(db, this.COLLECTION_NAME, profileId);

      const defaultPreferences = {
        notifications: true,
        shareProfile: false,
        showBirthTime: false,
        ...profileData.preferences
      };

      const userProfile: UserProfile = {
        id: profileId,
        userId: user.uid,
        displayName: profileData.displayName || user.displayName || undefined,
        email: user.email || undefined,
        encryptedBirthData: encryptResult.encryptedData,
        preferences: defaultPreferences,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: this.CURRENT_VERSION
      };

      await setDoc(profileRef, {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        success: true,
        data: userProfile
      };
    } catch (error) {
      console.error('Error creating profile:', error);
      return {
        success: false,
        error: `Failed to create profile: ${error}`
      };
    }
  }

  /**
   * Retrieve user profile and decrypt birth data
   */
  async getProfile(user: User): Promise<ProfileResult> {
    try {
      if (!user || !user.uid) {
        return {
          success: false,
          error: 'User authentication required'
        };
      }

      const profileId = `profile_${user.uid}`;
      const profileRef = doc(db, this.COLLECTION_NAME, profileId);
      const profileDoc = await getDoc(profileRef);

      if (!profileDoc.exists()) {
        return {
          success: false,
          error: 'Profile not found'
        };
      }

      const profileData = profileDoc.data() as UserProfile;

      // Verify the profile belongs to the current user
      if (profileData.userId !== user.uid) {
        return {
          success: false,
          error: 'Profile access denied'
        };
      }

      return {
        success: true,
        data: profileData
      };
    } catch (error) {
      console.error('Error retrieving profile:', error);
      return {
        success: false,
        error: `Failed to retrieve profile: ${error}`
      };
    }
  }

  /**
   * Decrypt birth information from profile
   */
  async getDecryptedBirthData(user: User): Promise<ProfileResult<BirthInformation>> {
    try {
      const profileResult = await this.getProfile(user);
      if (!profileResult.success || !profileResult.data) {
        return {
          success: false,
          error: profileResult.error
        };
      }

      const decryptResult = await this.encryptionService.decryptData<BirthInformation>(
        profileResult.data.encryptedBirthData
      );

      if (!decryptResult.success) {
        return {
          success: false,
          error: `Failed to decrypt birth data: ${decryptResult.error}`
        };
      }

      return {
        success: true,
        data: decryptResult.data
      };
    } catch (error) {
      console.error('Error decrypting birth data:', error);
      return {
        success: false,
        error: `Failed to decrypt birth data: ${error}`
      };
    }
  }

  /**
   * Update user profile (non-encrypted fields)
   */
  async updateProfile(user: User, updateData: ProfileUpdateData): Promise<ProfileResult> {
    try {
      if (!user || !user.uid) {
        return {
          success: false,
          error: 'User authentication required'
        };
      }

      const profileId = `profile_${user.uid}`;
      const profileRef = doc(db, this.COLLECTION_NAME, profileId);

      // Verify profile exists
      const existingProfile = await this.getProfile(user);
      if (!existingProfile.success) {
        return existingProfile;
      }

      // Build update fields carefully to handle partial preferences
      const updateFields: any = {
        updatedAt: serverTimestamp(),
      };

      if (updateData.displayName !== undefined) {
        updateFields.displayName = updateData.displayName;
      }

      if (updateData.profileImageUrl !== undefined) {
        updateFields.profileImageUrl = updateData.profileImageUrl;
      }

      if (updateData.astrologicalProfile !== undefined) {
        updateFields.astrologicalProfile = updateData.astrologicalProfile;
      }

      if (updateData.preferences !== undefined) {
        // Merge with existing preferences
        if (existingProfile.success && existingProfile.data) {
          updateFields.preferences = {
            ...existingProfile.data.preferences,
            ...updateData.preferences
          };
        }
      }

      await updateDoc(profileRef, updateFields);

      // Return updated profile
      return await this.getProfile(user);
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: `Failed to update profile: ${error}`
      };
    }
  }

  /**
   * Update encrypted birth data (re-encrypt with new key)
   */
  async updateBirthData(user: User, newBirthData: BirthInformation): Promise<ProfileResult> {
    try {
      if (!user || !user.uid) {
        return {
          success: false,
          error: 'User authentication required'
        };
      }

      // Validate new birth information
      const validation = this.validateBirthInformation(newBirthData);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Encrypt new birth data
      const encryptResult = await this.encryptionService.encryptData(newBirthData);
      if (!encryptResult.success || !encryptResult.encryptedData) {
        return {
          success: false,
          error: `Failed to encrypt birth data: ${encryptResult.error}`
        };
      }

      // Update profile with new encrypted data
      const profileId = `profile_${user.uid}`;
      const profileRef = doc(db, this.COLLECTION_NAME, profileId);

      await updateDoc(profileRef, {
        encryptedBirthData: encryptResult.encryptedData,
        updatedAt: serverTimestamp(),
      });

      return await this.getProfile(user);
    } catch (error) {
      console.error('Error updating birth data:', error);
      return {
        success: false,
        error: `Failed to update birth data: ${error}`
      };
    }
  }

  /**
   * Delete user profile permanently
   */
  async deleteProfile(user: User): Promise<ProfileResult<boolean>> {
    try {
      if (!user || !user.uid) {
        return {
          success: false,
          error: 'User authentication required'
        };
      }

      const profileId = `profile_${user.uid}`;
      const profileRef = doc(db, this.COLLECTION_NAME, profileId);

      await deleteDoc(profileRef);

      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Error deleting profile:', error);
      return {
        success: false,
        error: `Failed to delete profile: ${error}`
      };
    }
  }

  /**
   * Check if user has a profile
   */
  async hasProfile(user: User): Promise<boolean> {
    try {
      if (!user || !user.uid) {
        return false;
      }

      const profileId = `profile_${user.uid}`;
      const profileRef = doc(db, this.COLLECTION_NAME, profileId);
      const profileDoc = await getDoc(profileRef);

      return profileDoc.exists();
    } catch (error) {
      console.error('Error checking profile existence:', error);
      return false;
    }
  }

  /**
   * Validate birth information data
   */
  private validateBirthInformation(birthInfo: BirthInformation): { success: boolean; error?: string } {
    if (!birthInfo.birthDate) {
      return { success: false, error: 'Birth date is required' };
    }

    if (!birthInfo.birthTime) {
      return { success: false, error: 'Birth time is required' };
    }

    if (!birthInfo.birthCity) {
      return { success: false, error: 'Birth city is required' };
    }

    if (!birthInfo.birthCountry) {
      return { success: false, error: 'Birth country is required' };
    }

    if (!birthInfo.coordinates || 
        typeof birthInfo.coordinates.latitude !== 'number' || 
        typeof birthInfo.coordinates.longitude !== 'number') {
      return { success: false, error: 'Valid coordinates are required' };
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthInfo.birthDate)) {
      return { success: false, error: 'Birth date must be in YYYY-MM-DD format' };
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(birthInfo.birthTime)) {
      return { success: false, error: 'Birth time must be in HH:MM format' };
    }

    // Validate coordinates range
    if (birthInfo.coordinates.latitude < -90 || birthInfo.coordinates.latitude > 90) {
      return { success: false, error: 'Latitude must be between -90 and 90' };
    }

    if (birthInfo.coordinates.longitude < -180 || birthInfo.coordinates.longitude > 180) {
      return { success: false, error: 'Longitude must be between -180 and 180' };
    }

    return { success: true };
  }

  /**
   * Re-encrypt all user data (for key rotation)
   */
  async reEncryptUserData(user: User): Promise<ProfileResult> {
    try {
      const profileResult = await this.getProfile(user);
      if (!profileResult.success || !profileResult.data) {
        return profileResult;
      }

      // Decrypt current birth data
      const birthDataResult = await this.getDecryptedBirthData(user);
      if (!birthDataResult.success || !birthDataResult.data) {
        return {
          success: false,
          error: 'Could not decrypt existing birth data for re-encryption'
        };
      }

      // Re-encrypt with new salt/IV
      const reEncryptResult = await this.encryptionService.encryptData(birthDataResult.data);
      if (!reEncryptResult.success || !reEncryptResult.encryptedData) {
        return {
          success: false,
          error: `Re-encryption failed: ${reEncryptResult.error}`
        };
      }

      // Update profile with re-encrypted data
      const profileId = `profile_${user.uid}`;
      const profileRef = doc(db, this.COLLECTION_NAME, profileId);

      await updateDoc(profileRef, {
        encryptedBirthData: reEncryptResult.encryptedData,
        updatedAt: serverTimestamp(),
      });

      return await this.getProfile(user);
    } catch (error) {
      console.error('Error re-encrypting user data:', error);
      return {
        success: false,
        error: `Re-encryption failed: ${error}`
      };
    }
  }
} 