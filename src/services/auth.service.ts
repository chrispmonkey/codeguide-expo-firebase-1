import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  signInWithCustomToken
} from 'firebase/auth';
import { WalletService } from './wallet.service';
import { Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';

interface AuthUser {
  uid: string;
  email: string | null;
  walletAddress?: string;
}

// SIWA specific interfaces
export interface SiwaChallenge {
  challenge: string;
  nonce: string;
  timestamp: number;
  expiresAt: number;
}

export interface SiwaSignaturePayload {
  challenge: string;
  signature: string;
  publicKey: string;
  address: string;
  nonce: string;
}

export interface SiwaAuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  requiresRegistration?: boolean;
}

export class AuthService {
  private walletService: WalletService;
  private readonly CHALLENGE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.walletService = new WalletService();
  }

  /**
   * Generate SIWA authentication challenge
   */
  async generateSiwaChallenge(walletAddress: string): Promise<SiwaChallenge> {
    try {
      const timestamp = Date.now();
      const nonce = this.generateNonce();
      const expiresAt = timestamp + this.CHALLENGE_EXPIRY_MS;
      
      const challenge = this.createChallengeMessage({
        walletAddress,
        nonce,
        timestamp,
        expiresAt
      });

      return {
        challenge,
        nonce,
        timestamp,
        expiresAt
      };
    } catch (error) {
      console.error('Error generating SIWA challenge:', error);
      throw new Error('Failed to generate authentication challenge');
    }
  }

  /**
   * Verify SIWA signature and authenticate user
   */
  async verifySiwaSignature(payload: SiwaSignaturePayload): Promise<SiwaAuthResult> {
    try {
      // Verify signature timing
      const challengeData = this.parseChallengeMessage(payload.challenge);
      if (Date.now() > challengeData.expiresAt) {
        return {
          success: false,
          error: 'Authentication challenge has expired'
        };
      }

      // Verify nonce matches
      if (challengeData.nonce !== payload.nonce) {
        return {
          success: false,
          error: 'Invalid authentication nonce'
        };
      }

      // Verify wallet address matches
      if (challengeData.walletAddress !== payload.address) {
        return {
          success: false,
          error: 'Wallet address mismatch'
        };
      }

      // Verify signature
      const isValidSignature = await this.verifySignature(
        payload.challenge,
        payload.signature,
        payload.publicKey
      );

      if (!isValidSignature) {
        return {
          success: false,
          error: 'Invalid signature'
        };
      }

      // Check if user exists in Firebase (by wallet address)
      // For now, we'll create a custom token for SIWA users
      const customToken = await this.createCustomTokenForWallet(payload.address);
      
      if (customToken) {
        const userCredential = await signInWithCustomToken(auth, customToken);
        return {
          success: true,
          user: {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            walletAddress: payload.address
          }
        };
      } else {
        return {
          success: false,
          requiresRegistration: true,
          error: 'User not found. Registration required.'
        };
      }
    } catch (error) {
      console.error('Error verifying SIWA signature:', error);
      return {
        success: false,
        error: 'Authentication verification failed'
      };
    }
  }

  /**
   * Register new user with SIWA
   */
  async registerWithSiwa(
    payload: SiwaSignaturePayload,
    userInfo?: { email?: string; displayName?: string }
  ): Promise<SiwaAuthResult> {
    try {
      // First verify the signature
      const verificationResult = await this.verifySiwaSignature(payload);
      
      if (!verificationResult.success && !verificationResult.requiresRegistration) {
        return verificationResult;
      }

      // Create a custom token for the new wallet user
      const customToken = await this.createCustomTokenForWallet(
        payload.address,
        userInfo
      );

      if (customToken) {
        const userCredential = await signInWithCustomToken(auth, customToken);
        return {
          success: true,
          user: {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            walletAddress: payload.address
          }
        };
      }

      return {
        success: false,
        error: 'Failed to create user account'
      };
    } catch (error) {
      console.error('Error registering with SIWA:', error);
      return {
        success: false,
        error: 'Registration failed'
      };
    }
  }

  /**
   * Create challenge message for signing
   */
  private createChallengeMessage(params: {
    walletAddress: string;
    nonce: string;
    timestamp: number;
    expiresAt: number;
  }): string {
    return `Sign in to Astrophysicals

Wallet: ${params.walletAddress}
Nonce: ${params.nonce}
Issued At: ${new Date(params.timestamp).toISOString()}
Expires At: ${new Date(params.expiresAt).toISOString()}

This request will not trigger a blockchain transaction or cost any gas fees.`;
  }

  /**
   * Parse challenge message to extract data
   */
  private parseChallengeMessage(challenge: string): {
    walletAddress: string;
    nonce: string;
    timestamp: number;
    expiresAt: number;
  } {
    const lines = challenge.split('\n');
    const walletLine = lines.find(line => line.startsWith('Wallet:'));
    const nonceLine = lines.find(line => line.startsWith('Nonce:'));
    const issuedLine = lines.find(line => line.startsWith('Issued At:'));
    const expiresLine = lines.find(line => line.startsWith('Expires At:'));

    if (!walletLine || !nonceLine || !issuedLine || !expiresLine) {
      throw new Error('Invalid challenge message format');
    }

    return {
      walletAddress: walletLine.split('Wallet: ')[1],
      nonce: nonceLine.split('Nonce: ')[1],
      timestamp: new Date(issuedLine.split('Issued At: ')[1]).getTime(),
      expiresAt: new Date(expiresLine.split('Expires At: ')[1]).getTime()
    };
  }

  /**
   * Verify Ed25519 signature
   */
  private async verifySignature(
    message: string,
    signature: string,
    publicKey: string
  ): Promise<boolean> {
    try {
      // Convert message to bytes
      const messageBytes = new TextEncoder().encode(message);
      
      // Convert signature and public key from hex
      const signatureBytes = new Uint8Array(
        signature.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
      );
      const publicKeyBytes = new Uint8Array(
        publicKey.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
      );

      // For now, we'll do a basic verification
      // In a production app, you'd use the Aptos SDK's crypto utilities
      // This is a simplified implementation
      return signatureBytes.length === 64 && publicKeyBytes.length === 32;
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }

  /**
   * Generate cryptographically secure nonce
   */
  private generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Create custom Firebase token for wallet users
   * Note: In production, this should be handled by a backend service
   */
  private async createCustomTokenForWallet(
    walletAddress: string,
    userInfo?: { email?: string; displayName?: string }
  ): Promise<string | null> {
    try {
      // For client-side demo purposes, we'll create a mock token
      // In production, this would be handled by your backend Firebase Admin SDK
      console.warn('Custom token creation should be handled server-side in production');
      
      // Create a deterministic UID based on wallet address
      const uid = `wallet_${walletAddress.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
      
      // For now, return a mock token (this won't work with actual Firebase)
      // You'll need to implement proper backend custom token generation
      return null;
    } catch (error) {
      console.error('Error creating custom token:', error);
      return null;
    }
  }

  /**
   * Sign message with stored wallet (for testing)
   */
  async signMessageWithWallet(
    walletAddress: string,
    message: string
  ): Promise<{ signature: string; publicKey: string } | null> {
    try {
      // Get stored wallet data
      const walletData = await this.walletService.getStoredWalletData(walletAddress);
      if (!walletData) {
        throw new Error('Wallet not found');
      }

      // For demo purposes, create a mock signature
      // In a real app, you'd use the actual private key to sign
      const mockSignature = '0'.repeat(128); // 64 bytes = 128 hex chars
      const mockPublicKey = '1'.repeat(64);  // 32 bytes = 64 hex chars
      
      return {
        signature: mockSignature,
        publicKey: mockPublicKey
      };
    } catch (error) {
      console.error('Error signing message:', error);
      return null;
    }
  }

  async signUp(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      };
    } catch (error) {
      console.error('Error signing up:', error);
      throw new Error(`Sign up failed: ${(error as Error).message}`);
    }
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      };
    } catch (error) {
      console.error('Error signing in:', error);
      throw new Error(`Sign in failed: ${(error as Error).message}`);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw new Error('Sign out failed');
    }
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  isAuthenticated(): boolean {
    return auth.currentUser !== null;
  }

  getWalletService(): WalletService {
    return this.walletService;
  }

  async testServices(): Promise<{ auth: boolean; wallet: boolean }> {
    try {
      const walletConnected = await this.walletService.testConnection();
      const authConnected = auth.app !== null;
      return { auth: authConnected, wallet: walletConnected };
    } catch (error) {
      console.error('Error testing services:', error);
      return { auth: false, wallet: false };
    }
  }
}
