import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { WalletService } from './wallet.service';

interface AuthUser {
  uid: string;
  email: string | null;
  walletAddress?: string;
}

export class AuthService {
  private walletService: WalletService;

  constructor() {
    this.walletService = new WalletService();
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
