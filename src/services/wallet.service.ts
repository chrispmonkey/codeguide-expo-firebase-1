import { Aptos, AptosConfig, Network, Account } from '@aptos-labs/ts-sdk';
import * as SecureStore from 'expo-secure-store';
import { generateMnemonic, validateMnemonic } from 'bip39';

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

export class WalletService {
  private aptos: Aptos;
  private config: AptosConfig;

  constructor() {
    const network = process.env.EXPO_PUBLIC_APTOS_NETWORK === 'mainnet' 
      ? Network.MAINNET 
      : Network.TESTNET;
    
    this.config = new AptosConfig({ network });
    this.aptos = new Aptos(this.config);
  }

  async createWallet(): Promise<WalletInfo> {
    try {
      const account = Account.generate();
      const address = account.accountAddress.toString();
      const mnemonic = generateMnemonic(128);

      await this.storeWalletData(address, { account, mnemonic });
      
      return { address, mnemonic };
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new Error('Failed to create wallet');
    }
  }

  async validateMnemonic(mnemonic: string): Promise<boolean> {
    try {
      return validateMnemonic(mnemonic.trim());
    } catch (error) {
      console.error('Error validating mnemonic:', error);
      return false;
    }
  }

  async getWalletBalance(address: string): Promise<WalletBalance> {
    try {
      const balance = await this.aptos.getAccountAPTAmount({
        accountAddress: address
      });

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

  async hasStoredWallet(address: string): Promise<boolean> {
    try {
      const walletData = await SecureStore.getItemAsync(
        `${WALLET_STORAGE_PREFIX}${address}`,
        { keychainService: KEYCHAIN_SERVICE }
      );
      return walletData !== null;
    } catch (error) {
      console.error('Error checking stored wallet:', error);
      return false;
    }
  }

  async deleteStoredWallet(address: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(
        `${WALLET_STORAGE_PREFIX}${address}`,
        { keychainService: KEYCHAIN_SERVICE }
      );
    } catch (error) {
      console.error('Error deleting stored wallet:', error);
      throw new Error('Failed to delete wallet');
    }
  }

  private async storeWalletData(address: string, walletData: any): Promise<void> {
    try {
      const dataToStore = JSON.stringify({
        mnemonic: walletData.mnemonic,
        createdAt: new Date().toISOString()
      });

      await SecureStore.setItemAsync(
        `${WALLET_STORAGE_PREFIX}${address}`,
        dataToStore,
        {
          keychainService: KEYCHAIN_SERVICE,
          requireAuthentication: true,
          authenticationPrompt: 'Authenticate to access your wallet'
        }
      );
    } catch (error) {
      console.error('Error storing wallet data:', error);
      throw new Error('Failed to store wallet securely');
    }
  }

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

  generateTestAccount(): Account {
    return Account.generate();
  }
}
