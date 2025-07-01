import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';

// Test to understand the API
export const testAptosAPI = () => {
  // Create a test account
  const account = Account.generate();
  
  // Log available properties
  console.log('Account properties:', Object.getOwnPropertyNames(account));
  console.log('Account prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(account)));
  
  // Test basic functionality
  console.log('Address:', account.accountAddress);
  
  // Test Aptos client
  const config = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(config);
  
  return { account, aptos };
}; 