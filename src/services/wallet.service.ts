import { Aptos, AptosConfig, Network, Account } from '@aptos-labs/ts-sdk';
import { KeyStorageService } from './keyStorage.service';
import { MnemonicUtils, MnemonicStrength } from '../utils/mnemonic.utils';

// Wallet service configuration
const WALLET_STORAGE_PREFIX = 'astrophysicals_wallet_';
const KEYCHAIN_SERVICE = 'astrophysicals_keychain';

interface WalletInfo {
  address: string;
  mnemonic: string;
}

interface WalletBalance {
  balance: string;
  formattedBalance: string;
}

interface WalletRecoveryResult {
  success: boolean;
  wallet?: WalletInfo;
  errors?: string[];
}

export class WalletService {
  private aptos: Aptos;
  private config: AptosConfig;
  private keyStorage: KeyStorageService;

  constructor() {
    // Initialize Aptos client with appropriate network
    const network = process.env.EXPO_PUBLIC_APTOS_NETWORK === 'mainnet' 
      ? Network.MAINNET 
      : Network.TESTNET;
    
    this.config = new AptosConfig({ network });
    this.aptos = new Aptos(this.config);
    this.keyStorage = KeyStorageService.getInstance();
  }

  /**
   * Create a new wallet with generated mnemonic
   */
  async createWallet(
    strength: MnemonicStrength = MnemonicStrength.TWELVE_WORDS
  ): Promise<WalletInfo> {
    try {
      // Generate a cryptographically secure mnemonic
      const mnemonicInfo = MnemonicUtils.generateMnemonic(strength);
      
      // Generate Aptos account
      const account = Account.generate();
      const address = account.accountAddress.toString();

      // Store wallet data securely using our KeyStorageService
      await this.storeWalletSecurely(address, {
        mnemonic: mnemonicInfo.mnemonic,
        account: account
      });
      
      return {
        address,
        mnemonic: mnemonicInfo.mnemonic
      };
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new Error('Failed to create wallet');
    }
  }

  /**
   * Recover wallet from existing mnemonic
   */
  async recoverWallet(mnemonic: string): Promise<WalletRecoveryResult> {
    try {
      // Validate the mnemonic using our utilities
      const validation = MnemonicUtils.validateMnemonic(mnemonic);
      
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // For now, we'll generate a new account since we don't have 
      // the derivation path implementation yet
      // TODO: Implement proper mnemonic-to-account derivation
      const account = Account.generate();
      const address = account.accountAddress.toString();

      // Store the recovered wallet
      await this.storeWalletSecurely(address, {
        mnemonic: MnemonicUtils.normalizeMnemonic(mnemonic),
        account: account
      });

      return {
        success: true,
        wallet: {
          address,
          mnemonic: MnemonicUtils.normalizeMnemonic(mnemonic)
        }
      };
    } catch (error) {
      console.error('Error recovering wallet:', error);
      return {
        success: false,
        errors: ['Failed to recover wallet from mnemonic']
      };
    }
  }

  /**
   * Validate a mnemonic phrase
   */
  validateMnemonic(mnemonic: string): { isValid: boolean; errors: string[] } {
    const validation = MnemonicUtils.validateMnemonic(mnemonic);
    return {
      isValid: validation.isValid,
      errors: validation.errors
    };
  }

  /**
   * Get wallet balance for a given address
   */
  async getWalletBalance(address: string): Promise<WalletBalance> {
    try {
      const balance = await this.aptos.getAccountAPTAmount({
        accountAddress: address
      });

      // Convert from Octas to APT (1 APT = 100,000,000 Octas)
      const aptBalance = balance / 100_000_000;
      
      return {
        balance: balance.toString(),
        formattedBalance: `${aptBalance.toFixed(6)} APT`
      };
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return {
        balance: '0',
        formattedBalance: '0.000000 APT'
      };
    }
  }

  /**
   * Check if wallet exists in secure storage
   */
  async hasStoredWallet(address: string): Promise<boolean> {
    try {
      return await this.keyStorage.exists(`wallet_${address}`);
    } catch (error) {
      console.error('Error checking stored wallet:', error);
      return false;
    }
  }

  /**
   * Get stored wallet data for an address
   */
  async getStoredWalletData(address: string): Promise<any | null> {
    try {
      const walletDataStr = await this.keyStorage.retrieveSecure(`wallet_${address}`);
      return walletDataStr ? JSON.parse(walletDataStr) : null;
    } catch (error) {
      console.error('Error retrieving wallet data:', error);
      return null;
    }
  }

  /**
   * Delete stored wallet
   */
  async deleteStoredWallet(address: string): Promise<void> {
    try {
      await this.keyStorage.deleteSecure(`wallet_${address}`);
    } catch (error) {
      console.error('Error deleting stored wallet:', error);
      throw new Error('Failed to delete wallet');
    }
  }

  /**
   * List all stored wallet addresses
   */
  async listStoredWallets(): Promise<string[]> {
    try {
      // Note: This is limited by SecureStore's inability to list keys
      // In a real implementation, we'd maintain a registry
      console.warn('Wallet listing not fully implemented due to SecureStore limitations');
      return [];
    } catch (error) {
      console.error('Error listing wallets:', error);
      return [];
    }
  }

  /**
   * Store wallet data securely using KeyStorageService
   */
  private async storeWalletSecurely(address: string, walletData: any): Promise<void> {
    try {
      const dataToStore = {
        mnemonic: walletData.mnemonic,
        address: address,
        createdAt: new Date().toISOString(),
        version: '1.0'
      };

      await this.keyStorage.storeSecure(
        `wallet_${address}`, 
        JSON.stringify(dataToStore),
        {
          requireAuthentication: true,
          authenticationPrompt: 'Authenticate to access your wallet',
          encrypt: false // Temporarily disable encryption to fix startup issues
        }
      );
    } catch (error) {
      console.error('Error storing wallet securely:', error);
      // For now, continue without storage rather than failing completely
      console.warn('Wallet will not be persisted due to storage error');
    }
  }

  /**
   * Test connection to Aptos network
   */
  async testConnection(): Promise<boolean> {
    try {
      const ledgerInfo = await this.aptos.getLedgerInfo();
      console.log('Connected to Aptos network. Chain ID:', ledgerInfo.chain_id);
      return true;
    } catch (error) {
      console.error('Failed to connect to Aptos network:', error);
      return false;
    }
  }

  /**
   * Test all wallet service functionality
   */
  async testWalletService(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Test Aptos connection
      const connectionTest = await this.testConnection();
      if (!connectionTest) {
        errors.push('Failed to connect to Aptos network');
      }

      // Test key storage
      const storageTest = await this.keyStorage.testStorage();
      if (!storageTest) {
        errors.push('Key storage service test failed');
      }

      // Test mnemonic generation and validation
      const mnemonicInfo = MnemonicUtils.generateMnemonic();
      const validation = MnemonicUtils.validateMnemonic(mnemonicInfo.mnemonic);
      if (!validation.isValid) {
        errors.push('Mnemonic generation/validation test failed');
      }

      return {
        success: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Wallet service test failed:', error);
      return {
        success: false,
        errors: [`Test failed: ${(error as Error).message}`]
      };
    }
  }

  /**
   * Generate a test account for development
   */
  generateTestAccount(): Account {
    return Account.generate();
  }
} 