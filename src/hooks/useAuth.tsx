import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { AuthService, WalletService, KeyStorageService } from '../services';

// Authentication state interface
interface AuthState {
  user: User | null;
  walletAddress: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasWallet: boolean;
  error: string | null;
}

// Authentication actions
type AuthAction =
  | { type: 'AUTH_LOADING'; payload: boolean }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; walletAddress?: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'WALLET_CONNECTED'; payload: string }
  | { type: 'WALLET_DISCONNECTED' }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  user: null,
  walletAddress: null,
  isAuthenticated: false,
  isLoading: true,
  hasWallet: false,
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: null,
      };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        walletAddress: action.payload.walletAddress || null,
        isAuthenticated: true,
        isLoading: false,
        hasWallet: !!action.payload.walletAddress,
        error: null,
      };
    
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        walletAddress: null,
        isAuthenticated: false,
        isLoading: false,
        hasWallet: false,
        error: action.payload,
      };
    
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        walletAddress: null,
        isAuthenticated: false,
        isLoading: false,
        hasWallet: false,
        error: null,
      };
    
    case 'WALLET_CONNECTED':
      return {
        ...state,
        walletAddress: action.payload,
        hasWallet: true,
      };
    
    case 'WALLET_DISCONNECTED':
      return {
        ...state,
        walletAddress: null,
        hasWallet: false,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
}

// Context interface
interface AuthContextType extends AuthState {
  // Authentication methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, createWallet?: boolean) => Promise<{ wallet?: any }>;
  signOut: () => Promise<void>;
  
  // Wallet methods
  createWallet: () => Promise<{ address: string; mnemonic: string }>;
  recoverWallet: (mnemonic: string) => Promise<{ success: boolean; wallet?: any; errors?: string[] }>;
  connectWallet: (address: string) => Promise<void>;
  disconnectWallet: () => void;
  
  // Utility methods
  clearError: () => void;
  checkWalletExists: (address: string) => Promise<boolean>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Initialize services
  const authService = new AuthService();
  const walletService = new WalletService();
  const keyStorage = KeyStorageService.getInstance();

  // Session persistence key
  const SESSION_KEY = 'auth_session';

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, check for wallet
        const walletAddress = await loadUserWallet(user.uid);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, walletAddress }
        });
        
        // Persist session
        await persistSession({ userId: user.uid, walletAddress: walletAddress || undefined });
      } else {
        // User is signed out
        dispatch({ type: 'AUTH_LOGOUT' });
        await clearSession();
      }
    });

    return unsubscribe;
  }, []);

  // Initialize authentication from persisted session
  async function initializeAuth() {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });
      
      // Check if there's a current user
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const walletAddress = await loadUserWallet(currentUser.uid);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: currentUser, walletAddress }
        });
      } else {
        dispatch({ type: 'AUTH_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      dispatch({ type: 'AUTH_ERROR', payload: 'Failed to initialize authentication' });
    }
  }

  // Load user wallet from storage
  async function loadUserWallet(userId: string): Promise<string | null> {
    try {
      const sessionData = await keyStorage.retrieveSecure(SESSION_KEY);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session.userId === userId && session.walletAddress) {
          return session.walletAddress;
        }
      }
    } catch (error) {
      console.error('Error loading user wallet:', error);
    }
    return null;
  }

  // Persist session data
  async function persistSession(sessionData: { userId: string; walletAddress?: string | null | undefined }) {
    try {
      await keyStorage.storeSecure(
        SESSION_KEY,
        JSON.stringify({
          ...sessionData,
          timestamp: new Date().toISOString()
        }),
        {
          requireAuthentication: false, // Session data doesn't need biometric auth
          encrypt: true
        }
      );
    } catch (error) {
      console.error('Error persisting session:', error);
    }
  }

  // Clear session data
  async function clearSession() {
    try {
      await keyStorage.deleteSecure(SESSION_KEY);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  // Sign in method
  async function signIn(email: string, password: string) {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });
      await authService.signIn(email, password);
      // Auth state will be updated by the onAuthStateChanged listener
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: (error as Error).message });
      throw error;
    }
  }

  // Sign up method
  async function signUp(email: string, password: string, createWallet: boolean = true) {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });
      const result = await authService.signUp(email, password);
      
      let wallet = null;
      if (createWallet) {
        try {
          wallet = await walletService.createWallet();
          // Wallet address will be updated by the auth state listener
        } catch (walletError) {
          console.warn('Failed to create wallet during signup:', walletError);
        }
      }
      
      return { wallet };
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: (error as Error).message });
      throw error;
    }
  }

  // Sign out method
  async function signOut() {
    try {
      dispatch({ type: 'AUTH_LOADING', payload: true });
      await authService.signOut();
      // Auth state will be updated by the onAuthStateChanged listener
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: (error as Error).message });
      throw error;
    }
  }

  // Create wallet method
  async function createWallet() {
    try {
      const wallet = await walletService.createWallet();
      dispatch({ type: 'WALLET_CONNECTED', payload: wallet.address });
      
      // Update persisted session
      if (state.user) {
        await persistSession({ userId: state.user.uid, walletAddress: wallet.address });
      }
      
      return wallet;
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: (error as Error).message });
      throw error;
    }
  }

  // Recover wallet method
  async function recoverWallet(mnemonic: string) {
    try {
      const result = await walletService.recoverWallet(mnemonic);
      
      if (result.success && result.wallet) {
        dispatch({ type: 'WALLET_CONNECTED', payload: result.wallet.address });
        
        // Update persisted session
        if (state.user) {
          await persistSession({ userId: state.user.uid, walletAddress: result.wallet.address });
        }
      }
      
      return result;
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: (error as Error).message });
      throw error;
    }
  }

  // Connect wallet method
  async function connectWallet(address: string) {
    try {
      const hasWallet = await walletService.hasStoredWallet(address);
      if (hasWallet) {
        dispatch({ type: 'WALLET_CONNECTED', payload: address });
        
        // Update persisted session
        if (state.user) {
          await persistSession({ userId: state.user.uid, walletAddress: address });
        }
      } else {
        throw new Error('Wallet not found in storage');
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: (error as Error).message });
      throw error;
    }
  }

  // Disconnect wallet method
  function disconnectWallet() {
    dispatch({ type: 'WALLET_DISCONNECTED' });
    
    // Update persisted session
    if (state.user) {
      persistSession({ userId: state.user.uid, walletAddress: null });
    }
  }

  // Clear error method
  function clearError() {
    dispatch({ type: 'CLEAR_ERROR' });
  }

  // Check if wallet exists
  async function checkWalletExists(address: string) {
    return await walletService.hasStoredWallet(address);
  }

  // Context value
  const contextValue: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    createWallet,
    recoverWallet,
    connectWallet,
    disconnectWallet,
    clearError,
    checkWalletExists,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 